import Bus from "../models/Bus.js";
import Route from "../models/Route.js";

class TelemetrySimulator {
  constructor() {
    this.busSimStates = new Map();
    this.intervalId = null;
    this.broadcastCallback = null;
  }

  async init(broadcastCallback) {
    this.broadcastCallback = broadcastCallback;
    console.log("⚡ Initializing 85-Bus Real-Time Telemetry Simulator Engine...");

    try {
      const buses = await Bus.find().populate("currentDriverId");
      const routes = await Route.find();

      const routeMap = new Map();
      routes.forEach((r) => routeMap.set(r._id.toString(), r));

      // Build simulation state for each bus
      buses.forEach((bus, index) => {
        // Fallback route selection if not linked directly
        const assignedRoute = routes[index % routes.length] || routes[0];
        const stops = assignedRoute?.stops?.length > 0 ? assignedRoute.stops : [
          { name: "Terminal A", lat: 23.0225, lng: 72.5714 },
          { name: "Stop B", lat: 23.0450, lng: 72.5830 },
          { name: "Main Campus", lat: 23.0780, lng: 72.5920 },
        ];

        this.busSimStates.set(bus.registrationNumber, {
          busId: bus.registrationNumber,
          regNo: bus.registrationNumber,
          routeId: assignedRoute ? `R-${(index % 34 + 1).toString().padStart(2, '0')}` : "R-04",
          routeName: assignedRoute ? assignedRoute.name : "University Corridor",
          driverName: bus.currentDriverId ? bus.currentDriverId.name : `Driver ${index + 1}`,
          driverPhone: "+91 98765 11111",
          stops,
          currentStopIndex: 0,
          progressStep: Math.random(), // 0.0 to 1.0 progress between current stop & next stop
          speed: Math.floor(25 + Math.random() * 30),
          status: bus.status || "On Route",
          capacity: bus.capacity || 45,
          occupancy: bus.occupancy || Math.floor(15 + Math.random() * 25),
        });
      });

      console.log(`📡 Telemetry Simulator initialized for ${this.busSimStates.size} buses.`);
      this.start();
    } catch (err) {
      console.error("❌ Telemetry Simulator initialization error:", err.message);
    }
  }

  start() {
    if (this.intervalId) clearInterval(this.intervalId);

    // Broadcast frame every 3 seconds per specification
    this.intervalId = setInterval(() => {
      this.tick();
    }, 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    const timestamp = new Date().toISOString();

    for (const [busId, simState] of this.busSimStates.entries()) {
      const { stops } = simState;
      if (!stops || stops.length < 2) continue;

      // Advance progress between current stop & next stop
      simState.progressStep += 0.05;
      if (simState.progressStep >= 1.0) {
        simState.progressStep = 0;
        simState.currentStopIndex = (simState.currentStopIndex + 1) % (stops.length - 1);
      }

      const currStop = stops[simState.currentStopIndex];
      const nextStop = stops[simState.currentStopIndex + 1] || stops[0];

      // Linear interpolation for smooth lat/lng movement
      const lat = currStop.lat + (nextStop.lat - currStop.lat) * simState.progressStep;
      const lng = currStop.lng + (nextStop.lng - currStop.lng) * simState.progressStep;

      // Calculate heading direction string
      const latDiff = nextStop.lat - currStop.lat;
      const lngDiff = nextStop.lng - currStop.lng;
      let heading = "North";
      if (latDiff > 0 && lngDiff > 0) heading = "North-East";
      else if (latDiff > 0 && lngDiff < 0) heading = "North-West";
      else if (latDiff < 0 && lngDiff > 0) heading = "South-East";
      else if (latDiff < 0 && lngDiff < 0) heading = "South-West";

      // Fluctuating speed for realistic movement
      simState.speed = Math.floor(25 + Math.sin(Date.now() / 3000 + simState.currentStopIndex) * 15 + Math.random() * 5);

      const totalStopsCount = stops.length;
      const progressPercent = Math.min(100, Math.floor(((simState.currentStopIndex + simState.progressStep) / (totalStopsCount - 1)) * 100));
      const etaMinutes = Math.max(1, Math.floor((1 - simState.progressStep) * 8));

      const frame = {
        busId,
        regNo: simState.regNo,
        routeId: simState.routeId,
        routeName: simState.routeName,
        driverName: simState.driverName,
        driverPhone: simState.driverPhone,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        mapX: Math.floor(100 + ((lng - 72.5) * 2000) % 500),
        mapY: Math.floor(100 + ((23.1 - lat) * 2000) % 400),
        progressPercent,
        speed: simState.speed,
        heading,
        status: simState.status,
        currentLocationName: `Near ${currStop.name}`,
        nextStop: nextStop.name,
        nextStopIndex: simState.currentStopIndex + 1,
        etaMinutes,
        occupancy: simState.occupancy,
        capacity: simState.capacity,
        isLiveBroadcasting: true,
        isDeviceGps: false,
        lastUpdated: timestamp,
      };

      if (this.broadcastCallback) {
        // Broadcast specific bus telemetry channel and global telemetry channel
        this.broadcastCallback(`bus:${busId}:telemetry`, frame);
        this.broadcastCallback(`bus:*:telemetry`, frame);
      }
    }
  }

  getBusTelemetry(busId) {
    return this.busSimStates.get(busId) || null;
  }
}

export const telemetrySimulator = new TelemetrySimulator();
