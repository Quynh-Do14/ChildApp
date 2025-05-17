import React, { useEffect, useState } from 'react';
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
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

const formatDate = (date?: Date | string): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
    const [show, setShow] = useState<boolean>(false);

    const handleChangeDate = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setValue(selectedDate);
            setData({ [attribute]: selectedDate.toISOString() }); // hoặc .split('T')[0] nếu chỉ muốn YYYY-MM-DD
        }
        setShow(false);
    };

    const showDatepicker = () => {
        if (editable) {
            setShow(true);
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
            <TouchableOpacity onPress={showDatepicker}>
                <TextInput
                    placeholder={label}
                    value={formatDate(value)}
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

            {show && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleChangeDate}
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
        paddingRight: 30, // để chừa chỗ cho icon
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
