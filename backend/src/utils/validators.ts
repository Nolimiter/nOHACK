export const validateEnv = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'BCRYPT_ROUNDS',
  ];

 const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate bcrypt rounds
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
  if (isNaN(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 14) {
    throw new Error('BCRYPT_ROUNDS must be a number between 10 and 14');
  }
};