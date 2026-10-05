import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "./RealMapView.css";

// Fix Leaflet's default icon path issue in bundlers (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Vadodara & GSFC University Campus Geographic Anchor Coordinates
const GSFC_CAMPUS_COORDS = [22.3615, 73.1550];
const VADODARA_CENTER = [22.3400, 73.1700];

// Fallback Route Stops for Route R-04 (Fatehgunj ↔ GSFC University)
export const DEFAULT_R04_STOPS = [
  { name: "Fatehgunj Hub", lat: 22.3245, lng: 73.1880, orderIndex: 1 },
  { name: "Nizampura Char Rasta", lat: 22.3360, lng: 73.1795, orderIndex: 2 },
  { name: "Chhani Jakat Naka", lat: 22.3485, lng: 73.1710, orderIndex: 3 },
  { name: "Bajwa Crossing", lat: 22.3550, lng: 73.1620, orderIndex: 4 },
  { name: "Fertilizernagar Gate", lat: 22.3605, lng: 73.1590, orderIndex: 5 },
  { name: "GSFC University Main Campus", lat: 22.3615, lng: 73.1550, orderIndex: 6, isDestination: true },
];

// Detailed Road Waypoints for Route R-04 following Vadodara road geometry
export const VADODARA_R04_DETAILED_PATH = [
  [22.3245, 73.1880], // Stop 1: Fatehgunj Hub
  [22.3282, 73.1852], // Fatehgunj Main Flyover
  [22.3325, 73.1821], // Nizampura South Rd
  [22.3360, 73.1795], // Stop 2: Nizampura Char Rasta
  [22.3410, 73.1762], // Nizampura Main Rd
  [22.3450, 73.1732], // Chhani Canal Approach
  [22.3485, 73.1710], // Stop 3: Chhani Jakat Naka
  [22.3518, 73.1672], // Chhani - Bajwa Road
  [22.3538, 73.1645], // Bajwa Curve
  [22.3550, 73.1620], // Stop 4: Bajwa Crossing
  [22.3578, 73.1605], // Fertilizernagar Approach
  [22.3605, 73.1590], // Stop 5: Fertilizernagar Gate
  [22.3610, 73.1570], // GSFC Campus Ring Road
  [22.3615, 73.1550], // Stop 6: GSFC University Main Campus (Destination)
];

/**
 * Calculates distance between two coordinates in km (Haversine formula)
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Interpolates coordinate and bearing along polyline path given a progress fraction (0.0 to 1.0)
 */
function interpolateAlongPath(path, progress) {
  if (!path || path.length === 0) return { lat: 22.3485, lng: 73.1710, bearing: 0 };
  if (path.length === 1) return { lat: path[0][0], lng: path[0][1], bearing: 0 };

  const distances = [0];
  let totalDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const d = getDistanceKm(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
    totalDist += d;
    distances.push(totalDist);
  }

  if (totalDist === 0) {
    return { lat: path[0][0], lng: path[0][1], bearing: 0 };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const targetDist = clampedProgress * totalDist;

  let segIndex = 0;
  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
      segIndex = i;
      break;
    }
  }

  const p1 = path[segIndex];
  const p2 = path[segIndex + 1] || path[segIndex];
  const segDist = distances[segIndex + 1] - distances[segIndex];
  const segProgress = segDist > 0 ? (targetDist - distances[segIndex]) / segDist : 0;

  const lat = p1[0] + (p2[0] - p1[0]) * segProgress;
  const lng = p1[1] + (p2[1] - p1[1]) * segProgress;
  const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

  return { lat, lng, bearing };
}

/**
 * Creates custom Leaflet HTML DivIcon for a compact Google Maps style moving bus
 */
