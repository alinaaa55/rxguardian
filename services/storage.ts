import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const USER_INFO_KEY = 'userInfo';
const PROFILE_COMPLETE_KEY = 'isProfileComplete';
const ONBOARDING_COMPLETE_KEY = 'isOnboardingComplete';
const MEDS_KEY = 'meds';

export const storage = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async saveUserInfo(userInfo: any) {
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  async getUserInfo() {
    const data = await AsyncStorage.getItem(USER_INFO_KEY);
    return data ? JSON.parse(data) : null;
  },

  async removeUserInfo() {
    await AsyncStorage.removeItem(USER_INFO_KEY);
  },

  async setProfileComplete(complete: boolean) {
    await AsyncStorage.setItem(PROFILE_COMPLETE_KEY, JSON.stringify(complete));
  },

  async isProfileComplete() {
    const data = await AsyncStorage.getItem(PROFILE_COMPLETE_KEY);
    return data ? JSON.parse(data) : false;
  },

  async setOnboardingComplete(complete: boolean) {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, JSON.stringify(complete));
  },

  async isOnboardingComplete() {
    const data = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return data ? JSON.parse(data) : false;
  },

  async saveMeds(meds: any[]) {
    await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(meds));
  },

  async getMeds() {
    const data = await AsyncStorage.getItem(MEDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async clearAll() {
    await this.removeToken();
    await AsyncStorage.clear();
  }
};
