import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import folderService from '../../infrastructure/repositories/folder/folder.service';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';

type Props = {
    visible: boolean;
    folders: any[];
    onClose: () => void;
    idMessage: string
    setLoading: Function
};

const ModalFolderPicker = ({
    visible,
    folders,
    onClose,
    idMessage,
    setLoading }: Props
) => {
    const [idSelected, setIdSelected] = useState<string>("");

    const onSaveAsync = async () => {
        console.log("idMessage", idMessage);
        console.log("idSelected", idSelected);

        try {
            await folderService.saveFolder(
                {
                    "chatlogId": idMessage,
                    "folderId": idSelected
                },
                setLoading).then((res) => {
                    if (res) {
                        onClose();
                    }
                })
        } catch (error) {
            console.error('Inspector operation error:', error);
        }
    };
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Chọn thư mục để lưu</Text>
                    <FlatList
                        data={folders}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => {
                            const isActive = item.id === idSelected
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.folderItem,
                                        isActive && styles.activeFolderItem,
                                    ]}
                                    onPress={() => setIdSelected(item.id)}
                                >
                                    <Text style={[styles.folderText, isActive && styles.activeFolderText]}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )
                        }}
                    />
                    <ButtonCommon
                        title={'Lưu'}
                        onPress={onSaveAsync}
                    />
                    <ButtonCommon
                        title={'Đóng'}
                        onPress={onClose}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default ModalFolderPicker;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    folderItem: {
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 8,
        borderRadius: 8
    },
    folderText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 8,
        alignItems: 'center',
    },
    activeFolderItem: {
        backgroundColor: '#007AFF',
    },
    activeFolderText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
