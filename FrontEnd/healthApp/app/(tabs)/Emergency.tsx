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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

// Using Ionicons instead of phosphor-react-native to avoid compatibility issues
const HelpScreen = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [animation] = useState(new Animated.Value(0));
  const [breatheAnim] = useState(new Animated.Value(1));
  const [ambulanceModalVisible, setAmbulanceModalVisible] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination] = useState('Fortis Hospital Rajajinagar, Bangalore');
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);

  const hospitalCoordinates = {
    latitude: 12.9954,
    longitude: 77.5513,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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

  const requestLocationPermission = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(location);
      setPickupLocation(`${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);

      calculateETA(location.coords);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    } catch (error) {
      setErrorMsg('Error getting your location');
      console.log('Location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateETA = (coordinates) => {
    const distance = calculateDistance(
      coordinates.latitude,
      coordinates.longitude,
      hospitalCoordinates.latitude,
      hospitalCoordinates.longitude
    );
    const timeInMinutes = Math.round((distance / 50) * 60 * 1.3);
    setEta(timeInMinutes);
  };

  const bookAmbulance = () => {
    Alert.alert(
      'Ambulance Dispatched',
      'An ambulance is on its way to your location',
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
                  <Ionicons name="sunny" size={24} color={colors.accentSecondary} />
                ) : (
                  <Ionicons name="moon" size={24} color={colors.accentPrimary} />
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

            <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
              <View style={styles.locationHeaderRow}>
                <Text style={[styles.locationHeader, { color: colors.text }]}>
                  Fortis Hospital Route
                </Text>
                {eta && (
                  <View style={styles.etaBadge}>
                    <Ionicons name="time" size={16} color="white" />
                    <Text style={styles.etaText}>{eta} mins</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: darkMode ? '#2D2D2D' : '#F0F0F0' }]}
                onPress={requestLocationPermission}
              >
                <Ionicons name="location" size={20} color={colors.accentPrimary} />
                <Text style={[styles.locationButtonText, { color: colors.text }]}>
                  {location ? 'How far is your prefered Hospital' : 'Get my location'}
                </Text>
              </TouchableOpacity>

              {errorMsg && (
                <Text style={[styles.errorText, { color: colors.emergencyRed }]}>
                  {errorMsg}
                </Text>
              )}

              {location && (
                <View style={styles.locationInfo}>
                  <Text style={[styles.destinationText, { color: colors.secondaryText }]}>
                    From: {pickupLocation}
                  </Text>
                  <Text style={[styles.destinationText, { color: colors.secondaryText }]}>
                    To: {destination}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.optionsContainer}>
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
            </View>
          </SafeAreaView>
        </Animated.View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={ambulanceModalVisible}
        onRequestClose={() => setAmbulanceModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Book Ambulance to Fortis Hospital</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAmbulanceModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accentPrimary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>Getting your location...</Text>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT} // Changed from PROVIDER_GOOGLE to default
                style={styles.map}
                initialRegion={location ? {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                } : hospitalCoordinates}
              >
                {location && (
                  <Marker
                    coordinate={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }}
                    title="Your Location"
                    description="You are here"
                  >
                    <View style={styles.userMarker}>
                      <Ionicons name="person" size={18} color="white" />
                    </View>
                  </Marker>
                )}

                <Marker
                  coordinate={{
                    latitude: hospitalCoordinates.latitude,
                    longitude: hospitalCoordinates.longitude,
                  }}
                  title="Fortis Hospital Rajajinagar"
                  description="Your destination"
                >
                  <View style={styles.hospitalMarker}>
                    <Ionicons name="medical" size={18} color="white" />
                  </View>
                </Marker>
              </MapView>
            )}
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.etaContainer, { backgroundColor: darkMode ? '#2D2D2D' : '#F0F0F0' }]}>
              <Ionicons name="time" size={20} color={colors.accentPrimary} />
              <Text style={[styles.etaInfoText, { color: colors.text }]}>
                {eta ? `Estimated Time to Hospital: ${eta} minutes` : 'Calculating ETA...'}
              </Text>
            </View>

            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF' }]}>
              <Ionicons name="location" size={20} color={colors.accentPrimary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Your location"
                placeholderTextColor={colors.secondaryText}
                value={pickupLocation}
                onChangeText={setPickupLocation}
                editable={false}
              />
              <TouchableOpacity onPress={requestLocationPermission} style={styles.refreshButton}>
                <Ionicons name="refresh" size={20} color={colors.accentPrimary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF' }]}>
              <Ionicons name="location" size={20} color={colors.accentSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={destination}
                editable={false}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.bookNowButton} onPress={bookAmbulance}>
            <LinearGradient
              colors={[colors.accentPrimary, colors.accentTertiary]}
              style={styles.bookNowGradient}
            >
              <Text style={styles.bookNowText}>BOOK AMBULANCE NOW</Text>
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
    marginBottom: 30,
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
    marginBottom: 30,
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
  locationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationHeader: {
    fontSize: 18,
    fontWeight: '600',
  },
  etaBadge: {
    flexDirection: 'row',
    backgroundColor: '#5B00FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  etaText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  locationInfo: {
    marginTop: 10,
  },
  destinationText: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
  },
  optionsContainer: {
    marginTop: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  userMarker: {
    backgroundColor: '#5B00FF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
  },
  hospitalMarker: {
    backgroundColor: '#FF4F8B',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
  },
  inputContainer: {
    padding: 15,
    marginTop: 1,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  etaInfoText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
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
  refreshButton: {
    padding: 8,
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