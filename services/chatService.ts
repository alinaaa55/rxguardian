import api from './api';
import { storage } from './storage';

export interface ChatMessage {
  id: number;
  user_id: string;
  message: string;
  sender: 'user' | 'assistant' | 'bot'; 
  timestamp: string;
  pharmeasy_results?: PharmEasyResult[];
  localImageUri?: string;
}

export interface PharmEasyResult {
  medicine: string;
  results: {
    title: string;
    url: string;
    image: string;
  }[];
}

export interface ChatResponse {
  user_message: ChatMessage;
  pre_tool_message?: ChatMessage;
  bot_message: ChatMessage;
  pharmeasy_results?: PharmEasyResult[];
}

export const chatService = {
  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await api.post('/api/v1/chat', { message });
    return response.data;
  },

  async sendImageMessage(message: string, imageUri: string): Promise<ChatResponse> {
    const formData = new FormData();
    formData.append('message', message);
    
    // For React Native, we need to create a special file object for FormData
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: imageUri,
      name: `prescription.${fileType}`,
      type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
    } as any);

    const response = await api.post('/api/v1/chat/with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data: ChatResponse = response.data;
    if (data.user_message && data.user_message.id) {
      await storage.saveChatImage(data.user_message.id.toString(), imageUri);
    }
    
    return data;
  },

  async getHistory(limit: number = 50): Promise<ChatMessage[]> {
    const response = await api.get('/api/v1/chat/history', {
      params: { limit },
    });
    
    const messages: ChatMessage[] = response.data;
    
    // Check for images in history
    for (const msg of messages) {
      if (msg.message && msg.message.includes('[image]')) {
        const localUri = await storage.getChatImage(msg.id.toString());
        if (localUri) {
          msg.localImageUri = localUri;
        }
      }
    }
    
    return messages;
  },

  async clearHistory(): Promise<void> {
    await api.delete('/api/v1/chat/history');
    await storage.clearChatImages();
  }
};
