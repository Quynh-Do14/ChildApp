import { Endpoint } from "../../../core/common/apiLink";
import { Alert } from "react-native";
import { RequestService } from "../../utils/response";
import { clearStorage, saveToken } from "../../utils/storage";
class AuthService {
    async login(data: object, setLoading: Function) {
        setLoading(true);
        try {
            return await RequestService
                .post(Endpoint.Auth.Login,
                    data
                )
                .then(response => {
                    if (response) {
                        saveToken(
                            response.accessToken,
                        );
                    }
                    setLoading(false)
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
                .then(response => {
                    if (response) {
                        saveToken(
                            response.accessToken,
                        );
                    }
                    setLoading(false)
                    return response;
                });
        } catch (error: any) {
            Alert.alert(`Đăng nhập không thành công`, error.response.data.message);
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    async logout(setLoading: Function) {
        setLoading(true)
        try {
            clearStorage()
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        };
    };

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
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Auth.Profile).then(response => {
                    return response;
                });
        }
        catch (error) {
            console.log(error)
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


}

export default new AuthService();
