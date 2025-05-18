import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
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
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // Timer cho thời lượng cuộc gọi
    useEffect(() => {
        let timer: any;
        if (isConnected) {
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
    }, []);

    // Define endCall function first
    const endCall = useCallback(async () => {
        await callService.endCall();
        navigation.goBack();
    }, [navigation]);

    // Xử lý khi người dùng rời đi
    const handleUserOffline = useCallback((uid: any) => {
        console.log('User offline:', uid);
        setIsConnected(false);
        endCall();
    }, [endCall]);

    // Tham gia kênh khi màn hình được mở
    useEffect(() => {
        const setupCall = async () => {
            if (isIncoming) {
                // Nếu là cuộc gọi đến, tham gia kênh
                await callService.joinChannel(channelId);
            }

            // Thiết lập các sự kiện
            const cleanup = callService.setupCallEvents(
                handleUserJoined,
                handleUserOffline
            );

            return () => {
                cleanup();
                callService.leaveChannel();
            };
        };

        setupCall();
    }, [channelId, isIncoming, handleUserJoined, handleUserOffline]);

    // Bật/tắt micro
    const toggleMute = async () => {
        await callService.engine.muteLocalAudioStream(!isMuted);
        setIsMuted(!isMuted);
    };

    // Bật/tắt loa ngoài
    const toggleSpeaker = async () => {
        await callService.engine.setEnableSpeakerphone(!isSpeakerOn);
        setIsSpeakerOn(!isSpeakerOn);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.name}>{recipientName}</Text>
                {isConnected && <Text style={styles.status}>{formatTime(callDuration)}</Text>}
                {!isConnected && <Text style={styles.status}>{isIncoming ? 'Đang gọi đến...' : 'Đang gọi...'}</Text>}
            </View>

            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                    <Icon name={isMuted ? 'mic-off' : 'mic'} size={30} color="#fff" />
                    <Text style={styles.controlText}>{isMuted ? 'Bật mic' : 'Tắt mic'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={toggleSpeaker}>
                    <Icon name={isSpeakerOn ? 'volume-up' : 'volume-down'} size={30} color="#fff" />
                    <Text style={styles.controlText}>{isSpeakerOn ? 'Loa thường' : 'Loa ngoài'}</Text>
                </TouchableOpacity>
            </View>

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
    controlsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    controlButton: {
        alignItems: 'center',
    },
    controlText: {
        color: '#fff',
        marginTop: 8,
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