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
    Alert,
    Image,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../infrastructure/common/layouts/layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import conversationService from '../../infrastructure/repositories/conversation/conversation.service';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CheckPermission from '../../infrastructure/utils/CheckPermission';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalFolderPicker from './modal';
import { useRecoilValue } from 'recoil';
import { FolderState } from '../../core/atoms/folder/folderState';

const ChatSlugScreen = () => {
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<any>();

    const [chatLog, setChatLog] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [idMessage, setIdMessage] = useState<string>("");

    const [token, setToken] = useState<string>('');
    const [imageUri, setImageUri] = useState(null);
    const folderData = useRecoilValue(FolderState).data

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


    console.log("folderData", folderData);

    const GetMyChatLogAsync = async () => {
        if (chatId) {
            try {
                const response = await conversationService.GetChatLogById(
                    String(chatId),
                    setLoading,
                );
                if (response) {
                    setChatLog(response);
                    // scrollToBottom();
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

    useEffect(() => {
        let isMounted = true; // Tránh memory leak khi component unmount

        const fetchDataWithDelay = async () => {
            await GetMyChatLogAsync();
            if (isMounted) {
                setTimeout(fetchDataWithDelay, 5000); // Đợi 5s sau khi API hoàn thành
            }
        };

        fetchDataWithDelay();

        return () => {
            isMounted = false;
        };
    }, []);

    const onGoBack = () => {
        navigation.goBack();
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            await conversationService.SendMessage(
                {
                    receiverId: receiverId,
                    message: inputText,
                    file: imageUri
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

    const sendImageMessage = async (uri: string) => {
        console.log("uri", uri);

        const formData = new FormData();
        formData.append('receiverId', receiverId.toString());
        formData.append('message', ''); // nếu có chú thích
        formData.append('file', {
            uri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        try {
            await conversationService.SendMessage(
                formData,
                setLoading,
            );

            await GetMyChatLogAsync();

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error(error);
        }
    };


    const onOpenModal = (item: any) => {
        setModalVisible(true)
        setIdMessage(item.id)
    }

    const renderItem = ({ item }: any) => {
        const isSender = item.sender == null ? false : true;
        return (
            <View
                style={[
                    styles.messageContainer,
                    isSender ? styles.userMessage : styles.botMessage,
                ]}
            >
                {
                    item.type == "IMG"
                        ?
                        <Image
                            source={{ uri: `http://103.216.117.244:9999/files/preview/${item.message}` }}
                            style={{ width: 200, height: 400 }}
                            resizeMode="cover"
                        />
                        :
                        (
                            item.aiChat
                                ?
                                <TouchableOpacity onPress={() => onOpenModal(item)}>
                                    <Text style={styles.messageText}>{item.message}
                                        <MaterialCommunityIcons
                                            name="bookmark-outline"
                                            size={20}
                                            color="#fff"
                                            style={{ margin: 0 }}
                                        />
                                    </Text>
                                </TouchableOpacity>
                                :
                                <Text style={styles.messageText}>{item.message}</Text>
                        )
                }
            </View >
        );
    };

    const requestPhotoPermission = async () => {
        CheckPermission.requestPhotoLibraryPermission(
            async () => pickImage(),
            permission => {
                Alert.alert(
                    'Quyền bị từ chối',
                    'Vui lòng vào Cài đặt để cấp quyền Camera và Thư viện ảnh.',
                );
                return false;
            },
        );
    };

    const pickImage = async () => {
        launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
            if (!response.didCancel && response.assets) {
                setImageUri(response.assets[0].uri);
                sendImageMessage(response.assets[0].uri);
            }
        });
    };
    console.log("chatLog", chatLog);

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
                            <TouchableOpacity onPress={requestPhotoPermission} style={styles.sendButton}>
                                <Ionicons
                                    name={"camera-outline"}
                                    size={20}
                                    color={"#FFF"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                                <Text style={styles.sendText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
                <ModalFolderPicker
                    visible={modalVisible}
                    folders={folderData}
                    onClose={() => setModalVisible(false)}
                    idMessage={idMessage}
                    setLoading={setLoading}
                />
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
