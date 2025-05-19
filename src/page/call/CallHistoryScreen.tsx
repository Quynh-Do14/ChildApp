import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Endpoint } from '../../core/common/apiLink';

interface CallHistoryItem {
  id: number;
  callerId: number;
  receiverId: number;
  callerName: string;
  receiverName: string;
  channelName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
}

const CallHistoryScreen = () => {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      
      if (!userToken) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(Endpoint.Call.History, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      const data = await response.json();
      setCallHistory(data);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const renderCallItem = ({ item }: { item: CallHistoryItem }) => {
    const isOutgoing = item.callerId === 1; // Thay bằng userId thực
    
    return (
      <TouchableOpacity style={styles.callItem}>
        <View style={styles.iconContainer}>
          <Icon 
            name={isOutgoing ? 'call-made' : 'call-received'} 
            size={24} 
            color={item.status === 'COMPLETED' ? '#4CAF50' : '#FF5252'} 
          />
        </View>
        
        <View style={styles.callInfo}>
          <Text style={styles.name}>
            {isOutgoing ? item.receiverName : item.callerName}
          </Text>
          <Text style={styles.timeStamp}>
            {/* {formatDistanceToNow(new Date(item.startTime), { addSuffix: true, locale: vi })} */}
          </Text>
        </View>
        
        <View style={styles.callDetails}>
          {item.status === 'COMPLETED' ? (
            <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
          ) : (
            <Text style={styles.missedCall}>Cuộc gọi nhỡ</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lịch Sử Cuộc Gọi</Text>
      
      {loading ? (
        <Text style={styles.loading}>Đang tải...</Text>
      ) : callHistory.length > 0 ? (
        <FlatList
          data={callHistory}
          renderItem={renderCallItem}
          keyExtractor={item => item.id.toString()}
        />
      ) : (
        <Text style={styles.noCallsText}>Chưa có cuộc gọi nào</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  callItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  callInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeStamp: {
    color: '#757575',
    fontSize: 14,
    marginTop: 2,
  },
  callDetails: {
    marginLeft: 8,
  },
  duration: {
    color: '#4CAF50',
  },
  missedCall: {
    color: '#FF5252',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    color: '#757575',
  },
  noCallsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#757575',
  }
});

export default CallHistoryScreen;