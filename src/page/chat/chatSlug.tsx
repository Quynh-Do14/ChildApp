import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout'
import { useNavigation } from '@react-navigation/native';

export const fakeMessages = [
    {
        id: '1',
        sender: 'bot',
        text: 'Xin chào! Tớ có thể giúp gì cho bạn hôm nay?',
        timestamp: '2025-05-14T10:00:00',
    },
    {
        id: '2',
        sender: 'user',
        text: 'Tớ muốn biết hôm nay nên học gì?',
        timestamp: '2025-05-14T10:01:30',
    },
    {
        id: '3',
        sender: 'bot',
        text: 'Bạn nên ôn lại Toán và học thêm 1 bài Tiếng Anh nhé!',
        timestamp: '2025-05-14T10:01:50',
    },
];


const ChatSlugScreen = () => {
    const [messages, setMessages] = useState(fakeMessages);
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<any>();

    const onGoBack = () => {
        navigation.goBack();
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newUserMessage = {
            id: (messages.length + 1).toString(),
            sender: 'user',
            text: inputText,
            timestamp: new Date().toISOString(),
        };

        // Fake response bot
        const botReply = {
            id: (messages.length + 2).toString(),
            sender: 'bot',
            text: 'Tớ đã ghi nhận, bạn cần gì thêm không?',
            timestamp: new Date().toISOString(),
        };

        setMessages([...messages, newUserMessage, botReply]);
        setInputText('');
    };

    const renderItem = ({ item }: any) => {
        const isUser = item.sender === 'user';
        return (
            <View
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessage : styles.botMessage,
                ]}
            >
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <MainLayout
            title={'Trò chuyện với Bot'}
            isBackButton={true}
            onGoBack={onGoBack}
            noSpaceEnd={true}
        >
            <View style={styles.container}>
                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.chatContainer}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Nhập tin nhắn..."
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <Text style={styles.sendText}>Gửi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </MainLayout>

    )
}

export default ChatSlugScreen

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