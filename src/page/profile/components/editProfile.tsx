import React from 'react';
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


const EditProfile = () => {
  const navigation = useNavigation<any>();
  const dataProfile = useRecoilValue(ProfileState).data;
  const onGoBack = () => {
    navigation.goBack();
  };
  console.log("dataProfile", dataProfile);

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
            <Image
              source={
                dataProfile?.avatar
                  ? { uri: configImageURL(dataProfile?.avatar) }
                  :
                  require('../../../assets/images/myAvatar.png')
              }
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.name}>{dataProfile.fullName}</Text>
              <Text style={styles.className}>{dataProfile.majorName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên</Text>
            <Text style={[styles.value, styles.linkColor]}>{dataProfile.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={[styles.value, styles.linkColor]}>{dataProfile.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>SĐT</Text>
            <Text style={[styles.value, styles.linkColor]}>{dataProfile.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái</Text>
            <Text style={styles.value}>Hoạt động</Text>
          </View>
          {
            dataProfile.role == "child"
            && <View style={styles.infoRow}>
              <Text style={styles.label}>Điểm</Text>
              <Text style={styles.value}>{dataProfile.points}</Text>
            </View>
          }
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
