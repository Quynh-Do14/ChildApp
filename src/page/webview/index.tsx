import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, BackHandler, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import MainLayout from '../../infrastructure/common/layouts/layout';
import blockService from '../../infrastructure/repositories/block/block.service';

const WebiewScreen = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [browserList, setBrowserList] = useState<string[]>([]);
    const [canGoBack, setCanGoBack] = useState(false);
    const webViewRef = useRef<WebView>(null);
    const isFocused = useIsFocused();
    const currentUrl = 'https://www.google.com';

    const fetchBlockedWebsites = async (loadingState: boolean = true) => {
        try {
            const response = await blockService.getByChild(
                loadingState ? setLoading : setRefreshing
            );
            if (response) {
                const list = response.map((item: any) => item.appName.toLowerCase());
                setBrowserList(list);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách web bị chặn');
            console.error('Fetch blocked websites error:', error);
        }
    };

    useEffect(() => {
        fetchBlockedWebsites();
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchBlockedWebsites();
        }
    }, [isFocused]);

    const isBlockedUrl = (url: string) => {
        return browserList.some((blocked) => url.includes(blocked));
    };

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (canGoBack && webViewRef.current) {
                    webViewRef.current.goBack();
                    return true;
                }
                return false;
            });

            return () => backHandler.remove();
        }, [canGoBack])
    );
    const handleNavigationStateChange = (navState: any) => {
        setCanGoBack(navState.canGoBack);
    };

    return (
        <MainLayout title={'Trình duyệt'}>
            <View style={{ flex: 1 }}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: currentUrl }}
                    originWhitelist={['*']}
                    style={{ flex: 1 }}
                    onNavigationStateChange={handleNavigationStateChange}
                    onShouldStartLoadWithRequest={(request) => {
                        console.log("request", request);

                        const isBlocked = isBlockedUrl(request.url);
                        if (isBlocked) {
                            Alert.alert('Trình duyện bị chặn', `Những trình duyệt chứa từ này sẽ bị chặn`);
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
