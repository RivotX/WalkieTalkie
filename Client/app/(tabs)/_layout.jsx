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

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const SoftbackgroundColor = useThemeColor({}, 'Softbackground');
  const textColor = useThemeColor({}, 'text');
  return (
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
  );
}