import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import callService from '../../infrastructure/repositories/call/call.service';
import { Endpoint } from '../../core/common/apiLink';

type RootStackParamList = {
    CallScreen: {
        channelId: string;
        recipientName: string;
        isIncoming?: boolean;
        token?: string;
    };
    IncomingCallScreen: {
        callerName: string;
        channelId: string;
        callerImage?: string;
    };
};

type NavigationProps = NavigationProp<RootStackParamList>;

const TestCallButton = () => {
    const navigation = useNavigation<NavigationProps>();
    const [isLoading, setIsLoading] = useState(false);

    const startTestCall = async () => {
        try {
            setIsLoading(true);

            // Lấy token xác thực
            const userToken = await AsyncStorage.getItem('token');
            if (!userToken) {
                Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
                setIsLoading(false);
                return;
            }

            console.log('Bắt đầu cuộc gọi test với receiverId: 3');

            // Gọi API /call/initiate
            const response = await fetch(`${Endpoint.Call.InitiateCall}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    receiverId: 3
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error:', response.status, errorText);
                Alert.alert('Lỗi', `Không thể khởi tạo cuộc gọi: ${response.status}`);
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            console.log('API response:', data);

            if (data.status === 200 && data.channelName && data.token) {
                // Tham gia kênh
                await callService.init();

                // Chuyển đến màn hình cuộc gọi
                navigation.navigate('CallScreen', {
                    channelId: data.channelName,
                    recipientName: 'Test User',
                    token: data.token,
                    isIncoming: false,
                });
            } else {
                Alert.alert('Lỗi', data.message || 'Không thể khởi tạo cuộc gọi');
            }
        } catch (error) {
            console.error('Error starting test call:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi khởi tạo cuộc gọi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={startTestCall}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Text style={styles.buttonText}>Test Call (ID: 3)</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default TestCallButton;