import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks/useThemeColor';
import tw from 'twrnc';

export default function ConfigIcon() {
  const textColor = useThemeColor({}, 'text');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
        <Ionicons name="settings-outline" size={24} color={textColor} />
      </TouchableOpacity>

      {modalVisible && (
        <View style={styles.dropdown}>
          {/* Dropdown content here - this could be your select options */}
          <Text style={tw`text-[${textColor}]`}>Select Option</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={tw`text-[${textColor}]`}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    zIndex: -14,
  },
  dropdown: {
    position: 'absolute',
    zIndex: -111,

    right: 0,
    top: 30, // Adjust this value as needed to position the dropdown below the icon
    width: 200, // Set a fixed width for the dropdown
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    // Add shadow or border as needed to distinguish the dropdown
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});