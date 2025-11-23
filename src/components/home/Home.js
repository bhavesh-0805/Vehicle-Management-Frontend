// src/components/home/Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaMapMarkerAlt } from "react-icons/fa";
import api from "../../api";
import "./Home.css";
import logo from "../../assets/logo.png";

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    registrationNumber: "",
    color: "",
    fuelType: "",
  });

  const [addError, setAddError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Parking states
  const [showParking, setShowParking] = useState(false);
  const [parkingLoading, setParkingLoading] = useState(false);
  const [parkingError, setParkingError] = useState("");
  const [parkingSpots, setParkingSpots] = useState([]);
  const [coords, setCoords] = useState(null);

  // Mechanic states
  const [showMechanic, setShowMechanic] = useState(false);
  const [mechanicLoading, setMechanicLoading] = useState(false);
  const [mechanicError, setMechanicError] = useState("");
  const [mechanics, setMechanics] = useState([]);


  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchVehicles();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Error loading user info:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    }
  };

  const carImages = {
    maruti: "https://cdn-icons-png.flaticon.com/512/743/743922.png",
    honda: "https://cdn-icons-png.flaticon.com/512/743/743912.png",
    ford: "https://cdn-icons-png.flaticon.com/512/743/743910.png",
    hyundai: "https://cdn-icons-png.flaticon.com/512/743/743929.png",
    toyota: "https://cdn-icons-png.flaticon.com/512/743/743935.png",
    tata: "https://cdn-icons-png.flaticon.com/512/743/743941.png",
    default: "https://cdn-icons-png.flaticon.com/512/743/743920.png",
  };

  const getCarImage = (make = "") => {
    const key = (make || "").toLowerCase();
    if (key.includes("maruti")) return carImages.maruti;
    if (key.includes("honda")) return carImages.honda;
    if (key.includes("ford")) return carImages.ford;
    if (key.includes("hyundai")) return carImages.hyundai;
    if (key.includes("toyota")) return carImages.toyota;
    if (key.includes("tata")) return carImages.tata;
    return carImages.default;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setAddError("");
    setSubmitting(true);

    try {
      // normalize registration number
      const payload = {
        ...formData,
        registrationNumber: String(formData.registrationNumber || "").trim().toUpperCase(),
      };

      await api.post("/vehicles", payload);

      // success: refresh list, clear form, close modal
      setShowModal(false);
      await fetchVehicles();
      setFormData({
        make: "",
        model: "",
        year: "",
        registrationNumber: "",
        color: "",
        fuelType: "",
      });
    } catch (err) {
      console.error("Add vehicle error (full):", err);
      let msg = "Can't save this vehicle. Try again.";

      if (err.response) {
        const data = err.response.data;
        if (data && typeof data.message === "string" && data.message.trim()) {
          msg = data.message;
        } else if (data && typeof data.error === "string" && data.error.trim()) {
          msg = data.error;
        } else if (data && data.keyValue && data.keyValue.registrationNumber) {
          msg = "A vehicle with this registration number already exists.";
        } else if (data && Array.isArray(data.errors)) {
          msg = data.errors.map((x) => x.msg || x.message || JSON.stringify(x)).join("; ");
        } else {
          try {
            msg = JSON.stringify(data).slice(0, 180);
          } catch {
            msg = err.response.statusText || msg;
          }
        }

        if (
          String(msg).toLowerCase().includes("duplicate") ||
          String(msg).toLowerCase().includes("already exists") ||
          err.response.status === 400
        ) {
          if (
            String(msg).toLowerCase().includes("registration") ||
            (err.response.data && err.response.data.keyValue && err.response.data.keyValue.registrationNumber)
          ) {
            msg = "Can't save this vehicle — registration number already exists.";
          } else if (err.response.status === 400 && String(msg).toLowerCase().includes("exists")) {
            msg = "Can't save this vehicle — registration number already exists.";
          }
        }
      } else if (err.request) {
        msg = "No response from server. Check your backend.";
      } else if (err.message) {
        msg = err.message;
      }

      setAddError(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // accept event and id, stop propagation to prevent parent onClick
  const handleDeleteVehicle = async (e, id) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
      e.preventDefault();
    }

    const ok = window.confirm("Are you sure you want to delete this vehicle?");
    if (!ok) return;

    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ---------- Parking Nearby logic ----------
  const openGoogleMapsSearch = (lat, lon) => {
    // open Google Maps search for parking at coords
    const mapsUrl = `https://www.google.com/maps/search/parking/@${lat},${lon},15z`;
    window.open(mapsUrl, "_blank");
  };

  const findParkingNearby = () => {
    setParkingError("");
    setParkingSpots([]);
    setShowParking(true);

    if (!navigator.geolocation) {
      setParkingError("Geolocation is not supported by your browser.");
      return;
    }

    setParkingLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });

        // Overpass QL: find parking amenities within 2000m
        const q = `
          [out:json][timeout:15];
          (
            node["amenity"="parking"](around:2000,${lat},${lon});
            way["amenity"="parking"](around:2000,${lat},${lon});
            relation["amenity"="parking"](around:2000,${lat},${lon});
          );
          out center 20;
        `;

        try {
          const resp = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams({ data: q }).toString(),
          });

          if (!resp.ok) throw new Error(`Overpass failed: ${resp.status}`);

          const data = await resp.json();
          const elements = Array.isArray(data.elements) ? data.elements : [];

          const spots = elements.map((el) => {
            const latEl = el.lat ?? (el.center && el.center.lat);
            const lonEl = el.lon ?? (el.center && el.center.lon);
            const name = (el.tags && (el.tags.name || el.tags["parking"] || el.tags["operator"])) || "Parking";
            const distance = latEl && lonEl ? haversineDistance(lat, lon, latEl, lonEl) : null;
            return {
              id: el.id,
              name,
              lat: latEl,
              lon: lonEl,
              distance,
            };
          })
            .filter(s => s.lat && s.lon)
            .sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));

          if (spots.length === 0) {
            setParkingError("No parking spots found nearby. You can open Google Maps search instead.");
          } else {
            setParkingSpots(spots.slice(0, 12)); // show top 12
          }
        } catch (err) {
          console.error("Overpass fetch error:", err);
          setParkingError("Couldn't fetch nearby parking (Overpass). Use Google Maps fallback.");
        } finally {
          setParkingLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setParkingLoading(false);
        if (err.code === 1) {
          setParkingError("Location permission denied. Allow location to find nearby parking.");
        } else {
          setParkingError("Unable to get your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const findMechanicNearby = () => {
    setMechanicError("");
    setMechanics([]);
    setShowMechanic(true);

    if (!navigator.geolocation) {
      setMechanicError("Geolocation not supported.");
      return;
    }

    setMechanicLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const q = `
        [out:json][timeout:15];
        (
          node["shop"="car_repair"](around:2500,${lat},${lon});
          node["amenity"="car_repair"](around:2500,${lat},${lon});
        );
        out center;
      `;

        try {
          const resp = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: new URLSearchParams({ data: q }).toString(),
          });

          const data = await resp.json();
          const list = (data.elements || []).map((m) => ({
            id: m.id,
            name: m.tags?.name || "Mechanic Shop",
            lat: m.lat,
            lon: m.lon,
            distance: haversineDistance(lat, lon, m.lat, m.lon),
          }))
            .sort((a, b) => a.distance - b.distance);

          if (list.length === 0) {
            setMechanicError("No mechanics found nearby.");
          }

          setMechanics(list.slice(0, 10));
        } catch (err) {
          setMechanicError("Error finding mechanics.");
        } finally {
          setMechanicLoading(false);
        }
      },
      () => {
        setMechanicLoading(false);
        setMechanicError("Location access denied.");
      }
    );
  };


  // helper: compute approximate meters between two coords
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    function toRad(v) { return (v * Math.PI) / 180; }
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // meters
  };

  // ---------- end Parking logic ----------

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="AutoNexus" />
        </div>
        <ul className="nav-links">
          <li className="mechanic-wrapper">
            <button className="mechanic-btn" onClick={findMechanicNearby} title="Find mechanic nearby">
              <FaMapMarkerAlt style={{ marginRight: 3 }} />
              Mechanic Nearby
            </button>
          </li>

          <li className="parking-wrapper">
            <button className="parking-btn" onClick={findParkingNearby} title="Find parking nearby">
              <FaMapMarkerAlt style={{ marginRight: 3 }} />
              Parking Nearby
            </button>
          </li>

          <li>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="content">
        <div className="header-row">
          <h2 className="welcome-text">
            👋 Hello,{" "}
            <span className="username">{user ? user.name || user.email : "User"}</span>
          </h2>
          <h1 className="page-title">My Vehicles</h1>
        </div>

        <div className="vehicle-grid">
          {vehicles.length > 0 ? (
            vehicles.map((v) => (
              <div
                key={v._id}
                className="vehicle-card"
                onClick={() => navigate(`/vehicle/${v._id}`)}
                style={{ cursor: "pointer" }}
              >
                <button className="delete-icon" onClick={(e) => handleDeleteVehicle(e, v._id)} title="Delete Vehicle">
                  <FaTrash />
                </button>

                <div className="vehicle-info">
                  <h3>{v.make} {v.model}</h3>
                  <p>{v.registrationNumber}</p>
                  <p>{v.year}</p>
                  <p>{v.color}</p>
                  <p>{v.fuelType}</p>
                </div>

                <img src={v.image || getCarImage(v.make)} alt={v.make} className="vehicle-image" />
              </div>
            ))
          ) : (
            <p className="no-data">No vehicles found. Add one below!</p>
          )}
        </div>

        {/* Add Vehicle Button */}
        <button className="add-vehicle-btn" onClick={() => setShowModal(true)}>+ Add Vehicle</button>

        {/* Add Vehicle Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2>Add Vehicle</h2>
              <form onSubmit={handleAddVehicle} className="vehicle-form">
                <input name="make" placeholder="Make" value={formData.make} onChange={handleChange} required />
                <input name="model" placeholder="Model" value={formData.model} onChange={handleChange} required />
                <input name="year" placeholder="Year" value={formData.year} onChange={handleChange} required />
                <input name="registrationNumber" placeholder="Registration Number" value={formData.registrationNumber} onChange={handleChange} required />
                <input name="color" placeholder="Color" value={formData.color} onChange={handleChange} />
                <input name="fuelType" placeholder="Fuel Type" value={formData.fuelType} onChange={handleChange} />

                {/* show add error if any */}
                {addError && <p className="error-msg">{addError}</p>}

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={submitting}>{submitting ? "Saving..." : "Save Vehicle"}</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Parking Modal */}
        {showParking && (
          <div className="parking-modal-overlay" onClick={() => setShowParking(false)}>
            <div className="parking-modal" onClick={(e) => e.stopPropagation()}>
              <div className="parking-header">
                <h3><FaMapMarkerAlt /> Parking Nearby</h3>
                <div>
                  <button className="close-btn" onClick={() => setShowParking(false)}>Close</button>
                </div>
              </div>

              {parkingLoading && <p>Finding parking near you… (asking for location)</p>}

              {!parkingLoading && parkingError && (
                <div>
                  <p className="error-msg">{parkingError}</p>
                  <div style={{ marginTop: 8 }}>
                    {coords ? (
                      <button className="open-maps-btn" onClick={() => openGoogleMapsSearch(coords.lat, coords.lon)}>Open Google Maps Search</button>
                    ) : (
                      <button className="open-maps-btn" onClick={() => {
                        // try geolocation again to form maps link
                        navigator.geolocation.getCurrentPosition(pos => openGoogleMapsSearch(pos.coords.latitude, pos.coords.longitude), () => window.open("https://www.google.com/maps/search/parking", "_blank"));
                      }}>Open Google Maps</button>
                    )}
                  </div>
                </div>
              )}

              {!parkingLoading && !parkingError && parkingSpots.length === 0 && (
                <div>
                  <p>No parking spots found (try expanding search in Google Maps).</p>
                  {coords && <button className="open-maps-btn" onClick={() => openGoogleMapsSearch(coords.lat, coords.lon)}>Open Google Maps Search</button>}
                </div>
              )}

              {!parkingLoading && parkingSpots.length > 0 && (
                <div className="parking-list">
                  <p>Showing nearest parking spots (from OpenStreetMap):</p>
                  <ul>
                    {parkingSpots.map((p) => (
                      <li key={p.id} className="parking-item">
                        <div className="p-left">
                          <strong>{p.name}</strong>
                          <div className="p-meta">{p.distance ? `${p.distance} m` : "distance unknown"}</div>
                        </div>
                        <div className="p-actions">
                          <button className="open-maps-small" onClick={() => openGoogleMapsSearch(p.lat, p.lon)}>Open in Maps</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {showMechanic && (
          <div className="parking-modal-overlay" onClick={() => setShowMechanic(false)}>
            <div className="parking-modal" onClick={(e) => e.stopPropagation()}>
              <div className="parking-header">
                <h3><FaMapMarkerAlt /> Mechanic Nearby</h3>
                <button className="close-btn" onClick={() => setShowMechanic(false)}>Close</button>
              </div>

              {mechanicLoading && <p>Finding mechanics near you…</p>}

              {!mechanicLoading && mechanicError && (
                <p className="error-msg">{mechanicError}</p>
              )}

              {!mechanicLoading && !mechanicError && mechanics.length > 0 && (
                <ul className="parking-list">
                  {mechanics.map((m) => (
                    <li key={m.id} className="parking-item">
                      <div>
                        <strong>{m.name}</strong>
                        <div className="p-meta">{m.distance} m</div>
                      </div>
                      <button
                        className="open-maps-small"
                        onClick={() =>
                          window.open(`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lon}`, "_blank")
                        }
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!mechanicLoading && mechanics.length === 0 && !mechanicError && (
                <p>No mechanic shops found nearby.</p>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
