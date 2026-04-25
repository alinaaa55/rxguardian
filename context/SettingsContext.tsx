import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

interface SettingsContextType {
  elderlyMode: boolean;
  voiceReminders: boolean;
  notificationsEnabled: boolean;
  toggleElderlyMode: () => void;
  toggleVoiceReminders: () => void;
  toggleNotifications: () => void;
  fontSizeMultiplier: number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elderlyMode, setElderlyMode] = useState(false);
  const [voiceReminders, setVoiceReminders] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const savedElderly = await storage.getItem('elderlyMode');
      const savedVoice = await storage.getItem('voiceReminders');
      const savedNotifs = await storage.getItem('notificationsEnabled');
      if (savedElderly !== null) setElderlyMode(JSON.parse(savedElderly));
      if (savedVoice !== null) setVoiceReminders(JSON.parse(savedVoice));
      if (savedNotifs !== null) setNotificationsEnabled(JSON.parse(savedNotifs));
    };
    loadSettings();
  }, []);

  const toggleElderlyMode = () => {
    const newVal = !elderlyMode;
    setElderlyMode(newVal);
    storage.setItem('elderlyMode', JSON.stringify(newVal));
  };

  const toggleVoiceReminders = () => {
    const newVal = !voiceReminders;
    setVoiceReminders(newVal);
    storage.setItem('voiceReminders', JSON.stringify(newVal));
  };

  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    storage.setItem('notificationsEnabled', JSON.stringify(newVal));
  };

  const fontSizeMultiplier = elderlyMode ? 1.3 : 1;

  return (
    <SettingsContext.Provider
      value={{
        elderlyMode,
        voiceReminders,
        notificationsEnabled,
        toggleElderlyMode,
        toggleVoiceReminders,
        toggleNotifications,
        fontSizeMultiplier,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
