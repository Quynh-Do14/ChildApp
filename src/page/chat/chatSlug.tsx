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
    Image,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../infrastructure/common/layouts/layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import conversationService from '../../infrastructure/repositories/conversation/conversation.service';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import SockJS from 'sockjs-client';

// Định nghĩa BASE_URL
const BASE_URL = 'https://ebeb-1-54-214-41.ngrok-free.app';

const ChatSlugScreen = () => {
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<any>();
    const [chatLog, setChatLog] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [username, setUsername] = useState<string>('');

    const route = useRoute<any>();
    const { chatId, receiverId, name } = route.params;

    const flatListRef = useRef<FlatList>(null);
    const stompClientRef = useRef<Client | null>(null);

    const getStoredData = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUsername) {
            setUsername(storedUsername);
        }
    };

    useEffect(() => {
        getStoredData();
    }, []);

    const scrollToBottom = React.useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const GetMyChatLogAsync = React.useCallback(async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }, [chatId, scrollToBottom]);

    // Khởi tạo WebSocket sau khi có token
    useEffect(() => {
        if (!token) return;

        const wsUrl = `${BASE_URL}/ws?token=${token}`;

        // Sử dụng SockJS thay vì WebSocket trực tiếp
        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log('🟣 STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: (frame) => {
                console.log('✅ STOMP connected:', frame);
                setConnected(true);

                // Đăng ký nhận tin nhắn cá nhân
                if (username) {
                    client.subscribe(`/user/${username}/queue/chat`, (message) => {
                        console.log('📩 Nhận được tin nhắn:', message.body);
                        
                        try {
                            const messageData = JSON.parse(message.body);
                            
                            // Chỉ cập nhật nếu tin nhắn thuộc cuộc trò chuyện này
                            if (messageData.conversationId === chatId || 
                                (messageData.data && messageData.data.conversationId === chatId)) {
                                GetMyChatLogAsync();
                            }
                        } catch (error) {
                            console.error('Lỗi xử lý tin nhắn WebSocket:', error);
                        }
                    });
                }
            },
            onStompError: (frame) => {
                console.error('❌ STOMP error:', frame.headers['message']);
                setConnected(false);
            },
            onDisconnect: () => {
                console.log('❌ STOMP disconnected');
                setConnected(false);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [token, username, chatId, GetMyChatLogAsync]);

    useEffect(() => {
        GetMyChatLogAsync();
    }, [GetMyChatLogAsync]);

    const onGoBack = () => {
        navigation.goBack();
    };

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibrary({
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 1200,
            maxWidth: 1200,
        });

        if (!result.didCancel && result.assets && result.assets[0]) {
            setSelectedImage({
                uri: result.assets[0].uri,
                type: result.assets[0].type || 'image/jpeg',
                name: result.assets[0].fileName || 'image.jpg',
            });
        }
    };

    const handleSend = async () => {
        if ((!inputText.trim() && !selectedImage) || loading) return;

        try {
            setLoading(true);
            
            // Tạo FormData để gửi message
            const formData = new FormData();
            formData.append('receiverId', receiverId);
            
            if (inputText.trim()) {
                formData.append('message', inputText.trim());
            }
            
            if (selectedImage) {
                formData.append('file', selectedImage);
            }
            
            // Gọi API gửi tin nhắn
            await conversationService.SendMessage(
                formData,
                setLoading,
            );

            // Reset input
            setInputText('');
            setSelectedImage(null);

            // Cập nhật lại danh sách tin nhắn
            await GetMyChatLogAsync();
            
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: any) => {
        // Kiểm tra nếu người gửi là user hiện tại
        const isMine = item.sender && username && item.sender.username === username;
        
        return (
            <View
                style={[
                    styles.messageContainer,
                    isMine ? styles.userMessage : styles.botMessage,
                ]}
            >
                {item.type === 'IMG' ? (
                    <Image
                        source={{ uri: `${BASE_URL}/files/${item.message}` }}
                        style={styles.messageImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={styles.messageText}>{item.message}</Text>
                )}
                <Text style={styles.messageTime}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
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
                {/* Thông báo trạng thái kết nối WebSocket */}
                {!connected && (
                    <View style={styles.connectionStatus}>
                        <Text style={styles.connectionText}>Đang kết nối lại...</Text>
                    </View>
                )}
                
                <FlatList
                    ref={flatListRef}
                    data={chatLog}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    contentContainerStyle={styles.chatContainer}
                    onContentSizeChange={scrollToBottom}
                />
                
                {selectedImage && (
                    <View style={styles.selectedImageContainer}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                        <TouchableOpacity
                            style={styles.cancelImage}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Text style={styles.cancelImageText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                <KeyboardAvoidingView behavior="padding">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.inputContainer}>
                            <TouchableOpacity onPress={handleImagePicker} style={styles.attachButton}>
                                <Text style={styles.attachButtonText}>🖼️</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Nhập tin nhắn..."
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                            <TouchableOpacity 
                                onPress={handleSend} 
                                style={[styles.sendButton, 
                                    (!inputText.trim() && !selectedImage) ? styles.sendButtonDisabled : {}
                                ]}
                                disabled={(!inputText.trim() && !selectedImage) || loading}
                            >
                                <Text style={styles.sendText}>
                                    {loading ? '...' : 'Gửi'}
                                </Text>
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
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    messageTime: {
        fontSize: 10,
        color: '#ebebeb',
        alignSelf: 'flex-end',
        marginTop: 4,
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
    sendButtonDisabled: {
        backgroundColor: '#9d92c9',
    },
    sendText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    attachButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    attachButtonText: {
        fontSize: 20,
    },
    selectedImageContainer: {
        position: 'relative',
        margin: 10,
        alignSelf: 'flex-start',
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    cancelImage: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelImageText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    connectionStatus: {
        backgroundColor: '#ffcc00',
        padding: 5,
        alignItems: 'center',
    },
    connectionText: {
        color: '#333',
        fontWeight: 'bold',
    },
});