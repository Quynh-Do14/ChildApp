import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList } from 'react-native-gesture-handler';
import folderService from '../../infrastructure/repositories/folder/folder.service';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import MainLayout from '../../infrastructure/common/layouts/layout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRecoilValue } from 'recoil';
import { FolderState } from '../../core/atoms/folder/folderState';

const RestoreScreen = () => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [_data, _setData] = useState<any>({});
    const dataRequest = _data;
    const setDataRequest = (data: any) => {
        Object.assign(dataRequest, { ...data });
        _setData({ ...dataRequest });
    };

    const isValidData = () => {
        let allRequestOK = true;
        setValidate({ ...validate });

        Object.values(validate).forEach((it: any) => {
            if (it.isError === true) {
                allRequestOK = false;
            }
        });

        return allRequestOK;
    };

    const [validate, setValidate] = useState<Record<string, any>>({});
    const [submittedTime, setSubmittedTime] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [listFolder, setListFolder] = useState<any[]>([]);
    const isFocused = useIsFocused();
    // Hooks and Recoil state
    const navigation = useNavigation<any>();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['90%'], []);
    const fetchFolders = async () => {
        try {
            const response = await folderService.getFolder(
                setLoading
            );
            if (response) {
                setListFolder(response);
            }
        } catch (error) {
            console.error('Fetch inspectors error:', error);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            setEditingId(null);
        }
    }, []);

    const openSheet = (inspector?: any) => {
        console.log("inspector", inspector);

        if (inspector) {
            setEditingId(inspector.id);
            setDataRequest({
                "name": inspector.name,
            })
        }
        bottomSheetRef.current?.expand();
    };

    const closeSheet = () => {
        setEditingId(null);
        setDataRequest({
            "name": "",
        })
        bottomSheetRef.current?.close();
    }

    // Inspector CRUD operations
    const handleAddOrUpdateInspector = async () => {
        if (!isValidData()) return;

        try {
            const inspectorData = {
                "name": dataRequest.name,
            };

            const response = editingId
                ? await folderService.updateFolder(editingId, inspectorData, setLoading)
                : await folderService.createFolder(inspectorData, setLoading);

            if (response) {
                await fetchFolders();
                closeSheet();
            }
        } catch (error) {
            Alert.alert('Lỗi', editingId ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
            console.error('Inspector operation error:', error);
        }
    };

    const handleDeleteInspector = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá thư mục này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        const response = await folderService.deleteFolder(id, setLoading);
                        if (response) {
                            await fetchFolders();
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xóa thư mục thất bại');
                        console.error('Delete inspector error:', error);
                    }
                },
            },
        ]);
    };



    const renderItemUser = ({ item }: any) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => {
                // Điều hướng sang màn ChatBotScreen (hoặc ChatDetailScreen)
                navigation.navigate('RestoreSlugScreen',
                    {
                        id: item.id,
                        name: item.name,
                    });
            }} >
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item?.name?.charAt(0)}</Text>
            </View>
            <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openSheet(item)} style={styles.actionButton}>
                    <Icon name="pencil" size={20} color="#4f3f97" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteInspector(item.id)}
                    style={styles.actionButton}
                >
                    <Icon name="delete" size={20} color="#ff4d4f" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (


        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <MainLayout title={'Tin nhắn lưu trữ'}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Tin nhắn lưu trữ</Text>
                        <TouchableOpacity onPress={() => openSheet()}>
                            <Icon name={'plus-circle'} size={22} color="#4f3f97" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={listFolder}
                        renderItem={renderItemUser}
                        keyExtractor={(item) => item.id}
                    />
                </View>
                <LoadingFullScreen loading={loading} />
            </MainLayout>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                enablePanDownToClose={true}
                style={styles.bottomSheet}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                onClose={closeSheet}
            >
                <BottomSheetView style={styles.bottomSheetContent}>
                    <Text style={styles.sheetTitle}>
                        {editingId ? 'Cập nhật thư mục' : 'Thêm thư mục mới'}
                    </Text>

                    <InputTextCommon
                        label={"Tên"}
                        attribute={"name"}
                        dataAttribute={dataRequest.name}
                        isRequired={true}
                        setData={setDataRequest}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <ButtonCommon
                        title={editingId ? 'Cập nhật' : 'Thêm mới'}
                        onPress={handleAddOrUpdateInspector}
                    />

                    <ButtonCommon
                        title={'Đóng'}
                        onPress={closeSheet}
                    />
                </BottomSheetView>
            </BottomSheet>
        </KeyboardAvoidingView>
    )
}

export default RestoreScreen

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
    bottomSheet: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d3d3d3',
        shadowColor: '#000',
    },
    bottomSheetContent: {
        padding: 16,
        gap: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4f3f97',
        alignSelf: 'flex-start',
    },
    deleteText: {
        color: '#ff4d4f',
        fontSize: 14,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
});