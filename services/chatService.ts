import api from './api';

export interface ChatMessage {
  id: number;
  user_id: string;
  message: string;
  sender: 'user' | 'assistant' | 'bot'; // 'assistant' and 'bot' seem to be used interchangeably in common chat apps, but backend uses 'user'/'bot'
  timestamp: string;
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
    return response.data;
  },

  async getHistory(limit: number = 50): Promise<ChatMessage[]> {
    const response = await api.get('/api/v1/chat/history', {
      params: { limit },
    });
    return response.data;
  }
};
