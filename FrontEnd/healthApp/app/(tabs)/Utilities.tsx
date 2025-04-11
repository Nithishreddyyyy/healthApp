import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, useColorScheme } from 'react-native';

const Utilities = () => {
  // Sample exercise data
  const exerciseData = [
    {
      surgeryType: "Hip Replacement",
      exercises: [
        {
          id: "hip-1",
          name: "Ankle Pumps",
          imageUrl: "https://via.placeholder.com/100",
          description: "Move your foot up and down rhythmically by contracting the calf and shin muscles."
        },
        {
          id: "hip-2",
          name: "Ankle Rotations",
          imageUrl: "https://via.placeholder.com/100",
          description: "Rotate your ankle in a circular motion, both clockwise and counterclockwise."
        },
        {
          id: "hip-3",
          name: "Bed-Supported Knee Bends",
          imageUrl: "https://via.placeholder.com/100",
          description: "Slide your heel toward your buttocks, bending your knee and keeping your heel on the bed."
        }
      ]
    },
    {
      surgeryType: "Knee Surgery",
      exercises: [
        {
          id: "knee-1",
          name: "Quadriceps Sets",
          imageUrl: "https://via.placeholder.com/100",
          description: "Tighten your thigh muscle while trying to straighten your knee."
        },
        {
          id: "knee-2",
          name: "Straight Leg Raises",
          imageUrl: "https://via.placeholder.com/100",
          description: "Tighten your thigh muscle with knee fully straightened, and lift leg several inches."
        },
        {
          id: "knee-3",
          name: "Heel Slides",
          imageUrl: "https://via.placeholder.com/100",
          description: "Bend and straighten your knee by sliding heel forward and backward."
        }
      ]
    },
    {
      surgeryType: "Shoulder Surgery",
      exercises: [
        {
          id: "shoulder-1",
          name: "Pendulum",
          imageUrl: "https://via.placeholder.com/100",
          description: "Lean forward and let your affected arm hang down. Swing the arm in small circles."
        },
        {
          id: "shoulder-2",
          name: "Assisted Shoulder Flexion",
          imageUrl: "https://via.placeholder.com/100",
          description: "Use your unaffected arm to assist the affected arm up and overhead."
        },
        {
          id: "shoulder-3",
          name: "Scapular Retraction",
          imageUrl: "https://via.placeholder.com/100",
          description: "Pinch shoulder blades together, hold for 5 seconds, then relax."
        }
      ]
    }
  ];

  // Quick access options
  const quickAccessOptions = ["Hip Replacement", "Knee Surgery", "Shoulder Surgery"];

  // State
  const [searchValue, setSearchValue] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [showClear, setShowClear] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set dark mode as default
  const systemColorScheme = useColorScheme();

  // Set the appropriate colors based on the theme
  const theme = {
    backgroundColor: isDarkMode ? '#121212' : 'white',
    textColor: isDarkMode ? 'white' : 'black',
    cardBgColor: isDarkMode ? '#1E1E1E' : '#F3F4F6',
    inputBgColor: isDarkMode ? '#2C2C2C' : 'white',
    borderColor: isDarkMode ? '#333333' : '#E5E7EB',
    secondaryTextColor: isDarkMode ? '#AAAAAA' : '#6B7280',
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle search
  const handleSearch = (value) => {
    if (!value.trim()) {
      setRecommendations([]);
      return;
    }

    const matchingCategory = exerciseData.find(
      category => category.surgeryType.toLowerCase() === value.toLowerCase()
    );

    if (matchingCategory) {
      setRecommendations(matchingCategory.exercises);
    } else {
      setRecommendations([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchValue("");
    setRecommendations([]);
    setShowClear(false);
  };

  // Handle quick access button press
  const handleQuickAccessPress = (option) => {
    setSearchValue(option);
    setShowClear(true);
    handleSearch(option);
  };

  // Custom Moon Icon Component
  const MoonIcon = () => (
    <View>
      <View style={{ 
        width: 20, 
        height: 20, 
        borderRadius: 10, 
        borderWidth: 2,
        borderColor: theme.textColor,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <View style={{ 
          position: 'absolute',
          width: 15,
          height: 15,
          borderRadius: 7.5,
          backgroundColor: theme.textColor,
          right: -5,
          top: -5
        }} />
      </View>
    </View>
  );

  // Custom Sun Icon Component
  const SunIcon = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ 
        width: 12, 
        height: 12, 
        borderRadius: 6, 
        backgroundColor: theme.textColor 
      }} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((degree, index) => (
        <View 
          key={index}
          style={{
            position: 'absolute',
            height: 8,
            width: 2,
            backgroundColor: theme.textColor,
            transform: [
              { rotate: `${degree}deg` },
              { translateY: -10 }
            ]
          }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <ScrollView style={{ paddingHorizontal: 20 }}>
        <View style={{ maxWidth: 500, marginHorizontal: 'auto', paddingTop: 20 }}>
          {/* Dark Mode Toggle Button - positioned at the top right */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'flex-end', 
            marginBottom: 16,
            paddingTop: 8
          }}>
            <TouchableOpacity 
              style={{ 
                padding: 10,
                borderRadius: 20,
                backgroundColor: isDarkMode ? '#333333' : '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44
              }}
              onPress={toggleDarkMode}
            >
              {isDarkMode ? <MoonIcon /> : <SunIcon />}
            </TouchableOpacity>
          </View>
          
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: theme.textColor }}>
              Surgery Exercise Recommendations
            </Text>
          </View>
          
          {/* Search Input */}
          <View style={{ position: 'relative', marginBottom: 24 }}>
            <TextInput
              style={{ 
                width: '100%', 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                borderWidth: 1, 
                borderColor: theme.borderColor, 
                borderRadius: 9999, 
                fontSize: 16,
                backgroundColor: theme.inputBgColor,
                color: theme.textColor
              }}
              placeholder="Search by surgery type"
              placeholderTextColor={theme.secondaryTextColor}
              value={searchValue}
              onChangeText={(text) => {
                setSearchValue(text);
                setShowClear(!!text);
                handleSearch(text);
              }}
            />
            {showClear && (
              <TouchableOpacity 
                style={{ position: 'absolute', right: 16, top: 12 }}
                onPress={clearSearch}
              >
                <Text style={{ color: theme.secondaryTextColor, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Quick Access Section */}
          <View style={{ backgroundColor: theme.cardBgColor, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <Text style={{ textAlign: 'center', fontWeight: '500', marginBottom: 16, color: theme.textColor }}>QUICK ACCESS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {quickAccessOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ 
                    backgroundColor: theme.inputBgColor, 
                    borderRadius: 8, 
                    width: '30%', 
                    height: 80, 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: 16 
                  }}
                  onPress={() => handleQuickAccessPress(option)}
                >
                  <Text style={{ textAlign: 'center', fontSize: 14, color: theme.textColor }}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Exercise Recommendations */}
          <View style={{ paddingBottom: 20 }}>
            {recommendations.length > 0 ? (
              recommendations.map((exercise) => (
                <View key={exercise.id} style={{ 
                  flexDirection: 'row', 
                  backgroundColor: theme.cardBgColor, 
                  borderRadius: 12, 
                  padding: 16, 
                  marginBottom: 16 
                }}>
                  <View style={{ 
                    width: 96, 
                    height: 96, 
                    backgroundColor: theme.inputBgColor, 
                    borderRadius: 8, 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Image
                      source={{ uri: exercise.imageUrl }}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={{ fontWeight: '500', marginBottom: 4, color: theme.textColor }}>{exercise.name}</Text>
                    <Text style={{ fontSize: 14, color: theme.secondaryTextColor }}>{exercise.description}</Text>
                  </View>
                </View>
              ))
            ) : searchValue ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ color: theme.secondaryTextColor }}>No exercises found for "{searchValue}"</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Utilities;