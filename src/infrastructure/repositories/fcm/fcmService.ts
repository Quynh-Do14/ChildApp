import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoint } from '../../../core/common/apiLink';

class FCMService {
  /**
   * Yêu cầu quyền cho iOS và Android 13+
   */
  async requestUserPermission() {
    try {
      // Xử lý quyền cho Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied');
          return false;
        }
      }

      // Xử lý quyền cho iOS
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Authorization status:', authStatus);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  }

  /**
   * Lấy FCM token từ Firebase
   */
  async getFCMToken() {
    try {
      // Kiểm tra token đã lưu
      let fcmToken = await AsyncStorage.getItem('fcmToken');

      if (!fcmToken) {
        // Yêu cầu token mới
        fcmToken = await messaging().getToken();

        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          await AsyncStorage.setItem('fcmToken', fcmToken);
          await this.registerTokenWithServer(fcmToken);
        }
      } else {
        console.log('Token already exists:', fcmToken);
        await this.registerTokenWithServer(fcmToken);
      }

      return fcmToken;
    } catch (error) {
      console.log('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Gửi token lên server Spring Boot
   */
  async registerTokenWithServer(token: any) {
    try {
      const userToken = await AsyncStorage.getItem('token');

      if (!userToken) {
        await AsyncStorage.setItem('pendingFcmToken', token);

        console.log('User token not found, saving pending FCM token:', token);

        return;
      }

      // Thay thế URL này với endpoint của Spring Boot của bạn
      const response = await fetch(Endpoint.Notification.RegisterToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Thêm headers xác thực nếu cần
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          token: token,
          deviceName: Platform.OS === 'ios' ? 'iOS' : 'Android',
          deviceModel: Platform.Version,
        }),
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      const result = await response.json();
      console.log('Token registration result:', result);

      await AsyncStorage.removeItem('pendingFcmToken');
      return result;
    } catch (error) {
      console.log('Error registering token with server:', error);
    }
  }

  async registerTokenWithEmail(token: any, email: string) {
    console.log('Registering token with email:', token, email);
    try {
      // Thay thế URL này với endpoint của Spring Boot của bạn
      const response = await fetch(Endpoint.Notification.RegisterTokenEmail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Thêm headers xác thực nếu cần
        },
        body: JSON.stringify({
          token: token,
          // deviceName: Platform.OS === 'ios' ? 'iOS' : 'Android',
          // deviceModel: Platform.Version,
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      const result = await response.json();
      console.log('Token registration result:', result);

      await AsyncStorage.removeItem('pendingFcmToken');
      return result;
    } catch (error) {
      console.log('Error registering token with email:', error);
    }
  }

  /**
   * Thiết lập các bộ lắng nghe cho thông báo
   */
  setupMessageListeners(onNotificationReceived: any) {
    // Xử lý thông báo khi ứng dụng đang chạy ở foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
      onNotificationReceived(remoteMessage);
    });

    // Xử lý khi user nhấn vào thông báo và mở ứng dụng từ background
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app from background:', remoteMessage);
      onNotificationReceived(remoteMessage);
    });

    // Xử lý khi ứng dụng được mở từ trạng thái đóng hoàn toàn
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);
          onNotificationReceived(remoteMessage);
        }
      });

    // Xử lý thông báo ở background
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message handler:', remoteMessage);
      // Không thể trực tiếp gọi onNotificationReceived vì code JS không chạy ở background
      return Promise.resolve();
    });

    // Trả về hàm để hủy đăng ký khi cần
    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }

  /**
   * Xử lý khi token được làm mới
   */
  setupTokenRefresh() {
    return messaging().onTokenRefresh(async (token) => {
      console.log('FCM token refreshed:', token);
      await AsyncStorage.setItem('fcmToken', token);
      await this.registerTokenWithServer(token);
    });
  }

  /**
   * Xóa FCM token khi logout
   */
  async deleteToken() {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const userToken = await AsyncStorage.getItem('token');

      if (fcmToken && userToken) {
        try {
          await fetch(Endpoint.Notification.UnregisterToken, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              token: fcmToken,
            }),
          });
        } catch (error) {
          console.log('Error unregistering FCM token:', error);
        }
      }

      await AsyncStorage.removeItem('fcmToken');
      await AsyncStorage.removeItem('pendingFcmToken');
      await messaging().deleteToken();
      console.log('FCM token deleted');
      return true;
    } catch (error) {
      console.log('Error deleting FCM token:', error);
      return false;
    }
  }
}

export default new FCMService();