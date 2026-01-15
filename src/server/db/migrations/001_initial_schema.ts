/**
 * Database migration example
 * This file would contain the initial database schema creation
 */

export const migration_001_initial_schema = {
  name: '001_initial_schema',
  up: `
    -- Create users table
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) DEFAULT 'client',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create cases table
    CREATE TABLE cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'open',
      priority VARCHAR(50) DEFAULT 'medium',
      user_id UUID NOT NULL REFERENCES users(id),
      assigned_lawyer_id UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create messages table
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      sender_id UUID NOT NULL REFERENCES users(id),
      case_id UUID NOT NULL REFERENCES cases(id),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_cases_user_id ON cases(user_id);
    CREATE INDEX idx_cases_status ON cases(status);
    CREATE INDEX idx_messages_case_id ON messages(case_id);
    CREATE INDEX idx_messages_sender_id ON messages(sender_id);
  `,
  down: `
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS cases;
    DROP TABLE IF EXISTS users;
  `
};