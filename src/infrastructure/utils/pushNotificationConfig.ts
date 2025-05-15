import PushNotification, { Importance } from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

class NotificationHandler {
  private _onNotification: (notification: any) => void = () => null;
  private _onRegister: (token: any) => void = () => null;

  onNotification(notification: any) {
    console.log('NotificationHandler:', notification);
    
    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }

    if (Platform.OS === 'ios') {
      // Cần cho iOS để tiếp tục xử lý thông báo
      if (notification.data.openedInForeground) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    }
  }

  onRegister(token: any) {
    console.log('NotificationHandler:', token);
    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }

  attachRegister(handler: (token: any) => void) {
    this._onRegister = handler;
  }

  attachNotification(handler: (notification: any) => void) {
    this._onNotification = handler;
  }
}

const handler = new NotificationHandler();

PushNotification.configure({
  // (required) Gọi khi có token thiết bị
  onRegister: handler.onRegister.bind(handler),

  // (required) Gọi khi nhận được thông báo remote hoặc local
  onNotification: handler.onNotification.bind(handler),

  // Cho phép cập nhật badge trên iOS
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Thuộc tính của thông báo đẩy
  popInitialNotification: true,
  requestPermissions: true,
});

// Tạo kênh thông báo cho Android
if (Platform.OS === 'android') {
  PushNotification.createChannel(
    {
      channelId: 'default-channel-id', // (required)
      channelName: 'Default channel', // (required)
      channelDescription: 'Channel for default notifications', // (optional) mô tả
      playSound: true, // (optional) Chạy âm thanh khi thông báo đến
      soundName: 'default', // (optional) Âm thanh để chạy khi thông báo đến
      importance: Importance.HIGH, // (optional) Mức độ quan trọng (HIGH đảm bảo hiển thị đầy đủ ngay cả trong foreground)
      vibrate: true, // (optional) Rung thiết bị khi thông báo đến
    },
    (created: any) => console.log(`Notification channel created: ${created}`)
  );
}

export const LocalNotification = {
  showNotification(title: string, message: string, data = {}) {
    PushNotification.localNotification({
      /* Android Only Properties */
      channelId: 'default-channel-id', 
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      
      /* iOS and Android properties */
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      userInfo: data,
    });
  },
  
  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  },
};

export default handler;