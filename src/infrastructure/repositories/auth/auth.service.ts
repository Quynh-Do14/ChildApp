import { Endpoint } from "../../../core/common/apiLink";
import { Alert } from "react-native";
import { RequestService } from "../../utils/response";
import { clearStorage, saveToken } from "../../utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import fcmService from "../fcm/fcmService";
class AuthService {
    async login(data: object, setLoading: Function) {
        setLoading(true);
        try {
            return await RequestService
                .post(Endpoint.Auth.Login,
                    data
                )
                .then(async response => {
                    if (response) {
                        await saveToken(
                            response.accessToken,
                        );
                    }
                    setLoading(false);
                    return response;
                });
        } catch (error: any) {
            Alert.alert(`Đăng nhập không thành công`, error.response.data.message);
            console.error(error)
        } finally {
            setLoading(false);
        }
    }

    async loginOTP(otp: string, setLoading: Function) {
        setLoading(true);
        try {
            return await RequestService
                .post(`${Endpoint.Auth.OTP}/${otp}`,
                    {}
                )
                .then(async response => {
                    if (response) {
                        await saveToken(
                            response.accessToken,
                        );
                    }
                    setLoading(false);
                    return response;
                });
        } catch (error: any) {
            Alert.alert(`Đăng nhập không thành công`, error.response.data.message);
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    async registerFCMTokenAfterLogin(email: string) {
        try {
            const pendingToken = await AsyncStorage.getItem('pendingFcmToken');

            if (pendingToken) {
                await fcmService.registerTokenWithEmail(pendingToken, email);
                await AsyncStorage.removeItem('pendingFcmToken');
            } else {
                await fcmService.getFCMToken();
            }
        } catch (error) {
            console.log(error);
        }
    }

    async logout(setLoading: Function) {
        setLoading(true);
        try {
            console.log("Deleting FCM token...");
            await fcmService.deleteToken();

            console.log("Calling API logout...");
            await RequestService.post(Endpoint.Auth.Logout, {});

            console.log("Clearing storage...");
            clearStorage();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    }

    async register(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Auth.Signup,
                    { ...data }
                ).then(response => {
                    Alert.alert(`Đăng kí thành công`);
                    return response;
                });
        } catch (error: any) {
            Alert.alert(`Đăng kí không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    };
    async profile(setLoading: Function) {
        setLoading(true);
        try {
            // Gọi đăng ký FCM token nhưng không làm ảnh hưởng tới luồng chính nếu lỗi
            try {
                const token = await fcmService.getFCMToken();
                console.log("token", token);
                await RequestService.post(Endpoint.Notification.RegisterToken, { token });
            } catch (error) {
                console.log("Register token error", error);
            }

            // Gọi lấy thông tin profile và return
            const response = await RequestService.get(Endpoint.Auth.Profile);
            return response;
        } catch (error) {
            console.log("Lỗi lấy profile:", error);
            throw error; // có thể throw lại nếu muốn handle bên ngoài
        } finally {
            setLoading(false);
        }
    }

    async updateProfile(data: object, setLoading: Function) {
        setLoading(true)
        console.log("data", data);
        try {
            return await RequestService.putForm(Endpoint.Auth.UpdateProfile,
                data
            ).then(response => {
                Alert.alert(`Cập nhật thành công`);
                return response;
            });
        }
        catch (error: any) {
            console.log(error)
            Alert.alert(`Cập nhật không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    async resetPassword(otp: string, newPassword: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.post(`${Endpoint.Auth.ResetPassword}?otp=${otp}&newPassword=${newPassword}`,

                {}
            ).then(response => {
                Alert.alert(`Đổi mật khẩu thành công`);
                return response;
            });
        }
        catch (error: any) {
            console.log(error)
            Alert.alert(`Đổi mật khẩu không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }
    async forgotPassword(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.post(`${Endpoint.Auth.ForgotPassword}`,
                data
            ).then(response => {
                Alert.alert(`Gửi email thành công`);
                return response;
            });
        }
        catch (error: any) {
            Alert.alert(`Gửi email không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    async changePassword(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.put(`${Endpoint.Auth.ChangePassword}`,
                data
            ).then(response => {
                Alert.alert(`Đổi mật khẩu thành công`);
                return response;
            });
        }
        catch (error: any) {
            Alert.alert(`Đổi mật khẩu không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }
}

export default new AuthService();
