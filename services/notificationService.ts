import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  async scheduleMedicineReminder(medicineId: string, name: string, timeStr: string) {
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
  },

  async cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async cancelReminder(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
};
