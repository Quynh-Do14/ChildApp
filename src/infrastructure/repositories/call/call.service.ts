import { createAgoraRtcEngine, IRtcEngine } from 'react-native-agora';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Endpoint } from '../../../core/common/apiLink';

class CallService {
    engine: IRtcEngine | null;
    appId: string = 'bd75f190073641d38c551b244817a2b1';
    isCallConnected: boolean = false;
    callTimeout: NodeJS.Timeout | null = null;

    constructor() {
        this.engine = null;
    }

    /**
     * Yêu cầu quyền truy cập microphone
     */
    async requestPermissions() {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);
                return granted['android.permission.RECORD_AUDIO'] === 'granted';
            } else {
                const result = await requestMultiple([PERMISSIONS.IOS.MICROPHONE]);
                return result[PERMISSIONS.IOS.MICROPHONE] === 'granted';
            }
        } catch (err) {
            console.error('Permission request error:', err);
            return false;
        }
    }

    /**
     * Khởi tạo Agora engine
     */
    async initEngine() {
        if (!this.engine) {
            try {
                // Sử dụng cách tạo engine giống Agora-RN-Quickstart
                this.engine = createAgoraRtcEngine();
                await this.engine.initialize({ appId: this.appId });
                await this.engine.enableAudio();
                
                return true;
            } catch (error) {
                console.error('Không thể khởi tạo Agora engine:', error);
                return false;
            }
        }
        return true;
    }

    /**
     * Khởi tạo cuộc gọi mới
     */
    async startCall(receiverId: string) {
        try {
            // Kiểm tra kết nối mạng
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra kết nối internet');
                return false;
            }

            // Xin quyền microphone
            if (!await this.requestPermissions()) {
                Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập microphone');
                return false;
            }

            // Lấy token từ AsyncStorage
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
                return false;
            }

            // Gọi API tạo cuộc gọi
            const response = await fetch(Endpoint.Call.InitiateCall, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ receiverId }),
            });

            if (!response.ok) {
                throw new Error(`Failed to initiate call: ${response.status}`);
            }

            // Phân tích kết quả
            const data = await response.json();
            const { channelName, token } = data;

            // Khởi tạo Agora engine
            await this.initEngine();

            // Tham gia kênh - cách làm đơn giản như Agora-RN-Quickstart
            await this.engine?.joinChannel(token, channelName, 0, {});
            console.log('Successfully joined channel as caller');

            // Thiết lập timeout
            this.callTimeout = setTimeout(async () => {
                if (!this.isCallConnected) {
                    await this.endCall(channelName);
                    Alert.alert('Không có phản hồi', 'Người dùng không trả lời cuộc gọi');
                }
            }, 30000);

            return true;
        } catch (error) {
            console.error('Error starting call:', error);
            Alert.alert('Lỗi cuộc gọi', 'Không thể bắt đầu cuộc gọi');
            return false;
        }
    }

    /**
     * Tham gia cuộc gọi hiện có
     */
    async joinCall(channelId: string) {
        try {
            // Kiểm tra kết nối mạng
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra kết nối internet');
                return false;
            }

            // Xin quyền microphone
            if (!await this.requestPermissions()) {
                Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập microphone');
                return false;
            }

            // Lấy token từ AsyncStorage
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
                return false;
            }

            // Gọi API lấy token
            const response = await fetch(`${Endpoint.Call.Join}?channelName=${channelId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to join call: ${response.status}`);
            }

            const data = await response.json();
            const { token } = data;

            // Khởi tạo Agora engine
            await this.initEngine();

            // Tham gia kênh - cách làm đơn giản như Agora-RN-Quickstart
            await this.engine?.joinChannel(token, channelId, 0, {});
            console.log('Successfully joined channel as receiver');

            return true;
        } catch (error) {
            console.error('Error joining call:', error);
            Alert.alert('Lỗi cuộc gọi', 'Không thể tham gia cuộc gọi');
            return false;
        }
    }

    /**
     * Kết thúc cuộc gọi
     */
    async endCall(channelId?: string) {
        try {
            // Rời khỏi kênh
            if (this.engine) {
                await this.engine.leaveChannel();
            }

            // Cập nhật trạng thái cuộc gọi trên server
            if (channelId) {
                const userToken = await AsyncStorage.getItem('token');
                if (userToken) {
                    await fetch(`${Endpoint.Call.EndCall}?channelName=${channelId}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                        },
                    }).catch(err => console.error('Error updating call status:', err));
                }
            }

            // Reset các biến trạng thái
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

    /**
     * Thiết lập các sự kiện của cuộc gọi
     */
    setupCallEvents(onUserJoined: any, onUserOffline: any) {
        if (!this.engine) return () => {};

        const listeners = [
            // Người dùng tham gia/rời khỏi cuộc gọi
            this.engine.addListener('onUserJoined', onUserJoined),
            this.engine.addListener('onUserOffline', onUserOffline),

            // Sự kiện kết nối thành công
            this.engine.addListener('onJoinChannelSuccess', (connection: any) => {
                console.log('Tham gia kênh thành công:', connection.channelId);
                this.setCallConnected();
            }),

            // Sự kiện thay đổi trạng thái kết nối
            this.engine.addListener('onConnectionStateChanged', (state: any, reason: any) => {
                console.log('Trạng thái kết nối thay đổi:', state, 'lý do:', reason);
            })
        ];

        return () => {
            this.engine?.removeAllListeners();
        };
    }

    /**
     * Đánh dấu cuộc gọi đã kết nối
     */
    setCallConnected() {
        this.isCallConnected = true;
        if (this.callTimeout) {
            clearTimeout(this.callTimeout);
            this.callTimeout = null;
        }
    }

    /**
     * Giải phóng tài nguyên engine
     */
    async destroyEngine() {
        if (this.engine) {
            try {
                await this.engine.leaveChannel();
                await this.engine.release();
                this.engine = null;
            } catch (error) {
                console.error('Error destroying engine:', error);
            }
        }
    }
}

export default new CallService();