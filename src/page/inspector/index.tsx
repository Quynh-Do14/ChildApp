import React, { useCallback, useMemo, useRef, useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
const fakeGuardians = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        phone: '0912345678',
        relationship: 'Bố',
    },
    {
        id: '2',
        name: 'Trần Thị B',
        phone: '0987654321',
        relationship: 'Mẹ',
    },
    {
        id: '3',
        name: 'Lê Văn C',
        phone: '0909090909',
        relationship: 'Chú',
    },
];
const InspectorScreen = () => {
    const [_data, _setData] = useState<any>({});
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const navigation = useNavigation<any>();

    const dataProfile = _data;
    const setDataProfile = (data: any) => {
        Object.assign(dataProfile, { ...data });
        _setData({ ...dataProfile });
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

    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleDelete = (id: string) => {
        Alert.alert('Xoá người giám sát', `Bạn có chắc muốn xoá người giám sát này? (ID: ${id})`);
        // Thực hiện xoá từ state nếu bạn dùng state thật
    };

    const snapPoints = useMemo(() => ['50%', '90%'], []);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            // Reset form when sheet is closed
            setEditingId(null);
        }
    }, []);

    const openSheet = () => {
        bottomSheetRef.current?.expand();
    };
    const closeSheet = () => {
        bottomSheetRef.current?.close();
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.guardianItem}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>{item.relationship} - {item.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Xoá</Text>
            </TouchableOpacity>
        </View>
    );
    return (
        <MainLayout title={'Quản lý người giám sát'}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Người giám sát</Text>
                    <TouchableOpacity onPress={openSheet}>
                        <Icon name={'plus-circle'} size={22} color="#4f3f97" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={fakeGuardians}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                    enablePanDownToClose={true}
                    style={styles.bottomSheet}
                >
                    <BottomSheetView style={styles.bottomSheetContent}>
                        <Text style={styles.sheetTitle}>
                            {editingId ? 'Cập nhật người giám sát' : 'Thêm người giám sát mới'}
                        </Text>
                        <InputTextCommon
                            label={"Tên đăng nhập"}
                            attribute={"username"}
                            dataAttribute={dataProfile.username}
                            isRequired={false}
                            setData={setDataProfile}
                            editable={true}
                            validate={validate}
                            setValidate={setValidate}
                            submittedTime={submittedTime}
                        />
                        <InputTextCommon
                            label={"Tên đăng nhập"}
                            attribute={"username"}
                            dataAttribute={dataProfile.username}
                            isRequired={false}
                            setData={setDataProfile}
                            editable={true}
                            validate={validate}
                            setValidate={setValidate}
                            submittedTime={submittedTime}
                        />
                        <ButtonCommon
                            title={editingId ? 'Cập nhật' : 'Thêm mới'}
                            onPress={() => { }}
                        />

                        <ButtonCommon
                            title={'Đóng'}
                            onPress={closeSheet}
                        />

                    </BottomSheetView>
                </BottomSheet>
            </View>
        </MainLayout>
    )
}

export default InspectorScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        display: "flex",
        flexDirection: "column",
        gap: 12
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
    },
    listContainer: {
    },
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
        shadowColor: '#000',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d3d3d3"
    },
    bottomSheetContent: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4f3f97',
        alignSelf: 'flex-start',
    },
});