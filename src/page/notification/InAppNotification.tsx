import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

const InAppNotification = ({ title, message, onPress, onClose }) => {
    const translateY = new Animated.Value(-100);

    useEffect(() => {
        // Hiển thị thông báo
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
        }).start();

        // Tự động ẩn sau 5 giây
        const timer = setTimeout(() => {
            hideNotification();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const hideNotification = () => {
        Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose && onClose());
    };

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY }] }]}
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