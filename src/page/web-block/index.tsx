import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, Platform, KeyboardAvoidingView,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MainLayout from '../../infrastructure/common/layouts/layout';
import InputTextCommon from '../../infrastructure/common/components/input/input-text-common';
import ButtonCommon from '../../infrastructure/common/components/button/button-common';
import LoadingFullScreen from '../../infrastructure/common/components/controls/loading';

const fakeData = [
    { id: '1', name: 'Chrome', url: 'https://chrome.com' },
    { id: '2', name: 'YouTube', url: 'https://youtube.com' },
];

const WebBLockScreen = () => {
    const [browserList, setBrowserList] = useState(fakeData);
    const [dataRequest, setDataRequest] = useState<any>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [validate, setValidate] = useState<any>({});
    const [submittedTime, setSubmittedTime] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['100%'], []);

    const openSheet = (item?: any) => {
        if (item) {
            setDataRequest({ ...item });
            setEditingId(item.id);
        } else {
            setDataRequest({});
            setEditingId(null);
        }
        setValidate({});
        setSubmittedTime(null);
        bottomSheetRef.current?.expand();
    };

    const closeSheet = () => {
        bottomSheetRef.current?.close();
        setEditingId(null);
        setValidate({});
        setSubmittedTime(null);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Xoá trình duyệt', 'Bạn có chắc muốn xoá mục này?', [
            { text: 'Huỷ' },
            {
                text: 'Xoá',
                onPress: () => setBrowserList(prev => prev.filter(item => item.id !== id)),
                style: 'destructive',
            },
        ]);
    };

    const onCreateAsync = () => {
        setSubmittedTime(Date.now());
        const isValid = dataRequest.name && dataRequest.url;
        if (!isValid) return;

        if (editingId) {
            setBrowserList(prev =>
                prev.map(item => (item.id === editingId ? { ...dataRequest, id: editingId } : item))
            );
        } else {
            setBrowserList(prev => [
                ...prev,
                { ...dataRequest, id: Date.now().toString() },
            ]);
        }
        closeSheet();
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.browserItem}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleOpenUrl(item.url)}>
                    <Text style={styles.details}>
                        URL: <Text style={styles.link}>{item.url}</Text>
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
                        {editingId ? 'Cập nhật trình duyệt' : 'Thêm trình duyệt mới'}
                    </Text>

                    <InputTextCommon
                        label="Tên trình duyệt"
                        attribute="name"
                        dataAttribute={dataRequest.name}
                        setData={setDataRequest}
                        isRequired={true}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <InputTextCommon
                        label="Đường dẫn URL"
                        attribute="url"
                        dataAttribute={dataRequest.url}
                        setData={setDataRequest}
                        isRequired={true}
                        editable={true}
                        validate={validate}
                        setValidate={setValidate}
                        submittedTime={submittedTime}
                    />
                    <ButtonCommon
                        title={editingId ? 'Cập nhật' : 'Thêm mới'}
                        onPress={onCreateAsync}
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
