import React, { useContext, useState } from 'react';
import { 
  View, Text, TouchableOpacity, Image, ImageBackground, Platform, Modal 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from "../../styles/index"
import { LanguageContext } from '../context/LanguageContext';
import type { LanguageKey } from '../context/LanguageContext';

type Translations = {
  [key in LanguageKey]: {
    welcome: string;
    howToUse: string;
  };
};

const translations: Translations = {
  en: { welcome: 'Welcome to\nProjectName!', howToUse: 'How to use?'},
  ru: { welcome: 'Добро пожаловать\n в ProjectName!', howToUse: 'Как использовать?'},
  hy: { welcome: 'Բարի գալուստ\nProjectName!', howToUse: 'Ինչպե՞ս օգտվել'},
};

const flags = {
  en: require('../../assets/images/flag-en.png'),
  ru: require('../../assets/images/flag-ru.png'),
  hy: require('../../assets/images/flag-hy.png'),
};

const Settings = () => {
  const context = useContext(LanguageContext);
  const [isPickerVisible, setPickerVisible] = useState(false);

  if (!context) {
    throw new Error('LanguageContext must be used within a LanguageProvider');
  }

  const { language, changeLanguage } = context;

  return (
    <ImageBackground source={require("../../assets/images/bus_bg1.png")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>{translations[language].welcome}</Text>

        {/* Language Selection */}
        <View style={styles.optionRow}>
          <Image source={require('../../assets/images/globe.png')} style={styles.icon} />
          <TouchableOpacity 
            style={styles.langbutton} 
            onPress={() => Platform.OS === 'ios' ? setPickerVisible(true) : null}
          >
            <Image source={flags[language]} style={styles.icon} />
            {Platform.OS === 'ios' ? (
              <Text style={styles.buttonText}>
                {language === 'en' ? 'English' : language === 'ru' ? 'Русский' : 'Հայերեն'}
              </Text>
            ) : (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={language}
                  style={styles.picker}
                  onValueChange={(itemValue) => changeLanguage(itemValue as LanguageKey)}
                  mode="dropdown"
                >
                  <Picker.Item label="English" value="en" color="black" />
                  <Picker.Item label="Русский" value="ru" color="black" />
                  <Picker.Item label="Հայերեն" value="hy" color="black" />

                </Picker>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* iOS Picker Modal */}
        {Platform.OS === 'ios' && (
          <Modal visible={isPickerVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity>
                <Picker
                    selectedValue={language}
                    onValueChange={(itemValue) => {
                      changeLanguage(itemValue as LanguageKey);
                      setPickerVisible(false);
                    }}
                    style={styles.pickerios}
                  >
                    <Picker.Item label="English" value="en" color="black" />
                    <Picker.Item label="Русский" value="ru" color="black" />
                    <Picker.Item label="Հայերեն" value="hy" color="black" />

                  </Picker>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setPickerVisible(false)}>
                  <Text style={styles.closeModal}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* How to Use */}
        <View style={styles.optionRow}>
          <Image source={require('../../assets/images/question.png')} style={styles.icon} />
          <TouchableOpacity style={styles.howbutton}>
            <Text style={styles.buttonText}>{translations[language].howToUse}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Settings;