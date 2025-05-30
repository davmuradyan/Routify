import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import * as Location from "expo-location";
import { useState } from "react";
import EventEmitter from "eventemitter3";

export const backendEvents = new EventEmitter();

export class BackendService {
    private signalRConnection?: HubConnection;

    createConnection() {
        // Prevent multiple connections
        if (this.signalRConnection && 
            (this.signalRConnection.state === HubConnectionState.Connected ||
             this.signalRConnection.state === HubConnectionState.Connecting)) {
            console.log("SignalR connection already exists or is connecting.");
            return;
        }

        this.signalRConnection = new HubConnectionBuilder()
            .withUrl("https://bus-service-dmghcagrbebgg9be.germanywestcentral-01.azurewebsites.net/UserHub")
            .withAutomaticReconnect()
            .build();

        this.signalRConnection.on("Connected", async () => {
            console.log("Connection established");
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.warn("Permission to access location was denied");
                    return;
                }
                const location = await Location.getCurrentPositionAsync({});
                this.sendLocation(location.coords.latitude, location.coords.longitude);
                this.getStops();
                console.log(`Sending actual location: ${location.coords.latitude}, ${location.coords.longitude}`);
            } catch (err) {
                console.error("Failed to get user location:", err);
            }
        });

        this.signalRConnection.on("ReceiveFakeBusLocation", (message) => {
            console.log("Coordinates:" + message);
        });

        this.signalRConnection.on("LocationReceived", (success) => {
            console.log(`Location ${success ? "saved successfully" : "failed to save"}`);
        });

        this.signalRConnection.on("Error", (errorMessage) => {
            console.error(`Server error: ${errorMessage}`);
        });

        this.signalRConnection.on("ReceivePoints", (message) => {
            console.log("ReceivePoints message:", message, typeof message);
            try {
                // If message is a string, parse it. If it's already an object/array, use it directly.
                const stops = typeof message === "string" ? JSON.parse(message) : message;
                backendEvents.emit("busStops", stops);
            } catch (err) {
                console.error("Failed to parse bus stops:", err);
            }
        });

        this.startConnection();
    }

    private async startConnection() {
        try {
            await this.signalRConnection?.start();
            console.log("SignalR connection started successfully");
        } catch (error) {
            console.error("Error starting SignalR connection:", error);
        }
    }

    public sendLocation(latitude: number, longitude: number) {
        if (this.signalRConnection?.state === HubConnectionState.Connected) {
            this.signalRConnection.invoke("SendLocation", { latitude, longitude })
                .then(() => console.log("Location sent successfully"))
                .catch(err => console.error("Error sending location:", err));
        } else {
            console.warn("Cannot send location: SignalR connection not established");
        }
    }

    public async getStops() {
        if (this.signalRConnection?.state === HubConnectionState.Connected) {
            return this.signalRConnection.invoke("GetStops");
        } else {
            throw new Error("SignalR connection not established");
        }
    }

    public async sendFeedback(email: string, message: string) {
        if (this.signalRConnection?.state === HubConnectionState.Connected) {
            if (!message.trim()) {
                return;
            }
            return this.signalRConnection.invoke("GetFeedback", { email, message });
        } else {
            throw new Error("SignalR connection not established");
        }
    }

    public isConnected(): boolean {
        return this.signalRConnection?.state === HubConnectionState.Connected;
    }
}

const [busStops, setBusStops] = useState<
  { latitude: number; longitude: number; stopID: number; stopName: string }[]
>([]);