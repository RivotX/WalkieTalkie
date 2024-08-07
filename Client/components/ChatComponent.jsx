import { Text, TouchableOpacity, View, Vibration, Animated } from "react-native";
import tw from 'twrnc';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { useMic } from '.././components/context/MicContext';
import UserProfileModal from './modals/UserProfileModal';

const ChatComponent = ({ user, onPress, icon, onAdd }) => {
  const textColor = useThemeColor({}, 'text');
  const [micColor, setMicColor] = useState(textColor);
  const { activeMic, setActiveMic } = useMic();
  const iconScale = useRef(new Animated.Value(1)).current; // Initial scale
  const [iconSize, seticonSize] = useState(24);
  const [modalIconVisible, setModalIconVisible] = useState(false);

  const toggleMIC = () => {
    if (activeMic === user.name) {
      seticonSize(24);
      setActiveMic(null);
      setMicColor(textColor);
      stopPulsing();
    } else {
      seticonSize(42);
      setActiveMic(user.name);
      setMicColor('red');
      startPulsing();
    }
    Vibration.vibrate(200);
  };

  const startPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulsing = () => {
    iconScale.setValue(1); // Reset scale to default
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).stop();
  };

  useEffect(() => {
    if (activeMic === user.name) {
      setMicColor('red');
      startPulsing();
    } else {
      setMicColor(textColor);
      stopPulsing();
    }
  }, [activeMic, user.name, textColor]);

  return (
    <TouchableOpacity onPress={onPress} style={tw`p-2 flex flex-row w-full max-w-[700px] justify-center items-center`}>
      <UserProfileModal
        user={user}
        modalIconVisible={modalIconVisible}
        setModalIconVisible={setModalIconVisible}
        iconSize={14}
      />
      <View style={tw`flex-1 flex-row items-center`}>
        <View style={tw`flex-1 flex-row items-center justify-between`}>
          <View style={tw`ml-3`}>
            <Text style={[{ fontSize: 16 }, tw`font-bold text-[${textColor}]`]}>{user.name}</Text>
            <Text style={tw`text-gray-400`}>Last time: "2 days ago"</Text>
          </View>
          <View style={tw``}>
            {icon == 'mic' ? (
              <TouchableOpacity onPress={toggleMIC} style={tw`px-5`}>
                <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                  <Ionicons name="mic" size={iconSize} color={micColor} />
                </Animated.View>
              </TouchableOpacity>
            ) :
              <TouchableOpacity style={tw`px-5`} onPress={onAdd}>
                <Ionicons name="person-add" size={22} color={textColor} />
              </TouchableOpacity>
            }
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatComponent;