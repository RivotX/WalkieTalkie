//Client/app/(tabs)/AddContactsScreen.jsx
import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { useRoute } from '@react-navigation/native';
import { useThemeColor } from '../hooks/useThemeColor';
import AudioComponent from '../components/AudioComponent';

export default function ChatRoom() {
  const backgroundColor = useThemeColor({}, 'background');
  const route = useRoute();
  const { userName } = route.params;

  return (
    <View style={tw`flex-1 bg-[${backgroundColor}] items-center justify-center`}>
      <AudioComponent />
    </View>
  );
}