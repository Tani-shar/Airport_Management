import React, { useState, useEffect } from 'react';

export const FlightDialog = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    airline: '',
    departure: '',
    arrival: '',
    departure_time: '',
    arrival_time: '',
    date: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        airline: '',
        departure: '',
        arrival: '',
        departure_time: '',
        arrival_time: '',
        date: '',
      });
    }
  }, [initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box">
        <h2>{initialData ? 'Edit Flight' : 'Add Flight'}</h2>
        <div className="form-group">
          <label>Airline</label>
          <input name="airline" value={form.airline} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Departure Airport</label>
          <input name="departure" value={form.departure} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Arrival Airport</label>
          <input name="arrival" value={form.arrival} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Departure Time</label>
          <input type="time" name="departure_time" value={form.departure_time} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Arrival Time</label>
          <input type="time" name="arrival_time" value={form.arrival_time} onChange={handleChange} />
        </div>

        <div className="dialog-actions">
          <button className="admin-btn admin-btn-danger" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};
