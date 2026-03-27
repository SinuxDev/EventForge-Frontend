import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin';
  avatar?: string;
}

interface BackendAuthData {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

interface BackendAuthResponse {
  success: boolean;
  message?: string;
  data: BackendAuthData;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'attendee' | 'organizer' | 'admin';
  accessToken: string;
  refreshToken: string;
}

interface SessionUpdatePayload {
  user?: {
    role?: 'attendee' | 'organizer' | 'admin';
  };
  accessToken?: string;
}

const API_BASE_URL =
  process.env.NEXTAUTH_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000/api';

const SOCIAL_PROVIDERS = new Set(['google', 'github']);

async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? 'Authentication request failed');
  }

  return response.json() as Promise<T>;
}

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const result = await postJson<BackendAuthResponse>('/auth/login', {
          email: credentials.email,
          password: credentials.password,
        });

        return {
          id: result.data.user._id,
          name: result.data.user.name,
          email: result.data.user.email,
          image: result.data.user.avatar,
          role: result.data.user.role,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        } as AuthUser;
      } catch {
        return null;
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.provider || !SOCIAL_PROVIDERS.has(account.provider)) {
        return true;
      }

      if (!user.email || !account.providerAccountId) {
        return false;
      }

      try {
        const result = await postJson<BackendAuthResponse>('/auth/social', {
          provider: account.provider,
          providerId: account.providerAccountId,
          email: user.email,
          name: user.name || user.email,
          avatar: user.image,
          role: 'attendee',
        });

        const nextUser = user as unknown as AuthUser;
        nextUser.id = result.data.user._id;
        nextUser.name = result.data.user.name;
        nextUser.email = result.data.user.email;
        nextUser.image = result.data.user.avatar;
        nextUser.role = result.data.user.role;
        nextUser.accessToken = result.data.accessToken;
        nextUser.refreshToken = result.data.refreshToken;

        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        const authUser = user as unknown as AuthUser;
        token.sub = authUser.id;
        token.role = authUser.role;
        token.accessToken = authUser.accessToken;
        token.refreshToken = authUser.refreshToken;
        token.picture = authUser.image;
      }

      if (trigger === 'update') {
        const payload = session as SessionUpdatePayload;

        if (payload.user?.role) {
          token.role = payload.user.role;
        }

        if (payload.accessToken) {
          token.accessToken = payload.accessToken;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
        session.user.role = (token.role as 'attendee' | 'organizer' | 'admin') || 'attendee';
      }

      session.accessToken = (token.accessToken as string | undefined) ?? undefined;

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },
};
