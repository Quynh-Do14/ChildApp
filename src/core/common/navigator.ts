import { createRef } from "react";
import ChatListScreen from "../../page/chat";
import ChildrenScreen from "../../page/children";
import InspectorScreen from "../../page/inspector";
import MapScreen from "../../page/map";
import MissionScreen from "../../page/mission";
import ProfileScreen from "../../page/profile";
import StaticScreen from "../../page/static";
import WebBLockScreen from "../../page/web-block";
import WebiewScreen from "../../page/webview";
import { NavigationContainerRef, ParamListBase } from "@react-navigation/native";


export const bottomNavigator = [
    {
        component: ProfileScreen,
        name: "Quản lý thông tin",
        icon: 'account-circle-outline',  // Hồ sơ người dùng
        role: ['parent', 'child']
    },
    {
        component: ChildrenScreen,
        name: "Danh sách trẻ",
        icon: 'human-child',
        role: ['parent']
    },
    // {
    //     component: MapScreen,
    //     name: "Map",
    //     icon: 'map-marker-radius-outline',  // Bản đồ / vị trí
    // },
    {
        component: InspectorScreen,
        name: "Quản lý người giám sát",
        icon: 'account-supervisor-outline',  // Người giám sát
        role: ['parent', 'child']
    },
    {
        component: MissionScreen,
        name: "Quản lý nhiệm vụ",
        icon: 'clipboard-check-outline',  // Nhiệm vụ / kiểm tra
        role: ['parent', 'child']
    },
    {
        component: ChatListScreen,
        name: "Trò chuyện",
        icon: 'chat-outline',  // Trò chuyện / nhắn tin
        role: ['parent', 'child']
    },
    {
        component: WebiewScreen,
        name: "Trình duyệt",
        icon: 'compass-outline',  // Trò chuyện / nhắn tin
        role: ['child']
    },
    {
        component: WebBLockScreen,
        name: "Trình duyệt bị chặn",
        icon: 'compass-off-outline',  // Trò chuyện / nhắn tin
        role: ['parent']
    },
    // {
    //     component: StaticScreen,
    //     name: "Thống kê sử dụng",
    //     icon: 'chart-bar',  // Biểu đồ thống kê
    // },
]

export const navigationRef = createRef<NavigationContainerRef<ParamListBase>>();

let isNavigationReady = false;
let pendingNavigationCalls: Array<{ name: string; params?: object }> = [];

export function setNavigationReady() {
  isNavigationReady = true;

  // Xử lý các lệnh điều hướng đang chờ
  if (pendingNavigationCalls.length > 0) {
    console.log(`Processing ${pendingNavigationCalls.length} pending navigation calls`);
    pendingNavigationCalls.forEach(call => {
      navigate(call.name, call.params);
    });
    pendingNavigationCalls = [];
  }
}

export function navigate(name: string, params?: object) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    console.warn('Navigation attempted before navigator was ready, queuing...');
    pendingNavigationCalls.push({ name, params });
  }
}

export function goBack() {
  if (navigationRef.current) {
    navigationRef.current.goBack();
  }
}

export function reset(name: string, params?: object) {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}