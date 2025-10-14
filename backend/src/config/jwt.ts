import { SignOptions } from 'jsonwebtoken';

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
  options: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as SignOptions,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_token_secret',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
};