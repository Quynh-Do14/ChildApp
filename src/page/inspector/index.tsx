import React from 'react'
import MainLayout from '../../infrastructure/common/layouts/layout';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
    const handleDelete = (id: string) => {
        Alert.alert('Xoá người giám sát', `Bạn có chắc muốn xoá người giám sát này? (ID: ${id})`);
        // Thực hiện xoá từ state nếu bạn dùng state thật
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
        <MainLayout>
            <View style={styles.container}>
                <Text style={styles.header}>Danh sách người giám sát</Text>
                <FlatList
                    data={fakeGuardians}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </MainLayout>
    )
}

export default InspectorScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 12,
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        color: '#4f3f97',
    },
    listContainer: {
        paddingHorizontal: 16,
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
});