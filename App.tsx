/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

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
import { Alert } from 'react-native';

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
  // if (initialRoute) {
  return (
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
    </Stack.Navigator>
  );
  // }
};


function App(): React.JSX.Element {
  const [currentNotification, setCurrentNotification] = useState(null);

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

          // Thiết lập lắng nghe thông báo
          const unsubscribe = fcmService.setupMessageListeners((notification: any) => {
            console.log('Notification received in App.js:', notification);

            // Lưu thông báo vào state nếu cần
            setCurrentNotification(notification);

            // Hiển thị thông báo (có thể thay bằng component tùy chỉnh)
            if (notification.notification) {
              Alert.alert(
                notification.notification.title || 'Thông báo mới',
                notification.notification.body,
                [{ text: 'OK', onPress: () => console.log('OK pressed') }],
                { cancelable: false }
              );
            }

            // Xử lý hành động khi nhận thông báo
            // Ví dụ: điều hướng đến màn hình cụ thể
            if (notification.data && notification.data.screen) {
              // navigation.navigate(notification.data.screen, notification.data.params);
              console.log('Should navigate to:', notification.data.screen);
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
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </RecoilRoot>
    </GestureHandlerRootView>
  );
}

export default App;
