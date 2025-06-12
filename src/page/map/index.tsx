import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MainLayout from '../../infrastructure/common/layouts/layout';
import { useRecoilValue } from 'recoil';
import { LocationState } from '../../core/atoms/location/locationState';
import userService from '../../infrastructure/repositories/user/user.service';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import { useIsFocused } from '@react-navigation/native';

export default function MapScreen() {
    const location = useRecoilValue(LocationState)?.data;
    const [myLocation, setMyLocation] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const isFocused = useIsFocused();

    const GetMyLocationAsync = async () => {
        setLoading(true);
        try {
            const response = await userService.getLocation(setLoading);
            if (response && Array.isArray(response)) {
                setMyLocation(response);
            } else {
                setMyLocation([]); // fallback in case response is not valid
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu vị trí:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetMyLocationAsync();
    }, []);

    useEffect(() => {
        if (isFocused) {
            GetMyLocationAsync();
        }
    }, [isFocused]);

    const defaultRegion = {
        latitude: location?.coords?.latitude || 21.0278,
        longitude: location?.coords?.longitude || 105.8342,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <MainLayout title="Bản đồ">
            <View style={styles.container}>
                <MapView style={styles.map} initialRegion={defaultRegion}>
                    {location?.coords?.latitude && location?.coords?.longitude && (
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            title="Vị trí của bạn"
                            description="Đây là vị trí của bạn"
                        />
                    )}

                    {myLocation.map((item, index) => {
                        const lat = item?.latitude;
                        const lon = item?.longitude;
                        if (typeof lat === 'number' && typeof lon === 'number') {
                            return (
                                <Marker
                                    key={index}
                                    coordinate={{ latitude: lat, longitude: lon }}
                                    title={item?.user?.name || 'Người dùng'}
                                    description={`Vị trí của ${item?.user?.name || 'người dùng'}`}
                                />
                            );
                        }
                        return null;
                    })}
                </MapView>
            </View>
            <LoadingFullScreen loading={loading} />
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
