import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

export default function TabBarBackground() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: Dimensions.get('window').height * 0.1, // 10% of screen height
    backgroundColor: '#FFF0B4', // Your desired color
  },
});
