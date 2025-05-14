import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { bottomNavigator } from '../../../core/common/navigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../../repositories/auth/auth.service';
import { useRecoilValue } from 'recoil';
import { ProfileState } from '../../../core/atoms/profile/profileState';
import { configImageURL } from '../../helper/helper';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }: any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const dataProfile = useRecoilValue(ProfileState).data;
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
        <View style={styles.drawerContainer}>
            {/* Header */}
            <View style={styles.profileContainer}>
                <Image
                    source={
                        dataProfile?.avatar
                            ? { uri: configImageURL(dataProfile?.avatar) }
                            :
                            require('../../../assets/images/myAvatar.png')
                    }
                    style={styles.avatar}
                />
                <View style={{ marginLeft: 10, flexDirection: "column", gap: 8 }}>
                    <Text style={styles.name}>{dataProfile.fullName}</Text>
                    <Text style={styles.class}>{dataProfile.departmentName}</Text>
                    <Text style={styles.class}>{dataProfile.majorName}</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Menu items */}
            {
                bottomNavigator.map((it, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(it.name)}
                    >
                        <Icon name={it.icon || 'dots-grid'} size={22} color="#fff" style={{ marginRight: 16 }} />
                        <Text style={styles.menuText}>{it.name || it.name}</Text>
                    </TouchableOpacity>
                ))
            }

            {/* Logout button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogOut}>
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
        </View>
    );
};

const DrawerMenu = () => {
    return (
        <Drawer.Navigator
            initialRouteName="Quản lý thông tin"
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#4f3f97',
                    width: 260,
                },
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            {
                bottomNavigator.map((it, index) => (
                    <Drawer.Screen
                        key={index}
                        name={it.name}
                        component={it.component}
                    />
                ))
            }
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        backgroundColor: '#4f3f97',
        paddingTop: 24,
        paddingHorizontal: 16,
        paddingBottom: 12
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 50, height: 50, borderRadius: 25,
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    class: {
        color: '#ddd',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#6a5acd',
        marginVertical: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuText: {
        color: '#fff',
        fontSize: 15,
    },
    logoutBtn: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingVertical: 10,
    },
    logoutText: {
        color: '#FF6B6B',
        fontWeight: '500',
        fontSize: 14,
    },
});

export default DrawerMenu;
