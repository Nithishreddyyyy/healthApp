import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';

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
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showClear, setShowClear] = useState(false);

  // Handle search
  const handleSearch = (value: string) => {
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
  const handleQuickAccessPress = (option: string) => {
    setSearchValue(option);
    setShowClear(true);
    handleSearch(option);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-5">
        <View className="max-w-lg mx-auto py-5">
          {/* Header */}
          <Text className="text-center text-2xl font-bold mb-6">Surgery Exercise Recommendations</Text>
          
          {/* Search Input */}
          <View className="relative mb-6">
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-full text-base"
              placeholder="Value"
              value={searchValue}
              onChangeText={(text) => {
                setSearchValue(text);
                setShowClear(!!text);
                handleSearch(text);
              }}
            />
            {showClear && (
              <TouchableOpacity 
                className="absolute right-4 top-3"
                onPress={clearSearch}
              >
                <Text className="text-gray-500 text-lg">✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Quick Access Section */}
          <View className="bg-gray-100 rounded-xl p-4 mb-6">
            <Text className="text-center font-medium mb-4">QUICK ACCESS</Text>
            <View className="flex-row flex-wrap justify-between">
              {quickAccessOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-white rounded-lg w-[30%] h-20 items-center justify-center mb-4"
                  onPress={() => handleQuickAccessPress(option)}
                >
                  <Text className="text-center text-sm">{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Exercise Recommendations */}
          <View>
            {recommendations.length > 0 ? (
              recommendations.map((exercise) => (
                <View key={exercise.id} className="flex-row bg-gray-100 rounded-xl p-4 mb-4">
                  <View className="w-24 h-24 bg-white rounded-lg items-center justify-center">
                    <Image
                      source={{ uri: exercise.imageUrl }}
                      className="w-20 h-20"
                      resizeMode="contain"
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="font-medium mb-1">{exercise.name}</Text>
                    <Text className="text-sm text-gray-600">{exercise.description}</Text>
                  </View>
                </View>
              ))
            ) : searchValue ? (
              <View className="py-8 items-center">
                <Text className="text-gray-500">No exercises found for "{searchValue}"</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Utilities;