//Client/app/(tabs)/Groups.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../components/context/SocketContext';


export default function TabTwoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const navigation = useNavigation(); // Use the useNavigation hook
  const [socket, setSocket] = useState(useSocket()); // Estado para manejar la instancia del socket

  useEffect(() => {
    console.log(socket, 'socket ANTESSSSSSSSSSSSSS');
    if (socket != null) {
      console.log(socket);
    }
  },[]);

  return (
    <View style={tw`flex-1 items-center justify-center bg-[${backgroundColor}]`}>
      <Text style={tw`text-[${textColor}] mb-5 font-bold`}>Groups</Text>
      {/* Añadir grupos */}
      <TouchableOpacity onPress={() => navigation.navigate('AddGroupsScreen')} style={tw`absolute bottom-12 right-5 px-4 py-2 bg-blue-500 rounded-full`}>
        <Ionicons name="person-add-outline" size={24} color={"white"} />
      </TouchableOpacity>
    </View>
  );
}


