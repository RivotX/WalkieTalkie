//Client/app/(tabs)/_layout.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import RecentsScreen from './index';
import ContactsScreen from './Contacts';
import GroupsScreen from './Groups';
import { Ionicons } from '@expo/vector-icons';
import GroupIcon from '../../assets/GroupIcon';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useEffect, useState } from 'react';
import { SocketProvider } from '../../components/context/SocketContext';
import io from 'socket.io-client';
import axios from 'axios';
import getEnvVars from '../../config';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const [socket, setSocket] = useState(null); // Estado para manejar la instancia del socket
  const { SERVER_URL, SOCKET_URL } = getEnvVars();

  useEffect(() => {
    let newsocket;
    axios.get(`http://localhost:3000/getsession`,{ withCredentials: true })
    // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        console.log("SESSIONES", res.data);
        newsocket = io(SOCKET_URL, { query: { groups: res.data.user.groups } });
        setSocket(newsocket);
      })
      .catch((error) => { console.log(error) });

    return () => {
      newsocket.disconnect();
    };
  }, []);
  return (
    <>
      {socket !== null &&
        <SocketProvider socket={socket}>
          <Tab.Navigator tabBarPosition='bottom' screenOptions={{
            tabBarStyle: { backgroundColor: SoftbackgroundColor },
          }}
          >
            <Tab.Screen name="Recents" component={RecentsScreen}
              options={{
                tabBarLabel: () => (
                  <View style={tw`items-center justify-center`}>
                    <Ionicons name="time" size={24} color={textColor} />
                    <Text style={tw`text-center text-[${textColor}]`}>Recents</Text>
                  </View>
                ),
              }}
            />
            <Tab.Screen name="Contacts" component={ContactsScreen}
              options={{
                tabBarLabel: () => (
                  <View style={tw`items-center justify-center`}>
                    <Ionicons name="person" size={24} color={textColor} />
                    <Text style={tw`text-center text-[${textColor}]`}>Contacts</Text>
                  </View>
                ),
              }}
            />
            <Tab.Screen name="Group" component={GroupsScreen}
              options={{
                tabBarLabel: () => (
                  <View style={tw`items-center justify-center`}>
                    <GroupIcon fill={textColor} />
                    <Text style={tw`text-center text-[${textColor}]`}>Groups</Text>
                  </View>
                ),
              }}
            />
          </Tab.Navigator>
        </SocketProvider>}
    </>
  );
}