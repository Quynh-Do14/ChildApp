import ChatListScreen from "../../page/chat";
import InspectorScreen from "../../page/inspector";
import MissionScreen from "../../page/mission";
import ProfileScreen from "../../page/profile";
import StaticScreen from "../../page/static";


export const bottomNavigator = [
    {
        component: ProfileScreen,
        name: "Quản lý thông tin",
        icon: 'account-circle-outline',  // Đăng ký môn học
    },
    {
        component: InspectorScreen,
        name: "Quản lý người giám sát",
        icon: 'account-circle-outline',  // Đăng ký môn học
    },
    {
        component: MissionScreen,
        name: "Quản lý nhiệm vụ",
        icon: 'account-circle-outline',  // Đăng ký môn học
    },
    {
        component: ChatListScreen,
        name: "Trò chuyện",
        icon: 'account-circle-outline',  // Đăng ký môn học
    },
    {
        component: StaticScreen,
        name: "Thống kê sử dụng",
        icon: 'account-circle-outline',  // Đăng ký môn học
    },
];
