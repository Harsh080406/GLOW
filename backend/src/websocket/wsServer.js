import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { telemetrySimulator } from "../services/telemetrySimulator.js";

const JWT_SECRET = process.env.JWT_SECRET || "glow_super_secret_jwt_access_key_2026";

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  console.log("📡 GLOW Channel-Based WebSocket Gateway Initialized.");

  // Map of client sockets to set of subscribed channels
  const clientSubscriptions = new Map();

  wss.on("connection", (ws, req) => {
    // Extract query parameters for JWT token
    const urlParams = new URLSearchParams(req.url.split("?")[1] || "");
    const token = urlParams.get("token");

    let authenticatedUser = null;

    if (token) {
      try {
        authenticatedUser = jwt.verify(token, JWT_SECRET);
        ws.user = authenticatedUser;
        console.log(`🔒 Authenticated WS client: ${authenticatedUser.email} (${authenticatedUser.role})`);
      } catch (err) {
        console.warn("⚠️ WS connection provided invalid token. Connecting as guest read-only.");
      }
    }

    clientSubscriptions.set(ws, new Set(["bus:*:telemetry", "sos:alerts"]));

    ws.on("message", (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        const { action, channel, payload } = message;

        if (action === "SUBSCRIBE" && channel) {
          clientSubscriptions.get(ws)?.add(channel);
          ws.send(JSON.stringify({ event: "SUBSCRIBED", channel }));
        } else if (action === "UNSUBSCRIBE" && channel) {
          clientSubscriptions.get(ws)?.delete(channel);
          ws.send(JSON.stringify({ event: "UNSUBSCRIBED", channel }));
        } else if (action === "TRIGGER_SOS") {
          // Broadcast high-priority SOS emergency event
          broadcastToChannel("sos:alerts", {
            event: "SOS_ALERT",
            payload: {
              id: `EMG-${Date.now().toString().slice(-4)}`,
              busId: payload?.busId || "BUS-104",
              location: payload?.location || "Motera Crossroads",
              reportedBy: ws.user?.email || "Student Commuter",
              timestamp: new Date().toISOString(),
              severity: "CRITICAL",
            },
          });
        }
      } catch (err) {
        console.error("Invalid WS message format:", err.message);
      }
    });

    ws.on("close", () => {
      clientSubscriptions.delete(ws);
      console.log("🔌 WS Client disconnected.");
    });
  });

  // Channel-targeted broadcast function
  const broadcastToChannel = (channel, data) => {
    const messagePayload = JSON.stringify({ channel, data });

    for (const [ws, channels] of clientSubscriptions.entries()) {
      if (ws.readyState === WebSocket.OPEN && (channels.has(channel) || channels.has("*"))) {
        ws.send(messagePayload);
      }
    }
  };

  // Initialize the 85-bus real-time telemetry simulator
  telemetrySimulator.init((channel, frame) => {
    broadcastToChannel(channel, frame);
  });

  return { broadcastToChannel };
}
