import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Yêu cầu quyền gửi thông báo từ người dùng
 */
export const requestUserPermission = async () => {
    try {
        console.log('Requesting user permission for notifications');

        if (Platform.OS === 'ios') {
            // iOS yêu cầu quyền rõ ràng
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
                return await getFcmToken();
            } else {
                console.log('User denied notification permission');
                return null;
            }
        } else {
            // Android không cần yêu cầu quyền rõ ràng
            return await getFcmToken();
        }
    } catch (error) {
        console.error('Failed to request permission', error);
        return null;
    }
};

/**
 * Lấy FCM token từ Firebase
 * Token này dùng để xác định thiết bị khi gửi thông báo
 */
export const getFcmToken = async () => {
    try {
        // Kiểm tra xem token đã tồn tại trong storage chưa
        const storedToken = await AsyncStorage.getItem('fcmToken');

        if (!storedToken) {
            // Lấy token mới nếu chưa có
            const token = await messaging().getToken();

            if (token) {
                console.log("New FCM Token generated: ", token);
                await AsyncStorage.setItem('fcmToken', token);
                return token;
            }
        } else {
            console.log("Using stored FCM Token: ", storedToken);
            return storedToken;
        }
    } catch (error) {
        console.log("Error getting/storing FCM token: ", error);
        return null;
    }
};

/**
 * Hàm lắng nghe thông báo khi app đang chạy (foreground)
 */
export const listenToForegroundMessages = () => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('Received foreground notification: ', remoteMessage);

        // Hiển thị alert khi nhận được thông báo trong khi app đang mở
        if (remoteMessage && remoteMessage.notification) {
            Alert.alert(
                remoteMessage.notification.title || 'Thông báo mới',
                remoteMessage.notification.body || 'Bạn có thông báo mới',
                [{ text: 'OK', onPress: () => console.log('Notification alert closed') }]
            );
        }
    });

    return unsubscribe; // Trả về function để hủy đăng ký khi cần
};

/**
 * Xử lý thông báo khi app đang ở background
 */
export const backgroundMessageHandler = async (remoteMessage: any) => {
    console.log('Notification received in background: ', remoteMessage);
    // Thực hiện các tác vụ cần thiết với dữ liệu thông báo
    return Promise.resolve();
};

/**
 * Thiết lập handler cho việc nhấn vào thông báo
 */
export const setupNotificationOpenedHandler = (navigation: any) => {
    // Xử lý khi người dùng nhấn vào thông báo để mở app
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened the app from background:', remoteMessage);

        // Điều hướng dựa vào dữ liệu của thông báo
        if (remoteMessage.data && remoteMessage.data.screen) {
            navigation.navigate(remoteMessage.data.screen);
        }
    });

    // Kiểm tra nếu app được mở từ thông báo khi app đã đóng hoàn toàn
    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('App opened from quit state by notification:', remoteMessage);

            // Điều hướng sau một khoảng thời gian để đảm bảo navigation đã sẵn sàng
            setTimeout(() => {
                if (remoteMessage.data && remoteMessage.data.screen) {
                    navigation.navigate(remoteMessage.data.screen);
                }
            }, 1000);
        }
    });
};