import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, SafeAreaView, TouchableOpacity, Image, Text, Animated } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { styles } from "../../styles/map";
import BackendServiceSingleton from "../../services/BackendServiceSingleton";
import { BackendService, backendEvents, latestBusStops, BusStop, RouteEntity } from "../../services/BackendService";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";
import Modal from "react-native-modal"; // <-- NEW IMPORT
import { AntDesign } from '@expo/vector-icons'; // Add at the top
import { MaterialIcons } from '@expo/vector-icons'; // Add at the top

const locationIcon = require("../../assets/images/userLocation.png");

const Map = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; heading?: number }>({
    latitude: 0, // Default values
    longitude: 0,
    heading: undefined,
  });
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number; isStop: Boolean }[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetIndex, setSheetIndex] = useState(-1); // Add this state
  const [isSheetVisible, setSheetVisible] = useState(false); // <-- NEW STATE
  const mapRef = useRef<MapView>(null);
  const backendServiceRef = useRef<BackendService | null>(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  const buttonBottom = useRef(new Animated.Value(20)).current; // default bottom position

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

  useEffect(() => {
    Animated.timing(buttonBottom, {
      toValue: routePoints.length > 1 ? 80 : 20,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [routePoints.length]);

  if (!userLocation.latitude && !userLocation.longitude) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Bottomsheet-like Modal */}
      <Modal
        isVisible={isSheetVisible}
        onBackdropPress={() => setSheetVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        backdropTransitionInTiming={500}   // Fade in duration (ms)
        backdropTransitionOutTiming={500}  // Fade out duration (ms)
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={{
          backgroundColor: "#fff",
          padding: 20,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          position: "relative",
          paddingBottom: 70
        }}>
          {/* Close button in top right */}
          <TouchableOpacity
            onPress={() => setSheetVisible(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              padding: 8,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AntDesign name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 25, marginTop: 8 }}>
            {selectedStop?.stopName}
          </Text>
          {(selectedStop?.routes ?? []).length === 0 ? (
            <Text style={{ color: "#888" }}>No routes</Text>
          ) : (
            selectedStop?.routes.map((route, idx, arr) => (
              <TouchableOpacity
                key={route.routeID ?? idx}
                onPress={() => {
                  backendServiceRef.current?.demandRoute(route.routeID, selectedStop.stopID);
                  setTimeout(() => setSheetVisible(false), 150); // Only this, remove the immediate call
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
        </View>
      </Modal>

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
              strokeColor="#33ff7eff" // or any color you like
              strokeWidth={5}
            />
          )}
          {busStops.map(stop => (
            <Marker
              key={stop.stopID}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              onPress={() => {
                setSelectedStop(stop);
                setSheetVisible(true); // <-- OPEN MODAL
                console.log("Selected stop:", stop);
              }}
            >
              <Image
                source={require("../../assets/images/busStop.png")}
                style={{ width: 20, height: 20, resizeMode: "contain" }}
              />
            </Marker>
          ))}
        </MapView>
        <Animated.View style={[styles.locationButton, { bottom: Animated.add(buttonBottom, 60) }]}>
          <TouchableOpacity
            onPress={() => {
              BackendServiceSingleton.getInstance().getStops?.();
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#a0965cff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <MaterialIcons name="refresh" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.locationButton, { bottom: buttonBottom }]}>
          <TouchableOpacity onPress={centerMapOnUser}>
            <Image source={locationIcon} style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
        {routePoints.length > 1 && (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 24, // Adjust as needed to sit above the nav bar
              paddingHorizontal: 16,
              zIndex: 100,
              alignItems: "center",
            }}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              onPress={() => setRoutePoints([])}
              style={{
                width: "100%",
                backgroundColor: "#a0965cff",
                paddingVertical: 12,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Map;