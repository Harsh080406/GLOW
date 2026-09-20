import { WebSocketServer, WebSocket } from "ws";

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  console.log("📡 GLOW WebSocket Real-Time Event Gateway Initialized.");

  const clients = new Set();

  wss.on("connection", (ws, req) => {
    clients.add(ws);
    console.log(`🔌 New client connected to WebSocket gateway: ${req.url}`);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("📩 Received WS Message:", message);

        // Handle incoming client messages (e.g. SOS trigger via WS)
        if (message.type === "TRIGGER_SOS") {
          broadcast({
            event: "SOS_ALERT",
            payload: {
              id: `EMG-${Date.now().toString().slice(-4)}`,
              busId: message.busId || "BUS-104",
              location: message.location || "Motera Crossroads",
              timestamp: new Date().toISOString(),
              severity: "CRITICAL",
            },
          });
        }
      } catch (e) {
        console.error("Invalid WebSocket payload received.");
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("❌ Client disconnected from WebSocket gateway.");
    });
  });

  const broadcast = (data) => {
    const payload = JSON.stringify(data);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  // Live GPS Telemetry Broadcast Interval (Every 3 seconds per ARCHITECTURE.md)
  let angle = 0;
  setInterval(() => {
    if (clients.size > 0) {
      angle = (angle + 0.05) % (2 * Math.PI);
      const latOffset = Math.sin(angle) * 0.005;
      const lngOffset = Math.cos(angle) * 0.005;

      broadcast({
        event: "TELEMETRY_UPDATE",
        timestamp: new Date().toISOString(),
        busId: "BUS-104",
        coordinates: {
          lat: 23.0982 + latOffset,
          lng: 72.5784 + lngOffset,
        },
        speed: Math.floor(35 + Math.random() * 15),
        heading: Math.floor(Math.random() * 360),
        occupancy: 32,
        etaMinutes: Math.max(1, Math.floor(6 + Math.sin(angle) * 3)),
      });
    }
  }, 3000);

  return { broadcast };
}
