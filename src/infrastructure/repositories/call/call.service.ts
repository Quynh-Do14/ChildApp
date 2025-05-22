import { ChannelProfileType, ClientRoleType, createAgoraRtcEngine, IRtcEngine } from 'react-native-agora';
import { Platform, PermissionsAndroid } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoint } from '../../../core/common/apiLink';

class CallService {
    engine: IRtcEngine | null = null;
    appId: string = 'bd75f190073641d38c551b244817a2b1';

    constructor() { }

    async requestPermissions() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                ]);

                if (
                    granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Permission granted');
                    return true;
                } else {
                    console.log('Permission denied');
                    return false;
                }
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else if (Platform.OS === 'ios') {
            return true; // iOS xử lý quyền tự động
        }
    }

    async init() {
        try {
            await this.requestPermissions();

            if (this.engine) {
                console.log('Engine đã tồn tại, không khởi tạo lại');
                return true;
            }

            console.log('Khởi tạo Agora engine với AppID:', this.appId);
            this.engine = createAgoraRtcEngine();

            // Khởi tạo với config mới
            this.engine.initialize({
                appId: this.appId,
                // Không cần channelProfile và clientRole ở đây
            });

            // Thiết lập các giá trị cấu hình
            this.engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
            this.engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

            // Bật audio
            this.engine.enableAudio();

            // Bật video
            this.engine.enableVideo();
            this.engine.startPreview();

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
            console.log('User token:', userToken ? 'Có token' : 'Không có token');
            if (!userToken) return { success: false, error: 'Lỗi xác thực' };

            try {
                console.log('Khởi tạo cuộc gọi với receiverId:', receiverId);

                // In ra endpoint đầy đủ để debug
                console.log('URL:', Endpoint.Call.InitiateCall);

                const response = await fetch(Endpoint.Call.InitiateCall, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({ receiverId }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error:', response.status, errorText);
                    throw new Error(`API error: ${response.status}`);
                }

                console.log('API phản hồi thành công');
                const data = await response.json();
                console.log('Data từ API:', JSON.stringify(data));

                const { channelName, token } = data;

                // Khởi tạo engine nếu chưa
                if (!this.engine) {
                    console.log('Khởi tạo Agora engine...');
                    await this.init();
                }

                // Tham gia kênh - giống chính xác như Agora-RN-Quickstart
                console.log('Tham gia kênh với token: ', token ? token.substr(0, 20) + '...' : 'undefined');
                await this.engine?.joinChannel(token, channelName, 0, {});
                console.log('Tham gia kênh thành công với vai trò người gọi');

                return {
                    success: true,
                    channelName,
                    token
                };
            } catch (apiError) {
                console.error('API error detail:', apiError);
                throw apiError;
            }
        } catch (error: any) {
            console.error('Error starting call:', error);

            // Cải thiện thông báo lỗi
            let errorMessage = 'Không thể bắt đầu cuộc gọi';
            if (error.message?.includes('Network request failed')) {
                errorMessage = 'Không thể kết nối tới server. Kiểm tra kết nối mạng của bạn.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async joinCall(channelName: string) {
        try {
            // Lấy token xác thực
            const userToken = await AsyncStorage.getItem('token');
            console.log('User token:', userToken ? 'Có token' : 'Không có token');
            if (!userToken) return { success: false, error: 'Lỗi xác thực' };

            try {
                console.log('Đang lấy token từ API...');
                console.log('Channel name:', channelName);

                // URL đầy đủ với domain
                const url = `${Endpoint.Call.GetToken}?channelName=${channelName}`;
                console.log('URL đầy đủ:', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error:', response.status, errorText);
                    throw new Error(`API error: ${response.status}`);
                }

                console.log('API phản hồi thành công');
                const data = await response.json();
                console.log('Data từ API:', JSON.stringify(data));

                // Lấy token từ response thành công
                const token = data.token;

                // Khởi tạo engine nếu chưa
                if (!this.engine) {
                    console.log('Khởi tạo Agora engine...');
                    await this.init();
                }

                // Đảm bảo engine đã được khởi tạo
                if (!this.engine) {
                    throw new Error('Engine không được khởi tạo');
                }

                // Xóa tất cả event listeners trước khi thiết lập lại
                // this.engine.removeAllListeners();

                // Đảm bảo rời khỏi kênh trước khi tham gia kênh mới
                try {
                    if (this.engine) {
                        await this.engine.leaveChannel();
                        console.log('Đã rời khỏi kênh trước đó');
                    }
                } catch (leaveError) {
                    console.log('Không có kênh để rời hoặc lỗi khi rời kênh', leaveError);
                    // Tiếp tục - không throw lỗi
                }

                // Tham gia kênh
                console.log('Tham gia kênh với token:', token ? token.substr(0, 20) + '...' : 'undefined');
                await this.engine.joinChannel(token, channelName, 0, {});
                console.log('Tham gia kênh thành công');

                return {
                    success: true,
                    channelName,
                    token
                };
            } catch (apiError) {
                console.error('API error detail:', apiError);
                throw apiError;
            }
        } catch (error: any) {
            console.error('Error joining call:', error);

            // Cải thiện thông báo lỗi
            let errorMessage = 'Không thể tham gia cuộc gọi';
            if (error.message?.includes('Network request failed')) {
                errorMessage = 'Không thể kết nối tới server. Kiểm tra kết nối mạng của bạn.';
            }

            return {
                success: false,
                error: errorMessage
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

    async setupAndJoinChannel(channelId: string) {
        try {
            // 1. Khởi tạo engine nếu chưa có
            if (!this.engine) {
                console.log('Khởi tạo Agora engine...');
                await this.init();
            }

            // 2. Thiết lập các sự kiện TRƯỚC KHI join channel
            this.engine?.addListener('onJoinChannelSuccess', (connection, uid) => {
                console.log('Successfully joined channel', connection.channelId, 'with uid', uid);
            });

            this.engine?.addListener('onError', (err) => {
                console.error('Agora error:', err);
            });

            // 3. Thử join channel với token rỗng (như Agora-RN-Quickstart)
            console.log('Thử tham gia kênh trực tiếp với token rỗng...');
            try {
                await this.engine?.joinChannel('', channelId, 0, {});
                console.log('Join channel thành công với token rỗng!');
                return { success: true };
            } catch (joinError) {
                console.log('Không thể join với token rỗng, thử lấy token từ server...');
                await this.init();
                // 4. Nếu không được, thì thử lấy token từ server
                const result = await this.joinCall(channelId);
                return result;
            }
        } catch (error: any) {
            console.error('Error in setupAndJoinChannel:', error);
            return { success: false, error: error.message };
        }
    }

    async reconnect(channelName: string, token?: string) {
        try {
            console.log('Đang cố gắng kết nối lại...');
            if (this.engine) {
                // Rời khỏi kênh trước
                try {
                    await this.engine.leaveChannel();
                } catch (e) {
                    console.log('Không thể rời kênh:', e);
                }

                // Tham gia lại kênh
                await this.engine.joinChannel(token || '', channelName, Math.floor(Math.random() * 100000), {});
                console.log('Đã kết nối lại thành công');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi kết nối lại:', error);
            return false;
        }
    }
}

export default new CallService();