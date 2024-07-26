//FirstScreen
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

const FirstScreen = ({ SetFirstScreen, SetLoginScreenState }) => {

  const GoLoginScreen = (register) => {
    SetFirstScreen(false);
    SetLoginScreenState(!register);
    console.log('FirstScreen --> SetLoginScreenState', !register);
  };

  return (
    <View style={tw`flex-1 w-full items-center justify-center bg-red-500`}>
      <Text style={tw`text-2xl text-white`}>First Screen</Text>
      <TouchableOpacity style={tw`bg-blue-500 p-2 mt-5`} onPress={() => GoLoginScreen(false)}>
        <Text style={tw`text-white`}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={tw`bg-blue-500 p-2 mt-5`} onPress={() => GoLoginScreen(true)}>
        <Text style={tw`text-white`}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FirstScreen;