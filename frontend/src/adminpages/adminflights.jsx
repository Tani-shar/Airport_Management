import React, { useEffect, useState } from 'react';

export const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchFlights = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/flights", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    //   console.log(response.data);
      
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setFlights(data);

      }
      if(!response.ok) {
        
      }
      
    } catch (err) {
        

      console.error("Failed to fetch flights:", err);
    }
  };

  const handleAddFlight = () => {
    setIsEditing(false);
    setCurrentFlight(null);
    setDialogOpen(true);  // Open dialog for adding a new flight
  };

  const handleEditFlight = (flight) => {
    setIsEditing(true);
    setCurrentFlight(flight);
    setDialogOpen(true);  // Open dialog for editing a flight
  };

  const handleDeleteFlight = async (flightId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/flights/delete?flight_id=${flightId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFlights(); // Refresh the list
      }
    } catch (err) {
      console.error("Failed to delete flight:", err);
    }
  };

  const handleSaveFlight = async (formData) => {
    try {
        // Transform form data to match backend expectations
        console.log(formData);
        const flightData = {
            airline_id: parseInt(formData.airline), // Convert to number
            source: formData.departure,          // Map to source
            destination: formData.arrival,       // Map to destination
            date: formData.date,
            departure_time: formData.departure_time,
            arrival_time: formData.arrival_time,
            price : parseInt(formData.price) || 15000,            
            seats_available: parseInt(formData.available_seats) || 120, // Convert to number
            duration: formData.duration || "2h 30m", // Default value

        };
        console.log(flightData);
        const url = isEditing 
            ? `http://localhost:3001/api/admin/flights/${currentFlight.flight_id}`
            : "http://localhost:3001/api/admin/flights/add";
        
        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(flightData),
        });
        const errorText = await response.text();
        console.error("Error status:", response.status, "Error text:", errorText);
        alert(`Failed to save flight: ${errorText}`);



        if (response.ok) {
            fetchFlights(); // Refresh the list
            setDialogOpen(false);
        }
    } catch (err) {
        console.error("Failed to save flight:", err);
    }
};


  useEffect(() => {
    fetchFlights();
  }, []);

  return (
    <div>
      <h1>Flights Management</h1>
      <div className="actions-bar">
        <button 
          className="admin-btn admin-btn-primary"
          onClick={handleAddFlight} // Trigger dialog open when clicked
        >
          Add New Flight
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Flight ID</th>
            <th>Airline</th>
            <th>From</th>
            <th>To</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Available Seats</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight.flight_id}>
              <td>{flight.flight_id}</td>
              <td>{flight.airline}</td>
              <td>{flight.departure}</td>
              <td>{flight.arrival}</td>
              <td>{flight.departure_time}</td>
              <td>{flight.arrival_time}</td>
              <td>{flight.available_seat}</td>
              <td>{formatDate(flight.date)}</td>
              <td>
                {/* <button 
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleEditFlight(flight)} // Open dialog to edit flight
                >
                  Edit
                </button> */}
                <button 
                  className="admin-btn admin-btn-danger" 
                  style={{ marginLeft: '8px' }}
                  onClick={() => handleDeleteFlight(flight.flight_id)} // Delete flight
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Conditionally render FlightDialog only if dialogOpen is true */}
      {dialogOpen && (
        <FlightDialog 
          open={dialogOpen}
          onClose={() => setDialogOpen(false)} // Close the dialog
          onSave={handleSaveFlight}
          initialData={currentFlight}
        />
      )}
    </div>
  );
};

const FlightDialog = ({ open, onClose, onSave, initialData }) => {
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
      setForm({
        airline: initialData.airline || '',
        departure: initialData.departure || '',
        arrival: initialData.arrival || '',
        departure_time: initialData.departure_time || '',
        arrival_time: initialData.arrival_time || '',
        date: initialData.date || '',
      });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box">
        <h2>{initialData ? 'Edit Flight' : 'Add Flight'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="airline">Airline</label>
            <input 
              id="airline"
              name="airline" 
              value={form.airline} 
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="departure">Departure Airport</label>
            <input 
              id="departure"
              name="departure" 
              value={form.departure} 
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="arrival">Arrival Airport</label>
            <input 
              id="arrival"
              name="arrival" 
              value={form.arrival} 
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input 
              id="date"
              type="date" 
              name="date" 
              value={form.date} 
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="departure_time">Departure Time</label>
            <input 
              id="departure_time"
              type="time" 
              name="departure_time" 
              value={form.departure_time} 
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="arrival_time">Arrival Time</label>
            <input 
              id="arrival_time"
              type="time" 
              name="arrival_time" 
              value={form.arrival_time} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="dialog-actions">
            <button 
              type="button" 
              className="admin-btn admin-btn-danger" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper functions
function formatTime(timeString) {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
