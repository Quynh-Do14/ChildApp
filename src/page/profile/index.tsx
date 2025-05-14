import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useState } from 'react';
import MainLayout from '../../infrastructure/common/layouts/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import authService from '../../infrastructure/repositories/auth/auth.service';
import { useRecoilValue } from 'recoil';
import { ProfileState } from '../../core/atoms/profile/profileState';
import Constants from '../../core/common/constants';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import { configImageURL } from '../../infrastructure/helper/helper';

const ProfileScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const dataProfile = useRecoilValue(ProfileState).data;

    const navigateEditProfile = (value: string) => {
        navigation.navigate(value);
    };

    const onLogOutAsync = async () => {
        try {
            await authService.logout(setLoading).then(() => {
                navigation.navigate('LoginScreen');
            });
        } catch (error) {
            console.error(error);
        }
    };

    const onLogOut = () => {
        Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', onPress: () => onLogOutAsync() },
        ]);
    };

    return (
        <MainLayout title={'Trang cá nhân'}>
            <View style={styles.container}>
                {/* Avatar + tên + email */}
                <View style={styles.profileBox}>
                    <Image
                        source={
                            dataProfile?.avatar
                                ? { uri: configImageURL(dataProfile?.avatar) }
                                :
                                require('../../assets/images/myAvatar.png')
                        }
                        style={styles.avatar}
                    />
                    <View style={{ marginLeft: 16 }}>
                        <Text style={styles.name}>{dataProfile?.fullName}</Text>
                        <Text style={styles.email}>{dataProfile?.email}</Text>
                    </View>
                </View>

                {/* Menu các dòng chọn */}
                <View style={styles.menuList}>
                    {Constants.InfoUser.List.map((it, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigateEditProfile(it.value)}
                            style={styles.menuItem}
                        >
                            <Ionicons name={it.icon} size={18} color="#4f3f97" />
                            <Text style={styles.menuLabel}>{it.label}</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Đăng xuất */}
                    <TouchableOpacity onPress={onLogOut} style={[styles.menuItem, styles.logoutItem]}>
                        <Ionicons name="log-out-outline" size={18} color="#FF4D4D" />
                        <Text style={[styles.menuLabel, { color: '#FF4D4D' }]}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <LoadingFullScreen loading={loading} />
        </MainLayout>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#4f3f97',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#121212',
    },
    email: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    menuList: {
        marginTop: 16,
        paddingHorizontal: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#ececec',
    },
    menuLabel: {
        marginLeft: 14,
        fontSize: 15,
        color: '#4f3f97',
        fontWeight: '600',
    },
    logoutItem: {
        borderTopWidth: 1,
        borderColor: '#ccc',
        marginTop: 24,
    },
});
