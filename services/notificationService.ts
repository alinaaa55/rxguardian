import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// For SDK 53+ Android Push Notification support is removed from Expo Go.
// We wrap calls in try-catch to prevent app crashes in Expo Go environments.
const isExpoGo = Constants.appOwnership === 'expo';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (error) {
      if (isExpoGo && Platform.OS === 'android') {
        console.warn('Notifications permission request failed in Expo Go. Use a development build for full support.');
      }
      return false;
    }
  },

  async scheduleMedicineReminder(medicineId: string, name: string, timeStr: string) {
    try {
      // timeStr is in format "HH:MM AM/PM"
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medicine Reminder 💊",
          body: `It's time to take your ${name}.`,
          data: { medicineId },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      return identifier;
    } catch (error) {
      if (isExpoGo) {
        console.warn('Notification scheduling is limited in Expo Go. Local notifications should work, but push features are restricted.');
      }
      return null;
    }
  },

  async cancelAllReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      // Ignore errors in cleanup
    }
  },

  async cancelReminder(identifier: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      // Ignore errors in cleanup
    }
  }
};
