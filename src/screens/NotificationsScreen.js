import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../infrastructure/repositories/notification/notification.service';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tải danh sách thông báo
  const loadNotifications = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      setLoading(true);
      const data = await notificationService.getNotifications(userId);
      setNotifications(data || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Render từng item thông báo
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.notificationItem} 
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  // Xử lý khi người dùng bấm vào thông báo
  const handleNotificationPress = (notification) => {
    // Điều hướng dựa vào dữ liệu thông báo
    if (notification.data && notification.data.screen) {
      navigation.navigate(notification.data.screen, notification.data.params);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          refreshing={loading}
          onRefresh={loadNotifications}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  }
});

export default NotificationsScreen;