import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import callService from '../../infrastructure/repositories/call/call.service';

type CallScreenParams = {
    channelId: string;
    recipientName: string;
    isIncoming?: boolean;
};

type CallNavigationProp = RouteProp<{ CallScreen: CallScreenParams }, 'CallScreen'>;

const CallScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<CallNavigationProp>();
    const { channelId, recipientName, isIncoming = false } = route.params;
    
    // Chỉ giữ lại các trạng thái cần thiết
    const [isConnected, setIsConnected] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');

    // Timer cho thời lượng cuộc gọi
    useEffect(() => {
        let timer: any;
        if (isConnected) {
            setCallState('connected');
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [isConnected]);

    // Format thời gian
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Xử lý khi người dùng tham gia
    const handleUserJoined = useCallback((uid: any) => {
        console.log('User joined:', uid);
        setIsConnected(true);
        callService.setCallConnected();
    }, []);

    // Define endCall function
    const endCall = useCallback(async () => {
        try {
            console.log('Ending call with channel ID:', channelId);
            setCallState('ended');
            await callService.endCall(channelId);
            navigation.goBack();
        } catch (error) {
            console.error('Error ending call:', error);
            navigation.goBack();
        }
    }, [navigation, channelId]);

    // Xử lý khi người dùng rời đi
    const handleUserOffline = useCallback((uid: any) => {
        console.log('User offline:', uid);
        setIsConnected(false);
        endCall();
    }, [endCall]);

    // Tham gia kênh khi màn hình được mở
    useEffect(() => {
        const setupCall = async () => {
            try {
                setCallState('connecting');
                
                console.log('Setting up call with channel ID:', channelId);
                
                // Đảm bảo engine được khởi tạo trước
                const engineInitialized = await callService.initEngine();
                if (!engineInitialized) {
                    throw new Error('Failed to initialize Agora engine');
                }
                
                // Tham gia cuộc gọi
                const joinSuccess = await callService.joinCall(channelId);
                
                if (!joinSuccess) {
                    console.error('Failed to join channel');
                    Alert.alert(
                        'Không thể kết nối',
                        'Không thể tham gia cuộc gọi. Vui lòng kiểm tra kết nối mạng và thử lại.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                    return;
                }
                
                console.log('Successfully joined channel');
                
                // Thiết lập các sự kiện
                const cleanup = callService.setupCallEvents(
                    handleUserJoined,
                    handleUserOffline
                );
                
                return () => {
                    cleanup();
                    endCall(); // Đảm bảo cuộc gọi được kết thúc khi unmount
                };
            } catch (error) {
                console.error('Error setting up call:', error);
                Alert.alert(
                    'Lỗi cuộc gọi',
                    'Đã xảy ra lỗi khi thiết lập cuộc gọi. Vui lòng thử lại sau.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        };
        
        setupCall();
    }, [channelId, handleUserJoined, handleUserOffline, endCall, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.name}>{recipientName}</Text>
                <Text style={styles.status}>
                    {callState === 'connecting' && 'Đang kết nối...'}
                    {callState === 'connected' && formatTime(callDuration)}
                    {callState === 'ended' && 'Cuộc gọi đã kết thúc'}
                </Text>
            </View>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
                <Icon name="call-end" size={30} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
    },
    name: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    status: {
        color: '#aaa',
        fontSize: 16,
        marginTop: 8,
    },
    spacer: {
        flex: 1,
    },
    endCallButton: {
        alignSelf: 'center',
        backgroundColor: '#ff3b30',
        borderRadius: 30,
        padding: 15,
        marginBottom: 50,
    },
});

export default CallScreen;