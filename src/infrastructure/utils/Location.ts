import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

async function requestLocationPermission() {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Yêu cầu quyền truy cập vị trí',
                    message: 'Ứng dụng cần truy cập vị trí của bạn',
                    buttonNeutral: 'Hỏi sau',
                    buttonNegative: 'Hủy',
                    buttonPositive: 'Đồng ý',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
}

function getCurrentLocation() {
    requestLocationPermission().then((result) => {
        if (result) {
            Geolocation.getCurrentPosition(
                (position) => {
                    console.log(position);
                    // position.coords.latitude - vĩ độ
                    // position.coords.longitude - kinh độ
                    // position.coords.accuracy - độ chính xác (mét)
                    // position.coords.speed - tốc độ (m/s)
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
            );
        }
    });
}

// Theo dõi vị trí liên tục
const watchId = Geolocation.watchPosition(
    (position) => {
        console.log(position);
    },
    (error) => {
        console.log(error);
    },
    { enableHighAccuracy: true, distanceFilter: 10 }
);

// Dừng theo dõi khi không cần thiết
// Geolocation.clearWatch(watchId);