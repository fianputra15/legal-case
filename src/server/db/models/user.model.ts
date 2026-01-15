export interface UserModel {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModelSchema {
  // TODO: Define database schema/model
  // Example for Prisma: export const User = prisma.user
  // Example for Mongoose: export const User = mongoose.model('User', userSchema)
  
  static tableName = 'users';
  
  static fields = {
    id: 'uuid PRIMARY KEY',
    email: 'varchar(255) UNIQUE NOT NULL',
    password: 'varchar(255) NOT NULL',
    firstName: 'varchar(100) NOT NULL',
    lastName: 'varchar(100) NOT NULL',
    role: 'varchar(50) DEFAULT \'client\'',
    isActive: 'boolean DEFAULT true',
    createdAt: 'timestamp DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'timestamp DEFAULT CURRENT_TIMESTAMP',
  };
}