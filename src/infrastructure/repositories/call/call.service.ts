import RtcEngine, { createAgoraRtcEngine } from 'react-native-agora';
import { Platform, PermissionsAndroid, Alert, AppState } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
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

    async initEngine() {
        try {
            if (!this.engine) {
                this.engine = createAgoraRtcEngine();
                await this.engine.initialize({ appId: this.appId });
                await this.engine.enableAudio();

                // Thêm các sự kiện lắng nghe lỗi
                // this.engine.addListener('Error', this.handleAgoraError);
            }
            return true;
        } catch (error) {
            console.error('Không thể khởi tạo Agora engine:', error);
            return false;
        }
    }

    async joinChannel(channelId: string, uid: number = 0, providedToken?: string) {
        try {
            console.log(`Attempting to join channel: ${channelId}`);

            // 1. Kiểm tra kết nối mạng trước
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra kết nối internet của bạn');
                return false;
            }

            // 2. Sử dụng token được cung cấp nếu có
            if (providedToken) {
                console.log('Using provided token');
                const permissionGranted = await this.requestPermissions();
                if (!permissionGranted) {
                    Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập microphone để thực hiện cuộc gọi');
                    return false;
                }

                const engineInitialized = await this.initEngineWithRetry();
                if (!engineInitialized) {
                    Alert.alert('Lỗi kết nối', 'Không thể khởi tạo dịch vụ cuộc gọi');
                    return false;
                }

                // 3. Sử dụng Promise với timeout để tránh chờ vô hạn
                const joinResult = await Promise.race([
                    this.engine.joinChannel(providedToken, channelId, '', uid),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout joining channel')), 10000)
                    )
                ]);

                console.log('Join channel result:', joinResult);
                return true;
            }

            // 4. Nếu không có token, lấy từ API
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                console.error('User not authenticated');
                Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
                return false;
            }

            // 5. Lấy Agora token từ backend với xử lý lỗi tốt hơn
            console.log(`Fetching Agora token for channel: ${channelId}`);
            let agoraTokenData;

            try {
                // Sử dụng joinCall API thay vì get-token API trực tiếp
                // Endpoint này đảm bảo cập nhật trạng thái cuộc gọi và tạo token
                const response = await fetch(`${Endpoint.Call.Join}?channelName=${channelId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API error: ${response.status} - ${errorText}`);
                }

                agoraTokenData = await response.json();

                if (!agoraTokenData.token) {
                    throw new Error('Token không hợp lệ từ server');
                }
            } catch (apiError) {
                console.error('Token API error:', apiError);
                Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
                return false;
            }

            // 6. Yêu cầu quyền và khởi tạo engine
            const permissionGranted = await this.requestPermissions();
            if (!permissionGranted) {
                Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập microphone để thực hiện cuộc gọi');
                return false;
            }

            const engineInitialized = await this.initEngineWithRetry();
            if (!engineInitialized) {
                Alert.alert('Lỗi khởi tạo', 'Không thể khởi tạo dịch vụ cuộc gọi');
                return false;
            }

            // 7. Tham gia kênh với token và xử lý lỗi chi tiết
            try {
                console.log(`Joining channel with token: ${agoraTokenData.token.substring(0, 20)}...`);
                // Chú ý: thứ tự tham số đúng là (token, channelName, info, uid)
                await this.engine.joinChannel(agoraTokenData.token, channelId, '', uid);
                console.log('Successfully joined Agora channel');
                return true;
            } catch (joinError: any) {
                console.error('Agora join channel error:', joinError);

                // 8. Phân loại lỗi từ Agora SDK
                if (joinError.code === 17) {
                    Alert.alert('Đã tham gia', 'Bạn đã tham gia kênh này');
                    return true;
                } else {
                    Alert.alert('Lỗi tham gia kênh', 'Không thể tham gia cuộc gọi. Vui lòng thử lại.');
                    return false;
                }
            }
        } catch (error) {
            console.error('Error joining channel:', error);
            Alert.alert('Lỗi không xác định', 'Đã xảy ra lỗi khi tham gia cuộc gọi');
            return false;
        }
    }

    async initEngineWithRetry(retries = 2) {
        for (let i = 0; i <= retries; i++) {
            try {
                if (!this.engine) {
                    this.engine = await RtcEngine();
                    await this.engine.initialize({
                        appId: this.appId,
                    });
                    await this.engine.enableAudio();

                    // Thêm event listener cho lỗi
                    this.engine.addListener('Error', (err: any) => {
                        console.error(`Agora Error Code: ${err.code}, Message: ${err.message || 'Unknown error'}`);
                        // Log các mã lỗi phổ biến
                        if (err.code === 17) console.log('Error 17: User already joined channel');
                        if (err.code === 2) console.log('Error 2: Invalid channel name');
                        if (err.code === 5) console.log('Error 5: Refused by server');
                        if (err.code === 1) console.log('Error 1: General error with no specific reason');
                    });
                }
                return true;
            } catch (error) {
                console.error(`Engine init attempt ${i + 1} failed:`, error);
                if (i === retries) return false;
                // Đợi 1s trước khi thử lại
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return false;
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
            await this.engine.joinChannel(token, channelId, '', 0);
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
            // Kiểm tra kết nối mạng trước
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra kết nối internet');
                return false;
            }

            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                throw new Error('User not authenticated');
            }

            // Sử dụng AbortController với timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                console.log(`Getting token to join call with channel: ${channelId}`);
                const response = await fetch(`${Endpoint.Call.Join}?channelName=${channelId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId); // Xóa timeout nếu fetch thành công

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
                const permissionGranted = await this.requestPermissions();
                if (!permissionGranted) {
                    Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập microphone');
                    return false;
                }

                const engineInitialized = await this.initEngineWithRetry();
                if (!engineInitialized) {
                    Alert.alert('Lỗi khởi tạo', 'Không thể khởi tạo dịch vụ cuộc gọi');
                    return false;
                }

                // Tham gia kênh với chuỗi rỗng thay vì null
                console.log(`Joining channel with token: ${token.substring(0, 20)}...`);
                await this.engine.joinChannel(token, channelId, '', 0);
                console.log('Successfully joined Agora channel as receiver');

                return true;
            } catch (fetchError: any) {
                clearTimeout(timeoutId);

                if (fetchError.name === 'AbortError') {
                    Alert.alert('Timeout', 'Yêu cầu bị hủy do quá thời gian chờ');
                }
                throw fetchError;
            }
        } catch (error) {
            console.error('Error joining call:', error);
            return false;
        }
    }

    setupCallEvents(onUserJoined: any, onUserOffline: any) {
        // Các sự kiện hiện tại
        this.engine.addListener('UserJoined', onUserJoined);
        this.engine.addListener('UserOffline', onUserOffline);

        // Thêm các sự kiện quan trọng từ Agora-RN-Quickstart
        this.engine.addListener('JoinChannelSuccess', (connection: any, elapsed: any) => {
            console.log('Tham gia kênh thành công:', connection.channelId);
            // Đánh dấu là đã kết nối thành công
            this.setCallConnected();
        });

        this.engine.addListener('ConnectionStateChanged', (state: any, reason: any) => {
            console.log('Trạng thái kết nối thay đổi:', state, 'lý do:', reason);
        });

        return () => {
            this.engine.removeListener('UserJoined');
            this.engine.removeListener('UserOffline');
            this.engine.removeListener('JoinChannelSuccess');
            this.engine.removeListener('ConnectionStateChanged');
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