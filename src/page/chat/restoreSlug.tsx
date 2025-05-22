import {
    View,
    FlatList,
    StyleSheet,
    Image,
    Text,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../infrastructure/common/layouts/layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import folderService from '../../infrastructure/repositories/folder/folder.service';
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet';
import { TextInput } from 'react-native-gesture-handler';

const RestoreSlugScreen = () => {
    const navigation = useNavigation<any>();
    const [inputText, setInputText] = useState('');

    const [chatLog, setChatLog] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [token, setToken] = useState<string>('');

    const route = useRoute();
    const { id, name } = route.params;
    console.log("name", id, name);

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

    const GetMyChatLogAsync = async () => {
        try {
            const response = await folderService.getFolderbyId(
                String(id),
                inputText,
                setLoading,
            );
            if (response) {
                setChatLog(response);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        GetMyChatLogAsync()
    }, [inputText])

    const onGoBack = () => {
        navigation.goBack();
    }

    const renderItem = ({ item }: any) => {
        return (
            <View
                style={[
                    styles.messageContainer,
                    styles.botMessage,
                ]}
            >
                <Text style={styles.messageText}>{item.message}</Text>
            </View >
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
                />
                <KeyboardAvoidingView behavior="padding">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Tìm kiếm tin nhắn..."
                                returnKeyType="send"
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </View>
        </MainLayout>
    );
};

export default RestoreSlugScreen;

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
