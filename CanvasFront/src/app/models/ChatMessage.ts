export interface ChatMessage {
  id:number;
    username: string;
    message: string | null;
    messageType: string;
    senderId: number;
    recipientId:number;
    imageUrl?: string | null;
    userPhotoUrl?: any; 
    timestamp?: string; 
    reactions:any
   
  }