//Client/app/(tabs)/AddGroupsScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';

export default function AddGroupsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  const inputRef = useRef(null); // Create a ref for the TextInput

  useEffect(() => {
    // Automatically focus the TextInput when the screen is loaded
    inputRef.current?.focus();
  }, []);

  const [text, setText] = useState(''); // Step 1: State for tracking text input

  return (
    <View style={tw`flex-1 bg-[${backgroundColor}]`}>
      {/* Top Bar */}
      <View style={tw`w-full h-16 bg-[${SoftbackgroundColor}] flex items-center`}>
        <View style={tw`w-4/5 flex-row items-center`}>
          <TextInput
            style={tw`h-10 w-11/12 my-3 border-b border-gray-400 px-2 text-[${textColor}]`}
            placeholderTextColor='#9ca3af'
            placeholder='Busca por nombre de grupo'
            autoFocus={true}
            value={text}
            onChangeText={setText}
          />
          {/* Renderizado condicional para el boton "X" */}
          {text.length > 0 && (
            <TouchableOpacity onPress={() => setText('')} style={tw`ml-2 p-2 w-1/12`}>
              <Text style={tw`text-lg text-[${textColor}]`}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Main Content */}
      <View style={tw`flex-1 items-center justify-center`}>
      </View>
    </View>
  );
}