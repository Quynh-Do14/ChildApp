import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../infrastructure/common/layouts/layout';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import authService from '../../infrastructure/repositories/auth/auth.service';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
// import { useRecoilState } from 'recoil'; // Uncomment nếu cần dùng recoil

const OtpVerificationScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const otpLength = 4;
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleChangeText = (text: string, index: number) => {
        if (text.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text !== '' && index < otpLength - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length < otpLength) return;

        try {
            setLoading(true);
            // TODO: Gọi API xác thực OTP tại đây
            // await authService.verifyOTP(...);
            console.log('OTP xác nhận:', fullOtp);
            navigation.navigate('LoginScreen');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onGoBack = () => navigation.goBack();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
        >
            <View style={styles.container}>
                <Text style={styles.subtitle}>
                    Vui lòng nhập mã OTP của bạn.
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChangeText(text, index)}
                            autoFocus={index === 0}
                            onKeyPress={({ nativeEvent }) => {
                                if (
                                    nativeEvent.key === 'Backspace' &&
                                    index > 0 &&
                                    otp[index] === ''
                                ) {
                                    inputRefs.current[index - 1]?.focus();
                                }
                            }}
                        />
                    ))}
                </View>

                <ButtonCommon
                    title="Xác thực"
                    onPress={handleVerifyOtp}
                />

                <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Quay lại</Text>
                </TouchableOpacity>
            </View>
            <LoadingFullScreen loading={loading} />
        </KeyboardAvoidingView>
    );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
    keyboardAvoid: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 32,
        backgroundColor: "#FFF"
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        marginBottom: 8,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    otpInput: {
        width: 55,
        height: 60,
        borderWidth: 2,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        borderColor: '#007BFF',
        backgroundColor: '#fff',
        color: '#000',
    },
    backBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    backText: {
        fontSize: 14,
        color: '#007BFF',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});
