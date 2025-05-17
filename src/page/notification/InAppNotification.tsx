import React, { useEffect, useRef, useCallback } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

interface InAppNotificationProps {
    title: string;
    message: string;
    onPress?: () => void;
    onClose?: () => void;
}

const InAppNotification: React.FC<InAppNotificationProps> = ({
    title,
    message,
    onPress,
    onClose
}) => {
    // Sử dụng useRef để lưu trữ animate value
    const translateYRef = useRef(new Animated.Value(-100));

    // Sử dụng callback để tạo một hàm ổn định
    const hideNotification = useCallback(() => {
        Animated.timing(translateYRef.current, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose && onClose());
    }, [onClose]);

    // Hiệu ứng animation ban đầu
    useEffect(() => {
        // Hiển thị thông báo
        Animated.spring(translateYRef.current, {
            toValue: 0,
            useNativeDriver: true,
        }).start();

        // Tự động ẩn sau 5 giây
        const timer = setTimeout(hideNotification, 5000);

        // Dọn dẹp
        return () => clearTimeout(timer);
    }, [hideNotification]);

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY: translateYRef.current }] }]}
        >
            <TouchableOpacity style={styles.content} onPress={onPress}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
                <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        margin: 10,
        marginTop: 40,
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        zIndex: 999,
        elevation: 5,
    },
    content: {
        flex: 1,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    message: {
        color: 'white',
        marginTop: 5,
    },
    closeButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
});

export default InAppNotification;