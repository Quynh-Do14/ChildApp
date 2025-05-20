import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Keyboard,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../infrastructure/common/layouts/layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import conversationService from '../../infrastructure/repositories/conversation/conversation.service';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatSlugScreen = () => {
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<any>();

    const [chatLog, setChatLog] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [token, setToken] = useState<string>('');

    const route = useRoute();
    const { chatId, receiverId, name } = route.params;
    // console.log("chatId, receiverId, name", chatId, receiverId, name);

    const getTokenStoraged = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    };

    useEffect(() => {
        getTokenStoraged();
    }, []);

    const flatListRef = useRef<FlatList>(null);
    const stompClientRef = useRef<Client | null>(null);



    const GetMyChatLogAsync = async () => {
        if (chatId) {
            try {
                const response = await conversationService.GetChatLogById(
                    String(chatId),
                    setLoading,
                );
                if (response) {
                    setChatLog(response);
                    scrollToBottom();
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // useEffect(() => {
    //     const baseURL = 'http://192.168.100.79:8080';
    //     const wsUrl = `${baseURL.replace('http', 'ws')}/ws?token=${token}`;

    //     const client = new Client({
    //         brokerURL: wsUrl,
    //         connectHeaders: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //         debug: (str) => {
    //             console.log('🟣 STOMP Debug:', str);
    //         },
    //         reconnectDelay: 5000,
    //         onConnect: (frame) => {
    //             console.log('✅ STOMP connected:', frame);

    //             // Lắng nghe thông điệp riêng
    //             client.subscribe('/user/queue/chat', (message) => {
    //                 console.log('📩 Nhận được message:', message.body);
    //                 // Gọi lại các hàm cần reload
    //                 GetMyChatLogAsync();
    //             });
    //         },
    //         onStompError: (frame) => {
    //             console.error('❌ STOMP error:', frame.headers['message']);
    //         },
    //     });

    //     client.activate();
    //     stompClientRef.current = client;

    //     return () => {
    //         client.deactivate();
    //     };
    // }, []);

    useEffect(() => {
        GetMyChatLogAsync().then(() => { });
    }, [])

    const onGoBack = () => {
        navigation.goBack();
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            await conversationService.SendMessage(
                {
                    receiverId: receiverId,
                    message: inputText
                },
                setLoading,
            );

            setInputText('');

            await GetMyChatLogAsync(); // chờ tin nhắn mới render

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: any) => {
        const isSender = item.sender == null ? false : true;
        return (
            <View
                style={[
                    styles.messageContainer,
                    isSender ? styles.userMessage : styles.botMessage,
                ]}
            >
                <Text style={styles.messageText}>{item.message}</Text>
            </View>
        );
    };

    return (
        <MainLayout
            title={name}
            isBackButton={true}
            onGoBack={onGoBack}
            noSpaceEnd={true}
        >
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={chatLog}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    contentContainerStyle={styles.chatContainer}
                    onContentSizeChange={scrollToBottom}
                />
                <KeyboardAvoidingView behavior="padding">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Nhập tin nhắn..."
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                                <Text style={styles.sendText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </View>
        </MainLayout>
    );
};

export default ChatSlugScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    messageContainer: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4f3f97',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#7059d2',
    },
    messageText: {
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderColor: '#ddd',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#4f3f97',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#4f3f97',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    sendText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
