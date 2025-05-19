import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoint } from '../../../core/common/apiLink';
import { navigate } from '../../../core/common/navigator';

class FCMService {
  async requestUserPermission() {
    try {
      // Android 13+ (API level 33) requires POST_NOTIFICATIONS permission
      if (Platform.OS === 'android' && parseInt(Platform.Version.toString()) >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Notification permission denied for Android 13+');
          return false;
        }
      }
      
      // iOS notification permissions
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
      
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
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
    console.log('Registering token with server:', token);

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

  // Sửa phương thức handleCallNotification
  handleCallNotification = (remoteMessage: any) => {
    try {
      console.log('FCM - FULL DATA:', JSON.stringify(remoteMessage, null, 2));

      // Kiểm tra nhiều trường hợp của thông báo cuộc gọi
      if (
        // Trường hợp 1: Định dạng như trong code hiện tại
        (remoteMessage.data?.type === 'call') ||
        // Trường hợp 2: Định dạng thực tế bạn nhận được
        (remoteMessage.notification?.title?.includes('Cuộc gọi') && remoteMessage.data?.type === 'NOTIFICATION_TYPE')
      ) {
        // Xác định callData từ nhiều định dạng có thể có
        let callData: any = {};

        // Trường hợp 1: Thông tin trong data.callData
        if (remoteMessage.data?.callData) {
          if (typeof remoteMessage.data.callData === 'string') {
            try {
              callData = JSON.parse(remoteMessage.data.callData);
            } catch (e) {
              console.error('Error parsing callData string:', e);
            }
          } else {
            callData = remoteMessage.data.callData;
          }
        }
        // Trường hợp 2: Thông tin trực tiếp trong data
        else if (remoteMessage.data?.channelId) {
          callData = {
            callerName: remoteMessage.data.callerName || "Unknown",
            channelId: remoteMessage.data.channelId,
            callerImage: remoteMessage.data.callerImage
          };
        }
        // Trường hợp 3: Định dạng thực tế - Phải trích xuất từ body và id
        else if (remoteMessage.notification?.body && remoteMessage.data?.id) {
          const callerName = remoteMessage.notification.body.replace("Cuộc gọi từ ", "").trim();
          callData = {
            callerName: callerName || "Unknown Caller",
            channelId: remoteMessage.data.id, // Sử dụng id làm channelId
            callerImage: null
          };
        }
        
        console.log('Extracted call data:', callData);
        
        if (callData.channelId || callData.callerName) {
          console.log('Navigating to IncomingCallScreen with:', callData);
          setTimeout(() => {
            navigate('IncomingCallScreen', {
              callerName: callData.callerName || "Unknown",
              channelId: callData.channelId || remoteMessage.data.id, // Fallback to id
              callerImage: callData.callerImage || null,
            });
          }, 300);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error in handleCallNotification:', error);
      return false;
    }
  };

  // Cập nhật phương thức navigateToCallScreen
  navigateToCallScreen = (callData: any, retries = 5) => {
    // Sử dụng navigate() thay vì navigationRef.current.navigate()
    navigate('IncomingCallScreen', {
      callerName: callData.callerName,
      channelId: callData.channelId,
      callerImage: callData.callerImage || null,
    });
    return true;
  };

  setupMessageListeners(onNotificationReceived: any) {
    // Hàm xử lý thông báo cuộc gọi chung
    // this.handleCallNotification = (remoteMessage: any) => {
    //   try {
    //     console.log('Checking notification type:', remoteMessage?.data?.type);

    //     if (remoteMessage.data && remoteMessage.data.type === 'call') {
    //       // Xử lý dữ liệu cuộc gọi
    //       const callData =
    //         typeof remoteMessage.data.callData === 'string'
    //           ? JSON.parse(remoteMessage.data.callData)
    //           : remoteMessage.data.callData;

    //       console.log('Processing call notification with data:', callData);

    //       // Điều hướng đến màn hình cuộc gọi đến
    //       if (navigationRef && navigationRef.current) {
    //         navigationRef.current.navigate('IncomingCallScreen', {
    //           callerName: callData.callerName,
    //           channelId: callData.channelId,
    //           callerImage: callData.callerImage || null,
    //         });
    //         return true;
    //       } else {
    //         console.error('Navigation reference is not available');
    //       }
    //     }
    //     return false;
    //   } catch (error) {
    //     console.error('Error processing call notification:', error);
    //     return false;
    //   }
    // };

    // Xử lý thông báo khi ứng dụng đang chạy ở foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);

      // Thử xử lý như thông báo cuộc gọi trước
      const isCallHandled = this.handleCallNotification(remoteMessage);

      // Nếu không phải thông báo cuộc gọi, xử lý như thông báo thông thường
      if (!isCallHandled) {
        onNotificationReceived(remoteMessage);
      }
    });

    // Xử lý khi user nhấn vào thông báo và mở ứng dụng từ background
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app from background:', remoteMessage);

      // Thử xử lý như thông báo cuộc gọi trước
      setTimeout(() => {
        const isCallHandled = this.handleCallNotification(remoteMessage);

        if (!isCallHandled) {
          onNotificationReceived(remoteMessage);
        }
      }, 500);
    });

    // Xử lý khi ứng dụng được mở từ trạng thái đóng hoàn toàn
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);

          // Thử xử lý như thông báo cuộc gọi trước
          const isCallHandled = this.handleCallNotification(remoteMessage);

          // Nếu không phải thông báo cuộc gọi, xử lý như thông báo thông thường
          if (!isCallHandled && remoteMessage) {
            onNotificationReceived(remoteMessage);
          }
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