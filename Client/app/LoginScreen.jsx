//Client/app/LoginScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getEnvVars from '../config';

WebBrowser.maybeCompleteAuthSession();

const webClientId = "918481238590-vu5ui1gpmjphu3djas8mtk9qqbc5er2m.apps.googleusercontent.com";
const androidClientId = "918481238590-bv2fdn6pvi18g7imgghfu9b8s4scclbo.apps.googleusercontent.com";

const LoginScreen = ({ SetLayoutLogged }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [Confpassword, setConfPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const [LogSign, setLogSign] = useState(true);
  const [badLogin, setBadLogin] = useState(false);
  const [badLoginMsg, setBadLoginMsg] = useState('');

  const [formError, setFormError] = useState('');


  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId,
    androidClientId,
    // iosClientId, // Si tienes un ID de cliente para iOS, agrégalo aquí
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      console.log('ID Token:', id_token);
    }
  }, [response]);

  // Validar campos de registro
  const validateForm = () => {
    // Email validation

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    // Password validation
    if (password !== Confpassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if ((password.length > 0 && password.length < 8) || (Confpassword.length > 0 && Confpassword.length < 8)) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    setFormError('');
  };

  useEffect(() => {
    if (!LogSign) {
      validateForm();
    }
  }, [email, password, Confpassword, LogSign]);

  //sumbit de login o registro
  const { SERVER_URL } = getEnvVars();
  const handleSumbit = () => {
    if (LogSign) {
      if (username.trim().length === 0 || password.trim().length === 0) {
        setBadLogin(true);
        setBadLoginMsg('Please enter both your username and password.');
        return;
      }
      axios.post(SERVER_URL + '/login', { username, password })
      axios.post('/login', { username, password })
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            AsyncStorage.setItem('isLoggedIn', 'true')
              .then(() => {
                SetLayoutLogged(true);
              }).catch((error) => {
                console.error("Failed to save isLoggedIn status", error);
              });
          } else {
            console.log('res ' + res);
          }
        }).catch((err) => {
          console.log(err);
          if (err.response && err.response.status === 401) {
            setBadLogin(true);
            setBadLoginMsg('Incorrect username or password');
          }
        });
    } else {
      if (username.trim().length === 0) {
        setFormError('Username cannot be empty.');
        return;
      }
      else if (password.trim().length === 0 || Confpassword.trim().length === 0) {
        setFormError('Password cannot be empty.');
        return;
      }
      else if (email.trim().length === 0) {
        setFormError('Email cannot be empty.');
        return;
      }
      if (formError === '') {
        axios.post(SERVER_URL + '/create-user', { username, password, email })
          .then((res) => {
            setLogSign(true);
          }).catch((err) => {
            console.log(err);
            // Handle registration errors (e.g., duplicate email) here
          });
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={tw`flex-1 items-center justify-center bg-[${[backgroundColor]}]`}>
        <Text style={tw`text-xl mb-10 font-bold text-[${textColor}]`}>{LogSign ? "Log in" : "Register"}</Text>

        {/* UserName */}
        <TextInput
          style={tw`h-10 my-3 border-b border-gray-400 w-4/5 px-2 text-[${textColor}]`}
          onChangeText={setUsername}
          value={username}
          placeholder="Username"
          placeholderTextColor={textColor}
        />

        {/* Email */}
        {!LogSign && (
          <>
            <TextInput
              style={tw`h-10 my-3 border-b border-gray-400 w-4/5 px-2 text-[${textColor}]`}
              onChangeText={(text) => { setEmail(text); }}
              value={email}
              placeholder="Email"
              placeholderTextColor={textColor}
              keyboardType="email-address"
            />
            {emailError && <Text style={tw`text-red-600 text-sm pl-3`}>User name or password incorrect</Text>}
          </>
        )}

        {/* Password */}
        <TextInput
          style={tw`h-10 my-3 border-b border-gray-400 w-4/5 px-2 text-[${textColor}]`}
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="Password"
          placeholderTextColor={textColor}
          secureTextEntry
        />
        {badLogin && <Text style={tw`text-red-500`}>{badLoginMsg}</Text>}

        { /* Confirm Password */}
        {!LogSign &&
          <>
            <TextInput
              style={tw`h-10 my-3 border-b border-gray-400 w-4/5 px-2 text-[${textColor}]`}
              onChangeText={(text) => setConfPassword(text)}
              value={Confpassword}
              placeholder="Confirm Password"
              placeholderTextColor={textColor}
              secureTextEntry
            />
            {formError ? <Text style={tw`text-red-500`}>{formError}</Text> : null}
          </>
        }

        {/* Sumbit Button */}
        <TouchableOpacity style={tw`bg-blue-500 py-3 mt-4 rounded-lg w-1/2 text-${[textColor]}`} onPress={handleSumbit}>
          <Text style={tw`text-[white] text-center`}>
            {LogSign ? "Log in" : "Register"}
          </Text>
        </TouchableOpacity>

        {/* Google Login Button */}
        <TouchableOpacity
          style={tw`bg-blue-300 py-3 mt-4 rounded-lg w-1/2 text-${textColor}`}
          onPress={() => { promptAsync(); }}>
          <Text style={tw`text-[white] text-center`}>Use your Google account</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity style={tw`mt-5`} >
          <Text style={tw`text-gray-500`}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Log in or Sign up */}
        <TouchableOpacity style={tw`mt-2`}>
          <Text style={tw`text-blue-500`} onPress={() => { setLogSign(!LogSign); setBadLogin(false); setFormError(''); }}>
            {LogSign ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default LoginScreen;