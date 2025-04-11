import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Animated, Easing, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Use the specific IP where the backend is running
const DEFAULT_IP = '192.168.7.149'; // This is the IP where your backend is running

type GameStep = 'input' | 'door' | 'story' | 'config';

const DoorGame = () => {
  const [currentStep, setCurrentStep] = useState<GameStep>('input');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [currentSet, setCurrentSet] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [movementCount, setMovementCount] = useState(0);
  const [storyText, setStoryText] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [serverIP, setServerIP] = useState(DEFAULT_IP);
  const [serverPort, setServerPort] = useState('5000');
  const [totalReps, setTotalReps] = useState(0);
  const router = useRouter();

  // Animation values
  const doorRotation = useRef(new Animated.Value(0)).current;
  const doorOpacity = useRef(new Animated.Value(1)).current;
  const storyOpacity = useRef(new Animated.Value(0)).current;

  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Get the full API URL with the current IP and port
  const getApiUrl = () => `http://${serverIP}:${serverPort}`;
  
  // Helper function to add timeout to fetch
  const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    return response;
  };

  const handleStartGame = async () => {
    const newSessionId = generateSessionId();
    try {
      console.log(`Attempting to connect to: ${getApiUrl()}/reset_counter`);
      alert(`Attempting to connect to: ${getApiUrl()}/reset_counter`);
      
      const response = await fetchWithTimeout(
        `${getApiUrl()}/reset_counter`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: newSessionId }),
        },
        10000 // 10 second timeout
      );
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        setSessionId(newSessionId);
        setCurrentSet(1);
        setCurrentStep('door');
        // Reset door animation
        doorRotation.setValue(0);
        doorOpacity.setValue(1);
        storyOpacity.setValue(0);
        alert('Game started successfully!');
      } else {
        console.error('Server returned error:', response.status);
        alert(`Server returned error: ${response.status}. Please check if the backend is running correctly.`);
        setCurrentStep('config');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert(`Connection failed to ${getApiUrl()}. Error: ${error.message}. Make sure your backend is running and your phone is on the same network as your laptop.`);
      // Show config screen to allow changing the IP if needed
      setCurrentStep('config');
    }
  };

  // Fetch total reps when component mounts or when returning to input screen
  useEffect(() => {
    if (currentStep === 'input') {
      fetchTotalReps();
    }
  }, [currentStep]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 'door' && sessionId) {
      interval = setInterval(async () => {
        try {
          console.log(`Polling: ${getApiUrl()}/get_counter`);
          const response = await fetchWithTimeout(`${getApiUrl()}/get_counter`, {}, 5000);
          console.log('Poll response status:', response.status);
          const data = await response.json();
          console.log('Poll data:', data);

          if (data.session_id === sessionId) {
            setMovementCount(data.movement_count);
            if (data.movement_count >= parseInt(reps, 10)) {
              // Animate door opening
              animateDoorOpening();
              // Set timeout to match animation duration before changing step
              setTimeout(() => {
                setCurrentStep('story');
                startStoryCountdown();
              }, 1000); // Match with animation duration
            }
          } 
        } catch (error) {
          console.error('Error fetching count:', error);
          // Only show the alert once to avoid spamming
          if (movementCount === 0) {
            alert(`Connection to ${getApiUrl()} failed. Check your network settings.`);
            setCurrentStep('config');
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, sessionId, reps]);

  const animateDoorOpening = () => {
    // Animate door rotation (opening)
    Animated.timing(doorRotation, {
      toValue: 70, // Positive value now - door opens outward
      duration: 1000,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start();

    // Fade door out as story fades in
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(doorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(storyOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    ]).start();
  };

  const startStoryCountdown = () => {
    let count = 15;
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownInterval);
        if (currentSet < parseInt(sets, 10)) {
          startNewSet();
        } else {
          resetGame();
        }
      }
    }, 1000);
  };

  const startNewSet = async () => {
    const newSessionId = generateSessionId();
    try {
      console.log(`Starting new set: ${getApiUrl()}/reset_counter`);
      const response = await fetchWithTimeout(
        `${getApiUrl()}/reset_counter`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: newSessionId }),
        },
        10000 // 10 second timeout
      );
      console.log('New set response status:', response.status);
      setSessionId(newSessionId);
      setCurrentSet(prev => prev + 1);
      setCountdown(15);
      setCurrentStep('door');
      // Reset animations for new door
      doorRotation.setValue(0);
      doorOpacity.setValue(1);
      storyOpacity.setValue(0);
    } catch (error) {
      console.error('Error starting new set:', error);
      alert(`Connection failed to ${getApiUrl()}. Check your network settings.`);
      setCurrentStep('config');
    }
  };

  const fetchTotalReps = async () => {
    try {
      const response = await fetchWithTimeout(`${getApiUrl()}/get_total_reps`, {}, 5000);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTotalReps(data.total_reps);
        }
      }
    } catch (error) {
      console.error('Error fetching total reps:', error);
    }
  };

  const resetGame = () => {
    setCurrentStep('input');
    setCurrentSet(0);
    setReps('');
    setSets('');
    setCountdown(15);
    // We don't reset serverIP and serverPort to preserve the configuration
    // Fetch the latest total reps when returning to the input screen
    fetchTotalReps();
  };

  const getStoryPart = (setNumber: number) => {
    const storyParts = [
      'You enter a mysterious forest...',
      'You discover an ancient temple...',
      'A dragon appears before you...',
      'You find the hidden treasure!'
    ];
    return storyParts[Math.min(setNumber - 1, storyParts.length - 1)];
  };

  // Door transformation for animation - fixed to use increasing values
  const doorTransform = {
    transform: [
      { perspective: 1000 },
      { rotateY: doorRotation.interpolate({
        inputRange: [0, 70],
        outputRange: ['0deg', '-70deg']
      })},
      { translateX: doorRotation.interpolate({
        inputRange: [0, 70],
        outputRange: [0, -30]
      })}
    ]
  };

  const saveConfig = () => {
    setCurrentStep('input');
  };

  return (
    <View style={styles.container}>
      {/* Back button to return to Exercise screen */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to Exercises</Text>
      </TouchableOpacity>

      {currentStep === 'config' && (
        <>
          <Text style={styles.title}>Server Configuration</Text>
          <Text style={styles.subtitle}>
            Current connection: {getApiUrl()}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Server IP Address"
            value={serverIP}
            onChangeText={setServerIP}
          />
          <TextInput
            style={styles.input}
            placeholder="Server Port"
            keyboardType="numeric"
            value={serverPort}
            onChangeText={setServerPort}
          />
          <Text style={styles.hint}>
            Your backend is running at: http://172.16.5.216:5000
            {'\n'}Make sure your phone is on the same network as your laptop.
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Save and Continue" onPress={saveConfig} />
          </View>
          <View style={styles.buttonContainer}>
            <Button 
              title="Test Connection" 
              onPress={async () => {
                try {
                  console.log(`Testing connection to: ${getApiUrl()}/get_counter`);
                  alert(`Testing connection to: ${getApiUrl()}/get_counter`);
                  
                  const response = await fetchWithTimeout(`${getApiUrl()}/get_counter`, {}, 10000);
                  console.log('Response status:', response.status);
                  
                  if (response.ok) {
                    const data = await response.json();
                    console.log('Response data:', data);
                    alert(`Connection successful! Response: ${JSON.stringify(data)}`);
                    saveConfig();
                  } else {
                    console.error('Server returned error:', response.status);
                    alert(`Server returned error: ${response.status}. Please check if the backend is running correctly.`);
                  }
                } catch (error) {
                  console.error('Connection test failed:', error);
                  alert(`Connection failed. Error: ${error.message}. Please check your network settings and make sure the backend is running.`);
                }
              }} 
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              title="Check Backend Status" 
              onPress={async () => {
                try {
                  // Try to fetch without using our custom function to see if that's the issue
                  alert(`Checking backend at: ${getApiUrl()}`);
                  
                  // Use a simple GET request with a short timeout
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 5000);
                  
                  const response = await fetch(`${getApiUrl()}`, {
                    signal: controller.signal
                  });
                  
                  clearTimeout(timeoutId);
                  
                  alert(`Backend is responding with status: ${response.status}`);
                } catch (error) {
                  alert(`Backend check failed: ${error.message}`);
                }
              }} 
            />
          </View>
        </>
      )}

      {currentStep === 'input' && (
        <>
          <Text style={styles.title}>Fitness Adventure Game</Text>
          
          {/* Leaderboard section */}
          <View style={styles.leaderboardContainer}>
            <Text style={styles.leaderboardTitle}>Previous Workout Stats</Text>
            <View style={styles.leaderboardItem}>
              <Text style={styles.leaderboardText}>Total Reps Completed: {totalReps}</Text>
            </View>
            <Button 
              title="Refresh Stats" 
              onPress={fetchTotalReps}
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Number of Reps"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
          <TextInput
            style={styles.input}
            placeholder="Number of Sets"
            keyboardType="numeric"
            value={sets}
            onChangeText={setSets}
          />
          <Button title="Start Adventure" onPress={handleStartGame} />
          <View style={styles.configButtonContainer}>
            <Button title="Change Server Settings" onPress={() => setCurrentStep('config')} />
          </View>
          <View style={styles.configButtonContainer}>
            <Button 
              title="Debug Connection" 
              onPress={async () => {
                try {
                  alert(`Debugging connection to: ${getApiUrl()}`);
                  
                  // Try a simple fetch with no timeout first
                  try {
                    const response1 = await fetch(`${getApiUrl()}`);
                    alert(`Basic fetch succeeded with status: ${response1.status}`);
                  } catch (e1) {
                    alert(`Basic fetch failed: ${e1.message}`);
                  }
                  
                  // Try with XMLHttpRequest as an alternative
                  const xhr = new XMLHttpRequest();
                  xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                      alert(`XHR completed with status: ${xhr.status}`);
                    }
                  };
                  xhr.onerror = function() {
                    alert('XHR failed with network error');
                  };
                  xhr.open('GET', getApiUrl(), true);
                  xhr.timeout = 5000;
                  xhr.send();
                  
                } catch (error) {
                  alert(`Debug failed: ${error.message}`);
                }
              }}
            />
          </View>
        </>
      )}

      {currentStep === 'door' && (
        <View style={styles.doorContainer}>
          <Text style={styles.doorTitle}>Door {currentSet}</Text>
          <Text style={styles.instruction}>Perform {reps} hand waves</Text>
          <Text style={styles.counter}>{movementCount}/{reps}</Text>

          {/* Door visualization */}
          <View style={styles.doorFrame}>
            <Animated.View 
              style={[
                styles.door,
                doorTransform,
                { opacity: doorOpacity }
              ]}
            >
              <View style={styles.doorknob} />
              <Text style={styles.doorText}>Door {currentSet}</Text>
            </Animated.View>
          </View>

          <ActivityIndicator size="large" color="#2f95dc" style={styles.loader} />
          <Text style={styles.hint}>Make sure the backend is running on your laptop!</Text>
        </View>
      )}

      {currentStep === 'story' && (
        <Animated.View style={[styles.storyContainer, { opacity: storyOpacity }]}>
          <Text style={styles.storyTitle}>Chapter {currentSet}</Text>
          <Text style={styles.storyText}>{getStoryPart(currentSet)}</Text>
          <Text style={styles.countdown}>Next door in: {countdown}s</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2f95dc',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#2f95dc',
    textAlign: 'center',
  },
  configButtonContainer: {
    marginTop: 20,
    width: '80%',
  },
  buttonContainer: {
    marginTop: 15,
    width: '80%',
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  doorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  doorTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2f95dc',
  },
  instruction: {
    fontSize: 20,
    marginBottom: 10,
  },
  counter: {
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#4CAF50',
  },
  doorFrame: {
    width: 180,
    height: 280,
    borderWidth: 8,
    borderColor: '#8B4513',
    backgroundColor: '#D2B48C',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    overflow: 'hidden',
  },
  door: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#A0522D',
    borderWidth: 2,
    borderColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    // Origin of rotation is on the left side
    transformOrigin: 'left',
  },
  doorknob: {
    position: 'absolute',
    right: 15,
    top: '50%',
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#DAA520',
  },
  doorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  hint: {
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  loader: {
    marginTop: 15,
  },
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  storyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF5722',
  },
  storyText: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 30,
    lineHeight: 24,
  },
  countdown: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  leaderboardContainer: {
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    marginBottom: 10,
  },
  leaderboardText: {
    fontSize: 16,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default DoorGame;