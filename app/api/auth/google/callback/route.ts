import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, activityLogs, ActivityType, invitations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { setSession } from '@/lib/auth/session';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified: boolean;
}

async function getGoogleTokens(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.BASE_URL!;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const stateParam = searchParams.get('state');

    // Parse optional state (redirect / priceId / inviteId)
    let redirectTo = '/dashboard';
    let inviteId: string | null = null;
    if (stateParam) {
      try {
        const state = JSON.parse(Buffer.from(stateParam, 'base64').toString());
        inviteId = state.inviteId;
        if (state.redirect === 'checkout' && state.priceId) {
          redirectTo = `/pricing?priceId=${state.priceId}`;
        }
      } catch {
        // ignore malformed state
      }
    }

    if (error) {
      return NextResponse.redirect(`${baseUrl}/sign-in?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/sign-in?error=no_code`);
    }

    // Exchange code for tokens
    const tokens = await getGoogleTokens(code, redirectUri);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email_verified) {
      return NextResponse.redirect(`${baseUrl}/sign-in?error=email_not_verified`);
    }

    // Check if user already exists by googleId
    const existingByGoogleId = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.sub))
      .limit(1);

    if (existingByGoogleId.length > 0) {
      // User exists with Google account — sign them in
      await setSession(existingByGoogleId[0]);
      return NextResponse.redirect(`${baseUrl}${redirectTo}`);
    }

    // Check if user exists by email (might have signed up with password before)
    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    let user = existingByEmail.length > 0 ? existingByEmail[0] : null;

    if (user) {
      // Link the Google account to the existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          googleId: googleUser.sub,
          name: user.name || googleUser.name || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      user = updatedUser;
    } else {
      // New user — create account
      const [newUser] = await db
        .insert(users)
        .values({
          email: googleUser.email,
          name: googleUser.name || null,
          googleId: googleUser.sub,
          passwordHash: null,
          role: 'owner',
        })
        .returning();
      user = newUser;

      // Invitation logic for new users
      let teamId: number | null = null;
      let userRole = 'owner';

      if (inviteId) {
        const [invitation] = await db
          .select()
          .from(invitations)
          .where(
            and(
              eq(invitations.id, parseInt(inviteId)),
              eq(invitations.email, googleUser.email),
              eq(invitations.status, 'pending')
            )
          )
          .limit(1);

        if (invitation) {
          teamId = invitation.teamId;
          userRole = invitation.role;

          await db
            .update(invitations)
            .set({ status: 'accepted' })
            .where(eq(invitations.id, invitation.id));

          await db.insert(activityLogs).values({
            teamId,
            userId: user.id,
            action: ActivityType.ACCEPT_INVITATION,
            ipAddress: request.headers.get('x-forwarded-for') || '',
          });
        }
      }

      if (!teamId) {
        // Create a new team if no invitation
        const [newTeam] = await db
          .insert(teams)
          .values({ name: `${googleUser.email}'s Team` })
          .returning();
        teamId = newTeam.id;

        await db.insert(activityLogs).values({
          teamId,
          userId: user.id,
          action: ActivityType.CREATE_TEAM,
          ipAddress: request.headers.get('x-forwarded-for') || '',
        });
      }

      await db.insert(teamMembers).values({
        userId: user.id,
        teamId,
        role: userRole,
      });

      await db.insert(activityLogs).values({
        teamId,
        userId: user.id,
        action: ActivityType.SIGN_UP,
        ipAddress: request.headers.get('x-forwarded-for') || '',
      });
    }

    await setSession(user);
    return NextResponse.redirect(`${baseUrl}${redirectTo}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/sign-in?error=oauth_failed`);
  }
}
