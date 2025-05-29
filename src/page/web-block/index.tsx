import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, Platform, KeyboardAvoidingView,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MainLayout from '../../infrastructure/common/layouts/layout';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import blockService from '../../infrastructure/repositories/block/block.service';
import { useRecoilValue } from 'recoil';
import { ChildState } from '../../core/atoms/child/childState';
import SelectCommon from '../../infrastructure/common/components/input/select-common';
import { useIsFocused } from '@react-navigation/native';

const WebBLockScreen = () => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [_data, _setData] = useState<any>({});
    const dataChildren = useRecoilValue(ChildState).data || [];

    const dataRequest = _data;
    const setDataRequest = (data: any) => {
        Object.assign(_data, { ...data });
        _setData({ ..._data });
    };
    const [validate, setValidate] = useState<Record<string, any>>({});
    const [submittedTime, setSubmittedTime] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [browserList, setBrowerList] = useState<any[]>([]);
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
    const fetchWeb = async (loadingState: boolean = true) => {
        try {
            const response = await blockService.getAll(
                loadingState ? setLoading : setRefreshing
            );
            if (response) {
                setBrowerList(response);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách trẻ');
            console.error('Fetch children error:', error);
        }
    };

    // Effects
    useEffect(() => {
        fetchWeb();
    }, []);

    const openSheet = (child?: any) => {
        if (child) {
            setDataRequest({
                appName: child.appName,
                childId: child.childId,
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
            const data = {
                appName: dataRequest.appName,
                childId: dataRequest.childId,
            };

            const response = await blockService.createWeb(data, setLoading);

            if (response) {
                await fetchWeb();
                closeSheet();
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Tạo mới thất bại');
            console.error('Child operation error:', error);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá trẻ này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        const response = await blockService.deleteWeb(id, setLoading);
                        if (response) {
                            await fetchWeb();
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
            fetchWeb();
        }
    }, [isFocused]);

    const renderItem = ({ item }: any) => (
        <View style={styles.browserItem}>
            <View style={styles.info}>
                <TouchableOpacity onPress={() => handleOpenUrl(item.appName)}>
                    <Text style={styles.details}>
                        URL: <Text style={styles.link}>{item.appName}</Text>
                    </Text>
                    <Text style={styles.details}>
                        {item.child.name}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => openSheet(item)}>
                    <Icon name="pencil" size={20} color="#4f3f97" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Icon name="delete" size={20} color="#ff4d4f" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const handleOpenUrl = (url: string) => {
        Alert.alert(
            'Mở trình duyệt',
            `Bạn có muốn mở đường dẫn:\n${url}?`,
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Mở',
                    onPress: () => Linking.openURL(url),
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <MainLayout title="Quản lý trình duyệt">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Danh sách trình duyệt</Text>
                        <TouchableOpacity onPress={openSheet}>
                            <Icon name="plus-circle" size={24} color="#4f3f97" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={browserList}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                    />
                </View>
                <LoadingFullScreen loading={loading} />
            </MainLayout>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                style={styles.bottomSheet}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
            >
                <BottomSheetView style={styles.bottomSheetContent}>
                    <Text style={styles.sheetTitle}>
                        Thêm trình duyệt mới
                    </Text>
                    <InputTextCommon
                        label="Đường dẫn URL"
                        attribute="appName"
                        dataAttribute={dataRequest.appName}
                        setData={setDataRequest}
                        isRequired={true}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <SelectCommon
                        label="Trẻ em"
                        attribute="childId"
                        dataAttribute={dataRequest.childId}
                        setData={setDataRequest}
                        isRequired={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                        listArray={dataChildren}
                    />
                    <ButtonCommon
                        title={'Thêm mới'}
                        onPress={handleAddOrUpdateChild}
                    />
                    <ButtonCommon title="Đóng" onPress={closeSheet} />
                </BottomSheetView>
            </BottomSheet>
        </KeyboardAvoidingView>
    );
};

export default WebBLockScreen;

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
    browserItem: {
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
    link: {
        color: '#007AFF',
        textDecorationLine: 'underline',
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
});
