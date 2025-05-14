import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstanceFile = axios.create({
    // baseURL: process.env.REACT_APP_BASE_URL,
    baseURL: "http://192.168.1.4:8080",
    responseType: 'arraybuffer',
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

axiosInstanceFile.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token").then(result => {
            return result
        });

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstanceFile.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        return Promise.reject(error);
    }
);


export default axiosInstanceFile;
