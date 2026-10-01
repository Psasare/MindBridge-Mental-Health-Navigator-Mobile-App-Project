import { useEffect } from 'react';
import { LightSensor } from 'expo-sensors';

export const useSleepHygiene = (onWarning: () => void) => {
  useEffect(() => {
    let subscription: any;

    const checkSleepHygiene = async () => {
      const hour = new Date().getHours();
      const isLateNight = hour >= 22 || hour < 5;

      if (isLateNight) {
        await LightSensor.setUpdateInterval(2000);
        subscription = LightSensor.addListener(({ illuminance }) => {
          if (illuminance < 10) {
            onWarning();
            if (subscription) {
              subscription.remove();
              subscription = null;
            }
          }
        });
      }
    };

    checkSleepHygiene();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [onWarning]);
};
