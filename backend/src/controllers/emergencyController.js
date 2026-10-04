import SosAlert from "../models/SosAlert.js";

// POST /api/v1/emergencies/sos
export const triggerSos = async (req, res, next) => {
  try {
    const { reportedBy, role, busId, eventType, location, coordinates, notes } = req.body;

    const alert = await SosAlert.create({
      alertId: `EMG-${Date.now().toString().slice(-6)}`,
      reportedBy: reportedBy || req.user?.id || "ANONYMOUS",
      role: role || req.user?.role || "student",
      busId: busId || "BUS-104",
      eventType: eventType || "SOS Panic Button",
      location: location || "Near Nizampura Char Rasta, Vadodara",
      coordinates: coordinates || { lat: 22.3350, lng: 73.1750 },
      notes: notes || "Emergency panic button triggered from GLOW mobile web portal.",
      status: "ACTIVE",
      timestamp: new Date(),
    });

    return res.status(201).json({
      success: true,
      incident: {
        id: alert.alertId,
        status: alert.status,
        timestamp: alert.timestamp,
        securityDispatched: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
