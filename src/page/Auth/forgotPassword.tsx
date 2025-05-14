import React, { useState } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import MainLayout from '../../infrastructure/common/layouts/layout'
import ButtonCommon from '../../infrastructure/common/components/button/button-common'
import authService from '../../infrastructure/repositories/auth/auth.service'
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading'

const ForgotPasswordScreen = ({ navigation }: any) => {
    const onGoBack = () => {
        navigation.goBack()
    }
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState<boolean>(false);

    const onChange = (value: string) => {
        setEmail(value || "");
    }
    const onUpdateProfile = async () => {
        if (email) {
            try {
                await authService.forgotPassword(
                    email,
                    setLoading,

                ).then((response) => {
                    if (response) {
                        navigation.navigate('ResetPasswordScreen');
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }

    }
    return (
        <View style={styles.container}>
            <View>
                <View>
                    <Text style={[
                        styles.fontStyle,
                        {
                            fontSize: 24,
                            marginBottom: 20
                        }
                    ]}>
                        Bạn đã quên mật khẩu?
                    </Text>
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4
                        }}
                    >
                        <Text style={styles.fontStyle}>
                            Vui lòng nhập Email
                        </Text>
                        <Text style={styles.fontStyle}>
                            để lấy lại thông tin mật khẩu
                        </Text>
                    </View>
                </View>

                <View>
                    <KeyboardAvoidingView>
                        <View>
                            <TextInput
                                keyboardType='email-address'
                                placeholder='Email'
                                placeholderTextColor={"#ffffff"}
                                onChangeText={onChange}
                                style={[
                                    styles.fontStyle,
                                    styles.inputStyle
                                ]} />
                        </View>
                    </KeyboardAvoidingView>
                    <TouchableOpacity onPress={onGoBack}>
                        <Text style={styles.fontStyleBack}>
                            Trở lại màn hình đăng nhập
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
            <View style={styles.btnContainer}>
                <ButtonCommon
                    title={'Gửi yêu cầu'}
                    onPress={onUpdateProfile}
                />
            </View>
            <LoadingFullScreen loading={loading} />
        </View>
    )
}

export default ForgotPasswordScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 32,
        paddingHorizontal: 12,
        paddingVertical: 20
    },
    btnContainer: {
        paddingHorizontal: 12,
    },
    fontStyle: {
        color: "#666",
        fontSize: 16,
    },
    fontStyleBack: {
        color: "#6666",
        fontSize: 14,
        marginTop: 28,
        textAlign: "center"
    },
    inputStyle: {
        borderBottomWidth: 1,
        borderBottomColor: "#2C2C2E",
    },

})