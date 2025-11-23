import React, { useState } from "react";
import api from "../../api";

export default function VehicleList({ vehicles, refreshVehicles, onSelect }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [msg, setMsg] = useState("");

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    if (!make || !model || !year || !registrationNumber) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await api.post("/vehicles", {
        make,
        model,
        year,
        registrationNumber,
      });

      // ✅ Clear input fields
      setMake("");
      setModel("");
      setYear("");
      setRegistrationNumber("");

      // ✅ Show success message
      setMsg("✅ Vehicle added successfully!");

      // ✅ Refresh vehicle list everywhere (Dashboard + dropdowns)
      refreshVehicles();

      // ✅ Remove message after 3 seconds
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setMsg("❌ Failed to add vehicle. Try again.");
    }
  };

  return (
    <div className="vehicle-section">
      <h2>Your Vehicles</h2>

      {/* ✅ Add vehicle form */}
      <form className="vehicle-form" onSubmit={handleAddVehicle}>
        <input
          placeholder="Make (e.g. Honda)"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          required
        />
        <input
          placeholder="Model (e.g. City)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <input
          placeholder="Registration Number (e.g. DL8CAV3752)"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          required
        />
        <button type="submit">Add Vehicle</button>
      </form>

      {msg && <p className="msg">{msg}</p>}

      {/* ✅ Vehicle list display */}
      <div className="list-container">
        {vehicles.length === 0 ? (
          <p>No vehicles added yet.</p>
        ) : (
          <ul>
            {vehicles.map((v) => (
              <li key={v._id} onClick={() => onSelect && onSelect(v._id)}>
                <strong>
                  {v.make} {v.model}
                </strong>{" "}
                ({v.year}) – <em>{v.registrationNumber}</em>
              </li>
            ))}
          </ul>
        )}
        {vehicles.length > 0 && <small>Click a vehicle to view analytics</small>}
      </div>
    </div>
  );
}
