import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import MainLayout from '../../infrastructure/common/layouts/layout';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import { useRecoilValue } from 'recoil';
import { ProfileState } from '../../core/atoms/profile/profileState';
import inspectorService from '../../infrastructure/repositories/inspector/inspector.service';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import SelectCommon from '../../infrastructure/common/components/input/select-common';
import { ChildState } from '../../core/atoms/child/childState';

type Inspector = {
    id: string;
    name: string;
    phoneNumber: string;
    children: any
};

type InspectorFormData = {
    name: string;
    phoneNumber: string;
    childrenIds: string;
};

const InspectorScreen = () => {
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
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [listInspector, setListInspector] = useState<Inspector[]>([]);
    const isFocused = useIsFocused();

    // Hooks and Recoil state
    const navigation = useNavigation<any>();
    const dataChildren = useRecoilValue(ChildState).data || [];
    const dataProfile = useRecoilValue(ProfileState).data;
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['90%'], []);

    // Data fetching
    const fetchInspectors = async (loadingState: boolean = true) => {
        try {
            const response = await inspectorService.getInspector(
                loadingState ? setLoading : setRefreshing
            );
            if (response) {
                setListInspector(response);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách người giám sát');
            console.error('Fetch inspectors error:', error);
        }
    };

    // Effects
    useEffect(() => {
        fetchInspectors();
    }, []);


    // Form validation

    // Bottom sheet handlers
    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            setEditingId(null);
        }
    }, []);

    const openSheet = (inspector?: Inspector) => {
        if (inspector) {
            setEditingId(inspector.id);
            setDataRequest({
                "name": inspector.name,
                "phoneNumber": inspector.phoneNumber,
                "childrenIds": inspector?.children[0]?.id
            })
        }
        bottomSheetRef.current?.expand();
    };

    const closeSheet = () => {
        setEditingId(null);
        setDataRequest({
            "name": "",
            "phoneNumber": "",
            "childrenIds": ""
        })
        bottomSheetRef.current?.close();
    }

    // Inspector CRUD operations
    const handleAddOrUpdateInspector = async () => {
        if (!isValidData()) return;

        try {
            const inspectorData = {
                "name": dataRequest.name,
                "phoneNumber": dataRequest.phoneNumber,
                "childrenIds": [dataRequest.childrenIds]
            };

            const response = editingId
                ? await inspectorService.updateInspector(editingId, inspectorData, setLoading)
                : await inspectorService.createInspector(inspectorData, setLoading);

            if (response) {
                await fetchInspectors();
                closeSheet();
            }
        } catch (error) {
            Alert.alert('Lỗi', editingId ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
            console.error('Inspector operation error:', error);
        }
    };

    const handleDeleteInspector = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá người giám sát này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        const response = await inspectorService.deleteInspector(id, setLoading);
                        if (response) {
                            await fetchInspectors();
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xóa người giám sát thất bại');
                        console.error('Delete inspector error:', error);
                    }
                },
            },
        ]);
    };

    const handleCallPhone = (phone: string) => {
        Alert.alert(
            'Gọi điện',
            `Bạn có muốn gọi đến số ${phone}?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Gọi',
                    onPress: () => Linking.openURL(`tel:${phone}`),
                },
            ],
            { cancelable: true }
        );
    };

    useEffect(() => {
        if (isFocused) {
            fetchInspectors();
        }
    }, [isFocused]);
    // Render helpers
    const renderInspectorItem = ({ item }: { item: Inspector }) => (
        <View style={styles.guardianItem}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleCallPhone(item.phoneNumber)}>
                    <Text style={styles.details}>
                        SĐT: <Text style={styles.phoneLink}>{item.phoneNumber}</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            {dataProfile?.role === 'parent' && (
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
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <MainLayout title={'Quản lý người giám sát'}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Người giám sát</Text>
                        {
                            dataProfile?.role === 'parent'
                            &&
                            <TouchableOpacity onPress={() => openSheet()}>
                                <Icon name={'plus-circle'} size={22} color="#4f3f97" />
                            </TouchableOpacity>
                        }
                    </View>
                    <FlatList
                        data={listInspector}
                        renderItem={renderInspectorItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
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
                        {editingId ? 'Cập nhật người giám sát' : 'Thêm người giám sát mới'}
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
                    <InputTextCommon
                        label={"Số điện thoại"}
                        attribute={"phoneNumber"}
                        dataAttribute={dataRequest.phoneNumber}
                        isRequired={true}
                        setData={setDataRequest}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <SelectCommon
                        label="Trẻ em"
                        attribute="childrenIds"
                        dataAttribute={dataRequest.childrenIds}
                        setData={setDataRequest}
                        isRequired={false}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                        listArray={dataChildren}
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
    );
};

export default InspectorScreen;

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
    listContainer: {},
    guardianItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    info: {
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
    phoneLink: {
        color: '#007AFF', // hoặc màu xanh cuộc gọi
        textDecorationLine: 'underline',
    },
});
