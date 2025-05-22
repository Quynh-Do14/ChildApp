import React, { useEffect, useState, useCallback } from 'react';
import {
    View, TouchableOpacity, Text, StyleSheet, 
    SafeAreaView, Platform, Alert, Dimensions
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import callService from '../../infrastructure/repositories/call/call.service';
// Import RtcLocalView và RtcRemoteView
import {
    RtcSurfaceView,
    ChannelProfileType,
    ClientRoleType
} from 'react-native-agora';

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

    // Thêm state để quản lý camera và mic
    const [isCameraOn, setCameraOn] = useState(true);
    const [isMicOn, setMicOn] = useState(true);
    
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
                console.log('[CallScreen] Setting up call, channelId:', channelId);
                
                // Khởi tạo engine
                const initialized = await callService.init();
                if (!initialized) {
                    console.error('[CallScreen] Không thể khởi tạo dịch vụ cuộc gọi');
                    Alert.alert('Lỗi', 'Không thể khởi tạo dịch vụ cuộc gọi');
                    navigation.goBack();
                    return;
                }
                
                console.log('[CallScreen] Engine initialized successfully');
                
                // QUAN TRỌNG: Thiết lập listeners TRƯỚC KHI tham gia kênh
                if (callService.engine) {
                    callService.engine.removeAllListeners();
                    
                    // Sử dụng cú pháp giống hệt Quickstart
                    callService.engine.addListener('onJoinChannelSuccess', connection => {
                        console.log('[CallScreen] JoinChannelSuccess', connection);
                        setJoined(true);
                    });
                    
                    callService.engine.addListener('onUserJoined', (connection, uid) => {
                        console.log('[CallScreen] UserJoined', connection, uid);
                        setPeerIds(prev => {
                            if (prev.indexOf(uid) === -1) {
                                return [...prev, uid];
                            }
                            return prev;
                        });
                    });
                    
                    callService.engine.addListener('onUserOffline', (connection, uid) => {
                        console.log('[CallScreen] UserOffline', connection, uid);
                        setPeerIds(prev => {
                            const updatedPeerIds = prev.filter(id => id !== uid);
                            console.log('[CallScreen] Updated peerIds after user left:', updatedPeerIds);

                            // Nếu không còn người dùng khác, tự động kết thúc sau 3s
                            if (updatedPeerIds.length <= 0 && isJoined) {
                                console.log('[CallScreen] No peers left, ending call in 3s');
                                setTimeout(() => endCall(), 3000);
                            }

                            return updatedPeerIds;
                        });
                    });

                    callService.engine.addListener('onError', (err) => {
                        console.error('[CallScreen] Agora Error:', err);
                        Alert.alert('Lỗi kết nối', 'Có lỗi xảy ra trong quá trình kết nối');
                    });

                    console.log('[CallScreen] All listeners set up successfully');
                }
                
                // Sau đó mới tham gia kênh
                const result = await callService.joinCall(channelId);
                if (!result.success) {
                    console.error('[CallScreen] Join call error:', result.error);
                    Alert.alert('Lỗi', result.error || 'Không thể tham gia cuộc gọi');
                    navigation.goBack();
                    return;
                }
                
            } catch (error) {
                console.error('Error setting up call:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi thiết lập cuộc gọi');
                navigation.goBack();
            }
        };

        setupCall();

        // Dọn dẹp khi component unmount
        return () => {
            console.log('[CallScreen] Cleaning up');
            if (callService.engine) {
                callService.engine.removeAllListeners();
            }
        };
    }, [channelId, navigation, endCall, isJoined]);

    // Chức năng bật/tắt camera
    const toggleCamera = () => {
        callService.engine?.muteLocalVideoStream(isCameraOn);
        setCameraOn(!isCameraOn);
    };
    
    // Chức năng bật/tắt mic
    const toggleMic = () => {
        callService.engine?.muteLocalAudioStream(isMicOn);
        setMicOn(!isMicOn);
    };

    // Cập nhật giao diện để hiển thị video
    return (
        <SafeAreaView style={styles.container}>
            {/* Hiển thị video của người dùng từ xa */}
            {peerIds.length > 0 ? (
                <View style={styles.remoteVideoContainer}>
                    {peerIds.map(uid => (
                        <RtcSurfaceView
                            key={uid}
                            style={styles.remoteVideo}
                            canvas={{
                                uid: uid,
                                renderMode: 1, // 1 tương đương với VideoRenderMode.Hidden
                                mirrorMode: 0
                            }}
                            // connection={{ channelId: channelId }}
                            zOrderMediaOverlay={true}
                        />
                    ))}
                </View>
            ) : (
                <View style={styles.waitingContainer}>
                    <Text style={styles.waitingText}>
                        {isJoined ? 'Đang đợi người dùng khác...' : 'Đang kết nối...'}
                    </Text>
                </View>
            )}
            
            {/* Hiển thị video của người dùng hiện tại (local) */}
            <View style={styles.localVideoContainer}>
                <RtcSurfaceView
                    style={styles.localVideo}
                    canvas={{
                        uid: 0,  // Local user luôn là uid 0
                        renderMode: 1, // 1 tương đương với VideoRenderMode.Hidden
                        mirrorMode: 1  // Mirror cho camera trước
                    }}
                    // connection={{ channelId: channelId }}
                    zOrderMediaOverlay={true}
                />
            </View>
            
            {/* Phần điều khiển */}
            <View style={styles.controls}>
                {/* Nút bật/tắt mic */}
                <TouchableOpacity 
                    style={[styles.controlButton, !isMicOn && styles.controlButtonOff]}
                    onPress={toggleMic}
                >
                    <Icon name={isMicOn ? "mic" : "mic-off"} size={24} color="#fff" />
                </TouchableOpacity>
                
                {/* Nút kết thúc cuộc gọi */}
                <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
                    <Icon name="call-end" size={30} color="#fff" />
                </TouchableOpacity>
                
                {/* Nút bật/tắt camera */}
                <TouchableOpacity 
                    style={[styles.controlButton, !isCameraOn && styles.controlButtonOff]}
                    onPress={toggleCamera}
                >
                    <Icon name={isCameraOn ? "videocam" : "videocam-off"} size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Cập nhật styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
    },
    remoteVideoContainer: {
        flex: 1,
    },
    remoteVideo: {
        flex: 1,
    },
    localVideoContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 120,
        height: 160,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ffffff',
    },
    localVideo: {
        flex: 1,
    },
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingText: {
        color: 'white',
        fontSize: 18,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
    },
    controlButton: {
        backgroundColor: 'rgba(100, 100, 100, 0.5)',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonOff: {
        backgroundColor: 'rgba(200, 50, 50, 0.5)',
    },
    endCallButton: {
        backgroundColor: '#ff3b30',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CallScreen;