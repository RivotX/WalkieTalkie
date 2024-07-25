//Client/app/(tabs)/Contacts.jsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { Ionicons } from '@expo/vector-icons';
import ChatComponent from '../../components/ChatComponent';
import UwUIcon from '../../assets/images/adaptive-icon.png';
import emoGirlIcon from '../../assets/images/emoGirlIcon.png';
import { MicProvider } from '../../components/context/MicContext';

export default function TabTwoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const navigation = useNavigation(); // Use the useNavigation hook
  const user1 = {
    name: "CharoHot",
    profile: emoGirlIcon
  }
  const user2 = {
    name: "Geyson UwU :3",
    profile: UwUIcon

  }
  const user3 = {
    name: "VaaamoChangua ",
  }
  return (
    <View style={tw`flex-1 items-center  bg-[${backgroundColor}]`}>
      <MicProvider>
        <ChatComponent user={user1} onPress={() => navigation.navigate('ChatRoom', { user: user1 })} icon='mic' />
        <ChatComponent user={user2} onPress={() => navigation.navigate('ChatRoom', { user: user2 })} icon='mic' />
        <ChatComponent user={user3} onPress={() => navigation.navigate('ChatRoom', { user: user3 })} icon='mic' />
      </MicProvider>

      {/* Añadir contacto */}
      <TouchableOpacity onPress={() => navigation.navigate('AddContactsScreen')} style={tw`absolute bottom-12 right-5 px-4 py-2 bg-blue-500 rounded-full`}>
        <Ionicons name="person-add-outline" size={24} color={"white"} />
      </TouchableOpacity>
    </View>
  );
}


