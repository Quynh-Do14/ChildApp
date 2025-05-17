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
                        GetMissonAsync()
                        bottomSheetRef.current?.close();
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const snapPoints = useMemo(() => ['90%'], []);

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

    const deleteTask = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn muốn xóa nhiệm vụ này?', [
            { text: 'Hủy' },
            { text: 'Xóa', onPress: () => { } },
        ]);
    };

    const editTask = (task: any) => {
        setEditingId(task.id);
        openSheet();
    };

    const toggleComplete = (item: any) => {
        Alert.alert('Xác nhận', 'Bạn đã hoàn thành nhiệm vụ này?', [
            { text: 'Hủy' },
            { text: 'Hoàn thành', onPress: () => { } },
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <Text style={[styles.taskTitle, item.completed && styles.completed]}>
                    {item.title}
                </Text>
                <Text style={styles.deadline}>Hạn: {convertDate(item.deadline)}</Text>
            </TouchableOpacity>
            {
                dataProfile?.role === "child"
                    ?
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.button}>
                            <Text style={styles.buttonText}>Hoàn thành</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => editTask(item)} style={styles.button}>
                            <Text style={styles.buttonText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.button}>
                            <Text style={[styles.buttonText, { color: '#ff1111' }]}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
            }

        </View>
    );
    console.log("dataRequest", dataRequest.role);

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
                        isRequired
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
            <LoadingFullScreen loading={loading} />
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