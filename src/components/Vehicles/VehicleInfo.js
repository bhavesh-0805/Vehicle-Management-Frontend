// frontend/src/components/home/VehicleInfo.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "./VehicleInfo.css";
import logo from "../../assets/logo.png";
import { FaChevronLeft } from "react-icons/fa";

export default function VehicleInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [fuellogs, setFuellogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("info"); // info | fuel | maintenance
  const [err, setErr] = useState("");

  useEffect(() => {
    // load user and vehicle basic info on mount
    (async () => {
      try {
        setLoading(true);
        const [uRes, vRes] = await Promise.all([
          api.get("/auth/me").catch(() => ({ data: null })),
          api.get(`/vehicles/${id}`),
        ]);
        setUser(uRes?.data || null);
        setVehicle(vRes?.data || null);
      } catch (e) {
        console.error("Initial load error:", e);
        setErr(
          e.response?.data?.message ||
            e.response?.data?.error ||
            e.message ||
            "Failed to load vehicle data."
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load maintenance or fuel only when that tab is activated
  useEffect(() => {
    if (active === "maintenance") loadMaintenance();
    if (active === "fuel") loadFuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const loadMaintenance = async () => {
    try {
      setErr("");
      const res = await api.get(`/maintenance/vehicle/${id}`);
      setMaintenance(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Maintenance load error:", e);
      setErr("Failed to load maintenance records.");
    }
  };

  const loadFuel = async () => {
    try {
      setErr("");
      const res = await api.get(`/fuel/vehicle/${id}`);
      setFuellogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Fuel load error:", e);
      setErr("Failed to load fuel logs.");
    }
  };

  const goEdit = () => {
    navigate(`/vehicle/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="vehicle-info-page">
        <div className="vi-loading">Loading...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="vehicle-info-page">
        <div className="vi-sidepanel">
          <div className="vi-logo" onClick={() => navigate("/home")}>
            <img src={logo} alt="logo" />
          </div>
        </div>
        <div className="vi-main">
          <div className="vi-error">{err}</div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-info-page">
        <div className="vi-sidepanel">
          <div className="vi-logo" onClick={() => navigate("/home")}>
            <img src={logo} alt="logo" />
          </div>
        </div>
        <div className="vi-main">
          <div className="vi-error">Vehicle not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-info-page">
      <aside className="vi-sidepanel">
        <div className="vi-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="logo" />
        </div>

        <div className="vi-welcome">
          <div className="welcome-txt">Welcome</div>
          <div className="welcome-user">{user ? user.name || user.email : "User"}</div>
        </div>

        <nav className="vi-menu">
          <button
            className={active === "info" ? "vi-menu-item active" : "vi-menu-item"}
            onClick={() => setActive("info")}
          >
            Vehicle Info
          </button>
          <button
            className={active === "fuel" ? "vi-menu-item active" : "vi-menu-item"}
            onClick={() => setActive("fuel")}
          >
            Fuel Log
          </button>
          <button
            className={active === "maintenance" ? "vi-menu-item active" : "vi-menu-item"}
            onClick={() => setActive("maintenance")}
          >
            Maintenance
          </button>
        </nav>

        <div className="vi-side-bottom">
          <button className="vi-small" onClick={() => navigate("/home")}>
            <FaChevronLeft /> Back to Home
          </button>
          <div className="vi-version">v1.0</div>
        </div>
      </aside>

      <main className="vi-main">
        <header className="vi-header">
          <div>
            <h2>
              {vehicle.make} {vehicle.model}
            </h2>
            <p className="vi-sub">{vehicle.registrationNumber}</p>
          </div>

          <div className="vi-header-actions">
            <button className="vi-edit" onClick={goEdit}>
              Edit
            </button>
          </div>
        </header>

        <section className="vi-content">
          {active === "info" && (
            <div className="vi-panel">
              <h3>Vehicle Information</h3>
              <div className="vi-grid">
                <div className="vi-row">
                  <div className="label">Make</div>
                  <div className="val">{vehicle.make}</div>
                </div>
                <div className="vi-row">
                  <div className="label">Model</div>
                  <div className="val">{vehicle.model}</div>
                </div>
                <div className="vi-row">
                  <div className="label">Year</div>
                  <div className="val">{vehicle.year || "—"}</div>
                </div>
                <div className="vi-row">
                  <div className="label">Registration</div>
                  <div className="val">{vehicle.registrationNumber}</div>
                </div>
                <div className="vi-row">
                  <div className="label">Color</div>
                  <div className="val">{vehicle.color || "—"}</div>
                </div>
                <div className="vi-row">
                  <div className="label">Fuel Type</div>
                  <div className="val">{vehicle.fuelType || "—"}</div>
                </div>
                <div className="vi-row">
                  <div className="label">Added On</div>
                  <div className="val">
                    {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "fuel" && (
            <div className="vi-panel">
              <div className="vi-panel-header">
                <h3>Fuel Logs</h3>
                <button className="vi-small-link" onClick={() => navigate("/fuel")}>
                  Open Fuel Module
                </button>
              </div>

              {fuellogs.length === 0 ? (
                <div className="no-items">No fuel logs yet.</div>
              ) : (
                <table className="vi-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Litres</th>
                      <th>Cost</th>
                      <th>Odometer</th>
                    </tr>
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

          {active === "maintenance" && (
            <div className="vi-panel">
              <div className="vi-panel-header">
                <h3>Maintenance</h3>
                <button className="vi-small-link" onClick={() => navigate("/maintenance")}>
                  Open Maintenance Module
                </button>
              </div>

              {maintenance.length === 0 ? (
                <div className="no-items">No maintenance records yet.</div>
              ) : (
                <ul className="vi-list">
                  {maintenance.map((m) => (
                    <li key={m._id}>
                      <div>
                        <strong>{m.title}</strong>
                        <div className="li-meta">
                          {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "No date"} •{" "}
                          {m.cost ? `₹${m.cost}` : "—"}
                        </div>
                      </div>
                      <div>{m.completed ? "✅" : "⏳"}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
