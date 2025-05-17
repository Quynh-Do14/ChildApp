import ChatListScreen from "../../page/chat";
import ChildrenScreen from "../../page/children";
import InspectorScreen from "../../page/inspector";
import MapScreen from "../../page/map";
import MissionScreen from "../../page/mission";
import ProfileScreen from "../../page/profile";
import StaticScreen from "../../page/static";


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
        icon: 'account-circle-outline',
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
    // {
    //     component: StaticScreen,
    //     name: "Thống kê sử dụng",
    //     icon: 'chart-bar',  // Biểu đồ thống kê
    // },
]