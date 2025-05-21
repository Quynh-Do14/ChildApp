import React, { useState } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Alert } from 'react-native'
import ButtonCommon from '../../infrastructure/common/components/button/button-common'
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading'
import authService from '../../infrastructure/repositories/auth/auth.service';
import InputPasswordCommon from '../../infrastructure/common/components/input/input-password-common';

const ChangePasswordScreen = ({ navigation }: any) => {
    const [_data, _setData] = useState<any>({});
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

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

    const onGoBack = () => navigation.goBack();

    const onChangePassword = async () => {
        await setSubmittedTime(Date.now());
        if (isValidData()) {

            if (dataProfile.newPassword !== dataProfile.confirmNewPassword) {
                Alert.alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
                return;
            }
            try {
                await authService.changePassword(
                    {
                        "oldPassword": dataProfile.oldPassword,
                        "newPassword": dataProfile.newPassword,
                        "confirmNewPassword": dataProfile.confirmNewPassword
                    },
                    setLoading
                ).then((response) => {
                    if (response) {
                        navigation.goBack();
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Đổi mật khẩu</Text>
                <Text style={styles.description}>Vui lòng nhập mật khẩu hiện tại và mật khẩu mới</Text>

                <InputPasswordCommon
                    label={"Mật khẩu cũ"}
                    attribute={"oldPassword"}
                    dataAttribute={dataProfile.oldPassword}
                    isRequired={false}
                    setData={setDataProfile}
                    validate={validate}
                    setValidate={setValidate}
                    submittedTime={submittedTime}
                />
                <InputPasswordCommon
                    label={"Mật khẩu mới"}
                    attribute={"newPassword"}
                    dataAttribute={dataProfile.newPassword}
                    isRequired={false}
                    setData={setDataProfile}
                    validate={validate}
                    setValidate={setValidate}
                    submittedTime={submittedTime}
                />

                <InputPasswordCommon
                    label={"Xác nhận mật khẩu"}
                    attribute={"confirmNewPassword"}
                    dataAttribute={dataProfile.confirmNewPassword}
                    isRequired={false}
                    setData={setDataProfile}
                    validate={validate}
                    setValidate={setValidate}
                    submittedTime={submittedTime}
                />

                <TouchableOpacity onPress={onGoBack}>
                    <Text style={styles.backText}>← Quay lại</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonWrapper}>
                <ButtonCommon
                    title="Đổi mật khẩu"
                    onPress={onChangePassword}
                />
            </View>

            <LoadingFullScreen loading={loading} />
        </KeyboardAvoidingView>
    );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    innerContainer: {
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
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