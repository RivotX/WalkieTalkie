//Client/app/_layout.jsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import tw from 'twrnc';
import { Image, View, Text, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import ProfileIcon from '../assets/images/ProfileIcon.png';
import MainLogin from './MainLogin';
import ConfigIcon from '../components/ConfigIcon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColor } from '../hooks/useThemeColor';
import UserProfileModal from '../components/modals/UserProfileModal';
import getEnvVars from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io, { Socket } from 'socket.io-client';
import { SocketProvider } from '../components/context/SocketContext';


export default function RootLayout() {
  const [modalIconVisible, setModalIconVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false) //cambialo para probar el login
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const [username, setUsername] = useState('username');

  SetLayoutLogged = (value) => {
    setIsLoggedIn(value)
  };

  // Controla si la sesión esta logeada
  useEffect(() => {
    checkLoginStatus()
  }, []);

  const checkLoginStatus = async () => {
    const loggedIn = await AsyncStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedIn === 'true');

  };

  const { SERVER_URL } = getEnvVars();
  const { SOCKET_URL } = getEnvVars();
  useEffect(() => {
    axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
      // axios.get(`${SERVER_URL}/getsession`, { withCredentials: true })
      .then((res) => {
        setUsername(res.data.user.username)
      })
      .catch((error) => { console.log(error) });
  }, [isLoggedIn])

  // logout
  const handleLogout = async () => {

    axios.post(`${SERVER_URL}/logout`)
      .then((response) => {
        AsyncStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };


  const [socket, setSocket] = useState(null); // Estado para manejar la instancia del socket

  useEffect(() => {
    if (isLoggedIn) {
      let newsocket;
      axios.get(`http://localhost:3000/getsession`, { withCredentials: true })
        .then((res) => {
          newsocket = io(SOCKET_URL, { query: { groups: res.data.user.groups, username: res.data.user.username } });
          setSocket(newsocket);
        })
        .catch((error) => { console.log(error) });
      
      return () => {
        console.log('Desconectando socket LAYOUT');
        if (socket != null) {
        socket.disconnect();
        }
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {

    console.log("SOCKET DE LA CONEXION EN EL LAYOUT", socket)
  } ,[socket]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {console.log("comprobarrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr logeado: ", isLoggedIn, socket)}
        {isLoggedIn && socket != null ? (
          <SocketProvider socket={socket}>
            <Stack screenOptions={{ animation: 'slide_from_right', }} >
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerLeft: () => (
                    <View style={tw`flex-row items-center `}>
                      <Image source={ProfileIcon} style={tw`w-8 h-8 mr-2`} />
                      <Text style={tw`text-base font-semibold text-[${textColor}]`}>{username} </Text>
                    </View>
                  ),
                  headerRight: () => {
                    return (
                      <>
                        <TouchableOpacity onPress={handleLogout} style={tw`mr-2`}>
                          <Text style={tw`text-[${textColor}]`}>Logout(desplegable config)</Text>
                        </TouchableOpacity>
                        <ConfigIcon />

                      </>
                    );
                  },
                  headerTitle: '',
                  headerTitleAlign: 'center',
                  headerStyle: tw`bg-[${SoftbackgroundColor}]`,
                }}
              />
              <Stack.Screen
                name="AddContactsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor, // Dark background color for the header
                  },
                  headerTintColor: textColor,
                  headerTitle: 'Add Contacts',
                }}
              />
              <Stack.Screen
                name="AddGroupsScreen"
                options={{
                  headerStyle: {
                    backgroundColor: SoftbackgroundColor, // Dark background color for the header
                  },
                  headerTintColor: textColor,
                  headerTitle: 'Add Groups',
                }}
              />
              <Stack.Screen
                name="ChatRoom"
                options={({ route }) => {
                  const user = route.params.user; // Correctly access the user object from route params
                  return {
                    headerStyle: {
                      backgroundColor: SoftbackgroundColor,
                    },
                    headerTintColor: textColor,
                    headerTitle: () => (
                      <TouchableOpacity onPress={() => setModalIconVisible(true)} style={tw`w-full`}>
                        <View style={tw`flex-1 flex-row justify-start items-center w-full`}>
                          <UserProfileModal
                            user={user}
                            modalIconVisible={modalIconVisible}
                            setModalIconVisible={setModalIconVisible}
                            iconSize={12}
                          />
                          <Text style={tw`text-[${textColor}] font-bold text-lg ml-3`}>
                            {user.name || 'Chat Room'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ),
                    headerLeft: () => (
                      <View style={{ marginLeft: -50 }} />
                    ),
                  };
                }}
              />
            </Stack >
          </SocketProvider>
        ) : (
          // If not logged in, show the LoginScreen without navigation
          <MainLogin SetLayoutLogged={SetLayoutLogged} />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}