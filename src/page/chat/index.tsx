import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout'
import conversationService from '../../infrastructure/repositories/conversation/conversation.service';
import userService from '../../infrastructure/repositories/user/user.service';
import { useRecoilValue } from 'recoil';
import { ProfileState } from '../../core/atoms/profile/profileState';
import { convertTimeOnly } from '../../infrastructure/helper/helper';
import { useIsFocused } from '@react-navigation/native';

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
    const [parent, setParent] = useState<any>({})

    const [myChildrenNew, setMyChildrenNew] = useState<any[]>([])
    const dataProfile = useRecoilValue(ProfileState).data;
    const isFocused = useIsFocused();

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
        if (dataProfile?.role === 'parent') {
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
        } else {
            try {
                await userService.getParent(
                    setLoading,
                ).then((response) => {
                    if (response) {
                        setParent(response)
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    useEffect(() => {
        GetMyChldrenAsync().then(() => { });
        GetMyConversationAsync().then(() => { });
    }, [])

    useEffect(() => {
        if (isFocused) {
            GetMyChldrenAsync().then(() => { });
            GetMyConversationAsync().then(() => { });
        }
    }, [isFocused]);

    useEffect(() => {
        let isMounted = true; // Tránh memory leak khi component unmount

        const fetchDataWithDelay = async () => {
            await GetMyConversationAsync();
            if (isMounted) {
                setTimeout(fetchDataWithDelay, 5000); // Đợi 5s sau khi API hoàn thành
            }
        };

        fetchDataWithDelay();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        // let newArr: React.SetStateAction<any[]> = []
        // if (dataProfile?.role === 'parent') {
        //     if (myChildren) {
        //         for (let i = 0; i < myChildren.length; i++) {
        //             for (let j = 0; j < myConversation.length; j++) {
        //                 if (myChildren[i].id == myConversation[j].wantToSendUser.id) {
        //                     newArr.push({
        //                         ...myChildren[i],
        //                         chatId: myConversation[j].id
        //                     })
        //                 }

        //             }
        //         }
        //         setMyChildrenNew(newArr)
        //     }
        // }
        // else {
        //     myConversation.map((item) => {
        //         if (item.wantToSendUser.id == parent.id) {
        //             newArr.push({
        //                 ...parent,
        //                 chatId: item.id
        //             })
        //         }
        //     });
        //     // console.log("newArr", newArr);
        //     setMyChildrenNew(newArr)
        // }
        if (dataProfile?.role === 'parent') {
            setMyChildrenNew(myChildren)
        }
        else {
            const newArr = []
            newArr.push(parent)
            setMyChildrenNew(newArr);
        }
    }, [myChildren, myConversation])

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
                {convertTimeOnly(item.lastMessageTime)}
                {/* {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} */}
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
                        childrenId: item.id,
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
    return (
        <MainLayout title={'Trò chuyện'}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setTab(1)}>
                        <Text style={[
                            styles.headerText,
                            tab == 1 && styles.active
                        ]}>Trò chuyện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab(2)}>
                        <Text style={[
                            styles.headerText,
                            tab == 2 && styles.active
                        ]}>Danh bạ</Text>
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
                        tab == 2
                        &&
                        <FlatList
                            data={myChildrenNew}
                            renderItem={renderItemUser}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                        />
                }
            </View>
            {/* <LoadingFullScreen loading={loading} /> */}
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
        justifyContent: "flex-start",
        alignItems: "center"
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4f3f97',
        padding: 6
    },
    active: {
        borderRadius: 8,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: "#4f3f97",
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