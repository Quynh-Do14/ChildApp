import React, { useState } from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout'
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading'
import { convertTimeOnly } from '../../infrastructure/helper/helper'

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
    const [loading, setLoading] = useState<boolean>(false);

    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const addOrUpdateTask = () => {
        if (!title || !deadline) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và deadline');
            return;
        }

        if (editingId) {
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === editingId ? { ...task, title, deadline } : task
                )
            );
            setEditingId(null);
        } else {
            const newTask: Task = {
                id: Date.now().toString(),
                title,
                deadline,
                completed: false,
            };
            setTasks([...tasks, newTask]);
        }

        setTitle('');
        setDeadline('');
    };

    const deleteTask = (id: string) => {
        Alert.alert('Xác nhận', 'Bạn muốn xóa nhiệm vụ này?', [
            { text: 'Hủy' },
            { text: 'Xóa', onPress: () => setTasks(tasks.filter((task) => task.id !== id)) },
        ]);
    };

    const editTask = (task: Task) => {
        setTitle(task.title);
        setDeadline(task.deadline);
        setEditingId(task.id);
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
                    <Text style={[styles.buttonText, { color: 'red' }]}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <MainLayout title={'Quản lý nhiệm vụ'}>
            <View style={styles.container}>
                <Text style={styles.header}>Nhiệm vụ của trẻ</Text>
                {/* 
                <TextInput
                    placeholder="Tiêu đề nhiệm vụ"
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    placeholder="Deadline (ví dụ: 2025-05-20 18:00)"
                    style={styles.input}
                    value={deadline}
                    onChangeText={setDeadline}
                />

                <TouchableOpacity onPress={addOrUpdateTask} style={styles.addButton}>
                    <Text style={styles.addButtonText}>
                        {editingId ? 'Cập nhật nhiệm vụ' : 'Thêm nhiệm vụ'}
                    </Text>
                </TouchableOpacity> */}

                <FlatList
                    data={tasks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text style={styles.empty}>Chưa có nhiệm vụ nào</Text>}
                />
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
        backgroundColor: '#fff', // nền trắng
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#4f3f97',
    },
    input: {
        borderWidth: 1,
        borderColor: '#4f3f97',
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#4f3f97',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    taskItem: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
        backgroundColor: '#f2f0fa', // nền nhạt theo tone tím
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
});
