import { Tabs } from 'expo-router';
import React, { useContext } from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { LanguageProvider, LanguageContext } from '../context/LanguageContext';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const translations = {
  en: { settings: 'Settings', map: 'Map', support: 'Support' },
  ru: { settings: 'Настройки', map: 'Карта', support: 'Поддержка' },
  hy: { settings: 'Կարգավորումներ', map: 'Քարտեզ', support: 'Կապ' },
};

function TabLayout() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('LanguageContext must be used within a LanguageProvider');
  }

  const { language } = context;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#D9D9D9',
          height: SCREEN_HEIGHT * 0.13,
        },
        headerTitle: () => (
          <View style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 10, color: '#757575' }}>Project Name</Text>
            <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>
              {route.name === 'index' ? translations[language]?.settings :
               route.name === 'map' ? translations[language]?.map :
               route.name === 'support' ? translations[language]?.support : ''}
            </Text>
          </View>
        ),
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: 'transparent',
          height: SCREEN_HEIGHT * 0.09,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 15,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: translations[language]?.settings || 'Settings',
          tabBarIcon: () => <Feather name="settings" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: translations[language]?.map || 'Map',
          tabBarIcon: () => <Feather name="map-pin" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: translations[language]?.support || 'Support',
          tabBarIcon: () => <MaterialIcons name="support-agent" size={24} color="black" />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <TabLayout />
    </LanguageProvider>
  );
}