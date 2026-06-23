// import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Stubbed out for Expo Go compatibility. 
// expo-notifications causes an Invariant Violation (PushNotificationIOS missing) in SDK 53+ on Expo Go.
export const NotificationService = {
  init: async () => {
    console.log('Notifications stubbed out for Expo Go compatibility');
    return false;
  },

  scheduleDailyReminder: async () => {
    console.log('Would schedule daily reminder');
  },

  scheduleFollowUp: async () => {
    console.log('Would schedule follow up');
  }
};
