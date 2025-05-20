import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { validateFields } from '../../../helper/helper';

type Props = {
    label: string,
    attribute: string,
    isRequired: boolean,
    setData: (data: any) => void,
    dataAttribute?: any,
    validate: any,
    setValidate: (data: any) => void,
    submittedTime: any,
    editable: boolean
};

const formatDateTime = (date?: Date): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const InputDatePickerCommon = (props: Props) => {
    const {
        label,
        attribute,
        isRequired,
        setData,
        dataAttribute,
        validate,
        setValidate,
        submittedTime,
        editable
    } = props;

    const [value, setValue] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            const currentTime = value || new Date();
            newDate.setHours(currentTime.getHours());
            newDate.setMinutes(currentTime.getMinutes());
            setValue(newDate);
            setShowDatePicker(false);
            setShowTimePicker(true); // tiếp tục show picker giờ
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (event.type === 'dismissed') {
            setShowTimePicker(false);
            return;
        }
        if (selectedTime) {
            const newDate = value || new Date();
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setValue(newDate);
            setData({ [attribute]: newDate.toISOString() });
            setShowTimePicker(false);
        }
    };

    const showPickers = () => {
        if (editable) {
            setShowDatePicker(true);
        }
    };

    const onBlur = (isImplicitChange = false) => {
        const isError = !value && isRequired;
        validateFields(
            isImplicitChange,
            attribute,
            isError,
            setValidate,
            validate,
            isError ? `Vui lòng nhập ${label.toLowerCase()}` : ''
        );
    };

    useEffect(() => {
        if (dataAttribute) {
            const parsed = new Date(dataAttribute);
            if (!isNaN(parsed.getTime())) {
                setValue(parsed);
            }
        }
    }, [dataAttribute]);

    useEffect(() => {
        if (submittedTime != null) {
            onBlur(true);
        }
    }, [submittedTime]);

    return (
        <View>
            <TouchableOpacity onPress={showPickers}>
                <TextInput
                    placeholder={label}
                    value={formatDateTime(value)}
                    placeholderTextColor="#ABABAB"
                    onBlur={() => onBlur(false)}
                    editable={false}
                    style={[
                        styles.fontStyle,
                        styles.inputStyle,
                        validate[attribute]?.isError && styles.errorStyle,
                        !editable && styles.editableStyle
                    ]}
                />
                <View style={styles.icon}>
                    <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#4f3f97"
                    />
                </View>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </View>
    );
};

export default InputDatePickerCommon;

const styles = StyleSheet.create({
    fontStyle: {
        color: '#232323',
        fontFamily: 'Roboto Regular',
        fontWeight: '900',
    },
    inputStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#ABABAB',
        marginBottom: 4,
        paddingVertical: 8,
        paddingRight: 30,
    },
    errorStyle: {
        borderBottomColor: '#f61a1a',
    },
    editableStyle: {
        borderBottomColor: '#686b7d',
        color: '#686b7d',
    },
    icon: {
        position: 'absolute',
        right: 4,
        top: 6,
        padding: 6,
    },
});
