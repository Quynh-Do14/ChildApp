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

    async joinChannel(channelId: string, uid: number = 0, providedToken?: string) {
        try {
            console.log(`Attempting to join channel: ${channelId}`);
            
            // Sử dụng token được cung cấp nếu có
            if (providedToken) {
              console.log('Using provided token');
              await this.requestPermissions();
              await this.initEngine();
              await this.engine.joinChannel(providedToken, channelId, null, uid);
              return true;
            }
            
            // Nếu không có token, lấy từ API
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                console.error('User not authenticated');
                throw new Error('User not authenticated');
            }

            // Lấy token từ backend với method GET rõ ràng và timeout
            console.log(`Fetching Agora token from: ${Endpoint.Call.GetToken}?channelName=${channelId}`);

            // Tạo controller để có thể abort request nếu quá thời gian
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(`${Endpoint.Call.GetToken}?channelName=${channelId}`, {
                method: 'GET', // Chỉ định method rõ ràng
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal // Sử dụng signal từ controller
            });

            // Clear timeout sau khi có response
            clearTimeout(timeoutId);

            // Kiểm tra response status
            console.log(`Token API response status: ${response.status}`);

            // Xử lý response không thành công
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API error: ${response.status}`, errorText);
                throw new Error(`Failed to get Agora token: ${response.status}`);
            }

            // Parse response JSON
            const data = await response.json();
            console.log('Token API response:', data);

            if (!data.token) {
                console.error('No token in response:', data);
                throw new Error('No Agora token in response');
            }

            // Yêu cầu quyền và khởi tạo engine
            await this.requestPermissions();
            await this.initEngine();

            // Log thông tin trước khi join
            console.log(`Joining Agora channel with token: ${data.token.substring(0, 20)}...`);

            // Tham gia kênh với token
            await this.engine.joinChannel(data.token, channelId, null, uid);
            console.log('Successfully joined Agora channel');

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

    async startCall(receiverId: string) {
        try {
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                throw new Error('User not authenticated');
            }

            // Gọi API initiate đã cải tiến
            const response = await fetch(Endpoint.Call.InitiateCall, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    receiverId: receiverId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error:', response.status, errorText);
                throw new Error(`Failed to initiate call: ${response.status}`);
            }

            const data = await response.json();
            console.log('Initiate call response:', data);

            // Lấy thông tin từ response
            const channelId = data.channelName;
            const token = data.token;

            // Yêu cầu quyền và khởi tạo engine
            await this.requestPermissions();
            await this.initEngine();

            // Tham gia kênh trực tiếp với token đã cung cấp
            console.log(`Joining channel with provided token: ${token.substring(0, 20)}...`);
            await this.engine.joinChannel(token, channelId, null, 0);
            console.log('Successfully joined Agora channel as caller');

            // Thiết lập timeout cho cuộc gọi (30 giây)
            this.callTimeout = setTimeout(async () => {
                if (this.engine && !this.isCallConnected) {
                    await this.endCall(channelId);
                    Alert.alert('Không có phản hồi', 'Người dùng không trả lời cuộc gọi');
                }
            }, 30000);

            return true;
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

    async joinCall(channelId: string) {
        try {
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                throw new Error('User not authenticated');
            }

            // Gọi API join mới
            console.log(`Getting token to join call with channel: ${channelId}`);
            const response = await fetch(`${Endpoint.Call.Join}?channelName=${channelId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error:', response.status, errorText);
                throw new Error(`Failed to join call: ${response.status}`);
            }

            const data = await response.json();
            console.log('Join call response:', data);

            // Lấy token từ response
            const token = data.token;

            // Yêu cầu quyền và khởi tạo engine
            await this.requestPermissions();
            await this.initEngine();

            // Tham gia kênh
            console.log(`Joining channel with token: ${token.substring(0, 20)}...`);
            await this.engine.joinChannel(token, channelId, null, 0);
            console.log('Successfully joined Agora channel as receiver');

            return true;
        } catch (error) {
            console.error('Error joining call:', error);
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