function createSmallBusDivIcon(bus, isSelected, headingAngle = 0) {
  const isDelayed = bus.status === "DELAYED";
  const speed = bus.speed !== undefined ? `${bus.speed} km/h` : "42 km/h";
  const busLabel = bus.busId || bus.regNo || "BUS";

  const html = `
    <div class="glow-bus-marker-small ${isSelected ? "is-selected" : ""}">
      <span class="glow-bus-pulse-ring"></span>
      <div class="glow-bus-rotator" style="transform: rotate(${Math.round(headingAngle)}deg);">
        <span class="glow-bus-arrow"></span>
        <div class="glow-bus-puck" title="${busLabel} - Speed: ${speed}">
          <span>🚌</span>
        </div>
      </div>
      <div class="glow-bus-pill ${isDelayed ? "is-delayed" : ""}">
        <span>${busLabel}</span>
        <span style="color: #60a5fa; font-weight: 600;">${speed}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "glow-bus-leaflet-icon-wrapper",
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

/**
 * Creates custom Leaflet HTML DivIcon for a route stop
 */
function createStopDivIcon(stop, index, totalStops, currentStopIndex) {
  const isDestination = stop.isDestination || index === totalStops - 1;
  const isStart = index === 0;
  const isPassed = currentStopIndex !== undefined && index < currentStopIndex;
  const isNext = currentStopIndex !== undefined && index === currentStopIndex;

  if (isDestination) {
    const html = `
      <div class="glow-campus-marker">
        <div class="glow-campus-pin" title="GSFC University Main Campus">🎓</div>
      </div>
    `;
    return L.divIcon({
      className: "glow-stop-leaflet-icon",
      html,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });
  }

  const pinClass = isPassed ? "is-passed" : isNext ? "is-next" : isStart ? "is-start" : "";

  const html = `
    <div class="glow-stop-marker">
      <div class="glow-stop-dot ${pinClass}" title="${stop.name}">
        ${index + 1}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "glow-stop-leaflet-icon",
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

const RealMapView = ({
  buses = [],
  routeStops = DEFAULT_R04_STOPS,
  selectedBusId = null,
  onSelectBus = null,
  height = "380px",
  zoom = 13,
  center = VADODARA_CENTER,
  showControls = true,
  showRouteLine = true,
  isLiveBroadcasting = true,
  singleBus = null,
  className = "",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkersRef = useRef(new Map());
  const stopMarkersGroupRef = useRef(null);
  const routeCasingRef = useRef(null);
  const routeCoreRef = useRef(null);
  const initialFitDoneRef = useRef(false);
  const animFrameRef = useRef(null);
  const busProgressMapRef = useRef(new Map());

  // Combine buses list with singleBus if provided
  const allBuses = useMemo(() => {
    if (singleBus && singleBus.busId) {
      return [singleBus];
    }
    return Array.isArray(buses) ? buses : [];
  }, [buses, singleBus]);

  // Telemetry HUD summary
  const primaryBus = allBuses.find((b) => b.busId === selectedBusId) || allBuses[0] || singleBus;
  const primaryBusId = primaryBus?.busId || primaryBus?.regNo || "BUS-104";

  // Coordinates path connecting the stops (or detailed road waypoints for R-04)
  const pathPoints = useMemo(() => {
    const stops = routeStops && routeStops.length > 0 ? routeStops : DEFAULT_R04_STOPS;
    const isDefaultR04 =
      stops.length === DEFAULT_R04_STOPS.length &&
      Math.abs(stops[0].lat - DEFAULT_R04_STOPS[0].lat) < 0.001;

    if (isDefaultR04) {
      return VADODARA_R04_DETAILED_PATH;
    }

    // Connect user stops sequentially
    return stops.filter((s) => s.lat && s.lng).map((s) => [s.lat, s.lng]);
  }, [routeStops]);

  // State for live telemetry HUD display
  const [liveHudPos, setLiveHudPos] = useState({
    lat: primaryBus?.lat || center[0],
    lng: primaryBus?.lng || center[1],
    speed: primaryBus?.speed || 42,
  });

  // 1. Initialize Leaflet Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = singleBus && singleBus.lat && singleBus.lng
      ? [singleBus.lat, singleBus.lng]
      : center;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // 100% Free OpenStreetMap Standard Tiles
    const tileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
        minZoom: 10,
      }
    );
    tileLayer.addTo(map);

    // Zoom controls on top-left
    L.control.zoom({ position: "topleft" }).addTo(map);

    // Stops layer group
    const stopsGroup = L.layerGroup().addTo(map);
    stopMarkersGroupRef.current = stopsGroup;

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      busMarkersRef.current.clear();
      busProgressMapRef.current.clear();
      initialFitDoneRef.current = false;
    };
  }, []);

  // 2. Render Google Maps Route Polylines and Stop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const stops = routeStops && routeStops.length > 0 ? routeStops : DEFAULT_R04_STOPS;
    const currentStopIdx = primaryBus?.nextStopIndex || 2;

    // Clear old stops
    if (stopMarkersGroupRef.current) {
      stopMarkersGroupRef.current.clearLayers();
    }

    // Render Stop Markers
    stops.forEach((stop, idx) => {
      if (stop.lat && stop.lng) {
        const isDestination = stop.isDestination || idx === stops.length - 1;
        const icon = createStopDivIcon(stop, idx, stops.length, currentStopIdx);
        const marker = L.marker([stop.lat, stop.lng], { icon });

        marker.bindTooltip(
          isDestination ? "🎓 GSFC University Campus" : `<b>${idx + 1}. ${stop.name}</b>`,
          {
            direction: "right",
            offset: isDestination ? [16, 0] : [14, 0],
            className: isDestination ? "glow-campus-tooltip" : "glow-stop-tooltip",
            permanent: false,
          }
        );

        marker.bindPopup(`
          <div class="glow-popup">
            <h4 class="glow-popup-title">
              <span>📍 Stop ${idx + 1}: ${stop.name}</span>
            </h4>
            <p class="glow-popup-subtitle">Corridor Transit Station</p>
            <div class="glow-popup-grid">
              <div><span>Scheduled Time</span><strong>${stop.time || "Scheduled"}</strong></div>
              <div><span>Status</span><strong style="color: #0066ff;">${idx < currentStopIdx ? "Departed" : idx === currentStopIdx ? "Next Stop" : "Upcoming"}</strong></div>
            </div>
            <div class="glow-popup-footer">✓ Geofenced Campus Transit Station</div>
          </div>
        `);

        stopMarkersGroupRef.current?.addLayer(marker);
      }
    });

    // Render Dual-Layer Google Maps Route Line (Navy Casing + Vibrant Blue Core)
    if (showRouteLine && pathPoints.length >= 2) {
      if (routeCasingRef.current && routeCoreRef.current) {
        routeCasingRef.current.setLatLngs(pathPoints);
        routeCoreRef.current.setLatLngs(pathPoints);
      } else {
        if (routeCasingRef.current) routeCasingRef.current.remove();
        if (routeCoreRef.current) routeCoreRef.current.remove();

        // 1. Bottom Casing: dark contrast navy outline with shadow
        const casing = L.polyline(pathPoints, {
          color: "#1e3a8a",
          weight: 8,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
          className: "gm-route-casing",
        }).addTo(map);

        // 2. Top Core: Google Maps electric navigation blue
        const core = L.polyline(pathPoints, {
          color: "#3b82f6",
          weight: 5,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
          className: "gm-route-core",
        }).addTo(map);

        routeCasingRef.current = casing;
        routeCoreRef.current = core;
      }

      // Initial auto-fit bounds
      if (!initialFitDoneRef.current && pathPoints.length >= 2) {
        try {
          const bounds = L.latLngBounds(pathPoints);
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
          initialFitDoneRef.current = true;
        } catch (e) {}
      }
    }
  }, [routeStops, pathPoints, showRouteLine, primaryBus?.nextStopIndex]);

  // 3. Initialize & Synchronize Bus Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const existingMarkers = busMarkersRef.current;
    const currentBusIds = new Set();

    allBuses.forEach((bus, index) => {
      const id = bus.busId || bus.regNo || `BUS-${index}`;
      currentBusIds.add(id);

      const lat = Number(bus.lat) || (pathPoints[0] ? pathPoints[0][0] : 22.3412);
      const lng = Number(bus.lng) || (pathPoints[0] ? pathPoints[0][1] : 73.1710);
      const isSelected = selectedBusId === id;

      if (!existingMarkers.has(id)) {
        const icon = createSmallBusDivIcon(bus, isSelected, 0);
        const marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: 1200,
        }).addTo(map);

        marker.bindPopup(`
          <div class="glow-popup">
            <h4 class="glow-popup-title">
              <span>🚌 ${id}</span>
              <span style="font-size: 11px; color: #16a34a;">● ${bus.status || "On Route"}</span>
            </h4>
            <p class="glow-popup-subtitle">${bus.routeName || "Corridor R-04 (Fatehgunj ↔ GSFC)"}</p>
            <div class="glow-popup-grid">
              <div><span>Speed</span><strong>${bus.speed || 42} km/h</strong></div>
              <div><span>Next Stop</span><strong>${bus.nextStop || "Chhani Jakat Naka"}</strong></div>
              <div><span>ETA</span><strong>${bus.etaMinutes || 6} min</strong></div>
              <div><span>Occupancy</span><strong>${bus.occupancy || 28} / ${bus.capacity || 45} seats</strong></div>
            </div>
            <div class="glow-popup-footer">
              Driver: ${bus.driverName || "Mahesh Patel"} (Ph: ${bus.driverPhone || "+91 98765 11111"})
            </div>
          </div>
        `);

        marker.on("click", () => {
          if (onSelectBus) onSelectBus(id);
        });

        existingMarkers.set(id, marker);

        // Seed simulation progress for this bus along route
        const initialProg = bus.progressPercent
          ? bus.progressPercent / 100
          : (0.35 + index * 0.25) % 0.85;
        busProgressMapRef.current.set(id, {
          progress: initialProg,
          speed: bus.speed || 42,
          lastLat: lat,
          lastLng: lng,
        });
      }
    });

    // Remove obsolete markers
    for (const [id, marker] of existingMarkers.entries()) {
      if (!currentBusIds.has(id)) {
        marker.remove();
        existingMarkers.delete(id);
        busProgressMapRef.current.delete(id);
      }
    }
  }, [allBuses, selectedBusId, pathPoints, onSelectBus]);

  // 4. Smooth Continuous Live Movement Animation Loop
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || pathPoints.length < 2) return;

    let lastTimestamp = performance.now();

    const animateLoop = (now) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1); // Clamp delta time
      lastTimestamp = now;

      allBuses.forEach((bus, index) => {
        const id = bus.busId || bus.regNo || `BUS-${index}`;
        const marker = busMarkersRef.current.get(id);
        if (!marker) return;

        let sim = busProgressMapRef.current.get(id);
        if (!sim) {
          sim = {
            progress: (0.35 + index * 0.25) % 0.85,
            speed: Number(bus.speed) || 42,
            lastLat: pathPoints[0][0],
            lastLng: pathPoints[0][1],
          };
          busProgressMapRef.current.set(id, sim);
        }

        const speedKmh = Number(bus.speed) || sim.speed || 42;

        // Smoothly progress along route (simulating ~40km/h over a ~6km corridor)
        const progressRate = (speedKmh / 3600 / 6) * dt * 0.6; // Controlled smooth pace
        sim.progress = (sim.progress + progressRate) % 1.0;

        // Calculate position and direction angle along road waypoints
        const { lat, lng, bearing } = interpolateAlongPath(pathPoints, sim.progress);

        marker.setLatLng([lat, lng]);
        marker.setIcon(createSmallBusDivIcon(bus, selectedBusId === id, bearing));

        // Update live coordinates in HUD for selected bus
        if (id === primaryBusId) {
          setLiveHudPos((prev) => {
            if (
              Math.abs(prev.lat - lat) > 0.0001 ||
              Math.abs(prev.lng - lng) > 0.0001 ||
              prev.speed !== speedKmh
            ) {
              return { lat, lng, speed: speedKmh };
            }
            return prev;
          });
        }
      });

      animFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [allBuses, pathPoints, selectedBusId, primaryBusId]);

  // Recenter Map on Active Bus
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (liveHudPos.lat && liveHudPos.lng) {
      map.flyTo([Number(liveHudPos.lat), Number(liveHudPos.lng)], 14, {
        animate: true,
        duration: 0.8,
      });
    } else {
      map.flyTo(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [liveHudPos, center, zoom]);

  // Fit Entire Route Corridor
  const handleFitRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pathPoints.length >= 2) {
      const bounds = L.latLngBounds(pathPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [pathPoints]);

  return (
    <div className={`real-map-wrapper ${className}`} style={{ height }}>
      {/* Real Map Leaflet Container */}
      <div ref={mapContainerRef} className="real-map-container" />

      {/* Floating GPS Telemetry HUD */}
      {showControls && (
        <>
          <div className="real-map-hud-top-right">
            <button className="real-map-btn" onClick={handleRecenter} title="Center on active bus">
              <span>🎯 Center Bus</span>
            </button>
            <button className="real-map-btn" onClick={handleFitRoute} title="Fit entire route corridor">
              <span>🗺️ Fit Route</span>
            </button>
          </div>

          <div className="real-map-hud-bottom-left">
            <div className="real-map-pill real-map-pill--green">
              <span className="real-map-live-dot" />
              <span>
                {isLiveBroadcasting !== false ? "Live Real-World GPS" : "Telemetry Active"} · {liveHudPos.speed} km/h
              </span>
            </div>
            <div className="real-map-pill real-map-pill--dark">
              <span>
                {Number(liveHudPos.lat).toFixed(4)}° N, {Number(liveHudPos.lng).toFixed(4)}° E (Vadodara)
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RealMapView;
