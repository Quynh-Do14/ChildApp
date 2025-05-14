import { useRecoilState } from 'recoil';
import React, { useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import authService from '../../repositories/auth/auth.service';
import { ProfileState } from '../../../core/atoms/profile/profileState';
import Feather from 'react-native-vector-icons/Feather';

const MainLayout = ({ onGoBack, isBackButton = false, title, ...props }: any) => {
    const [token, setToken] = useState<string>('');
    const [dataProfile, setDataProfile] = useRecoilState(ProfileState);
    const navigation = useNavigation<any>();

    const getTokenStoraged = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    };

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

    useEffect(() => {
        if (token) {
            getProfileUser();
        }
    }, [token]);
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
                        {dataProfile?.data?.fullName}
                    </Text>
                    <Text style={styles.class}>{title}</Text>
                </View>

                <View style={styles.avatarWrapper}>
                    <Image
                        source={
                            dataProfile?.data?.avatar
                                ? { uri: dataProfile.data.avatar }
                                : require('../../../assets/images/myAvatar.png')
                        }
                        style={styles.avatar}
                    />
                    <View style={styles.dot} />
                </View>
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
});
