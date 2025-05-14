import React from 'react'
import { View, Modal, Text, TouchableOpacity } from 'react-native'

type Props = {
    visible: boolean,
    onConfirm: () => void,
    onCancel: () => void
    message: String
}
const DialogConfirmCommon = (props: Props) => {
    const { visible, onConfirm, onCancel, message } = props
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onConfirm}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: "500", marginBottom: 20, color: "#1C1C1E" }}>{message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: "center", gap: 8}}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "red",
                                padding: 10,
                                borderRadius: 8
                            }}
                            onPress={onCancel}
                        >
                            <Text style={{ color: '#ffffff', fontSize: 16 }}>Hủy bỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "green",
                                padding: 10,
                                borderRadius: 8
                            }}
                            onPress={onConfirm}
                        >
                            <Text style={{ color: '#ffffff', fontSize: 16 }}>Đồng ý</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default DialogConfirmCommon