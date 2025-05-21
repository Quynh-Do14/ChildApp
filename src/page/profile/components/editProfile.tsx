import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MainLayout from '../../../infrastructure/common/layouts/layout';
import { useRecoilValue } from 'recoil';
import { ProfileState } from '../../../core/atoms/profile/profileState';
import { useNavigation } from '@react-navigation/native';
import { configImageURL } from '../../../infrastructure/helper/helper';
import InputTextCommon from '../../../infrastructure/common/components/input/input-text-common';
import ButtonCommon from '../../../infrastructure/common/components/button/button-common';
import authService from '../../../infrastructure/repositories/auth/auth.service';

const EditProfile = () => {
  const [_data, _setData] = useState<any>({});
  const [validate, setValidate] = useState<any>({});
  const [submittedTime, setSubmittedTime] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigation = useNavigation<any>();
  const dataProfileState = useRecoilValue(ProfileState).data;
  const onGoBack = () => {
    navigation.goBack();
  };
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

  useEffect(() => {
    if (dataProfile) {
      setDataProfile({
        name: dataProfileState?.name,
        phoneNumber: dataProfileState.phoneNumber,
      });
    }
  }, [dataProfileState]);

  const onUpdateProfile = async () => {
    await setSubmittedTime(Date.now());
    if (isValidData()) {
      try {
        await authService.updateProfile(
          {
            name: dataProfile.name,
            phoneNumber: dataProfile.phoneNumber,
          },
          setLoading,
        )
          .then(response => {
            if (response) {
              onGoBack()
            }
          });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <MainLayout
      title={'Chỉnh sửa hồ sơ'}
      isBackButton={true}
      onGoBack={onGoBack}
      noSpaceEnd={true}
    >
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.form}>

            <InputTextCommon
              label={"Tên"}
              attribute={"name"}
              dataAttribute={dataProfile.name}
              isRequired={false}
              setData={setDataProfile}
              editable={true}
              validate={validate}
              setValidate={setValidate}
              submittedTime={submittedTime}
            />

            <InputTextCommon
              label={"SĐT"}
              attribute={"phoneNumber"}
              dataAttribute={dataProfile.phoneNumber}
              isRequired={false}
              setData={setDataProfile}
              editable={true}
              validate={validate}
              setValidate={setValidate}
              submittedTime={submittedTime}
            />
            <ButtonCommon title="Chỉnh sửa" onPress={onUpdateProfile} />
          </View>
        </ScrollView>
      </View >
    </MainLayout >
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    gap: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  form: {
    flexDirection: "column",
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  headerText: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  className: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#b9b9b9',
  },
  label: {
    fontSize: 14,
    color: '#444',
    fontWeight: 'bold',

  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  linkColor: {
    color: '#3b82f6', // Màu xanh nhạt giống trong ảnh
  },

});
