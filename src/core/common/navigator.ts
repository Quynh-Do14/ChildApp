import ChatListScreen from "../../page/chat";
import ChildrenScreen from "../../page/children";
import InspectorScreen from "../../page/inspector";
import MapScreen from "../../page/map";
import MissionScreen from "../../page/mission";
import ProfileScreen from "../../page/profile";
import StaticScreen from "../../page/static";
import WebBLockScreen from "../../page/web-block";
import WebiewScreen from "../../page/webview";


export const bottomNavigator = [
    {
        component: ProfileScreen,
        name: "Quản lý thông tin",
        icon: 'account-circle-outline',  // Hồ sơ người dùng
        role: ['admin', 'parent', 'child']
    },
    {
        component: ChildrenScreen,
        name: "Danh sách trẻ",
        icon: 'human-child',
        role: ['admin', 'parent']
    },
    {
        component: MapScreen,
        name: "Map",
        icon: 'map-marker-radius-outline',  // Bản đồ / vị trí
        role: ['admin', 'parent', 'child']
    },
    {
        component: InspectorScreen,
        name: "Quản lý người giám sát",
        icon: 'account-supervisor-outline',  // Người giám sát
        role: ['admin', 'parent', 'child']
    },
    {
        component: MissionScreen,
        name: "Quản lý nhiệm vụ",
        icon: 'clipboard-check-outline',  // Nhiệm vụ / kiểm tra
        role: ['admin', 'parent', 'child']
    },
    {
        component: ChatListScreen,
        name: "Trò chuyện",
        icon: 'chat-outline',  // Trò chuyện / nhắn tin
        role: ['admin', 'parent', 'child']
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
        role: ['admin', 'parent']
    },
    // {
    //     component: StaticScreen,
    //     name: "Thống kê sử dụng",
    //     icon: 'chart-bar',  // Biểu đồ thống kê
    // },
]