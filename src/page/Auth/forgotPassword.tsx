import React, { useState } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native'
import ButtonCommon from '../../infrastructure/common/components/button/button-common'
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading'
import authService from '../../infrastructure/repositories/auth/auth.service';

const ForgotPasswordScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState<boolean>(false);

    const onGoBack = () => navigation.goBack();

    const onUpdateProfile = async () => {
        if (!email.trim()) return;
        try {
            await authService.forgotPassword(
                {
                    email
                },
                setLoading
            ).then((response) => {
                if (response) {
                    navigation.navigate('ResetPasswordScreen');
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Quên mật khẩu?</Text>
                <Text style={styles.description}>Nhập email để lấy lại thông tin mật khẩu</Text>

                <TextInput
                    keyboardType='email-address'
                    placeholder='Nhập email của bạn'
                    placeholderTextColor="#999"
                    onChangeText={setEmail}
                    value={email}
                    style={styles.input}
                />

                <TouchableOpacity onPress={onGoBack}>
                    <Text style={styles.backText}>← Quay lại màn hình đăng nhập</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonWrapper}>
                <ButtonCommon
                    title="Gửi yêu cầu"
                    onPress={onUpdateProfile}
                />
            </View>

            <LoadingFullScreen loading={loading} />
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    innerContainer: {
        gap: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginTop: -12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#f9f9f9',
    },
    backText: {
        fontSize: 14,
        color: '#4f3f97',
        marginTop: 16,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    buttonWrapper: {
        paddingTop: 12,
    },
});
