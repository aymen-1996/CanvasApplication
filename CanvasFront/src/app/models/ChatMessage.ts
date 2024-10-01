export interface ChatMessage {
    username: string;
    message: string;
    messageType: string;
    senderId: number;
    imageUrl?: string | null;
    userPhotoUrl?: any; 
    timestamp?: string; 
  }