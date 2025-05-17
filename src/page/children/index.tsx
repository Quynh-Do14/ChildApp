import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import MainLayout from '../../infrastructure/common/layouts/layout';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import InputDatePickerCommon from '../../infrastructure/common/components/input/input-date-common';
import InputPasswordCommon from '../../infrastructure/common/components/input/input-password-common';
import userService from '../../infrastructure/repositories/user/user.service';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';

const ChildrenScreen = () => {
    const [_data, _setData] = useState<any>({});
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [childrenList, setChildrenList] = useState<any[]>([])

    const dataRequest = _data;
    const setDataRequest = (data: any) => {
        Object.assign(_data, { ...data });
        _setData({ ..._data });
    };

    const GetMyChildrenAsync = async () => {
        try {
            await userService.getChild(
                setLoading,
            ).then((response) => {
                if (response) {
                    setChildrenList(response)
                }
            });
        } catch (error) {
            console.error(error);
        }
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

    useEffect(() => {
        GetMyChildrenAsync().then(() => { });
    }, []);

    const onCreateChildAsync = async () => {
        if (isValidData()) {
            try {
                await userService.createUser(
                    {
                        name: dataRequest.name,
                        phoneNumber: dataRequest.phoneNumber,
                    },
                    setLoading,
                ).then((response) => {
                    if (response) {
                        GetMyChildrenAsync();
                        closeSheet();
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['90%'], []);
    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            setEditingId(null);
        }
    }, []);

    const openSheet = (child?: any) => {
        if (child) {
            setDataRequest({ ...child });
            setEditingId(child.id);
        } else {
            setDataRequest({});
            setEditingId(null);
        }
        bottomSheetRef.current?.expand();
    };

    const closeSheet = () => bottomSheetRef.current?.close();

    const handleDelete = (id: string) => {
        Alert.alert('Xoá trẻ', 'Bạn có chắc muốn xoá trẻ này?', [
            { text: 'Huỷ' },
            {
                text: 'Xoá',
                onPress: () => setChildrenList(prev => prev.filter(item => item.id !== id)),
                style: 'destructive',
            },
        ]);
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.childItem}>
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>Mã: {item.accessCode} | SĐT: {item.phoneNumber}</Text>
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
                        renderItem={renderItem}
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
                                onPress={onCreateChildAsync}
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
    bottomSheet: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d3d3d3',
    },
    bottomSheetContent: {
        gap: 16,
        flex: 1
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4f3f97',
    },
});
