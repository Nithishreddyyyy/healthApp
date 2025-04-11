import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Linking, 
  Platform,
  Alert,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HelpScreen = () => {
  // Animation values
  const [animation] = useState(new Animated.Value(0));
  const [breatheAnim] = useState(new Animated.Value(1));
  
  // Function to handle emergency call
  const callEmergencyContact = () => {
    const phoneNumber = '+919482837541';
    const phoneUrl = Platform.OS === 'android' 
      ? `tel:${phoneNumber}` 
      : `telprompt:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Phone not available', 'Cannot make a phone call at this time');
        }
      })
      .catch(error => Alert.alert('Error', 'Failed to make call'));
  };

  // Function to play calming music
  const playMusic = () => {
    // In a real app, you would implement music playback here
    Alert.alert('Playing Music', 'Calming music would start playing now');
    // Example: If you have a music library integration
    // musicPlayerService.play('calming_playlist');
  };

  // Pulse animation for SOS button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Subtle fade-in animation for the entire screen
    Animated.timing(animation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef']}
      style={styles.gradientBackground}
    >
      <Animated.View style={[styles.container, { opacity: animation }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Don't Worry</Text>
              <Text style={styles.headerText}>Mark, Your Family is here.</Text>
            </View>
            
            <View style={styles.profileContainer}>
              <View style={styles.profileCircle}>
                {/* Replace with actual profile image if available */}
                <Text style={styles.profileInitial}>M</Text>
              </View>
            </View>
          </View>

          <View style={styles.sosButtonContainer}>
            <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
              <TouchableOpacity 
                style={styles.sosButton}
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert(
                    'SOS Activated', 
                    'Emergency services have been notified',
                    [{ text: 'OK', style: 'default' }]
                  );
                }}
              >
                <View style={styles.sosInnerCircle}>
                  <Text style={styles.sosButtonText}>Help</Text>
                  <Text style={styles.sosButtonSubText}>CLICK IN CASES OF AN EMERGENCY</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.optionCard}>
              <Text style={styles.optionText}>Feeling Lost? Call Your Close ones</Text>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={callEmergencyContact}
              >
                <LinearGradient
                  colors={['black', '#182848']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.actionButtonText}>Call Emergency Contacts</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.optionCard}>
              <Text style={styles.optionText}>Panicking? Listen to some calming music</Text>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={playMusic}
              >
                <LinearGradient
                  colors={['black', '#182848']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.actionButtonText}>Play Music</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  profileContainer: {
    marginLeft: 15,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a6fa5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  sosButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  sosButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  sosInnerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sosButtonSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#444',
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default HelpScreen;