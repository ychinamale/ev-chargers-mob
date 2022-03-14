import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = React.useState({ data: null, isLoading: false });

  const handleCurrentUpdate = () => {
    setLocation((prevLocation) => ({ data: { ...prevLocation?.data}, isLoading: true }))
  }

  React.useEffect(() => {
    if (!!location.isLoading) {
      (async function getCurrentLocation () {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return console.log('Permission to access location was denied');
        }

        let data = await Location.getCurrentPositionAsync({});
        setLocation({ data, isLoading: false });
      })()
    }
  }, [location.isLoading])

  console.log('The location now is', JSON.stringify(location, null, 2));

  return (
    <View style={styles.layout}>
      <Text>Charger Finder</Text>
      <View style={styles.mapContainer}>
        <MapView 
          provider={PROVIDER_GOOGLE}
          style={styles.map}
        />
      </View>
      <Text>Status: { !!location.isLoading ? '...loading': 'Done' }</Text>
      <TouchableOpacity style={styles.button} onPress={handleCurrentUpdate} >
        <Text>get current location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  layout: {
    flex: 1,
    alignItems: 'center',
  },
  mapContainer: {
    height: 400,
    width: 400,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
