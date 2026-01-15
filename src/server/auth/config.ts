export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export type AuthConfig = typeof authConfig;
