// src/components/home/VehicleInfo.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api";
import "./VehicleInfo.css";
import logo from "../../assets/logo.png";
import MaintenancePanel from "./MaintenancePanel";

export default function VehicleInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [fuellogs, setFuellogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("details"); // details | maintenance | fuel

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [vRes, fRes] = await Promise.all([
        api.get(`/vehicles/${id}`),
        api.get(`/fuel/vehicle/${id}`)
      ]);
      const raw = vRes.data || {};
      const normalized = {
        ...raw,
        color: raw.color ?? raw.colour ?? "",
        fuelType: raw.fuelType ?? raw.fuel ?? "",
      };
      setVehicle(normalized);
      setFuellogs(Array.isArray(fRes.data) ? fRes.data : []);
    } catch (error) {
      console.error("Error loading vehicle info:", error);
      setErr("Failed to load vehicle data.");
    } finally {
      setLoading(false);
    }
  };

  const goToEdit = () => navigate(`/vehicle/${id}/edit`);

  if (loading) return <div className="vehicle-info-page"><p className="loading">Loading...</p></div>;
  if (err) return <div className="vehicle-info-page"><p className="error">{err}</p></div>;
  if (!vehicle) return <div className="vehicle-info-page"><p>No vehicle found</p></div>;

  return (
    <div className="vehicle-info-page">
      <nav className="vi-navbar">
        <div className="vi-left" onClick={() => navigate("/home")} style={{cursor:'pointer'}}>
          <img src={logo} alt="logo" />
          <span className="brand">Vehicle Management</span>
        </div>
        <div className="vi-actions">
          <button className="vi-edit" onClick={goToEdit}>Edit</button>
        </div>
      </nav>

      <div className="vi-content">
        <div className="vi-header-card">
          <div className="vi-left-card">
            <h1>{vehicle.make} {vehicle.model}</h1>
            <p className="reg">{vehicle.registrationNumber}</p>
            <div className="meta-row">
              <span><strong>Year:</strong> {vehicle.year || "—"}</span>
              <span><strong>Color:</strong> {vehicle.color || "—"}</span>
              <span><strong>Fuel:</strong> {vehicle.fuelType || "—"}</span>
            </div>
            <p className="created">Added: {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString() : "—"}</p>
          </div>

          <div className="vi-image">
            <img
              src={vehicle.image || "https://cdn-icons-png.flaticon.com/512/743/743920.png"}
              alt={`${vehicle.make} ${vehicle.model}`}
            />
          </div>
        </div>

        <div className="vi-tabs">
          <button className={activeTab==="details" ? "active" : ""} onClick={() => setActiveTab("details")}>Details</button>
          <button className={activeTab==="maintenance" ? "active" : ""} onClick={() => setActiveTab("maintenance")}>Maintenance</button>
          <button className={activeTab==="fuel" ? "active" : ""} onClick={() => setActiveTab("fuel")}>Fuel Logs ({fuellogs.length})</button>
        </div>

        <div className="vi-tab-content">
          {activeTab === "details" && (
            <div className="vi-details">
              <h3>Vehicle Information</h3>
              <table className="vi-table">
                <tbody>
                  <tr><td>Make</td><td>{vehicle.make}</td></tr>
                  <tr><td>Model</td><td>{vehicle.model}</td></tr>
                  <tr><td>Registration No.</td><td>{vehicle.registrationNumber}</td></tr>
                  <tr><td>Year</td><td>{vehicle.year}</td></tr>
                  <tr><td>Color</td><td>{vehicle.color}</td></tr>
                  <tr><td>Fuel Type</td><td>{vehicle.fuelType}</td></tr>
                  <tr><td>Notes</td><td>{vehicle.notes || "—"}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "maintenance" && (
            <MaintenancePanel vehicleId={id} />
          )}

          {activeTab === "fuel" && (
            <div className="vi-fuel">
              <div className="vi-section-header">
                <h3>Fuel Logs</h3>
                <Link to="/fuel" className="small-link">Open fuel module</Link>
              </div>

              {fuellogs.length === 0 ? (
                <p className="no-items">No fuel logs recorded.</p>
              ) : (
                <table className="vi-table">
                  <thead>
                    <tr><th>Date</th><th>Litres</th><th>Cost</th><th>Odometer</th></tr>
                  </thead>
                  <tbody>
                    {fuellogs.map((f) => (
                      <tr key={f._id}>
                        <td>{f.date ? new Date(f.date).toLocaleDateString() : "—"}</td>
                        <td>{f.litres}</td>
                        <td>{f.cost ? `₹${f.cost}` : "—"}</td>
                        <td>{f.odometer || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
