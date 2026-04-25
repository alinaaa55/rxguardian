import api from './api';
import { storage } from './storage';

export interface AIMessage {
  id: string;
  message: string;
  sender: string;
  timestamp: string;
}

export interface AIResponse {
  bot_message: AIMessage;
}

export const aiService = {
  /**
   * 1. Interaction Alert
   * Backend expects: 
   * - new_medicine: dict
   * - user_profile: dict
   * - current_medications: List[dict]
   */
  async getInteractionAlert(newMedicine: string): Promise<AIResponse> {
    const userProfile = await storage.getUserInfo();
    const currentMeds = await storage.getMeds();
    
    const response = await api.post('/api/v1/ai/interaction-alert', {
      // Changed from string to dict to match Pydantic schema
      new_medicine: { name: newMedicine }, 
      user_profile: {
        bloodGroup: userProfile?.bloodGroup || 'Not specified',
        allergies: userProfile?.allergies || 'None',
        dob: userProfile?.dob || 'Not specified'
      },
      current_medications: currentMeds.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        instructions: m.instructions
      }))
    });
    return response.data;
  },

  /**
   * 2. AI Suggestions
   * Backend expects:
   * - user_profile: dict
   * - full_medication_list: List[dict]
   */
  async getSuggestions(): Promise<AIResponse> {
    const userProfile = await storage.getUserInfo();
    const currentMeds = await storage.getMeds();

    const response = await api.post('/api/v1/ai/suggestions', {
      user_profile: {
        bloodGroup: userProfile?.bloodGroup || 'Not specified',
        allergies: userProfile?.allergies || 'None',
        dob: userProfile?.dob || 'Not specified'
      },
      full_medication_list: currentMeds.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        instructions: m.instructions
      }))
    });
    return response.data;
  },

  /**
   * 3. AI Insights
   * Backend expects:
   * - weekly_tracking_history: List[dict] (must be the array, not the object)
   * - medication_list: List[dict]
   */
  async getInsights(): Promise<AIResponse> {
    const meds = await storage.getMeds();
    const weeklyTrackingRes = await api.get('/api/v1/track/weekly');
    
    const response = await api.post('/api/v1/ai/insights', {
      // Pass only the daily_summaries array to match List[dict]
      weekly_tracking_history: weeklyTrackingRes.data.daily_summaries || [],
      medication_list: meds.map((m: any) => ({
        name: m.name,
        frequency: m.frequency
      }))
    });
    return response.data;
  }
};
