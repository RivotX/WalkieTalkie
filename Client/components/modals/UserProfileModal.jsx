// UserProfileModal.jsx
import React from 'react';
import { View, TouchableOpacity, Modal, Image, Text } from 'react-native';
import tw from 'twrnc';
import ProfileIcon from '../../assets/images/ProfileIcon.png';
const UserProfileModal = ({ user, modalIconVisible, setModalIconVisible, iconSize }) => {
  return (
    <>
      <TouchableOpacity onPress={() => setModalIconVisible(true)}>
        <View style={tw`h-[${iconSize}] w-[${iconSize}] rounded-full`}>
          <Image
            style={[tw`rounded-full`, { width: '100%', height: '100%' }]}
            source={user.profile ? user.profile : ProfileIcon}
          />
        </View>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalIconVisible}
        onRequestClose={() => setModalIconVisible(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 pt-[20%] items-center bg-black bg-opacity-80`}
          activeOpacity={1}
          onPress={() => setModalIconVisible(false)}
        >
          <Image
            style={{ width: 300, height: 300, resizeMode: 'contain' }}
            source={user.profile ? user.profile : ProfileIcon}
          />
          <Text style={tw`text-white text-lg font-bold text-center mt-1`}>{user.name}</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default UserProfileModal;