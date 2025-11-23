import React, { useState } from 'react';
import api from '../../api';

export default function AddVehicle({ onAdded }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/vehicles', { make, model, year });
    onAdded(res.data);
    setMsg('✅ Vehicle added');
    setMake(''); setModel(''); setYear('');
  };

  return (
    <div className="form-container">
      <h3>Add Vehicle</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Make" value={make} onChange={e => setMake(e.target.value)} required />
        <input placeholder="Model" value={model} onChange={e => setModel(e.target.value)} required />
        <input placeholder="Year" value={year} onChange={e => setYear(e.target.value)} required />
        <button type="submit">Add</button>
      </form>
      {msg && <p className="msg">{msg}</p>}
    </div>
  );
}
