import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import MainLayout from '../../infrastructure/common/layouts/layout';
import { Alert, Button, TextInput, View } from 'react-native';
import blockService from '../../infrastructure/repositories/block/block.service';
import { useIsFocused } from '@react-navigation/native';

const WebiewScreen = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [browserList, setBrowerList] = useState<string[]>([]);
    const currentUrl = "https://www.google.com";
    const isFocused = useIsFocused();

    const fetchWeb = async (loadingState: boolean = true) => {
        try {
            const response = await blockService.getByChild(
                loadingState ? setLoading : setRefreshing
            );
            if (response) {
                setBrowerList(response?.map((item: any) => item.appName));
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách trẻ');
            console.error('Fetch children error:', error);
        }
    };

    // Effects
    useEffect(() => {
        fetchWeb();
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchWeb();
        }
    }, [isFocused]);

    const isBlockedUrl = (url: string) => {
        return browserList.some((blocked) => url.includes(blocked));
    };

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
