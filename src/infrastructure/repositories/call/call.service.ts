import RtcEngine from 'react-native-agora';
import { Platform, PermissionsAndroid, Alert, AppState } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoint } from '../../../core/common/apiLink';

class CallService {
    engine: any;
    appId: string = 'bd75f190073641d38c551b244817a2b1'; // Đăng ký trên agora.io
    isCallConnected: boolean = false;
    callTimeout: NodeJS.Timeout | null = null;

    constructor() {
        this.engine = null;
    }

    async requestPermissions() {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.CAMERA,
            ]);
        } else {
            await requestMultiple([
                PERMISSIONS.IOS.MICROPHONE,
                PERMISSIONS.IOS.CAMERA,
            ]);
        }
    }

    async initEngine() {
        if (!this.engine) {
            this.engine = await RtcEngine();
            await this.engine.initialize({
                appId: this.appId,
            });
            // Bật âm thanh
            await this.engine.enableAudio();
        }
    }

    async joinChannel(channelId: string, uid: number = 0) {
        try {
            const userToken = await AsyncStorage.getItem('token');

            if (!userToken) {
                throw new Error('User not authenticated');
            }

            // Lấy token từ backend
            const response = await fetch(`${Endpoint.Call.GetToken}?channelName=${channelId}`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            const { token } = await response.json();

            await this.requestPermissions();
            await this.initEngine();

            // Tham gia kênh với token
            await this.engine.joinChannel(token, channelId, null, uid);

            return true;
        } catch (error) {
            console.error('Error joining channel:', error);
            return false;
        }
    }

    async leaveChannel() {
        if (this.engine) {
            await this.engine.leaveChannel();
        }
    }

    async startCall(recipientId: string) {
        try {
            const userToken = await AsyncStorage.getItem('token');

            if (!userToken) {
                throw new Error('User not authenticated');
            }

            // Yêu cầu backend tạo kênh và gửi thông báo
            const response = await fetch(Endpoint.Call.InitiateCall, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    recipientId: recipientId,
                }),
            });

            const responseData = await response.json();
            console.log('InitiateCall response:', responseData);

            // Xác định channelId từ nhiều định dạng có thể có
            let channelId;
            if (responseData.channelName) {
                channelId = responseData.channelName;
            } else if (responseData.message) {
                // Sử dụng message field nếu không có channelName
                channelId = responseData.message;
            } else {
                throw new Error('Unable to extract channel ID from response');
            }

            console.log('Using Channel ID:', channelId);

            // Tiếp tục với việc tham gia kênh
            const joinResult = await this.joinChannel(channelId);

            console.log('Join result:', joinResult);

            // Thêm timeout cho cuộc gọi đi
            const callTimeout = setTimeout(async () => {
                // Nếu vẫn đang gọi (chưa được kết nối)
                if (this.engine && !this.isCallConnected) {
                    await this.endCall();
                    // Gọi API để cập nhật trạng thái cuộc gọi là "MISSED"
                    await fetch(`${Endpoint.Call.EndCall}?channelName=${channelId}&status=MISSED`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${userToken}`
                        }
                    });

                    // Thông báo cho người dùng
                    Alert.alert('Không có phản hồi', 'Người dùng không trả lời cuộc gọi');
                }
            }, 30000); // 30 giây

            // Lưu timeout ID để có thể hủy nếu người dùng nhận cuộc gọi
            this.callTimeout = callTimeout;

            return joinResult;
        } catch (error) {
            console.error('Error starting call:', error);
            return false;
        }
    }

    async endCall(channelId?: string) {
        try {
            // 1. Rời khỏi kênh Agora
            await this.leaveChannel();

            // 2. Cập nhật trạng thái cuộc gọi trên server
            const userToken = await AsyncStorage.getItem('token');
            if (userToken && channelId) {
                try {
                    // Gọi API để cập nhật trạng thái cuộc gọi
                    await fetch(`${Endpoint.Call.EndCall}?channelName=${channelId}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                        },
                    });
                    console.log(`Call ${channelId} ended with status: COMPLETED`);
                } catch (apiError) {
                    console.error('Error updating call status:', apiError);
                }
            }

            // 3. Reset các biến trạng thái
            this.isCallConnected = false;
            if (this.callTimeout) {
                clearTimeout(this.callTimeout);
                this.callTimeout = null;
            }

            return true;
        } catch (error) {
            console.error('Error ending call:', error);
            return false;
        }
    }

    setupCallEvents(onUserJoined: any, onUserOffline: any) {
        this.engine.addListener('UserJoined', onUserJoined);
        this.engine.addListener('UserOffline', onUserOffline);

        // Trả về hàm cleanup
        return () => {
            this.engine.removeListener('UserJoined');
            this.engine.removeListener('UserOffline');
        };
    }

    async destroyEngine() {
        if (this.engine) {
            await this.leaveChannel();
            await this.engine.destroy();
            this.engine = null;
        }
    }

    setCallConnected() {
        this.isCallConnected = true;
        if (this.callTimeout) {
            clearTimeout(this.callTimeout);
            this.callTimeout = null;
        }
    }

    setupAppStateListener() {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (this.engine && this.isCallConnected && nextAppState === 'background') {
                // Lưu thông tin cuộc gọi để có thể khôi phục
                AsyncStorage.setItem('ongoingCall', JSON.stringify({
                    isActive: true,
                    timestamp: Date.now()
                }));
            }
        });

        return () => {
            subscription.remove();
        };
    }
}

export default new CallService();