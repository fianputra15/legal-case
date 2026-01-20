export const authConfig = {
  session: {
    secret: process.env.SESSION_SECRET || 'fallback-session-secret',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    cookieName: 'session-id',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },
};

export type AuthConfig = typeof authConfig;
