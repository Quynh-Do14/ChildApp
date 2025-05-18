import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';

// Định nghĩa kiểu cho navigation stack
type RootStackParamList = {
    CallScreen: {
        channelId: string;
        recipientName: string;
        isIncoming?: boolean;
    };
    IncomingCallScreen: {
        callerName: string;
        channelId: string;
        callerImage?: string;
    };
    // Thêm các màn hình khác nếu cần
};

// Định nghĩa kiểu cho route
type IncomingCallScreenRouteProp = RouteProp<RootStackParamList, 'IncomingCallScreen'>;

const IncomingCallScreen = () => {
    // Sử dụng useRoute với kiểu đã định nghĩa
    const route = useRoute<IncomingCallScreenRouteProp>();
    // Sử dụng useNavigation với kiểu đã định nghĩa
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const { callerName, channelId, callerImage } = route.params;

    // Từ chối cuộc gọi
    const rejectCall = useCallback(() => {
        // Có thể thêm API để thông báo từ chối
        navigation.goBack();
    }, [navigation]);

    // Tự động từ chối cuộc gọi sau 30 giây
    useEffect(() => {
        const timer = setTimeout(() => {
            rejectCall();
        }, 30000);

        return () => clearTimeout(timer);
    }, [rejectCall]);

    // Chấp nhận cuộc gọi
    const acceptCall = () => {
        navigation.navigate({
            name: 'CallScreen',
            params: {
                channelId,
                recipientName: callerName,
                isIncoming: true
            },
            merge: true
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.infoContainer}>
                <Text style={styles.callerName}>{callerName}</Text>
                <Text style={styles.callingText}>Đang gọi thoại...</Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={rejectCall}>
                    <Icon name="call-end" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={acceptCall}>
                    <Icon name="call" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    infoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    callerName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    callingText: {
        color: '#aaa',
        fontSize: 18,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 50,
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: '#ff3b30',
    },
    acceptButton: {
        backgroundColor: '#34c759',
    },
});

export default IncomingCallScreen;