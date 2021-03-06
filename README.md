# EV Charger Finder

An Android app that allows an EV driver to find nearby charge points - built with React Native.

## Approach

The app launches with its default location set to a region in Johannesburg South Africa. The MapView component shows a map of the area.
A side effect fetches ev chargers in the vicinity using coordinates of the default location.
Moving the map triggers another side effect to update the region in focus (kept in state). Once that happens, the app re-fetches ev chargers in the new area.
A simple png is used as a marker for a charger site. These are shown on the screen once the list of charge points updates. To check against calls to re-fetch charge points being too frequent, a debounce function is used to delay repeat calls when the region updates.

## App Preview

<img src="https://user-images.githubusercontent.com/5281496/158482615-1442b4e2-813b-4bec-a6d0-53d6517fb630.gif" width="220" />

## Features

-  Jump to current location
-  Identify EV charger points in vicinity
-  Initiate charging session with chosen charger point (dummy request)

## Tech Stack

- [React Native (Expo)](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [React Native Config](https://github.com/luggit/react-native-config)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Axios](https://axios-http.com/docs/intro)

## Setup

- Install Node and yarn
- Follow the React Native [Expo CLI Quickstart guide](https://reactnative.dev/docs/environment-setup).
- Follow [setup instructions for React Native Config](https://github.com/luggit/react-native-config)
- Follow [additional setup instructions for React Native Maps](https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md)
- Follow [additional setup instructions for Expo Location](https://github.com/expo/expo/tree/main/packages/expo-location)
- Create a `.env` file in the project root directory with the following content:
```
OPENCHARGEMAP_API_KEY=your_api_key_here
OPENCHARGEMAP_BASE_URL=https://api.openchargemap.io/v3
```
- Start the app by running these commands: `yarn` and then `yarn android`

## Things I'd have wanted to do

- Update the 'Status' so it reflects the readiness of the charger markers
- Setup and built iOS app
- UI improvements
- Housekeeping (e.g. set up absolute paths, linting, TS, app icons, splash screen)
- Add more comments to the code
- Add dimension scaling
- Looked into performance (e.g. unnecessary re-renders, glitch when user quickly flicks the MapView)
- Moved API keys to backend
- A location search at the top so we don't scroll everywhere
- A bookmark feature for favourite locations
- An intuitive way of showing that a certain charger has multiple charge points
- Show user the distance to a selected charger
