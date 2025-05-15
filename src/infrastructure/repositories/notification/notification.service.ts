import { Alert, Platform } from "react-native";
import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class NotificationService {
  /**
   * Đăng ký token thiết bị với backend
   * @param token FCM token của thiết bị
   * @param userId ID của người dùng
   * @param setLoading Function để hiển thị/ẩn loading indicator (nếu có)
   */
  async registerDeviceToken(token: string, userId: number) {
    try {      
      console.log('Registering device token with backend:', { token, userId });
      
      return await RequestService.post(
        `${Endpoint.Notification?.RegisterToken || '/device-tokens/register'}`,
        { 
          token,
          userId,
          deviceType: Platform.OS.toUpperCase() // 'ANDROID' hoặc 'IOS'
        }
      ).then(response => {
        console.log('Device token registered successfully:', response.data);
        return response.data;
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
      Alert.alert(
        'Đăng ký thiết bị thất bại',
        'Không thể đăng ký thiết bị để nhận thông báo. Vui lòng thử lại sau.'
      );
      return null;
    } finally {
    }
  }

  /**
   * Lấy danh sách thông báo của người dùng
   */
  async getNotifications(userId: number) {
    try {
      
      return await RequestService.get(
        `${Endpoint.Notification?.GetAll || '/api/notifications/user'}/${userId}`
      ).then(response => {
        return response.data;
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải thông báo. Vui lòng thử lại sau.'
      );
      return [];
    } finally {
        console.log('Finished fetching notifications');
    }
  }
}

export default new NotificationService();