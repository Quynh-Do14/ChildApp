import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import MainLayout from '../../infrastructure/common/layouts/layout';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import userService from '../../infrastructure/repositories/user/user.service';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import { useIsFocused } from '@react-navigation/native';

type Child = {
    id: string;
    name: string;
    phoneNumber: string;
    accessCode: string;
    batteryLevel: string
};

type ChildFormData = {
    name: string;
    phoneNumber: string;
};

const ChildrenScreen = () => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [_data, _setData] = useState<any>({});

    const dataRequest = _data;
    const setDataRequest = (data: any) => {
        Object.assign(_data, { ...data });
        _setData({ ..._data });
    };
    const [validate, setValidate] = useState<Record<string, any>>({});
    const [submittedTime, setSubmittedTime] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [childrenList, setChildrenList] = useState<Child[]>([]);
    const isFocused = useIsFocused();

    // Refs and constants
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['90%'], []);

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

    // Data fetching
    const fetchChildren = async (loadingState: boolean = true) => {
        try {
            const response = await userService.getChild(
                loadingState ? setLoading : setRefreshing
            );
            if (response) {
                setChildrenList(response);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách trẻ');
            console.error('Fetch children error:', error);
        }
    };

    // Effects
    useEffect(() => {
        fetchChildren();
    }, []);

    const handleRefresh = () => {
        fetchChildren(false);
    };



    // Bottom sheet handlers
    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            setEditingId(null);
            setDataRequest({
                name: '',
                phoneNumber: '',
            });
        }
    }, []);

    const openSheet = (child?: Child) => {
        if (child) {
            setDataRequest({
                name: child.name,
                phoneNumber: child.phoneNumber,
            });
            setEditingId(child.id);
        }
        bottomSheetRef.current?.expand();
    };

    const closeSheet = () => bottomSheetRef.current?.close();

    // Child CRUD operations
    const handleAddOrUpdateChild = async () => {
        if (!isValidData()) return;

        try {
            const childData = {
                name: dataRequest.name,
                phoneNumber: dataRequest.phoneNumber,
            };

            const response = editingId
                ? await userService.updateUser(editingId, childData, setLoading)
                : await userService.createUser(childData, setLoading);

            if (response) {
                await fetchChildren();
                closeSheet();
            }
        } catch (error) {
            Alert.alert('Lỗi', editingId ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
            console.error('Child operation error:', error);
        }
    };

    const handleDeleteChild = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá trẻ này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        const response = await userService.deleteUser(id, setLoading);
                        if (response) {
                            await fetchChildren();
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xóa trẻ thất bại');
                        console.error('Delete child error:', error);
                    }
                },
            },
        ]);
    };
    useEffect(() => {
        if (isFocused) {
            fetchChildren();
        }
    }, [isFocused]);
    // Render helpers
    const renderChildItem = ({ item }: { item: Child }) => (
        <View style={styles.childItem}>
            <View style={styles.childInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>
                    Mã: {item.accessCode} | SĐT: {item.phoneNumber}
                </Text>
                <Text style={styles.details}>
                    Mức pin: {item.batteryLevel} %
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openSheet(item)} style={styles.actionButton}>
                    <Icon name="pencil" size={20} color="#4f3f97" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteChild(item.id)}
                    style={styles.actionButton}
                >
                    <Icon name="delete" size={20} color="#ff4d4f" />
                </TouchableOpacity>
            </View>
        </View>
    );
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <MainLayout title={'Quản lý trẻ'}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Danh sách trẻ</Text>
                        <TouchableOpacity onPress={() => openSheet()}>
                            <Icon name="plus-circle" size={24} color="#4f3f97" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={childrenList}
                        renderItem={renderChildItem}
                        keyExtractor={item => item.id}
                    />

                </View>
            </MainLayout>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                enablePanDownToClose
                style={styles.bottomSheet}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
            >
                <BottomSheetView>
                    <ScrollView>
                        <View style={styles.bottomSheetContent}>
                            <Text style={styles.sheetTitle}>{editingId ? 'Cập nhật trẻ' : 'Thêm trẻ mới'}</Text>
                            <InputTextCommon
                                label="Họ tên"
                                attribute="name"
                                dataAttribute={dataRequest.name}
                                setData={setDataRequest}
                                isRequired
                                editable
                                validate={validate}
                                setValidate={setValidate}
                                submittedTime={submittedTime}
                            />
                            <InputTextCommon
                                label="SĐT"
                                attribute="phoneNumber"
                                dataAttribute={dataRequest.phoneNumber}
                                setData={setDataRequest}
                                isRequired
                                editable
                                validate={validate}
                                setValidate={setValidate}
                                submittedTime={submittedTime}
                            />
                            <ButtonCommon
                                title={editingId ? 'Cập nhật' : 'Thêm mới'}
                                onPress={handleAddOrUpdateChild}
                            />
                            <ButtonCommon title="Đóng" onPress={closeSheet} />
                        </View>
                    </ScrollView>
                </BottomSheetView>
            </BottomSheet>
            <LoadingFullScreen loading={loading} />
        </KeyboardAvoidingView >
    );
};

export default ChildrenScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4f3f97',
    },
    childItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    childInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    details: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    bottomSheet: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d3d3d3',
    },
    bottomSheetContent: {
        gap: 16,
        padding: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4f3f97',
    },
});
