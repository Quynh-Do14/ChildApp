import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MainLayout from '../../infrastructure/common/layouts/layout';

export default function MapScreen() {
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
                        coordinate={{ latitude: 21.0285, longitude: 105.8542 }}
                        title="Điểm A"
                        description="Đây là điểm đầu tiên"
                    />

                    {/* Điểm thứ hai */}
                    <Marker
                        coordinate={{ latitude: 21.0201, longitude: 105.8105 }}
                        title="Điểm B"
                        description="Đây là điểm thứ hai"
                    />
                </MapView>
            </View>
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
