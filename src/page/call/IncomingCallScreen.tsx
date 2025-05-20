import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoint } from '../../core/common/apiLink';

type RootStackParamList = {
    CallScreen: {
        channelId: string;
        recipientName: string;
        isIncoming?: boolean;
    };
    IncomingCallScreen: {
        callerName: string;
        channelId: string;
        callerImage?: string;
    };
};

type IncomingCallScreenRouteProp = RouteProp<RootStackParamList, 'IncomingCallScreen'>;

const IncomingCallScreen = () => {
    const route = useRoute<IncomingCallScreenRouteProp>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { callerName, channelId, callerImage } = route.params;

    // Từ chối cuộc gọi
    const rejectCall = useCallback(async () => {
        try {
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
                return;
            }
            
            await fetch(`${Endpoint.Call.EndCall}?channelName=${channelId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${userToken}` },
            });
            
            navigation.goBack();
        } catch (error) {
            console.error('Error rejecting call:', error);
            Alert.alert('Lỗi', 'Không thể từ chối cuộc gọi');
            navigation.goBack();
        }
    }, [channelId, navigation]);

    // Tự động từ chối cuộc gọi sau 30 giây
    useEffect(() => {
        const timer = setTimeout(() => {
            rejectCall();
        }, 30000);

        return () => clearTimeout(timer);
    }, [rejectCall]);

    // Chấp nhận cuộc gọi
    const acceptCall = () => {
        navigation.navigate({
            name: 'CallScreen',
            params: {
                channelId,
                recipientName: callerName,
                isIncoming: true
            },
            merge: true
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.infoContainer}>
                <Text style={styles.callerName}>{callerName}</Text>
                <Text style={styles.callingText}>Đang gọi thoại...</Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={rejectCall}>
                    <Icon name="call-end" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={acceptCall}>
                    <Icon name="call" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    infoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    callerName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    callingText: {
        color: '#aaa',
        fontSize: 18,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 50,
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: '#ff3b30',
    },
    acceptButton: {
        backgroundColor: '#34c759',
    },
});

export default IncomingCallScreen;