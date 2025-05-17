import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import { useNavigation } from '@react-navigation/native';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import InputDatePickerCommon from '../../infrastructure/common/components/input/input-date-common';
import missionService from '../../infrastructure/repositories/mission/mission.service';
import { convertDate } from '../../infrastructure/helper/helper';
import SelectCommon from '../../infrastructure/common/components/input/select-common';
import { useRecoilValue } from 'recoil';
import { ChildState } from '../../core/atoms/child/childState';
import { ProfileState } from '../../core/atoms/profile/profileState';

const MissionScreen = () => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [_data, _setData] = useState<any>({});
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [listMission, setListMission] = useState<any[]>([])
    const navigation = useNavigation<any>();
    const dataChildren = useRecoilValue(ChildState).data;
    const dataProfile = useRecoilValue(ProfileState).data;

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

    const GetMissonAsync = async () => {
        try {
            await missionService.getMission(
                setLoading,
            ).then((response) => {
                if (response) {
                    console.log("response", response);
                    setListMission(response.content)
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        GetMissonAsync().then(() => { });
    }, []);

    const bottomSheetRef = useRef<BottomSheet>(null);

    const addOrUpdateTask = async () => {
        if (editingId) {
            if (isValidData()) {
                try {
                    await missionService.updateMission(
                        String(editingId),
                        {
                            "childId": dataRequest.childId,
                            "title": dataRequest.title,
                            "description": dataRequest.description,
                            "deadline": dataRequest.deadline,
                            "points": Number(dataRequest.points),
                        },
                        setLoading,
                    ).then((response) => {
                        if (response) {
                            GetMissonAsync().then(() => { });
                            bottomSheetRef.current?.close();
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }
        else {
            if (isValidData()) {
                try {
                    await missionService.createMission(
                        {
                            "childId": dataRequest.childId,
                            "title": dataRequest.title,
                            "description": dataRequest.description,
                            "deadline": dataRequest.deadline,
                            "points": Number(dataRequest.points),
                        },
                        setLoading,
                    ).then((response) => {
                        if (response) {
                            GetMissonAsync().then(() => { });
                            bottomSheetRef.current?.close();
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }

    };

    const snapPoints = useMemo(() => ['90%'], []);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            setEditingId(null);
        }
    }, []);

    const openSheet = () => {
        bottomSheetRef.current?.expand();
    };
    const closeSheet = () => {
        bottomSheetRef.current?.close();
        setEditingId(null);
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
            await missionService.deleteMission(
                String(editingId),
                setLoading,
            ).then((response) => {
                if (response) {
                    GetMissonAsync().then(() => { });
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const editTask = (task: any) => {
        setEditingId(task.id);
        openSheet();
        setDataRequest({
            "childId": task.child.id,
            "title": task.title,
            "description": task.description,
            "deadline": task.deadline,
            "points": String(task.points),
        })
    };

    const toggleComplete = (item: any) => {
        setEditingId(item.id);
        Alert.alert('Xác nhận', 'Bạn đã hoàn thành nhiệm vụ này?', [
            { text: 'Hủy' },
            { text: 'Hoàn thành', onPress: () => onCompleteAsync() },
        ]);
    };

    const onCompleteAsync = async () => {
        try {
            await missionService.CompleteMission(
                String(editingId),
                setLoading,
            ).then((response) => {
                if (response) {
                    GetMissonAsync().then(() => { });
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

    const toggleConfirm = (item: any) => {
        setEditingId(item.id);
        Alert.alert('Xác nhận', 'Xác nhận hoàn thành nhiệm vụ này?', [
            { text: 'Chưa hoàn thành', onPress: () => onConfirmAsync(false) },
            { text: 'Hoàn thành', onPress: () => onConfirmAsync(true) },
        ]);
    };

    const onConfirmAsync = async (confirm: boolean) => {
        try {
            await missionService.ConfirmMission(
                String(editingId),
                confirm,
                setLoading,
            ).then((response) => {
                if (response) {
                    GetMissonAsync().then(() => { });
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.taskItem}>
                <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                    <Text style={[styles.taskTitle, item.confirm && styles.completed]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.deadline]}>
                        {item.description}
                    </Text>
                    <Text style={styles.deadline}>Hạn: {convertDate(item.deadline)} | Điểm: {item.points}</Text>
                </TouchableOpacity>
                {
                    item.confirm
                        ?
                        null
                        :
                        dataProfile?.role === "child" && item.completedAt !== null
                            ?
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}>Chờ xác nhận</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            dataProfile?.role === "child" && item.completedAt === null
                            &&
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.button}>
                                    <Text style={styles.buttonText}>Hoàn thành</Text>
                                </TouchableOpacity>
                            </View>
                }
                {
                    item.confirm
                        ?
                        null
                        :
                        dataProfile.role === "parent" && item.completedAt === null
                            ?
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => editTask(item)} style={styles.button}>
                                    <Text style={styles.buttonText}>Sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.button}>
                                    <Text style={[styles.buttonText, { color: '#ff1111' }]}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            dataProfile.role === "parent" && item.completedAt !== null
                            &&
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => toggleConfirm(item)} style={styles.button}>
                                    <Text style={styles.buttonText}>Xác nhận</Text>
                                </TouchableOpacity>
                            </View>
                }
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <MainLayout title={'Quản lý nhiệm vụ'}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Nhiệm vụ của trẻ</Text>
                        <TouchableOpacity onPress={openSheet}>
                            <Icon name={'plus-circle'} size={22} color="#4f3f97" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={listMission}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={<Text style={styles.empty}>Chưa có nhiệm vụ nào</Text>}
                        contentContainerStyle={styles.listContent}
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
                        {editingId ? 'Cập nhật nhiệm vụ' : 'Thêm nhiệm vụ mới'}
                    </Text>
                    <InputTextCommon
                        label={"Tên nhiệm vụ"}
                        attribute={"title"}
                        dataAttribute={dataRequest.title}
                        isRequired={false}
                        setData={setDataRequest}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <InputTextCommon
                        label={"Mô tả"}
                        attribute={"description"}
                        dataAttribute={dataRequest.description}
                        isRequired={false}
                        setData={setDataRequest}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <InputTextCommon
                        label={"Điểm"}
                        attribute={"points"}
                        dataAttribute={dataRequest.points}
                        isRequired={false}
                        setData={setDataRequest}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <InputDatePickerCommon
                        label="Thời hạn"
                        attribute="deadline"
                        dataAttribute={dataRequest.deadline}
                        setData={setDataRequest}
                        isRequired
                        editable
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <SelectCommon
                        label="Trẻ em"
                        attribute="childId"
                        dataAttribute={dataRequest.childId}
                        setData={setDataRequest}
                        isRequired={false}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                        listArray={dataChildren}
                    />
                    <ButtonCommon
                        title={editingId ? 'Cập nhật' : 'Thêm mới'}
                        onPress={addOrUpdateTask}
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

export default MissionScreen

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
    listContent: {
        paddingBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#4f3f97',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
        width: '100%',
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#4f3f97',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    cancelButton: {
        backgroundColor: '#ff3838',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    taskItem: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
        backgroundColor: '#f2f0fa',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    deadline: {
        color: '#666',
        marginTop: 4,
    },
    completed: {
        textDecorationLine: 'line-through',
        color: '#4f3f97',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 8,
        justifyContent: 'flex-end',
    },
    button: {
        marginLeft: 12,
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#4f3f97',
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#aaa',
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