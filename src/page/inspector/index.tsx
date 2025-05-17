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
import { useNavigation } from '@react-navigation/native';

import MainLayout from '../../infrastructure/common/layouts/layout';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import { useRecoilValue } from 'recoil';
import { ProfileState } from '../../core/atoms/profile/profileState';
import inspectorService from '../../infrastructure/repositories/inspector/inspector.service';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';
import SelectCommon from '../../infrastructure/common/components/input/select-common';
import { ChildState } from '../../core/atoms/child/childState';

const InspectorScreen = () => {
    const [_data, _setData] = useState<any>({});
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [listInspector, setListInspector] = useState<any[]>([])

    const dataChildren = useRecoilValue(ChildState).data;
    const dataProfile = useRecoilValue(ProfileState).data;
    const navigation = useNavigation<any>();
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

    const GetMyInspectorAsync = async () => {
        try {
            await inspectorService.getInspector(
                setLoading,
            ).then((response) => {
                if (response) {
                    setListInspector(response)
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        GetMyInspectorAsync().then(() => { });
    }, []);

    console.log("editingId", editingId);

    const onCreateAsync = async () => {
        if (editingId) {
            if (isValidData()) {
                try {
                    await inspectorService.updateInspector(
                        String(editingId),
                        {
                            "name": dataRequest.name,
                            "phoneNumber": dataRequest.phoneNumber,
                            "childrenIds": [dataRequest.childrenIds]
                        },
                        setLoading,
                    ).then((response) => {
                        if (response) {
                            console.log("response", response);
                            GetMyInspectorAsync()
                            closeSheet();
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        }
        else {
            if (isValidData()) {
                try {
                    await inspectorService.createInspector(
                        {
                            "name": dataRequest.name,
                            "phoneNumber": dataRequest.phoneNumber,
                            "childrenIds": [dataRequest.childrenIds]
                        },
                        setLoading,
                    ).then((response) => {
                        if (response) {
                            GetMyInspectorAsync()
                            closeSheet();
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
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

    const openSheet = (item?: any) => {
        if (item) {
            setDataRequest({ ...item });
            setEditingId(item.id);
        } else {
            setDataRequest({});
            setEditingId(null);
        }
        bottomSheetRef.current?.expand();
    };
    const closeSheet = () => {
        bottomSheetRef.current?.close();
    };

    const handleDelete = (id: string) => {
        setEditingId(id);
        Alert.alert('Xoá người giám sát', 'Bạn có chắc muốn xoá người giám sát này?', [
            { text: 'Hủy', style: 'cancel', onPress: () => setEditingId(null) },
            { text: 'Xóa', onPress: () => onDeleteAsync() },
        ]);
        

    };

    const onDeleteAsync = async () => {
        try {
            await inspectorService.deleteInspector(
                String(editingId),
                setLoading,
            ).then((response) => {
                if (response) {
                    GetMyInspectorAsync()
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.guardianItem}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleCallPhone(item.phoneNumber)}>
                    <Text style={styles.details}>
                        SĐT: <Text style={styles.phoneLink}>{item.phoneNumber}</Text>
                    </Text>
                </TouchableOpacity>
            </View>
            {
                dataProfile.role == "parent"
                &&

                <TouchableOpacity onPress={() => openSheet(item)}>
                    <Icon name="pencil" size={20} color="#4f3f97" />
                </TouchableOpacity>
            }
            {
                dataProfile.role == "parent"
                &&
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Icon name="delete" size={20} color="#ff4d4f" />
                </TouchableOpacity>
            }

        </View>
    );
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


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <MainLayout title={'Quản lý người giám sát'}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Người giám sát</Text>
                        <TouchableOpacity onPress={openSheet}>
                            <Icon name={'plus-circle'} size={22} color="#4f3f97" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={listInspector}
                        renderItem={renderItem}
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
                        onPress={onCreateAsync}
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
