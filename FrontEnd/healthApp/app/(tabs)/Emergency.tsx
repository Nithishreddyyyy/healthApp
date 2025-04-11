import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Moon, X, MapPin } from 'phosphor-react-native';
import MapView from 'react-native-maps';

const HelpScreen = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [animation] = useState(new Animated.Value(0));
  const [breatheAnim] = useState(new Animated.Value(1));
  const [ambulanceModalVisible, setAmbulanceModalVisible] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');

  // Vibrant color palette
  const colors = {
    background: darkMode ? '#0E0E0E' : '#F7F7F7',
    card: darkMode ? '#1A1A1A' : '#FFFFFF',
    text: darkMode ? '#F4F4F4' : '#1A1A1A',
    secondaryText: darkMode ? '#A0A0A0' : '#666666',
    border: darkMode ? '#333333' : '#EDEDED',
    accentPrimary: '#5B00FF',
    accentSecondary: '#FF4F8B',
    accentTertiary: '#1A00FF',
    accentOrange: '#FF6A3D',
    emergencyRed: '#FF5252',
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
      .catch(() => Alert.alert('Error', 'Failed to make call'));
  };

  const playMusic = () => {
    Alert.alert('Playing Music', 'Calming music would start playing now');
  };

  const bookAmbulance = () => {
    if (!pickupLocation || !destination) {
      Alert.alert('Missing Information', 'Please enter both pickup location and destination');
      return;
    }
    
    Alert.alert(
      'Ambulance Booked',
      `An ambulance is on the way to ${pickupLocation}. ETA: 10 minutes`,
      [{ text: 'OK', onPress: () => setAmbulanceModalVisible(false) }]
    );
  };

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

    Animated.timing(animation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={darkMode ? ['#0E0E0E', '#1A1A1A'] : ['#F7F7F7', '#EDEDED']}
      style={styles.gradientBackground}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.container, { opacity: animation }]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.welcomeText, { color: colors.secondaryText }]}>
                  Don't Worry
                </Text>
                <Text style={[styles.headerText, { color: colors.text }]}>
                  User, Your Family is here.
                </Text>
              </View>

              <TouchableOpacity 
                onPress={toggleDarkMode} 
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: darkMode ? '#2A1E3A' : '#F0E8FF',
                    borderRadius: 20,
                    padding: 8
                  }
                ]}
              >
                {darkMode ? (
                  <Sun size={24} color={colors.accentSecondary} weight="bold" />
                ) : (
                  <Moon size={24} color={colors.accentPrimary} weight="bold" />
                )}
              </TouchableOpacity>
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
                  <View style={[styles.sosInnerCircle, { backgroundColor: colors.emergencyRed }]}>
                    <Text style={styles.sosButtonText}>Help</Text>
                    <Text style={styles.sosButtonSubText}>CLICK IN CASES OF AN EMERGENCY</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.optionsContainer}>
              {/* Ambulance Option Card */}
              <View style={[styles.optionCard, { backgroundColor: colors.card }]}>
                <View style={styles.ambulanceImageContainer}>
                  <View style={[styles.ambulanceImagePlaceholder, { backgroundColor: darkMode ? '#2D2D2D' : '#F5F5F5' }]}>
                    <Text style={styles.ambulanceImageText}>🚑</Text>
                  </View>
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  Need Medical Transportation?
                </Text>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => setAmbulanceModalVisible(true)}
                >
                  <LinearGradient
                    colors={[colors.accentPrimary, colors.accentTertiary]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.actionButtonText}>Book Ambulance</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={[styles.optionCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  Feeling Lost? Call Your Close ones
                </Text>
                <TouchableOpacity style={styles.actionButton} onPress={callEmergencyContact}>
                  <LinearGradient
                    colors={[colors.accentSecondary, colors.accentOrange]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.actionButtonText}>Call Emergency Contacts</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={[styles.optionCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  Panicking? Listen to some calming music
                </Text>
                <TouchableOpacity style={styles.actionButton} onPress={playMusic}>
                  <LinearGradient
                    colors={[colors.accentPrimary, colors.accentSecondary]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.actionButtonText}>Play Music</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </ScrollView>

      {/* Ambulance Booking Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={ambulanceModalVisible}
        onRequestClose={() => setAmbulanceModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Book Ambulance</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setAmbulanceModalVisible(false)}
            >
              <X size={24} color={colors.text} weight="bold" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF' }]}>
              <MapPin size={20} color={colors.accentPrimary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter pickup location"
                placeholderTextColor={colors.secondaryText}
                value={pickupLocation}
                onChangeText={setPickupLocation}
              />
            </View>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF' }]}>
              <MapPin size={20} color={colors.accentPrimary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter destination"
                placeholderTextColor={colors.secondaryText}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>
          
          <TouchableOpacity style={styles.bookNowButton} onPress={bookAmbulance}>
            <LinearGradient
              colors={[colors.accentPrimary, colors.accentTertiary]}
              style={styles.bookNowGradient}
            >
              <Text style={styles.bookNowText}>BOOK NOW</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </LinearGradient>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
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
    marginBottom: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
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
    marginBottom: 20,
  },
  optionCard: {
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
  ambulanceImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  ambulanceImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambulanceImageText: {
    fontSize: 60,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  mapContainer: {
    width: '100%',
    height: height * 0.4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    padding: 15,
    marginTop: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
  },
  bookNowButton: {
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookNowGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  bookNowText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default HelpScreen;