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

                        await this.registerFCMTokenAfterLogin(response.userProfile.email);
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
        console.log("otp", otp);
        setLoading(true);
        try {
            return await RequestService
                .post(`${Endpoint.Auth.OTP}/${otp}`,
                    {}
                )
                .then(async response => {
                    if (response) {
                        console.log("response", response);
                        await saveToken(
                            response.refreshToken,
                        );

                        await this.registerFCMTokenAfterLogin(response.userProfile.email);
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
        setLoading(true)
        try {
            await fcmService.deleteToken();
            await RequestService.
                post(Endpoint.Auth.Logout,
                    {}
                ).then(response => {
                    return response;
                });
            clearStorage();
        } catch (error) {
            console.log(error);
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
            await RequestService.
                post(Endpoint.Notification.RegisterToken, {
                    token: await fcmService.getFCMToken(),
                }).then(response => {
                    return response;
                }
                ).catch(error => {
                    console.log("Register token error", error);
                });

            return await RequestService.
                get(Endpoint.Auth.Profile).then(response => {
                    return response;
                });
        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async updateProfile(data: object, setLoading: Function) {
        setLoading(true)

        try {
            return await RequestService.putForm(Endpoint.Auth.UpdateProfile,
                { ...data }
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
            console.log("otp", otp);
            console.log("newPassword", newPassword);
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
            return await RequestService.post(`${Endpoint.Auth.ChangePassword}`,
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
