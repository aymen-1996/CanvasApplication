export interface Notification {
    id: number;          
    userId: number;    
    message: string;   
    createdAt: Date;   
    isRead: boolean;  
  }