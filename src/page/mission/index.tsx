import React, { useCallback, useMemo, useRef, useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import { useNavigation } from '@react-navigation/native';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';

const fakeTasks = [
    {
        id: 'task_001',
        title: 'Học 30 phút Toán lớp 5',
        deadline: '2025-05-14 19:00',
        completed: false,
    },
    {
        id: 'task_002',
        title: 'Gấp quần áo và dọn phòng',
        deadline: '2025-05-14 20:30',
        completed: true,
    },
    {
        id: 'task_003',
        title: 'Đọc truyện 20 phút',
        deadline: '2025-05-15 17:00',
        completed: false,
    },
    {
        id: 'task_004',
        title: 'Tập thể dục 15 phút',
        deadline: '2025-05-15 06:30',
        completed: false,
    },
    {
        id: 'task_005',
        title: 'Giúp mẹ rửa bát sau ăn tối',
        deadline: '2025-05-14 20:00',
        completed: true,
    },
];

type Task = {
    id: string;
    title: string;
    deadline: string;
    completed: boolean;
};

const MissionScreen = () => {
    const [tasks, setTasks] = useState<Task[]>(fakeTasks);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [_data, _setData] = useState<any>({});
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

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

    const addOrUpdateTask = () => {
        bottomSheetRef.current?.close();
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

    const deleteTask = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn muốn xóa nhiệm vụ này?', [
            { text: 'Hủy' },
            { text: 'Xóa', onPress: () => setTasks(tasks.filter((task) => task.id !== id)) },
        ]);
    };

    const editTask = (task: Task) => {
        setEditingId(task.id);
        openSheet();
    };

    const toggleComplete = (id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const renderItem = ({ item }: { item: Task }) => (
        <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <Text style={[styles.taskTitle, item.completed && styles.completed]}>
                    {item.title}
                </Text>
                <Text style={styles.deadline}>Hạn: {item.deadline}</Text>
            </TouchableOpacity>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => editTask(item)} style={styles.button}>
                    <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.button}>
                    <Text style={[styles.buttonText, { color: '#ff1111' }]}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <MainLayout title={'Quản lý nhiệm vụ'}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Nhiệm vụ của trẻ</Text>
                    <TouchableOpacity onPress={openSheet}>
                        <Icon name={'plus-circle'} size={22} color="#4f3f97" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={tasks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text style={styles.empty}>Chưa có nhiệm vụ nào</Text>}
                    contentContainerStyle={styles.listContent}
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
                            {editingId ? 'Cập nhật nhiệm vụ' : 'Thêm nhiệm vụ mới'}
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
                            onPress={addOrUpdateTask}
                        />

                        <ButtonCommon
                            title={'Đóng'}
                            onPress={closeSheet}
                        />

                    </BottomSheetView>
                </BottomSheet>
            </View>
            <LoadingFullScreen loading={loading} />
        </MainLayout>
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