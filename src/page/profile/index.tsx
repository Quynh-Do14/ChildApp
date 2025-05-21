import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MainLayout from '../../infrastructure/common/layouts/layout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import authService from '../../infrastructure/repositories/auth/auth.service';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ProfileState } from '../../core/atoms/profile/profileState';
import Constants from '../../core/common/constants';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import { configImageURL } from '../../infrastructure/helper/helper';
import userService from '../../infrastructure/repositories/user/user.service';
import { LocationState } from '../../core/atoms/location/locationState';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const location = useRecoilValue(LocationState).data
    const isFocused = useIsFocused();
    const [dataProfile, setDataProfile] = useRecoilState(ProfileState);

    const navigateEditProfile = (value: string) => {
        navigation.navigate(value);
    };

    const getTokenStoraged = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(true);
        }
    };
    useEffect(() => {
        getTokenStoraged();
    }, []);

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

    const onShareLocationAsync = async () => {
        try {
            await userService.shareLocation(
                {
                    "latitude": location?.coords?.latitude,
                    "longitude": location?.coords?.longitude
                },
                setLoading
            ).then(() => {
                Alert.alert('Chia sẻ vị trí', 'Chia sẻ vị trí thành công', [
                    { text: 'Đóng', style: 'cancel' },
                ]);
            });
        } catch (error) {
            console.error(error);
        }
    };
    const getProfileUser = async () => {
        try {
            const response = await authService.profile(() => { });
            if (response) {
                setDataProfile({ data: response });
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        getProfileUser();
    }, []);

    useEffect(() => {
        if (isFocused) {
            getProfileUser();
        }
    }, [isFocused]);
    return (
        <MainLayout title={'Trang cá nhân'}>
            <View style={styles.container}>
                {/* Avatar + tên + email */}
                <View style={styles.profileBox}>
                    <Image
                        source={
                            dataProfile.data?.avatar
                                ? { uri: configImageURL(dataProfile.data?.avatar) }
                                :
                                require('../../assets/images/avatar.png')
                        }
                        style={styles.avatar}
                    />
                    {
                        isLoading
                        &&
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.name}>{dataProfile.data?.name}</Text>
                            <Text style={styles.email}>{dataProfile.data?.email}</Text>
                        </View>
                    }

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
                    <TouchableOpacity
                        onPress={onShareLocationAsync}
                        style={styles.menuItem}
                    >
                        <Ionicons name="location-sharp" size={18} color="#4f3f97" />
                        <Text style={styles.menuLabel}>Chia sẻ vị trí</Text>
                    </TouchableOpacity>
                    {/* Đăng xuất */}
                    <TouchableOpacity onPress={onLogOut} style={[styles.menuItem, styles.logoutItem]}>
                        <Ionicons name="log-out-outline" size={18} color="#FF4D4D" />
                        <Text style={[styles.menuLabel, { color: '#FF4D4D' }]}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <LoadingFullScreen loading={loading} />
        </MainLayout >
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
