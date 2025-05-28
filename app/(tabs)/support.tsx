import React, { useState, useEffect } from 'react';
import { 
  ImageBackground, Text, View, TextInput, TouchableOpacity, 
  Keyboard, TouchableWithoutFeedback 
} from 'react-native';
import { styles } from "../../styles/support";
import BackendServiceSingleton from "../../services/BackendServiceSingleton";

const Support = () => {
  // State for inputs
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const backendService = BackendServiceSingleton.getInstance();
    if (!backendService.isConnected()) {
      backendService.createConnection(); // No location arguments
    }
  }, []);

  // Function to handle send
  const handleSend = async () => {
    const backendService = BackendServiceSingleton.getInstance();
    try {
      await backendService.sendFeedback(email, message);
      // Optionally show a success message
    } catch (err) {
      console.error("Error sending feedback:", err);
      // Optionally show an error message
    }
    // Clear inputs
    setEmail('');
    setMessage('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground source={require('../../assets/images/bus_bg1.png')} style={styles.bgImg}>
        <View>
          <Text style={styles.title}>How can we help?</Text>

          <View style={styles.inputContainer}>
            <Text>Enter your e-mail to receive an answer</Text>
            <TextInput 
              style={styles.emailInput} 
              placeholder="your@email.here" 
              keyboardType="email-address" 
              placeholderTextColor="#888" 
              maxLength={40}
              value={email} 
              onChangeText={setEmail} // Update state
            />
          
            <Text style={{marginTop: 30}}>Write down your message here!</Text>
            <TextInput 
              style={styles.input} 
              placeholder="I suggest you to..." 
              multiline 
              placeholderTextColor="#888" 
              maxLength={500}
              value={message} 
              onChangeText={setMessage} // Update state
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSend}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default Support;