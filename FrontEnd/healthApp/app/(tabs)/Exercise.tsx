import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const Exercise = () => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const exerciseItems = [
    {
      id: 1,
      title: 'Physio',
      description: 'Exercise activity for physiotherapy',
      imageUrl:
        'https://cdn.usegalileo.ai/sdxl10/fc51339a-9b7c-469a-b6a2-d4fff9f3ecff.png',
      hasOptions: true,
      active: false,
    },
    {
      id: 2,
      title: 'Walk',
      description: 'Exercise activity for walking',
      imageUrl:
        'https://cdn.usegalileo.ai/sdxl10/d856df1d-3fda-4681-85b0-6ab0a9146d2e.png',
      hasOptions: false,
      active: true,
    },
    {
      id: 3,
      title: 'Finger Move',
      description: 'Finger movement exercise',
      imageUrl:
        'https://cdn.usegalileo.ai/sdxl10/3ca94118-9dea-450d-a234-e117fcd61354.png',
      hasOptions: true,
      active: false,
    },
  ];

  // Updated color palette with vibrant accents
  const colors = {
    background: darkMode ? '#0E0E0E' : '#F7F7F7',
    textPrimary: darkMode ? '#F4F4F4' : '#1A1A1A',
    textSecondary: darkMode ? '#A0A0A0' : '#666666',
    cardBackground: darkMode ? '#1A1A1A' : '#FFFFFF',
    iconColor: darkMode ? '#F4F4F4' : '#1A1A1A',
    activeStatus: '#5B00FF', // Changed to vibrant purple
    accentPrimary: '#5B00FF',
    accentSecondary: '#FF4F8B',
    accentTertiary: '#1A00FF',
    accentOrange: '#FF6A3D',
    borderColor: darkMode ? '#333333' : '#EDEDED',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.mainContainer}>
        <View>
          {/* Header with gradient border */}
          <View style={[
            styles.header, 
            { 
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderColor
            }
          ]}>
            <View style={styles.headerSpacer} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Exercise
            </Text>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleDarkMode}
              activeOpacity={0.8}
            >
              {darkMode ? (
                <Feather name="sun" size={24} color={colors.accentSecondary} />
              ) : (
                <Feather name="moon" size={24} color={colors.accentPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Exercise List with enhanced styling */}
          <ScrollView style={styles.scrollView}>
            {exerciseItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.exerciseItem, 
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.borderColor,
                    borderWidth: 1,
                    shadowColor: darkMode ? colors.accentPrimary : '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    elevation: 2,
                  }
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.exerciseItemLeft}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={[
                      styles.exerciseImage,
                      {
                        borderColor: item.active ? colors.accentPrimary : colors.borderColor,
                        borderWidth: item.active ? 2 : 0
                      }
                    ]}
                  />
                  <View style={styles.exerciseTextContainer}>
                    <Text style={[styles.exerciseTitle, { color: colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.exerciseDescription, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.exerciseItemRight}>
                  {item.active ? (
                    <View style={[
                      styles.statusIndicatorContainer,
                      {
                        backgroundColor: darkMode ? '#2A1E3A' : '#F0E8FF',
                        borderRadius: 20
                      }
                    ]}>
                      <View
                        style={[
                          styles.activeStatusIndicator,
                          { 
                            backgroundColor: colors.accentPrimary,
                            shadowColor: colors.accentPrimary,
                            shadowOpacity: 0.5,
                            shadowRadius: 4,
                            shadowOffset: { width: 0, height: 2 }
                          }
                        ]}
                      />
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: darkMode ? '#2A1E3A' : '#F0E8FF',
                          borderRadius: 20
                        }
                      ]}
                      activeOpacity={0.7}
                    >
                      <Feather 
                        name="sliders" 
                        size={20} 
                        color={item.active ? '#FFFFFF' : colors.accentPrimary} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 100,
    justifyContent: 'space-between',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  exerciseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  exerciseImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  exerciseTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  exerciseItemRight: {
    flexShrink: 0,
    padding: 8,
  },
  statusIndicatorContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStatusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  optionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Exercise;