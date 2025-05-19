/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { convertTimeParams, validateFields } from "../../../helper/helper";
import { MessageError } from '../controls/MessageError';
import { Picker } from '@react-native-picker/picker';

type Props = {
    label: string,
    attribute: string,
    isRequired: boolean,
    setData: Function,
    dataAttribute?: any,
    validate: any,
    setValidate: Function,
    submittedTime: any,
    listArray: Array<any>,
}
const SelectCommon = (props: Props) => {
    const {
        label,
        attribute,
        isRequired,
        setData,
        dataAttribute,
        validate,
        setValidate,
        submittedTime,
        listArray,
    } = props;
    const [valueInput, setValueInput] = useState<number>();

    const labelLower = label?.toLowerCase();
    const pickerRef = useRef<any>();

    const validateEvent = (isImplicitChange: boolean = false) => {
        let checkValidate
        validateFields(isImplicitChange, attribute, !valueInput, setValidate, validate, !valueInput ? `Vui lòng nhập ${labelLower}` : "")
    }

    const onChange = (value: number, itemIndex: number) => {
        setValueInput(value);
        setData({
            [attribute]: value || ''
        });

        // Gọi validate sau khi setState hoàn tất
        setTimeout(() => {
            validateFields(false, attribute, !value, setValidate, validate, !value ? `Vui lòng nhập ${labelLower}` : "");
        }, 0);
    };

    useEffect(() => {
        setValueInput(dataAttribute || '');
    }, [dataAttribute]);

    useEffect(() => {
        if (submittedTime != null) {
            validateEvent(true);
        }
    }, [submittedTime]);

    return (
        <KeyboardAvoidingView>
            <View
                style={styles.container}
            >
                <Text style={styles.labelStyle}>
                    {label}
                </Text>
                <View
                    style={
                        validate[attribute]?.isError && styles.errorStyle
                    }
                >
                    <Picker
                        ref={pickerRef}
                        selectedValue={valueInput}
                        onValueChange={onChange}
                        style={{
                            padding: 0,
                            color: "#4f3f97",
                            fontFamily: "Roboto Regular",
                            fontWeight: "900",
                            marginBottom: 12,
                        }}
                        dropdownIconColor={"#4f3f97"}
                        mode='dropdown'
                        placeholder={`Chọn ${labelLower}`}
                    >
                        <Picker.Item enabled={false} color={"#4f3f97"} label={`Chọn ${labelLower}`} value="" />
                        {
                            listArray.map((it, index) => {
                                return (
                                    <Picker.Item key={index} label={it.name} value={it.id} />
                                )
                            })
                        }
                    </Picker>
                </View>
                <MessageError isError={validate[attribute]?.isError || false} message={validate[attribute]?.message || ""} />
            </View>
        </KeyboardAvoidingView >
    )
};
export default SelectCommon;
const styles = StyleSheet.create({
    container: {
        marginBottom: 4
    },
    fontStyle: {
        color: "#121212",
        fontFamily: "Roboto Regular",
        fontWeight: "900",
    },

    labelStyle: {
        color: "#4f3f97",
        fontFamily: "Roboto Regular",
        fontWeight: "600",
        fontSize: 11,
        position: "absolute",
        top: -4
    },

    inputStyle: {
        borderBottomWidth: 1,
        borderBottomColor: "#4f3f97",
        marginBottom: 4,
    },
    btnStyle: {
        backgroundColor: "#4f3f97",
        paddingVertical: 16,
        borderRadius: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    errorStyle: {
        borderBottomColor: "#f61a1a",
        borderBottomWidth: 1,
    }
})