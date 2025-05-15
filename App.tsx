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
import messaging from '@react-native-firebase/messaging';
import { backgroundMessageHandler, listenToForegroundMessages, requestUserPermission, setupNotificationOpenedHandler } from './src/infrastructure/utils/notification';
import notificationService from './src/infrastructure/repositories/notification/notification.service';

const Stack = createNativeStackNavigator();

messaging().setBackgroundMessageHandler(backgroundMessageHandler);

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
      <Stack.Screen name={"EditProfile"} component={EditProfile} />
      <Stack.Screen name={"ForgotPasswordScreen"} component={ForgotPasswordScreen} />
      <Stack.Screen name={"ResetPasswordScreen"} component={ResetPasswordScreen} />
      <Stack.Screen name={"ChatSlugScreen"} component={ChatSlugScreen} />
    </Stack.Navigator>
  );
  // }
};


function App(): React.JSX.Element {
  const navigationRef = React.useRef(null);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        console.log('Setting up notifications...');

        // Yêu cầu quyền và lấy FCM token
        const fcmToken = await requestUserPermission();

        if (fcmToken) {
          console.log('FCM Token obtained:', fcmToken);

          // Lấy user ID từ storage (giả sử bạn đã lưu khi người dùng đăng nhập)
          const userId = await AsyncStorage.getItem('userId');

          if (userId) {
            // Đăng ký token với backend
            await notificationService.registerDeviceToken(fcmToken, 2);
          } else {
            console.log('User not logged in yet, will register token after login');
          }
        }

        // Lắng nghe thông báo khi app đang chạy
        const unsubscribeForeground = listenToForegroundMessages();

        // Thiết lập xử lý khi nhấn vào thông báo
        setupNotificationOpenedHandler(navigationRef.current);

        return () => {
          // Dọn dẹp khi unmount
          unsubscribeForeground();
        };
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  return (
    <RecoilRoot>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default App;
