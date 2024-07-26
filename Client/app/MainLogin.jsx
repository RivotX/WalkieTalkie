//Main Login
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';
import FirstScreen from '../components/Login/FirstScreen';
import LoginRegister from '../components/Login/LoginRegister';
import { useThemeColor } from '../hooks/useThemeColor';

const MainLogin = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const [firstScreen, setFirstScreen] = useState(true);
  const [loginScreen, setLoginScreen] = useState(false);

  const handleSetFirstScreen = (value) => {
    setFirstScreen(value);
  };
  const SetLoginScreenState = (value) => {
    setLoginScreen(value);
    console.log('MainLogin--> SetLoginScreen', value);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 items-center justify-center bg-[${backgroundColor}]`}>
        {firstScreen ? (
          <FirstScreen
            SetFirstScreen={handleSetFirstScreen}
            SetLoginScreenState={SetLoginScreenState}
          />
        ) : (
          <LoginRegister LoginScreen={loginScreen} />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default MainLogin;