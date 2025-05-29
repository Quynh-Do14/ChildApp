import { useRecoilState } from 'recoil';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    AppState,
    AppStateStatus,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import authService from '../../repositories/auth/auth.service';
import { ProfileState } from '../../../core/atoms/profile/profileState';
import Feather from 'react-native-vector-icons/Feather';
import { ChildState } from '../../../core/atoms/child/childState';
import userService from '../../repositories/user/user.service';
import inspectorService from '../../repositories/inspector/inspector.service';

import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { LocationState } from '../../../core/atoms/location/locationState';
import DeviceInfo from 'react-native-device-info';
import { FolderState } from '../../../core/atoms/folder/folderState';
import folderService from '../../repositories/folder/folder.service';

const MainLayout = ({ onGoBack, isBackButton = false, title, ...props }: any) => {
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [dataProfile, setDataProfile] = useRecoilState(ProfileState);
    const [, setDataChildren] = useRecoilState(ChildState);
    const [listInspector, setListInspector] = useState<any[]>([])
    const [, setPosition] = useRecoilState(LocationState);
    const [, setFolder] = useRecoilState(FolderState);

    const navigation = useNavigation<any>();

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


    const onShareLocationAsync = async (latitude: number, longitude: number) => {
        try {
            await userService.shareLocation(
                {
                    "latitude": latitude,
                    "longitude": longitude
                },
                () => { }
            ).then(() => { });
        } catch (error) {
            console.error(error);
        }
    };

    const watchId = useRef<number | null>(null);
    const appState = useRef(AppState.currentState);
    const lastSentTime = useRef<number>(0);

    useEffect(() => {
        const startTracking = () => {
            if (watchId.current === null) {
                watchId.current = Geolocation.watchPosition(
                    position => {
                        const { latitude, longitude } = position.coords;
                        console.log('New location:', latitude, longitude);

                        // Cập nhật vị trí vào state
                        setPosition({ data: position });

                        // Gửi lên server
                        onShareLocationAsync(latitude, longitude);
                    },
                    error => console.log('Location error:', error),
                    {
                        enableHighAccuracy: true,
                        distanceFilter: 10,       // cập nhật nếu di chuyển ≥ 1m
                        interval: 10000,         // Android: tối đa mỗi 10s
                        fastestInterval: 5000,   // Android: tối thiểu mỗi 5s
                    }
                );
            }
        };

        const stopTracking = () => {
            if (watchId.current !== null) {
                Geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
        };

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                startTracking();
            } else if (nextAppState.match(/inactive|background/)) {
                stopTracking();
            }
            appState.current = nextAppState;
        };

        // Start tracking on mount
        startTracking();

        // Subscribe to app state changes
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            stopTracking();
        };
    }, [setPosition,]);


    useEffect(() => {
        getTokenStoraged();
    }, []);

    const getProfileUser = async () => {
        if (token) {
            try {
                const response = await authService.profile(() => { });
                if (response) {
                    setDataProfile({ data: response });
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const GetMyChildrenAsync = async () => {
        try {
            await userService.getChild(
                () => { },
            ).then((response) => {
                if (response) {
                    setDataChildren({
                        data: response
                    })
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (token) {
            getProfileUser();
            GetMyChildrenAsync();
        }
    }, [token]);

    const GetMyInspectorAsync = async () => {
        try {
            await inspectorService.getInspector(
                () => { },
            ).then((response) => {
                if (response) {
                    setListInspector(response)
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        GetMyInspectorAsync().then(() => { });
    }, []);

    const fetchFolders = async () => {
        try {
            const response = await folderService.getFolder(
                () => { }
            );
            if (response) {
                setFolder({
                    data: response
                });
            }
        } catch (error) {
            console.error('Fetch inspectors error:', error);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleSosCall = async () => {
        // if (listInspector.length === 0) {
        //     Alert.alert("Thông báo", "Không có người giám sát để gọi.");
        //     return;
        // }
        callNext(0)
        try {
            await userService.notificationSOS(
                () => { },
            ).then((response) => {
                if (response) {
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const callNext = (index: number) => {
        if (index >= listInspector.length) return;

        const phone = listInspector[index]?.phoneNumber;
        if (!phone) {
            callNext(index + 1); // bỏ qua nếu không có số
            return;
        }

        Alert.alert(
            "Gọi SOS",
            `Gọi ${listInspector[index].name} - ${phone}?`,
            [
                {
                    text: "Bỏ qua",
                    style: "cancel",
                    onPress: () => callNext(index + 1)
                },
                {
                    text: "Gọi",
                    onPress: () => {
                        Linking.openURL(`tel:${phone}`);
                        // Đợi vài giây rồi gọi tiếp nếu cần (nếu không thì để người dùng bấm tiếp)
                        setTimeout(() => callNext(index + 1), 5000); // hoặc để người dùng tự next
                    }
                }
            ]
        );
    };

    const onSharePinAsync = async (level: number) => {
        try {
            await userService.sharePin(
                {
                    "batteryLevel": level,
                },
                () => { }
            ).then(() => { });
        } catch (error) {
            console.error(error);
        }
    };
    
    useEffect(() => {
        const fetchBattery = async () => {
            const level = await DeviceInfo.getBatteryLevel(); // trả về số từ 0 -> 1
            onSharePinAsync(Math.round(level * 100));
        };

        // Gọi lần đầu khi component mount
        fetchBattery();

        // Thiết lập interval mỗi 5 phút
        const interval = setInterval(() => {
            fetchBattery();
        }, 5 * 60 * 1000); // 5 phút = 300000ms

        // Clear interval khi unmount
        return () => clearInterval(interval);
    }, []);


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                {isBackButton ?
                    <Feather
                        name="arrow-left"
                        size={24}
                        color="#fff"
                        onPress={onGoBack}
                    />
                    :
                    <MaterialCommunityIcons
                        name="view-grid"
                        size={24}
                        color="#fff"
                        onPress={() => navigation.openDrawer()}
                    />
                }

                <View style={styles.textContainer}>
                    <Text style={styles.name}>
                        {isLoading && dataProfile?.data?.name}
                    </Text>
                    <Text style={styles.class}>{title}</Text>
                </View>

                {/* <View style={styles.avatarWrapper}>
                    <Image
                        source={
                            dataProfile?.data?.avatar
                                ? { uri: dataProfile.data.avatar }
                                : require('../../../assets/images/myAvatar.png')
                        }
                        style={styles.avatar}
                    />
                    <View style={styles.dot} />
                </View> */}
                {
                    dataProfile?.data?.role === "child"
                    &&
                    <TouchableOpacity onPress={handleSosCall} style={styles.round}>
                        <Text style={styles.textSOS}>SOS</Text>
                    </TouchableOpacity>
                }
            </View>

            {/* Content */}
            {props.children}
        </View>
    );
};

export default MainLayout;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        backgroundColor: '#4f3f97',
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    class: {
        fontSize: 12,
        color: '#ddd',
        marginTop: 2,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#eee',
    },
    dot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        backgroundColor: 'red',
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    round: {
        width: 36,
        height: 36,
        borderRadius: 22,
        backgroundColor: '#eee',
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    textSOS: {
        color: "red",
        fontWeight: "bold"
    }
});
