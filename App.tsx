import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Constants from './src/core/common/constants';
import { RecoilRoot } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/page/Auth';
import DrawerMenu from './src/infrastructure/common/layouts/drawer-menu';
import EditProfile from './src/page/profile/components/editProfile';
import ForgotPasswordScreen from './src/page/Auth/forgotPassword';
import ResetPasswordScreen from './src/page/Auth/resetPassword';
import ChatSlugScreen from './src/page/chat/chatSlug';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RegisterScreen from './src/page/Auth/register';
import OtpVerificationScreen from './src/page/Auth/veriify-otp';
import fcmService from './src/infrastructure/repositories/fcm/fcmService';
import InAppNotification from './src/page/notification/InAppNotification';
import CallScreen from './src/page/call/CallScreen';
import IncomingCallScreen from './src/page/call/IncomingCallScreen';
import { navigationRef, setNavigationReady } from './src/core/common/navigator';
import CallHistoryScreen from './src/page/call/CallHistoryScreen';
import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token").then(result => {
        return result
      });
      setIsLogin(!!token);
      if (token || token !== null) {
        setInitialRoute('DrawerMenu');
      } else {
        setInitialRoute('LoginScreen');
      }
    } catch (error) {
      setInitialRoute('LoginScreen');
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    // <NavigationContainer ref={navigationRef}>
    <Stack.Navigator
      initialRouteName={"LoginScreen"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={"DrawerMenu"}
        component={DrawerMenu}
        options={{ headerShown: false }}
      />
      <Stack.Screen name={Constants.Navigator.Auth.LoginScreen.value} component={LoginScreen} />
      <Stack.Screen name={"RegisterScreen"} component={RegisterScreen} />
      <Stack.Screen name={"OtpVerificationScreen"} component={OtpVerificationScreen} />
      <Stack.Screen name={"EditProfile"} component={EditProfile} />
      <Stack.Screen name={"ForgotPasswordScreen"} component={ForgotPasswordScreen} />
      <Stack.Screen name={"ResetPasswordScreen"} component={ResetPasswordScreen} />
      <Stack.Screen name={"ChatSlugScreen"} component={ChatSlugScreen} />
      <Stack.Screen name="CallScreen" component={CallScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IncomingCallScreen" component={IncomingCallScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CallHistoryScreen" options={{ headerShown: true, title: "Lịch sử cuộc gọi" }} component={CallHistoryScreen} />
    </Stack.Navigator>
    // </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  // Sử dụng một state duy nhất để theo dõi thông báo hiện tại
  const [notification, setNotification] = useState<any>(null);
  const [pendingNotification, setPendingNotification] = useState<any>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Tham chiếu đến đối tượng NavigationContainer
  // const navigationRef = React.useRef(null);

  useEffect(() => {
    // Khởi tạo FCM khi app khởi động
    const initFCM = async () => {
      try {
        // Yêu cầu quyền
        const hasPermission = await fcmService.requestUserPermission();

        if (hasPermission) {
          // Lấy và đăng ký token
          const token = await fcmService.getFCMToken();
          console.log('FCM token in App.js:', token);

          // Thiết lập lắng nghe thông báo - CHỈ THIẾT LẬP MỘT LẦN
          const unsubscribe = fcmService.setupMessageListeners((remoteMessage: any) => {
            console.log('Notification received in App.js:', remoteMessage);

            if (remoteMessage.notification) {
              // Hiển thị thông báo tùy chỉnh thay vì Alert
              setNotification({
                title: remoteMessage.notification.title || 'Thông báo mới',
                body: remoteMessage.notification.body || '',
                data: remoteMessage.data,
              });

              // Xử lý điều hướng nếu cần
              if (remoteMessage.data && remoteMessage.data.screen && navigationRef.current) {
                // Sử dụng navigationRef để điều hướng
                // @ts-ignore
                navigationRef.current.navigate(remoteMessage.data.screen, remoteMessage.data.params);
                console.log('Navigating to:', remoteMessage.data.screen);
              }
            }
          });

          // Thiết lập lắng nghe token refresh
          const unsubscribeTokenRefresh = fcmService.setupTokenRefresh();

          // Kiểm tra thông báo khi mở app từ trạng thái đóng
          const initialNotification = await messaging().getInitialNotification();
          if (initialNotification) {
            console.log('App opened from killed state by notification:', 
              JSON.stringify(initialNotification));
            
            // Lưu thông báo đến một state để xử lý sau khi navigation sẵn sàng
            setPendingNotification(initialNotification);
          }

          // Dọn dẹp khi unmount
          return () => {
            unsubscribe && unsubscribe();
            unsubscribeTokenRefresh && unsubscribeTokenRefresh();
          };
        }
      } catch (error) {
        console.log('FCM initialization error:', error);
      }
    };

    initFCM();
  }, []);

  // Kiểm tra navigation ref
  useEffect(() => {
    if (navigationRef.current && !isNavigationReady) {
      setIsNavigationReady(true);
      console.log('Navigation ref is ready, setting isNavigationReady to true');
    }
  }, [isNavigationReady]); // Thêm isNavigationReady vào dependencies

  // Xử lý thông báo đang chờ
  useEffect(() => {
    if (!pendingNotification) return;
    
    console.log('Processing pending notification, navigation ready:', isNavigationReady);
    
    // Nếu navigation chưa sẵn sàng nhưng có pendingNotification, đợi 300ms rồi kiểm tra lại
    if (!isNavigationReady && navigationRef.current) {
      console.log('Setting navigation ready due to pending notification');
      setIsNavigationReady(true);
    }
    
    // Chỉ xử lý thông báo khi navigation đã sẵn sàng
    if (isNavigationReady) {
      console.log('Navigation is ready, processing notification after delay');
      const timer = setTimeout(() => {
        try {
          // Debugging
          console.log('Handling notification:', 
            pendingNotification.data?.type,
            JSON.stringify(pendingNotification.data)
          );
          
          // Thử xử lý thông báo
          const isCallHandled = fcmService.handleCallNotification(pendingNotification);
          console.log('Call handled result:', isCallHandled);
          
          if (!isCallHandled && pendingNotification.notification) {
            // Hiển thị thông báo trong app
            setNotification({
              title: pendingNotification.notification.title || 'Thông báo mới',
              body: pendingNotification.notification.body || '',
              data: pendingNotification.data,
            });
          }
        } catch (error) {
          console.error('Error handling pending notification:', error);
        } finally {
          setPendingNotification(null);
        }
      }, 1000); // Thời gian chờ hợp lý
      
      return () => clearTimeout(timer);
    }
  }, [pendingNotification, isNavigationReady]); // Thêm cả hai dependencies

  // Phần return trong App.tsx
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RecoilRoot>
        <NavigationContainer 
          ref={navigationRef}
          onReady={() => {
            console.log('Navigation container is now ready!');
            setNavigationReady(); // Gọi hàm từ navigator.ts
            setIsNavigationReady(true); // Cập nhật state trong App.tsx
          }}
        >
          <StackNavigator />
          {notification && (
            <InAppNotification
              title={notification.title}
              message={notification.body}
              onPress={() => {
                console.log('Notification pressed:', notification.data);
                // Kiểm tra xem đây có phải thông báo cuộc gọi không
                if (notification.data?.type === 'call') {
                  fcmService.handleCallNotification({data: notification.data});
                } 
                // Xử lý điều hướng thông thường
                else if (notification.data?.screen && navigationRef.current) {
                  navigationRef.current.navigate(notification.data.screen, notification.data.params);
                }
                // Đóng notification sau khi xử lý
                setNotification(null);
              }}
              onClose={() => setNotification(null)}
            />
          )}
        </NavigationContainer>
      </RecoilRoot>
    </GestureHandlerRootView>
  );
}

export default App;