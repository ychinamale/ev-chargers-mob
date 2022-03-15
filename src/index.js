import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { debounceWithRef } from './constants/utils';
import { startCharging  } from './services/api';
import { fetchChargerPoints } from './services/openChargeMap';
import { icons } from './constants/images';

const { width, height } = Dimensions.get('window');

// Constants that will be used defaults when MapView first renders
const ASPECT_RATIO = width / height;
const LATITUDE = -26.130029273632143; // Somewhere in Joburg
const LONGITUDE = 27.973646800965067; // Somewhere in Joburg
const LATITUDE_DELTA = 0.0922; // from `examples/DisplayLatLng.js`
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO; // from `examples/DisplayLatLng.js`

// debounce delay
const DELAY = 500; // in milliseconds

export default function App() {
  const [region, setRegion] = React.useState({ data: null, isLoading: false });
  const [listChargers, setListChargers] = React.useState([]);
  const [chosenCharger, setChosenCharger] = React.useState(null);
  const timerRef = React.useRef();

  // 
  const handleCurrentUpdate = () => {
    setRegion((prevLocation) => ({ data: { ...prevLocation?.data }, isLoading: true }))
  }

  const handleRegionChange = async (thisRegion) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = thisRegion;

    setRegion({
      data: {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta
      },
      isLoading: false
    })
  }

  const handleSelectCharger = (charger) => {
    setChosenCharger(charger);
  }

  const handleBeginCharging = async () => {
    try {
      const response = await startCharging(chosenCharger);
      console.log(`[Success] We are charging\n${response}`);
    } catch (err) {
      console.log(`[Error] handleBeginCharging\n${err}`);
    }
  }

  // Side effect to handle updating the region to the device's current location
  React.useEffect(() => {
    if (!!region.isLoading) {
      (async function getCurrentLocation () {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return console.log('Permission to access location was denied');
        }

        const data = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = data?.coords;

        setRegion({ 
          data: {
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }, 
          isLoading: false });
      })()
    }
  }, [region.isLoading])

  // Side effect to listen for changes in map region and refetch chargers in the vicinity
  React.useEffect(() => {
    (function getChargerPoints() {
      debounceWithRef(async () => {
        // fetch all POI within the region
        try {
          const position = { latitude: region?.data?.latitude, longitude: region?.data?.longitude }
          const response = await fetchChargerPoints(position);

          const responseData = response.map((item) => {
            const { ID, AddressInfo, NumberOfPoints, StatusType } = item;

            return {
              ID,
              country: AddressInfo.Country.Title,
              latitude: AddressInfo.Latitude,
              longitude: AddressInfo.Longitude,
              numberOfPoints: NumberOfPoints,
              isOperational: StatusType?.IsOperational,
              isUserSelectable: StatusType?.IsUserSelectable,
            };
          });

          setListChargers(responseData);
        } catch (err) {
          console.log(`[Error] getChargerPoints()\n${err}`) 
        }
      }, DELAY, timerRef)
    })()

    return () => {
      clearTimeout(timerRef.current)
    }
  }, [region.data])

  return (
    <View style={styles.layout}>
      <Text>EV Charger Finder</Text>
      <View style={styles.mapContainer}>
        <MapView 
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          region={region.data}
          onRegionChangeComplete={(thisRegion) => { handleRegionChange(thisRegion) }}
        >
          { listChargers?.length > 0 && (
            <>
              { listChargers.map((charger, index) => (
                <Marker
                  key={index}
                  coordinate={{ latitude: charger.latitude, longitude: charger.longitude }}
                  image={icons.bolt_active}
                  onPress={() => { handleSelectCharger(charger) }}
                />
              ))}
            </>
          )}
        </MapView>
      </View>
      <Text>Status: { !!region.isLoading ? '...loading': 'Ready' }</Text>
      <TouchableOpacity style={styles.button} onPress={handleCurrentUpdate} >
        <Text>Current location</Text>
      </TouchableOpacity>
      { !!chosenCharger && (
        <TouchableOpacity style={styles.button} onPress={handleBeginCharging} >
          <Text>Start charging at #{chosenCharger.ID}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
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
