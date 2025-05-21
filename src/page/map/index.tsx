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
    const location = useRecoilValue(LocationState).data
    const [myLocation, setMyLocation] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const isFocused = useIsFocused();

    const GetMyLocationAsync = async () => {
        try {
            await userService.getLocation(
                setLoading,
            ).then((response) => {
                if (response) {
                    setMyLocation(response)
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        GetMyLocationAsync().then(() => { });
    }, [])
    useEffect(() => {
        if (isFocused) {
            GetMyLocationAsync();
        }
    }, [isFocused]);
    return (
        <MainLayout title={'Bản đồ'}>
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 21.0278,
                        longitude: 105.8342,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    <Marker
                        coordinate={{ latitude: location?.coords?.latitude, longitude: location?.coords?.longitude }}
                        title="Vị trí của bạn"
                        description="Đây là vị trí của bạn"
                    />
                    {
                        myLocation.map((item, index) => {
                            return (
                                <Marker
                                    key={index}
                                    coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                                    title={item.user?.name}
                                    description={`Vị trí của ${item.user?.name}`}
                                />
                            )
                        })
                    }

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
