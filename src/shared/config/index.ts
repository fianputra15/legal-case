// Application configuration
export const config = {
  environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  appName: 'Legal Case Workspace',
  version: '1.0.0',
} as const;