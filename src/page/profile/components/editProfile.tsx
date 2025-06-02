import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MainLayout from '../../../infrastructure/common/layouts/layout';
import { useRecoilValue } from 'recoil';
import { ProfileState } from '../../../core/atoms/profile/profileState';
import { useNavigation } from '@react-navigation/native';
import { configImageURL, configImageURLIncludeHTTP } from '../../../infrastructure/helper/helper';
import InputTextCommon from '../../../infrastructure/common/components/input/input-text-common';
import ButtonCommon from '../../../infrastructure/common/components/button/button-common';
import authService from '../../../infrastructure/repositories/auth/auth.service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CheckPermission from '../../../infrastructure/utils/CheckPermission';
import LoadingFullScreen from '../../../infrastructure/common/components/controls/loading';

const EditProfile = () => {
  const [_data, _setData] = useState<any>({});
  const [validate, setValidate] = useState<any>({});
  const [submittedTime, setSubmittedTime] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<any>();

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
        avatar: dataProfileState?.avatarCode,

      });
    }
  }, [dataProfileState]);

  const onUpdateProfile = async () => {
    await setSubmittedTime(Date.now());

    if (!isValidData()) return;

    try {
      setLoading(true);

      if (imageUri) {
        // Tạo FormData cho multipart/form-data
        const formData = new FormData();
        formData.append('name', dataProfile.name);
        formData.append('phoneNumber', dataProfile.phoneNumber);

        // Xử lý image (imageUri nên là local path kiểu 'file://...')
        const fileName = imageUri.split('/').pop() || 'avatar.jpg';
        const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

        formData.append('avatar', {
          uri: imageUri,
          name: fileName,
          type: fileType,
        });

        // Gửi formData
        const response = await authService.updateProfile(formData, setLoading);
        if (response) onGoBack();
      } else {
        // Gửi JSON object nếu không có ảnh
        const response = await authService.updateProfile({
          name: dataProfile.name,
          phoneNumber: dataProfile.phoneNumber,
        }, setLoading);
        if (response) onGoBack();
      }
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };


  const requestTakePhoto = async () => {
    CheckPermission.hasCameraCaptureAndSave(
      async () => takePhoto(),
      permission => {
        // console.log('permission', permission);
        Alert.alert(
          'Quyền bị từ chối',
          'Vui lòng vào Cài đặt để cấp quyền Camera và Thư viện ảnh.',
        );
        return false;
      },
    );
  };

  const takePhoto = async () => {
    // const hasPermission = await requestPermissions();
    // if (!hasPermission) return;

    launchCamera({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && response.assets) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const requestPhotoPermission = async () => {
    CheckPermission.requestPhotoLibraryPermission(
      async () => pickImage(),
      permission => {
        // console.log('permission', permission);
        Alert.alert(
          'Quyền bị từ chối',
          'Vui lòng vào Cài đặt để cấp quyền Camera và Thư viện ảnh.',
        );
        return false;
      },
    );
  };

  const pickImage = async () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && response.assets) {
        setImageUri(response.assets[0].uri);
      }
    });
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickImage}>
              {dataProfile?.avatar && (
                <Image
                  source={{
                    uri: imageUri
                      ? imageUri
                      : `${configImageURL(dataProfile?.avatar)}`,
                  }}
                  style={styles.avatar}
                />
              )}
            </TouchableOpacity>

            {/* Nút chọn ảnh */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={requestTakePhoto}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.buttonText}>Chụp ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.libraryButton]}
                onPress={requestPhotoPermission}>
                <Ionicons name="image" size={20} color="#fff" />
                <Text style={styles.buttonText}>Chọn ảnh</Text>
              </TouchableOpacity>
            </View>
          </View>
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
      <LoadingFullScreen loading={loading} />
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
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
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

  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#bbb',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  libraryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },

});
