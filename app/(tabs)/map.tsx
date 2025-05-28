import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, SafeAreaView } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";
import BackendServiceSingleton from "../../services/BackendServiceSingleton";
import { BackendService } from "../../services/BackendService";
import { styles } from "../../styles/map";

const locationIcon = require("../../assets/images/userLocation.png");

const BUS_POINTS = [
  { latitude: 40.204206, longitude: 44.550423 },
  { latitude: 40.202884, longitude: 44.546994 },
  { latitude: 40.203278, longitude: 44.542955 },
];

const GOOGLE_MAPS_APIKEY = "AIzaSyDDMguZH_L6rdJSmKVeLpjRCmODGE2FuQw"; // <-- Replace with your API key

const Map = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; heading?: number }>({
    latitude: 0, // Default values
    longitude: 0,
    heading: undefined,
  });
  const [routeCoords, setRouteCoords] = useState(BUS_POINTS);
  const mapRef = useRef<MapView>(null);
  const backendServiceRef = useRef<BackendService | null>(null);
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 3,
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading ?? undefined,
          });

          // Connect and send location only once
          if (!hasConnectedRef.current) {
            backendServiceRef.current = BackendServiceSingleton.getInstance();
            backendServiceRef.current.createConnection(); // No location arguments
            hasConnectedRef.current = true;
          }
        }
      );
    };

    startLocationTracking();
    setRouteCoords(BUS_POINTS); // Just use your points directly
  }, []);

  // Fetch route from Google Directions API
  const fetchBusRoute = async () => {
    const origin = `${BUS_POINTS[0].latitude},${BUS_POINTS[0].longitude}`;
    const destination = `${BUS_POINTS[2].latitude},${BUS_POINTS[2].longitude}`;
    const waypoints = `${BUS_POINTS[1].latitude},${BUS_POINTS[1].longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([latitude, longitude]: [number, number]) => ({ latitude, longitude }));
        setRouteCoords(coords);
      }
    } catch (err) {
      console.error("Failed to fetch bus route:", err);
    }
  };

  const centerMapOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        heading: userLocation.heading,
      });
    }
  };

  if (!userLocation.latitude && !userLocation.longitude) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          rotateEnabled={true}
          pitchEnabled={false}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.00522,
            longitudeDelta: 0.00021,
          }}
        >
          <Polyline
            coordinates={routeCoords}
            strokeColor="#007AFF"
            strokeWidth={5}
          />
        </MapView>
        <TouchableOpacity style={styles.locationButton} onPress={centerMapOnUser}>
          <Image source={locationIcon} style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Map;