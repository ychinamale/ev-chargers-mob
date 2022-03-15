import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { debounce } from './constants/utils';
import { fetchChargerPoints } from './services/openChargeMap';
import { icons } from './constants/images';


const { width, height } = Dimensions.get('window');

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

  // May be useful later
  // const getTopLeftCoord = () => {
  //   return {
  //     latitude: region?.data?.latitude + (region?.data?.latitudeDelta/2),
  //     longitude: region?.data?.longitude - (region?.data?.longitude/2)
  //   }
  // }

  // const getBottomRightCoord = () => {
  //   return {
  //     latitude: region?.data?.latitude - (region?.data?.latitude/2),
  //     longitude: region?.data?.longitude + (region?.data?.longitude/2)
  //   }
  // }

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

  React.useEffect(() => {
    (async function getChargerPoints() {
      // fetch all POI within the region
      try {
        const position = { latitude: region.data.latitude, longitude: region.data.longitude }
        const response = await fetchChargerPoints(position);

        const responseData = response.map((item) => {
          const { UUID, AddressInfo, NumberOfPoints, StatusType } = item;

          return { 
            UUID,
            country: AddressInfo.Country.Title,
            latitude: AddressInfo.Latitude,
            longitude: AddressInfo.Longitude,
            numberOfPoints: NumberOfPoints,
            isOperational: StatusType.IsOperational,
            isUserSelectable: StatusType.IsUserSelectable,
          };
        });

        setListChargers(responseData);
      } catch (err) {
        console.log(`[Error] getChargerPoints()\n${err}`) 
      }
    })()
  }, [region.data])

  return (
    <View style={styles.layout}>
      <Text>Charger Finder</Text>
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
              { listChargers.map((marker, index) => (
                <Marker
                  key={index}
                  coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                  image={icons.bolt_active}
                />
              ))}
            </>
          )}
        </MapView>
      </View>
      <Text>Status: { !!region.isLoading ? '...loading': 'Done' }</Text>
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
