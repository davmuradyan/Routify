import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export type LanguageKey = 'en' | 'ru' | 'hy';

interface LanguageContextType {
  language: LanguageKey;
  changeLanguage: (lang: LanguageKey) => void;
}

const translations = {
  en: { settings: 'Settings', map: 'Map', support: 'Support' },
  ru: { settings: 'Настройки', map: 'Карта', support: 'Поддержка' },
  hy: { settings: 'Կարգավորումներ', map: 'Քարտեզ', support: 'Աջակցություն' },
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultLanguage: LanguageKey = 'en';
  const [language, setLanguage] = useState<LanguageKey>(defaultLanguage);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('language');
        if (storedLang && Object.keys(translations).includes(storedLang)) {
          setLanguage(storedLang as LanguageKey);
        }
      } catch (error) {
        console.error("Error loading language:", error);
      }
    };
    loadLanguage();
  }, []);
  

  const changeLanguage = async (lang: LanguageKey) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguage(lang);  // This triggers a re-render
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };
  

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};