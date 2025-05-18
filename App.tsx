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
import { navigationRef } from './src/core/common/navigator';

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
    <NavigationContainer ref={navigationRef}>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  // Sử dụng một state duy nhất để theo dõi thông báo hiện tại
  const [notification, setNotification] = useState<any>(null);

  // Tham chiếu đến đối tượng NavigationContainer
  const navigationRef = React.useRef(null);

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RecoilRoot>
        <NavigationContainer ref={navigationRef}>
          <StackNavigator />
          {notification && (
            <InAppNotification
              title={notification.title}
              message={notification.body}
              onPress={() => {
                // Xử lý khi nhấn vào thông báo
                if (notification.data && notification.data.screen && navigationRef.current) {
                  // @ts-ignore
                  navigationRef.current.navigate(notification.data.screen, notification.data.params);
                }
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