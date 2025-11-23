// import React, { useState, useEffect } from "react";
// import api from "../../api";

// export default function MaintenanceList({ vehicles }) {
//   const [selectedVehicleId, setSelectedVehicleId] = useState("");
//   const [title, setTitle] = useState("");
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const loadMaintenance = async (vehicleIdToLoad) => {
//     if (!vehicleIdToLoad) return;
//     setLoading(true);
//     try {
//       const res = await api.get(`/maintenance/vehicle/${vehicleIdToLoad}`);
//       setList(res.data);
//     } catch (err) {
//       console.error("Error loading maintenance:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addMaintenance = async (e) => {
//     e.preventDefault();
//     if (!selectedVehicleId) return alert("Select a vehicle first");
//     await api.post("/maintenance", {
//       vehicleId: selectedVehicleId,
//       title,
//     });
//     setTitle("");
//     loadMaintenance(selectedVehicleId); // refresh list
//   };

//   // ✅ Re-fetch after refresh/login when vehicles become available
//   useEffect(() => {
//     if (vehicles.length > 0 && selectedVehicleId) {
//       loadMaintenance(selectedVehicleId);
//     }
//   }, [vehicles, selectedVehicleId]);

//   return (
//     <div className="form-container">
//       <h3>Maintenance Records</h3>
//       <form onSubmit={addMaintenance}>
//         <select
//           value={selectedVehicleId}
//           onChange={(e) => setSelectedVehicleId(e.target.value)}
//           required
//         >
//           <option value="">-- Select Vehicle --</option>
//           {vehicles.map((v) => (
//             <option key={v._id} value={v._id}>
//               {v.make} ({v.registrationNumber})
//             </option>
//           ))}
//         </select>

//         <input
//           placeholder="Task (e.g., Oil Change)"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           required
//         />
//         <button type="submit">Add</button>
//       </form>

//       {loading ? (
//         <p>Loading maintenance...</p>
//       ) : (
//         <ul>
//           {list.map((m) => (
//             <li key={m._id}>
//               {m.title} — {m.completed ? "✅ Done" : "⏳ Pending"}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
