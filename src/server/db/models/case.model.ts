export interface CaseModel {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  userId: string;
  assignedLawyerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CaseModelSchema {
  // TODO: Define database schema/model
  
  static tableName = 'cases';
  
  static fields = {
    id: 'uuid PRIMARY KEY',
    title: 'varchar(255) NOT NULL',
    description: 'text',
    status: 'varchar(50) DEFAULT \'open\'',
    priority: 'varchar(50) DEFAULT \'medium\'',
    userId: 'uuid NOT NULL REFERENCES users(id)',
    assignedLawyerId: 'uuid REFERENCES users(id)',
    createdAt: 'timestamp DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'timestamp DEFAULT CURRENT_TIMESTAMP',
  };

  static statusValues = ['open', 'in_progress', 'closed', 'archived'];
  static priorityValues = ['low', 'medium', 'high', 'urgent'];
}