// Application configuration
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  appName: 'Legal Case Workspace',
  version: '1.0.0',
} as const;