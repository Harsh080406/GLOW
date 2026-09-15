/**
 * GLOW CAMPUS TRANSIT — Real-time Live Telemetry & GPS API Client
 * 
 * Ready for seamless backend API integration.
 * To connect to a live backend, simply configure VITE_API_BASE_URL in your .env
 * or set ENABLE_BACKEND_API to true.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000/ws/telemetry";
const ENABLE_BACKEND_API = import.meta.env.VITE_ENABLE_BACKEND_API === "true";

export const TelemetryService = {
  /**
   * Broadcast Driver Live GPS Telemetry payload to Backend Server
   * Endpoint: POST /api/v1/telemetry/driver/broadcast
   */
  async broadcastDriverLocation(payload) {
    if (!ENABLE_BACKEND_API) {
      // Local development fallback: returns mock ack
      return { success: true, timestamp: new Date().toISOString(), ...payload };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/driver/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("glow_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Telemetry broadcast failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn("[TelemetryService] Backend API not reachable, falling back to local state sync:", error);
      return { success: true, fallback: true, ...payload };
    }
  },

  /**
   * Fetch Real-time Location for a Specific Bus (Used by Student Portal)
   * Endpoint: GET /api/v1/telemetry/buses/:busId
   */
  async getBusLocation(busId) {
    if (!ENABLE_BACKEND_API) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/buses/${busId}`);
      if (!response.ok) throw new Error("Failed to fetch bus telemetry");
      return await response.json();
    } catch (error) {
      console.warn(`[TelemetryService] Failed to fetch live location for ${busId}:`, error);
      return null;
    }
  },

  /**
   * Fetch Real-time Telemetry for the Entire Fleet (Used by Admin Portal)
   * Endpoint: GET /api/v1/telemetry/fleet
   */
  async getFleetLocations() {
    if (!ENABLE_BACKEND_API) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/fleet`);
      if (!response.ok) throw new Error("Failed to fetch fleet telemetry");
      return await response.json();
    } catch (error) {
      console.warn("[TelemetryService] Failed to fetch fleet telemetry:", error);
      return null;
    }
  },

  /**
   * Initialize a WebSocket or Server-Sent Events (SSE) Stream for real-time GPS updates
   */
  subscribeToLiveFleet(onMessageCallback) {
    if (!ENABLE_BACKEND_API) {
      return () => {}; // No-op cleanup
    }

    try {
      const socket = new WebSocket(WS_BASE_URL);

      socket.onopen = () => {
        console.log("[TelemetryService] WebSocket connection established for live GPS stream.");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageCallback(data);
        } catch (e) {
          console.error("[TelemetryService] Error parsing WebSocket message:", e);
        }
      };

      socket.onerror = (err) => {
        console.warn("[TelemetryService] WebSocket error, using polling fallback:", err);
      };

      // Return cleanup unsubscription function
      return () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      };
    } catch (err) {
      console.warn("[TelemetryService] Could not establish WebSocket:", err);
      return () => {};
    }
  },
};

export default TelemetryService;
