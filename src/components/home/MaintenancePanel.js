// src/components/home/MaintenancePanel.js
import React, { useEffect, useState } from "react";
import api from "../../api";
import "./MaintenancePanel.css";

export default function MaintenancePanel({ vehicleId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [cost, setCost] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vehicleId) loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const loadList = async () => {
    if (!vehicleId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/maintenance/vehicle/${vehicleId}`);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load maintenance:", err);
      setError("Failed to load maintenance records.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDueDate("");
    setCost("");
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        // update
        await api.patch(`/maintenance/${editingId}`, {
          title: title.trim(),
          dueDate: dueDate || null,
          cost: cost ? Number(cost) : undefined,
        });
      } else {
        // create
        await api.post("/maintenance", {
          vehicleId,
          title: title.trim(),
          dueDate: dueDate || null,
          cost: cost ? Number(cost) : undefined,
        });
      }
      await loadList();
      resetForm();
    } catch (err) {
      console.error("Save maintenance error:", err);
      setError(err.response?.data?.message || "Failed to save maintenance.");
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (id, current) => {
    try {
      await api.patch(`/maintenance/${id}`, { completed: !current });
      setList((prev) => prev.map((p) => (p._id === id ? { ...p, completed: !current } : p)));
    } catch (err) {
      console.error("Toggle complete error:", err);
      setError("Could not update status.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setTitle(item.title || "");
    setDueDate(item.dueDate ? item.dueDate.slice(0, 10) : "");
    setCost(item.cost ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this maintenance record?")) return;
    try {
      await api.delete(`/maintenance/${id}`);
      setList((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete maintenance error:", err);
      setError("Failed to delete record.");
    }
  };

  return (
    <div className="maintenance-panel">
      <div className="mp-header">
        <h2>Maintenance</h2>
        <p className="mp-sub">Automated reminders • Service history • Upcoming tasks</p>
      </div>

      <form className="mp-form" onSubmit={submit}>
        {error && <div className="mp-error">{error}</div>}

        <div className="mp-row">
          <input
            className="mp-input"
            placeholder="Task (e.g., Oil change)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="mp-input mp-input-small"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <input
            className="mp-input mp-input-small"
            placeholder="Cost (optional)"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>

        <div className="mp-actions">
          <button type="submit" className="mp-btn mp-btn-primary" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Add maintenance"}
          </button>

          {editingId && (
            <button
              type="button"
              className="mp-btn mp-btn-ghost"
              onClick={() => resetForm()}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <hr className="mp-sep" />

      <section>
        <h3 className="mp-section-title">Upcoming</h3>

        {loading ? (
          <div className="mp-empty">Loading...</div>
        ) : list.length === 0 ? (
          <div className="mp-empty">No maintenance tasks recorded for this vehicle.</div>
        ) : (
          <ul className="mp-list">
            {list.map((m) => {
              const due = m.dueDate ? new Date(m.dueDate) : null;
              const overdue = due && due < new Date() && !m.completed;
              return (
                <li key={m._id} className={`mp-item ${m.completed ? "completed" : ""} ${overdue ? "overdue" : ""}`}>
                  <div className="mp-item-left">
                    <div className="mp-item-title">{m.title}</div>
                    <div className="mp-meta">
                      {due ? due.toLocaleDateString() : "No date"} • {m.cost ? `₹${m.cost}` : "Cost not added"}
                    </div>
                  </div>

                  <div className="mp-item-actions">
                    <button className="mp-small" onClick={() => toggleComplete(m._id, m.completed)}>
                      {m.completed ? "Undo" : "Done"}
                    </button>
                    <button className="mp-small" onClick={() => startEdit(m)}>Edit</button>
                    <button className="mp-small danger" onClick={() => remove(m._id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <hr className="mp-sep" />

      <section>
        <h3 className="mp-section-title">History</h3>
        <div className="mp-empty small">Completed items are shown in the list above (toggle to filter later).</div>
      </section>
    </div>
  );
}
