//Client/app/(tabs)/AddContactsScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useThemeColor } from "../hooks/useThemeColor";
import axios from "axios";
import ChatComponent from "../components/ChatComponent";
import { MicProvider } from "../components/context/MicContext";
import emoGirlIcon from "../assets/images/emoGirlIcon.png";
import getEnvVars from "../config";

export default function AddContactsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const SoftbackgroundColor = useThemeColor({}, "Softbackground");
  const textColor = useThemeColor({}, "text");
  const inputRef = useRef(null); // Create a ref for the TextInput
  const [text, setText] = useState(""); // Step 1: State for tracking text input
  const [userFound, setUserFound] = useState(undefined); // Step 2: State to track if user is found
  const [users, setUsers] = useState([
    {
      name: "",
      profile: emoGirlIcon,
    },
  ]);

  const { SERVER_URL } = getEnvVars();
  const onSearchUser = () => {
    axios.post(`${SERVER_URL}/searchUser`, { username: text })
      .then((res) => {
        console.log(res.data);
        const usersData = res.data.map((user) => ({
          name: user.username,
          profile: user.image ? { uri: user.image } : emoGirlIcon,
        }));
        setUsers(usersData);
        setUserFound(true);
      })
      .catch((err) => {
        console.error(err);
        setUsers([]);
        setUserFound(false);
      });
  };

  useEffect(() => {
    // Automatically focus the TextInput when the screen is loaded
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    console.log(userFound);
  }, [userFound]);

  // Solicitud de amistad
  const addUser = (senderId, receiverId) => {
    console.log("addUser",'senderID: ', senderId, 'receiverId: ', receiverId);
    axios.post(`${SERVER_URL}/send-friend-request`, { senderId, receiverId })
    // axios.post(`http://localhost:3000/send-friend-request`, { username })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <View style={tw`flex-1 bg-[${backgroundColor}]`}>
      {/* Top Bar */}
      <View
        style={tw`w-full h-16 bg-[${SoftbackgroundColor}] flex items-center`}
      >
        <View style={tw`w-4/5 flex-row items-center`}>
          <TextInput
            style={tw`h-10 w-11/12 my-3 border-b border-gray-400 px-2 text-[${textColor}]`}
            placeholderTextColor="#9ca3af"
            placeholder="Busca por nombre de usuario o teléfono"
            autoFocus={true}
            value={text}
            onChangeText={(e) => {
              setText(e);
              setUserFound(undefined);
            }}
            onSubmitEditing={onSearchUser}
          />
          {/* Renderizado condicional para el boton "X" */}
          {text.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setText("");
                setUserFound(undefined);
              }}
              style={tw`ml-2 p-2 w-1/12`}
            >
              <Text style={tw`text-lg text-[${textColor}]`}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Main Content */}
      <View style={tw`flex-1 items-center`}>
        {userFound &&
          users.map((user, index) => (
            <MicProvider key={index}>
              <ChatComponent
                user={user}
                onAdd={() => { addUser('rivotx', user.name); }}
                icon="+"
              />
            </MicProvider>
          ))}
        {userFound == false && (
          <Text style={tw`text-[${textColor}]`}>
            No se encontraron usuarios
          </Text>
        )}
      </View>
    </View>
  );
}
