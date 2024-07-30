import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, } from 'react-native';
import tw from 'twrnc';
import { Audio } from 'expo-av';
import { FontAwesome5 } from '@expo/vector-icons'; // Assuming usage of Expo vector icons for simplicity
import getEnvVars from '../config';
import io from 'socket.io-client';
import axios from 'axios';

const { SOCKET_URL } = getEnvVars();
let socket=io(SOCKET_URL);
const AudioComponent = ({ currentRoom, userID }) => {
  // Estados 
  const [recording, setRecording] = useState();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [groups, setGroups] = useState("");
  // Cuando el componente se monta, pide permisos de audio
  useEffect(() => {
    
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionStatus(status === 'granted'); // Actualiza los permisos (true o false)
    })();
    console.log('entro a audio component');
    
  }, [currentRoom]);

  useEffect(() => {
    axios.get(`http://localhost:3000/getsession`,{ withCredentials: true })
    .then((res) => {console.log("SESSIONES",res.data); socket=io(SOCKET_URL,{ query : { groups: res.data.user.groups }})})
    .catch((error) => {console.log(error)});
    console.log('entro esta cosa');
  },[]);


  useEffect(() => {
    if (!currentRoom) return;
    socket.emit('join', { currentRoom: currentRoom, userID: userID });
    console.log('user ', userID, ' Joined room ', currentRoom);
  }, [currentRoom]);

  // Funcion para iniciar la grabacion de audio
  const startRecording = async () => {
    if (!permissionStatus) { // Checkea si los permisos fueron otorgados
      console.log('Permissions not granted');
      return;
    }
    try {
      await Audio.setAudioModeAsync({ // Set audio mode for recording
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true, // permite reproducirlo en modo silencio? XD (pruebalo geyson en iphone)
      });
      const { recording } = await Audio.Recording.createAsync( // recording(variable, NO state) = result.recording
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY // Establece la calidad de grabacion (alta calidad)
      );
      setRecording(recording); // Actualiza el estado de grabacion con el objeto recording de antes
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Funcion para detener la grabacion de audio
  const stopRecording = async () => {
    try {
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const audioData = await fetch(uri);
      const audioBlob = await audioData.blob();
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];
        socket.emit('send-audio', base64Audio, currentRoom);

        setRecordedAudio({ uri });
      };
      console.log("stopped recording");
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
    // Actualiza el estado con la URI del audio grabado
  };

  useEffect(() => {
    console.log('Listening for audio data from room', currentRoom);
    socket.on('receive-audio', async (base64Audio, room) => {
      console.log('Received audio data from room', room);
      const uri = `data:audio/wav;base64,${base64Audio}`;
      console.log("audioUri", uri);

      // Play audio using expo-av
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      await sound.setVolumeAsync(1.0); // Ensure volume is set to maximum
      await sound.playAsync();
    });

    return () => {
      socket.off('receive-audio');
    };
  }, []);

  //  Funcion para reproducir el audio grabado 
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: recordedAudio.uri }, // Carga el audio grabado
      { shouldPlay: true } // Empieza a reproducir el audio
    );
    await sound.playAsync(); // Reproduce el audio
  };

  // Presionar grabar / detener audio
  const onPressHandler = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // renderiza UI del componente
  return (
    <View style={tw`flex items-center justify-center`}>
      <View style={tw`flex-row items-center justify-center`}>
        {recordedAudio &&
          (<TouchableOpacity onPress={playSound} disabled={!recordedAudio} style={tw`p-2 mx-2 bg-green-500 rounded-full ${!recordedAudio ? 'bg-gray-300' : ''}`}>
            <FontAwesome5 name="play" size={32} color="white" />
          </TouchableOpacity>)
        }
        <TouchableOpacity onPress={onPressHandler} style={tw`p-[7px] mx-2 ${recording ? 'bg-red-500 h-20 w-20' : 'bg-blue-500'} rounded-full`}>
          <FontAwesome5 name={recording ? "stop-circle" : "microphone"} size={recording ? 64 : 40} color="white" />
        </TouchableOpacity>
      </View>
      {recording && <Text style={tw`mt-4 text-blue-500`}>Grabando...</Text>}
    </View>
  );

};


export default AudioComponent; // Exporta el componente para usarlos en otras partes de la app