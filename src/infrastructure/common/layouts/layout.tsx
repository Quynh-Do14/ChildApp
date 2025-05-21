import { useRecoilState } from 'recoil';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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

const MainLayout = ({ onGoBack, isBackButton = false, title, ...props }: any) => {
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [dataProfile, setDataProfile] = useRecoilState(ProfileState);
    const [, setDataChildren] = useRecoilState(ChildState);
    const [listInspector, setListInspector] = useState<any[]>([])
    const [, setPosition] = useRecoilState(LocationState);

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

    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                setPosition({
                    data: position
                })
            },
            (error) => {
                console.log(error);
            },
            // { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }, [])

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

    const handleSosCall = async () => {
        if (listInspector.length === 0) {
            Alert.alert("Thông báo", "Không có người giám sát để gọi.");
            return;
        }
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
