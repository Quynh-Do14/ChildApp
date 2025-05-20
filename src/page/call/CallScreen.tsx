import React, { useEffect, useState, useRef, useCallback } from 'react';
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

    const [isJoined, setJoined] = useState(false);
    const [peerIds, setPeerIds] = useState<number[]>([]);
    const [callDuration, setCallDuration] = useState(0);

    // Timer để đếm thời gian cuộc gọi
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (isJoined) {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isJoined]);

    // Format thời gian
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Kết thúc cuộc gọi
    const endCall = useCallback(async () => {
        try {
            // Rời khỏi kênh và cập nhật trạng thái
            await callService.endCall(channelId);

            // Giải phóng engine
            await callService.release();

            // Quay về màn hình trước
            navigation.goBack();
        } catch (error: any) {
            console.error('Error ending call:', error);
            navigation.goBack();
        }
    }, [channelId, navigation]);

    // Khởi tạo cuộc gọi
    useEffect(() => {
        const setupCall = async () => {
            try {
                // Khởi tạo engine
                const initialized = await callService.init();
                if (!initialized) {
                    Alert.alert('Lỗi', 'Không thể khởi tạo dịch vụ cuộc gọi');
                    navigation.goBack();
                    return;
                }

                // Tham gia kênh
                const result = await callService.joinCall(channelId);
                if (!result.success) {
                    Alert.alert('Lỗi', result.error || 'Không thể tham gia cuộc gọi');
                    navigation.goBack();
                    return;
                }

                // Lắng nghe sự kiện
                callService.engine?.addListener('onJoinChannelSuccess', (connection) => {
                    console.log('JoinChannelSuccess', connection);
                    setJoined(true);
                });

                callService.engine?.addListener('onUserJoined', (connection, uid) => {
                    console.log('UserJoined', connection, uid);
                    if (peerIds.indexOf(uid) === -1) {
                        setPeerIds(prev => [...prev, uid]);
                    }
                });

                callService.engine?.addListener('onUserOffline', (connection, uid) => {
                    console.log('UserOffline', connection, uid);
                    setPeerIds(prev => {
                        const updatedPeerIds = prev.filter(id => id !== uid);

                        // Nếu không còn người dùng khác, tự động kết thúc
                        if (updatedPeerIds.length <= 0) {
                            endCall();
                        }

                        return updatedPeerIds;
                    });
                });
            } catch (error) {
                console.error('Error setting up call:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi thiết lập cuộc gọi');
                navigation.goBack();
            }
        };

        setupCall();

        // Dọn dẹp khi component unmount
        return () => {
            if (callService.engine) {
                callService.engine.removeAllListeners();
            }
        };
    }, [channelId, navigation, peerIds, endCall]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.name}>{recipientName}</Text>
                <Text style={styles.status}>
                    {!isJoined ? 'Đang kết nối...' : formatTime(callDuration)}
                </Text>

                {/* Hiển thị trạng thái người tham gia */}
                <Text style={styles.participants}>
                    {peerIds.length > 0 ? `${peerIds.length} người tham gia` : 'Đang đợi...'}
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
    participants: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 4,
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