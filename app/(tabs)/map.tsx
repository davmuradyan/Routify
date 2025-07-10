import React, { useEffect, useRef, useState } from "react";
import { View, SafeAreaView, TouchableOpacity, Image, Text, Modal } from "react-native";
import MapView, { Marker, Polyline, Callout, CalloutSubview } from "react-native-maps";
import { styles } from "../../styles/map";
import BackendServiceSingleton from "../../services/BackendServiceSingleton";
import { BackendService, backendEvents, latestBusStops, BusStop, RouteEntity } from "../../services/BackendService";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";

const locationIcon = require("../../assets/images/userLocation.png");

const Map = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; heading?: number }>({
    latitude: 0, // Default values
    longitude: 0,
    heading: undefined,
  });
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const backendServiceRef = useRef<BackendService | null>(null);

  useEffect(() => {
    // Connect to backend as soon as component mounts
    backendServiceRef.current = BackendServiceSingleton.getInstance();
    backendServiceRef.current.createConnection();

    // Start location tracking
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
        }
      );
    };

    startLocationTracking();

    // Subscribe to busStops event
    const handler = (stops: BusStop[]) => {
      setBusStops(stops);
    };
    backendEvents.on("busStops", handler);

    // Immediately set stops if already available
    if (latestBusStops && latestBusStops.length > 0) {
      setBusStops(latestBusStops);
    }

    // Request stops on mount
    BackendServiceSingleton.getInstance().getStops?.();

    return () => {
      backendEvents.off("busStops", handler);
    };
  }, []);

  useEffect(() => {
    const handleRoutePoints = (points: any) => {
      const parsed = typeof points === "string" ? JSON.parse(points) : points;
      const coords = parsed.map((p: any) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      }));
      setRoutePoints(coords);
    };
    backendEvents.on("routePoints", handleRoutePoints);

    return () => {
      backendEvents.off("routePoints", handleRoutePoints);
    };
  }, []);

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
            latitude: 41.0956,      // Alaverdi latitude
            longitude: 44.6616,     // Alaverdi longitude
            latitudeDelta: 0.03,    // Adjust zoom as needed
            longitudeDelta: 0.03,
          }}
        >
          {routePoints.length > 1 && (
            <Polyline
              coordinates={routePoints}
              strokeColor="#FF5733" // or any color you like
              strokeWidth={5}
            />
          )}
          {busStops.map(stop => (
            <Marker
              key={stop.stopID}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              onPress={() => {
                setSelectedStop(stop);
                setModalVisible(true);
              }}
            >
              <Image
                source={require("../../assets/images/busStop.png")}
                style={{ width: 20, height: 20, resizeMode: "contain" }}
              />
            </Marker>
          ))}
        </MapView>
        <TouchableOpacity
          style={[styles.locationButton, { bottom: 80 }]}
          onPress={() => {
            BackendServiceSingleton.getInstance().getStops?.();
          }}
        >
          <Text style={{fontSize: 24}}>⟳</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationButton} onPress={centerMapOnUser}>
          <Image source={locationIcon} style={styles.buttonIcon} />
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0008" }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 20, minWidth: 250 }}>
              <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
                {selectedStop?.stopName}
              </Text>
              {(selectedStop?.routes ?? []).length === 0 ? (
                <Text style={{ color: "#888" }}>No routes</Text>
              ) : (
                selectedStop?.routes.map((route, idx, arr) => (
                  <TouchableOpacity
                    key={route.routeID ?? idx}
                    onPress={() => {
                      setModalVisible(false);
                      console.log("Clicked route:", route.routeID);
                      backendServiceRef.current?.demandRoute(route.routeID, selectedStop.stopID)
                    }}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 6,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 6,
                      marginBottom: idx < arr.length - 1 ? 8 : 0,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 16 }}>
                      Համար: {route.routeNum ?? route.routeID ?? "?"} {route.startHour ?? "N/A"} - {route.endHour ?? "N/A"}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 16 }}>
                <Text style={{ color: "#007AFF", fontWeight: "bold" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Map;