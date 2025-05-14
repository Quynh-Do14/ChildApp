import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native'
import authService from '../../infrastructure/repositories/auth/auth.service';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import InputPasswordCommon from '../../infrastructure/common/components/input/input-password-common';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import React from 'react';

const ResetPasswordScreen = () => {
    const [_data, _setData] = useState<any>({});
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const navigation = useNavigation<any>();

    const dataProfile = _data;
    const setDataProfile = (data: any) => {
        Object.assign(dataProfile, { ...data });
        _setData({ ...dataProfile });
    };

    const isValidData = () => {
        let allRequestOK = true;

        setValidate({ ...validate });

        Object.values(validate).forEach((it: any) => {
            if (it.isError === true) {
                allRequestOK = false;
            }
        });

        return allRequestOK;
    };
    const onLoginAsync = async () => {
        await setSubmittedTime(Date.now());
        if (isValidData()) {
            try {
                await authService.resetPassword(
                    dataProfile.otp,
                    dataProfile.newPassword,
                    setLoading,
                ).then((response) => {
                    if (response) {
                        setDataProfile(
                            {
                                otp: "",
                                newPassword: "",
                            },
                        )
                        navigation.replace('LoginScreen');
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <ImageBackground
                    source={require("../../assets/images/bgLogin.png")}
                    style={[
                        styles.backgroundImage,
                        {
                            position: "relative",
                            height: "100%"
                        }
                    ]}
                >
                    <View
                        style={[
                            {
                                // backgroundColor: "#0000007f",
                                width: "100%",
                                height: "100%",
                                position: "absolute"
                            }
                        ]}
                    ></View>
                    <View style={[
                        styles.flexCol,
                        {
                            paddingVertical: 20,
                            paddingHorizontal: 30,
                            justifyContent: "space-between",
                            height: "100%",
                        }
                    ]}>
                    </View>
                </ImageBackground>
            </View>
            <View style={styles.content}>
                <ScrollView>
                    <KeyboardAvoidingView behavior='padding'>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.form}>
                                <InputTextCommon
                                    label={"Mã OTP"}
                                    attribute={"otp"}
                                    dataAttribute={dataProfile.otp}
                                    isRequired={false}
                                    setData={setDataProfile}
                                    editable={true}
                                    validate={validate}
                                    setValidate={setValidate}
                                    submittedTime={submittedTime}
                                />
                                <InputPasswordCommon
                                    label={"Mật khẩu"}
                                    attribute={"newPassword"}
                                    dataAttribute={dataProfile.newPassword}
                                    isRequired={false}
                                    setData={setDataProfile}
                                    validate={validate}
                                    setValidate={setValidate}
                                    submittedTime={submittedTime}
                                />
                                {/* Remember Me and Forgot Password */}
                                <ButtonCommon title="Đặt lại" onPress={onLoginAsync} />
                                <View style={styles.row}>
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                    >
                                        <Text style={styles.forgotPassword}>Quay lại</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </ScrollView>
            </View>
            <LoadingFullScreen loading={loading} />
        </View >
    )
}

export default ResetPasswordScreen
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FA',
        flexDirection: "column",
        justifyContent: "center",
        gap: 12,
        flex: 1
    },
    logo: {
        flex: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 5,
        paddingHorizontal: 12,
        paddingVertical: 20
    },
    form: {
        flexDirection: "column",
        gap: 12
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: '#fff',
    },
    checkboxSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    rememberMeText: {
        fontSize: 14,
        color: '#555',
    },
    forgotPassword: {
        fontSize: 14,
        color: '#FD3667',
        fontWeight: "bold"
    },
    signInButton: {
        backgroundColor: "#407CE2",
        borderRadius: 90,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    signInButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    orText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#aaa',
        marginBottom: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e1e1e1',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        shadowRadius: 4,
    },
    signUpText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#555',
    },
    signUpLink: {
        color: '#85C850',
        fontWeight: 'bold',
    },


    flexRow: {
        display: "flex",
        flexDirection: "row",
    },
    flexCol: {
        display: "flex",
        flexDirection: "column",
    },
    fontStyle: {
        color: "#FFFFFF",
        fontFamily: "Roboto Regular",
        fontWeight: "bold",
    },
})