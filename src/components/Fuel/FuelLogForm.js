import React, { useState, useEffect } from "react";
import api from "../../api";

export default function FuelLogForm({ vehicles }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [litres, setLitres] = useState("");
  const [cost, setCost] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadFuelLogs = async (vehicleIdToLoad) => {
    if (!vehicleIdToLoad) return;
    setLoading(true);
    try {
      const res = await api.get(`/fuel/vehicle/${vehicleIdToLoad}`);
      setLogs(res.data);
    } catch (err) {
      console.error("Error loading fuel logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) return alert("Select a vehicle first");
    await api.post("/fuel", {
      vehicleId: selectedVehicleId,
      litres: Number(litres),
      cost: Number(cost),
    });
    setLitres("");
    setCost("");
    setMsg("✅ Fuel log added!");
    loadFuelLogs(selectedVehicleId); // refresh list
  };

  // ✅ Re-fetch logs when vehicles or selected vehicle change
  useEffect(() => {
    if (vehicles.length > 0 && selectedVehicleId) {
      loadFuelLogs(selectedVehicleId);
    }
  }, [vehicles, selectedVehicleId]);

  return (
    <div className="form-container">
      <h3>Fuel Logs</h3>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          required
        >
          <option value="">-- Select Vehicle --</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.make} ({v.registrationNumber})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Litres"
          value={litres}
          onChange={(e) => setLitres(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Cost (₹)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
        />

        <button type="submit">Add</button>
      </form>

      {msg && <p className="msg">{msg}</p>}

      {loading ? (
        <p>Loading fuel logs...</p>
      ) : (
        <ul>
          {logs.map((f) => (
            <li key={f._id}>
              {f.litres} L — ₹{f.cost}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
