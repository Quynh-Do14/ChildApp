import { createAgoraRtcEngine, IRtcEngine } from 'react-native-agora';
import { Platform, PermissionsAndroid } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoint } from '../../../core/common/apiLink';

class CallService {
    engine: IRtcEngine | null = null;
    appId: string = 'bd75f190073641d38c551b244817a2b1';

    constructor() { }

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

    async init() {
        try {
            // Đảm bảo đã xin quyền
            await this.requestPermissions();

            // Khởi tạo engine theo cách làm của Agora-RN-Quickstart
            this.engine = createAgoraRtcEngine();
            await this.engine.initialize({ appId: this.appId });
            await this.engine.enableAudio();
            console.log('Agora engine initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Agora engine:', error);
            return false;
        }
    }

    async startCall(receiverId: string) {
        try {
            // Lấy token xác thực
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) return { success: false, error: 'Lỗi xác thực' };

            // Gọi API để khởi tạo cuộc gọi
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

            const data = await response.json();
            const { channelName, token } = data;

            // Khởi tạo engine nếu chưa
            if (!this.engine) {
                await this.init();
            }

            // Tham gia kênh - giống như Agora-RN-Quickstart
            await this.engine?.joinChannel(token, channelName, null, 0);
            console.log('Successfully joined channel as caller');

            return {
                success: true,
                channelName,
                token
            };
        } catch (error: any) {
            console.error('Error starting call:', error);
            return {
                success: false,
                error: error.message || 'Không thể bắt đầu cuộc gọi'
            };
        }
    }

    async joinCall(channelName: string) {
        try {
            // Lấy token xác thực
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) return { success: false, error: 'Lỗi xác thực' };

            // Lấy Agora token từ API
            const response = await fetch(`${Endpoint.Call.Join}?channelName=${channelName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to join call: ${response.status}`);
            }

            const data = await response.json();
            const { token } = data;

            // Khởi tạo engine nếu chưa
            if (!this.engine) {
                await this.init();
            }

            // Tham gia kênh - giống như Agora-RN-Quickstart
            await this.engine?.joinChannel(token, channelName, null, 0);
            console.log('Successfully joined channel');

            return {
                success: true,
                channelName,
                token
            };
        } catch (error: any) {
            console.error('Error joining call:', error);
            return {
                success: false,
                error: error.message || 'Không thể tham gia cuộc gọi'
            };
        }
    }

    async endCall(channelName?: string) {
        try {
            // Rời khỏi kênh
            if (this.engine) {
                await this.engine.leaveChannel();
            }

            // Cập nhật trạng thái trên server
            if (channelName) {
                const userToken = await AsyncStorage.getItem('token');
                if (userToken) {
                    await fetch(`${Endpoint.Call.EndCall}?channelName=${channelName}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                        },
                    }).catch(err => console.error('Error updating call status:', err));
                }
            }

            return { success: true };
        } catch (error: any) {
            console.error('Error ending call:', error);
            return {
                success: false,
                error: error.message || 'Không thể kết thúc cuộc gọi'
            };
        }
    }

    async release() {
        try {
            if (this.engine) {
                await this.engine.removeAllListeners();
                await this.engine.release();
                this.engine = null;
            }
        } catch (error) {
            console.error('Error releasing Agora engine:', error);
        }
    }
}

export default new CallService();