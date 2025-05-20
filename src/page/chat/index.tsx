import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout'
import conversationService from '../../infrastructure/repositories/conversation/conversation.service';
import userService from '../../infrastructure/repositories/user/user.service';

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
    const [tab, setTab] = useState<number>(1);

    const [myConversation, setMyConversation] = useState<any[]>([])
    const [myChildren, setMyChildren] = useState<any[]>([])

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

    const GetMyChldrenAsync = async () => {
        try {
            await userService.getChild(
                setLoading,
            ).then((response) => {
                if (response) {
                    setMyChildren(response)
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        GetMyChldrenAsync().then(() => { });
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

    const renderItemUser = ({ item }: any) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => {
                // Điều hướng sang màn ChatBotScreen (hoặc ChatDetailScreen)
                navigation.navigate('ChatSlugScreen',
                    {
                        receiverId: item.id,
                        name: item.name
                    });
            }}
        >
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );
    console.log("myChildren", myChildren);
    console.log("myConversation", myConversation);

    return (
        <MainLayout title={'Trò chuyện'}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setTab(1)}>
                        <Text style={styles.headerText}>Danh sách trò chuyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab(2)}>
                        <Text style={styles.headerText}>Danh bạ</Text>
                    </TouchableOpacity>
                </View>
                {
                    tab == 1
                        ?
                        <FlatList
                            data={myConversation}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                        />
                        :
                        <FlatList
                            data={myChildren}
                            renderItem={renderItemUser}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                        />
                }



            </View>
        </MainLayout>

    );
};

export default ChatListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        gap: 12,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4f3f97',
    },
    listContainer: {
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingVertical: 12,
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