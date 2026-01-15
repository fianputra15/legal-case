export interface MessageModel {
  id: string;
  content: string;
  senderId: string;
  caseId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MessageModelSchema {
  // TODO: Define database schema/model
  
  static tableName = 'messages';
  
  static fields = {
    id: 'uuid PRIMARY KEY',
    content: 'text NOT NULL',
    senderId: 'uuid NOT NULL REFERENCES users(id)',
    caseId: 'uuid NOT NULL REFERENCES cases(id)',
    isRead: 'boolean DEFAULT false',
    createdAt: 'timestamp DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'timestamp DEFAULT CURRENT_TIMESTAMP',
  };
}