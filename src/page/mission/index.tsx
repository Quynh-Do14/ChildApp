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
import { useIsFocused, useNavigation } from '@react-navigation/native';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import InputDatePickerCommon from '../../infrastructure/common/components/input/input-date-common';
import missionService from '../../infrastructure/repositories/mission/mission.service';
import { convertDate } from '../../infrastructure/helper/helper';
import SelectCommon from '../../infrastructure/common/components/input/select-common';
import { useRecoilValue } from 'recoil';
import { ChildState } from '../../core/atoms/child/childState';
import { ProfileState } from '../../core/atoms/profile/profileState';
import InputNumberCommon from '../../infrastructure/common/components/input/input-number-common';

type Mission = {
    id: string;
    child: {
        id: string;
    };
    title: string;
    description: string;
    deadline: string;
    points: number;
    confirm: boolean;
    completedAt: string | null;
};

type MissionFormData = {
    childId: string;
    title: string;
    description: string;
    deadline: string;
    points: string;
};


const MissionScreen = () => {
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
    const [listMission, setListMission] = useState<Mission[]>([]);
    const isFocused = useIsFocused();

    // Hooks and Recoil state
    const navigation = useNavigation<any>();
    const dataChildren = useRecoilValue(ChildState).data || [];
    const dataProfile = useRecoilValue(ProfileState).data;
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['90%'], []);

    // Data fetching
    const fetchMissions = async (loadingState: boolean = true) => {
        try {
            const response = await missionService.getMission(loadingState ? setLoading : setRefreshing);
            if (response?.content) {
                setListMission(response.content);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách nhiệm vụ');
            console.error('Fetch missions error:', error);
        }
    };

    // Effects
    useEffect(() => {
        fetchMissions();
    }, []);

    const handleRefresh = () => {
        fetchMissions(false);
    };

    // Bottom sheet handlers
    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            setEditingId(null);

        }
    }, []);

    const openSheet = () => bottomSheetRef.current?.expand();
    const closeSheet = () => {
        bottomSheetRef.current?.close();
        setEditingId(null);
        setDataRequest({
            "childId": "",
            "title": "",
            "description": "",
            "deadline": "",
            "points": "",
        })
    }

    // Mission CRUD operations
    const handleAddOrUpdateMission = async () => {
        if (!isValidData()) return;

        try {
            const missionData = {
                "childId": dataRequest.childId,
                "title": dataRequest.title,
                "description": dataRequest.description,
                "deadline": dataRequest.deadline,
                "points": Number(dataRequest.points),
            };

            const response = editingId
                ? await missionService.updateMission(editingId, missionData, setLoading)
                : await missionService.createMission(missionData, setLoading);

            if (response) {
                await fetchMissions();
                closeSheet();
            }
        } catch (error) {
            Alert.alert('Lỗi', editingId ? 'Cập nhật thất bại' : 'Tạo mới thất bại');
            console.error('Mission operation error:', error);
        }
    };

    const handleDeleteMission = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá nhiệm vụ này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        const response = await missionService.deleteMission(id, setLoading);
                        if (response) {
                            await fetchMissions();
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xóa nhiệm vụ thất bại');
                        console.error('Delete mission error:', error);
                    }
                },
            },
        ]);
    };

    const handleEditMission = (mission: Mission) => {
        setEditingId(mission.id);
        openSheet();
        setDataRequest({
            "childId": mission.child.id,
            "title": mission.title,
            "description": mission.description,
            "deadline": mission.deadline,
            "points": String(mission.points),
        })
    };

    // Mission status operations
    const handleCompleteMission = (mission: Mission) => {
        Alert.alert('Xác nhận', 'Bạn đã hoàn thành nhiệm vụ này?', [
            { text: 'Hủy' },
            {
                text: 'Hoàn thành',
                onPress: async () => {
                    try {
                        const response = await missionService.CompleteMission(mission.id, setLoading);
                        if (response) {
                            await fetchMissions();
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xác nhận hoàn thành thất bại');
                        console.error('Complete mission error:', error);
                    }
                },
            },
        ]);
    };

    const handleConfirmMission = (mission: Mission, confirm: boolean) => {
        Alert.alert('Xác nhận', confirm ? 'Xác nhận hoàn thành nhiệm vụ?' : 'Đánh dấu chưa hoàn thành?', [
            { text: 'Hủy' },
            {
                text: confirm ? 'Hoàn thành' : 'Chưa hoàn thành',
                onPress: async () => {
                    try {
                        const response = await missionService.ConfirmMission(mission.id, confirm, setLoading);
                        if (response) {
                            await fetchMissions();
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xác nhận thất bại');
                        console.error('Confirm mission error:', error);
                    }
                },
            },
        ]);
    };
    useEffect(() => {
        if (isFocused) {
            fetchMissions();
        }
    }, [isFocused]);
    // Render helpers
    const renderMissionActions = (mission: Mission) => {
        if (mission.confirm) return null;

        if (dataProfile?.role === 'child') {
            if (mission.completedAt) {
                return (
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Chờ xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleCompleteMission(mission)} style={styles.button}>
                        <Text style={styles.buttonText}>Hoàn thành</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (dataProfile?.role === 'parent') {
            if (mission.completedAt) {
                return (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={() => handleConfirmMission(mission, true)}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleEditMission(mission)} style={styles.button}>
                        <Text style={styles.buttonText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeleteMission(mission.id)}
                        style={styles.button}
                    >
                        <Text style={[styles.buttonText, styles.deleteText]}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    const renderMissionItem = ({ item }: { item: Mission }) => (
        <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => handleCompleteMission(item)}>
                <Text style={[styles.taskTitle, item.confirm && styles.completed]}>
                    {item.title}
                </Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.deadline}>
                    Hạn: {convertDate(item.deadline)} | Điểm: {item.points}
                </Text>
            </TouchableOpacity>
            {renderMissionActions(item)}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <MainLayout title={'Quản lý nhiệm vụ'}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Nhiệm vụ của trẻ</Text>
                        {
                            dataProfile?.role === 'parent'
                            &&
                            <TouchableOpacity onPress={openSheet}>
                                <Icon name={'plus-circle'} size={22} color="#4f3f97" />
                            </TouchableOpacity>
                        }
                    </View>
                    <FlatList
                        data={listMission}
                        renderItem={renderMissionItem}
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
                onClose={closeSheet}
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
                    <InputNumberCommon
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
                        isRequired={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                        listArray={dataChildren}
                    />
                    <ButtonCommon
                        title={editingId ? 'Cập nhật' : 'Thêm mới'}
                        onPress={handleAddOrUpdateMission}
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
    description: {
        color: '#666',
        marginTop: 4,
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
    deleteText: {
        color: '#ff1111',
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