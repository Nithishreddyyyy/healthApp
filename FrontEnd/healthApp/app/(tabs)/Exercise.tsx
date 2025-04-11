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

  const colors = {
    background: darkMode ? '#000000' : '#FFFFFF',
    textPrimary: darkMode ? '#FFFFFF' : '#1C160C',
    textSecondary: darkMode ? '#A18249' : '#A18249',
    cardBackground: darkMode ? '#2A2116' : '#FFFFFF',
    iconColor: darkMode ? '#FFFFFF' : '#1C160C',
    activeStatus: '#019863',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.mainContainer}>
        <View>
          {/* Header - Removed left menu icon */}
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <View style={styles.headerSpacer} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Exercise
            </Text>
            <TouchableOpacity style={styles.iconButton} onPress={toggleDarkMode}>
              <Feather name="moon" size={24} color={colors.iconColor} />
            </TouchableOpacity>
          </View>

          {/* Exercise List - Made workout tiles bigger */}
          <ScrollView>
            {exerciseItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.exerciseItem, { backgroundColor: colors.cardBackground }]}
              >
                <View style={styles.exerciseItemLeft}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.exerciseImage}
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
                    <View style={styles.statusIndicatorContainer}>
                      <View
                        style={[
                          styles.activeStatusIndicator,
                          { backgroundColor: colors.activeStatus },
                        ]}
                      />
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.optionButton}>
                      <Feather name="sliders" size={24} color={colors.iconColor} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
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
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 100, // Increased from 72 to make tiles bigger
    justifyContent: 'space-between',
    marginVertical: 8, // Added to create spacing between items
    marginHorizontal: 12, // Added horizontal margin
    borderRadius: 12, // Added for better aesthetics with larger tiles
  },
  exerciseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20, // Increased from 16
  },
  exerciseImage: {
    width: 72, // Increased from 56
    height: 72, // Increased from 56
    borderRadius: 12, // Increased from 8
  },
  exerciseTextContainer: {
    justifyContent: 'center',
  },
  exerciseTitle: {
    fontSize: 18, // Increased from 16
    fontWeight: '600', // Increased from 500
    marginBottom: 4, // Added for spacing
  },
  exerciseDescription: {
    fontSize: 15, // Increased from 14
  },
  exerciseItemRight: {
    flexShrink: 0,
    padding: 8, // Added padding
  },
  statusIndicatorContainer: {
    width: 36, // Increased from 28
    height: 36, // Increased from 28
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStatusIndicator: {
    width: 16, // Increased from 12
    height: 16, // Increased from 12
    borderRadius: 8, // Increased from 6
  },
  optionButton: {
    width: 36, // Increased from 28
    height: 36, // Increased from 28
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Exercise;