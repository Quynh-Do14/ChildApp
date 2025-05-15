import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout'
import conversationService from '../../infrastructure/repositories/conversation/conversation.service';

export const fakeConversations = [
    {
        id: '1',
        name: 'Chat với Bot Học Tập',
        lastMessage: 'Bạn nên học thêm Toán hôm nay.',
        timestamp: '2025-05-14T09:30:00',
    },
    {
        id: '2',
        name: 'Chat với Phụ huynh',
        lastMessage: 'Nhớ làm bài tập nhé con!',
        timestamp: '2025-05-14T08:15:00',
    },
    {
        id: '3',
        name: 'Trợ lý AI',
        lastMessage: 'Tôi có thể giúp gì cho bạn hôm nay?',
        timestamp: '2025-05-13T20:00:00',
    },
]

const ChatListScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [myConversation, setMyConversation] = useState<any[]>([])
    const GetMyConversationAsync = async () => {
        try {
            await conversationService.getMyConversation(
                setLoading,
            ).then((response) => {
                if (response) {
                    setMyConversation(response)
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        GetMyConversationAsync().then(() => { });
    }, [])
    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => {
                // Điều hướng sang màn ChatBotScreen (hoặc ChatDetailScreen)
                navigation.navigate('ChatSlugScreen',
                    {
                        chatId: item.id,
                        receiverId: item.wantToSendUser.id,
                        name: item.wantToSendUser.name
                    });
            }}
        >
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.wantToSendUser?.name.charAt(0)}</Text>
            </View>
            <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.wantToSendUser?.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
            <Text style={styles.time}>
                {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </TouchableOpacity>
    );

    return (
        <MainLayout title={'Trò chuyện'}>
            <View style={styles.container}>
                <Text style={styles.header}>Danh sách trò chuyện</Text>
                <FlatList
                    data={myConversation}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </MainLayout>

    )
}

export default ChatListScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 12,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        marginBottom: 10,
        color: '#4f3f97',
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    avatarPlaceholder: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#4f3f97',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    chatInfo: {
        flex: 1,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
});