export interface ChatMessage {
    username: string;
    message: string | null;
    messageType: string;
    senderId: number;
    imageUrl?: string | null;
    userPhotoUrl?: any; 
    timestamp?: string; 
  }