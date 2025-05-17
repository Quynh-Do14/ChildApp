import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import MainLayout from '../../infrastructure/common/layouts/layout';
import { Alert, Button, TextInput, View } from 'react-native';

const blockedLinks = [
    'https://www.facebook.com/',
    'https://www.instagram.com/',
    'https://www.youtube.com/',
];

const isBlockedUrl = (url: string) => {
    return blockedLinks.some((blocked) => url.includes(blocked));
};

const WebiewScreen = () => {
    const currentUrl = "https://www.google.com";
    return (
        <MainLayout title={'Trình duyệt'}>
            <View style={{ flex: 1 }}>
                <WebView
                    source={{ uri: currentUrl }}
                    originWhitelist={['*']}
                    style={{ flex: 1 }}
                    onShouldStartLoadWithRequest={(request) => {
                        const isBlocked = isBlockedUrl(request.url);
                        if (isBlocked) {
                            Alert.alert('Cảnh báo', 'Trang web này bị chặn vì lý do an toàn.');
                            return false;
                        }
                        return true;
                    }}
                />
            </View>
        </MainLayout>
    );
};

export default WebiewScreen;
