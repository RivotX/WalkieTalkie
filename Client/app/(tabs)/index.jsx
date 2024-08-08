//Client/app/(tabs)/index.jsx
import { View, Text } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import tw from 'twrnc';
import AudioComponent from '../../components/AudioComponent';
import { useThemeColor } from '../../hooks/useThemeColor';
import axios from 'axios';
import getEnvVars from '../../config';
import { useSocket } from '../../components/context/SocketContext';

const Index = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [currentRoom, setCurrentRoom] = useState(null);
  const rooms = ['room1', 'room2', 'room3', 'room4', 'room5'];
  const [userID, setUserID] = useState();
  const { SERVER_URL } = getEnvVars();
  const [socket, setSocket] = useState(useSocket());



  useEffect(() => {
    if (socket != null) {
          console.log(socket, 'socket EN INDEX');
      axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
        // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
        .then((res) => { setUserID(res.data.user.id) })
        .catch((error) => { console.log(error) });
      socket.on('receive_request', (data) => {
        console.log('Solicitud recibida de:', data.senderId);
      });
      return () => {
        console.log('Desconectando socket INDEX');
        socket.disconnect();
      };
    }
  }, [])

  


  return (
    <View style={tw`flex-1 items-center justify-center bg-[${backgroundColor}]`}>
      <View>
        <Text style={tw`text-[${textColor}] text-2xl font-bold`}>Bienvenido {userID} </Text>
        <Text style={tw`text-[${textColor}] text-2xl font-bold`}>Salas</Text>
        <View style={tw`flex flex-col items-center `}>
          {rooms.map((room, index) => (
            <TouchableOpacity key={index} onPress={() => setCurrentRoom(room)} style={tw`mt-2 bg-slate-700 rounded-full p-2 `}>
              <Text style={tw`text-[${textColor}]`}>Ir a {room}</Text>
            </TouchableOpacity>
          ))
          }
        </View>
        <Text style={tw`text-[${textColor}] mb-5`}>Sala {currentRoom} </Text>
        <AudioComponent currentRoom={currentRoom} userID={userID} />
      </View>
    </View>
  );
}

export default Index;