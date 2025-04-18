import React, { useEffect, useState } from 'react';
import './Passengers.css';

// Mock data aligned with backend's Passengers struct
const mockUsers = [
  {
    passenger_id: 1,
    booking_id: 101,
    passenger_type: "Adult",
    full_name: "John Doe",
    passport_number: "AB123456",
    seat_preference: "Window",
    meal_preference: "Vegetarian",
    special_assistance: "None",
    assigned_seat: "12A",
    meal: null,
    travel_class: "Economy",
  },
  {
    passenger_id: 2,
    booking_id: 102,
    passenger_type: "Adult",
    full_name: "Jane Smith",
    passport_number: "XY789012",
    seat_preference: "Aisle",
    meal_preference: "Non-Vegetarian",
    special_assistance: "Wheelchair",
    assigned_seat: "14B",
    meal: "Non-Veg",
    travel_class: "Business",
  },
  {
    passenger_id: 3,
    booking_id: 103,
    passenger_type: "Child",
    full_name: "Alex Patel",
    passport_number: "",
    seat_preference: "Middle",
    meal_preference: "Vegan",
    special_assistance: "None",
    assigned_seat: "15C",
    meal: "Vegan",
    travel_class: null,
  },
];

const Passengers = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPassenger, setExpandedPassenger] = useState(null);

  const useMockData = false; // Set to false when backend is ready

  const fetchUsers = async (retryCount = 3, delay = 1000) => {
    setLoading(true);
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        if (useMockData) {
          setUsers(mockUsers);
          setError(null);
          setLoading(false);
          return;
        } else {
          const response = await fetch("http://localhost:3001/api/admin/passengers", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setUsers(data);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err);
        if (attempt === retryCount) {
          setError("Unable to load passengers. Please check your connection and try again.");
          setLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = async (passengerId) => {
    if (!window.confirm("Are you sure you want to delete this passenger record?")) {
      return;
    }

    if (useMockData) {
      setUsers(users.filter((u) => u.passenger_id !== passengerId));
    } else {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/passengers/delete?passenger_id=${passengerId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchUsers();
      } catch (err) {
        console.error("Failed to delete passenger:", err);
        alert("Failed to delete passenger. Please try again.");
      }
    }
  };

  const handleSaveUser = async (userData) => {
    if (useMockData) {
      if (isEditing) {
        setUsers(
          users.map((u) =>
            u.passenger_id === currentUser.passenger_id ? { ...userData, passenger_id: currentUser.passenger_id } : u
          )
        );
      } else {
        setUsers([...users, { ...userData, passenger_id: users.length + 1 }]);
      }
    } else {
      try {
        const url = isEditing
          ? `http://localhost:3001/api/admin/users/${currentUser.passenger_id}`
          : "http://localhost:3001/api/admin/users";

        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchUsers();
      } catch (err) {
        console.error("Failed to save passenger:", err);
        alert("Failed to save passenger information. Please try again.");
      }
    }
  };

  const toggleExpand = (passengerId) => {
    setExpandedPassenger(expandedPassenger === passengerId ? null : passengerId);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="passengers-container">
      <h1>Passengers Management</h1>
      <div className="actions-bar">
        {/* <button className="admin-btn admin-btn-primary" onClick={handleAddUser}>
          Add New Passenger
        </button> */}
      </div>

      {loading ? (
        <div className="loading-indicator">Loading passengers data...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button
            className="admin-btn admin-btn-primary"
            style={{ marginLeft: "10px" }}
            onClick={() => fetchUsers()}
          >
            Retry
          </button>
          <button
            className="admin-btn admin-btn-primary"
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setUsers(mockUsers);
              setError(null);
            }}
          >
            Use Mock Data
          </button>
        </div>
      ) : (
        <table className="passengers-table">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Passenger Type</th>
              <th>Travel Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No passenger records found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <React.Fragment key={user.passenger_id}>
                  <tr>
                    <td>
                      <button
                        className="expand-btn"
                        onClick={() => toggleExpand(user.passenger_id)}
                      >
                        {expandedPassenger === user.passenger_id ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>{user.passenger_id}</td>
                    <td>{user.full_name}</td>
                    <td>{user.passenger_type}</td>
                    <td>{user.travel_class || "N/A"}</td>
                    <td>
                      {/* <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button> */}
                      <button
                        className="admin-btn admin-btn-danger"
                        style={{ marginLeft: "8px" }}
                        onClick={() => handleDeleteUser(user.passenger_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedPassenger === user.passenger_id && (
                    <tr>
                      <td colSpan="6">
                        <div className="passenger-details">
                          <h3>Passenger Details</h3>
                          <p><strong>Passenger ID:</strong> {user.passenger_id}</p>
                          <p><strong>Booking ID:</strong> {user.booking_id}</p>
                          <p><strong>Passenger Type:</strong> {user.passenger_type}</p>
                          <p><strong>Full Name:</strong> {user.full_name}</p>
                          <p><strong>Passport Number:</strong> {user.passport_number || "N/A"}</p>
                          <p><strong>Seat Preference:</strong> {user.seat_preference || "N/A"}</p>
                          <p><strong>Meal Preference:</strong> {user.meal_preference || "N/A"}</p>
                          <p><strong>Special Assistance:</strong> {user.special_assistance || "N/A"}</p>
                          <p><strong>Assigned Seat:</strong> {user.assigned_seat || "N/A"}</p>
                          <p><strong>Meal:</strong> {user.meal || "N/A"}</p>
                          <p><strong>Travel Class:</strong> {user.travel_class || "N/A"}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      )}

      {dialogOpen && (
        <UserDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveUser}
          initialData={currentUser}
        />
      )}
    </div>
  );
};

const UserDialog = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    booking_id: "",
    passenger_type: "",
    full_name: "",
    passport_number: "",
    seat_preference: "",
    meal_preference: "",
    special_assistance: "",
    assigned_seat: "",
    meal: "",
    travel_class: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        booking_id: initialData.booking_id?.toString() || "",
        passenger_type: initialData.passenger_type || "",
        full_name: initialData.full_name || "",
        passport_number: initialData.passport_number || "",
        seat_preference: initialData.seat_preference || "",
        meal_preference: initialData.meal_preference || "",
        special_assistance: initialData.special_assistance || "",
        assigned_seat: initialData.assigned_seat || "",
        meal: initialData.meal || "",
        travel_class: initialData.travel_class || "",
      });
    } else {
      setForm({
        booking_id: "",
        passenger_type: "",
        full_name: "",
        passport_number: "",
        seat_preference: "",
        meal_preference: "",
        special_assistance: "",
        assigned_seat: "",
        meal: "",
        travel_class: "",
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
    // Convert booking_id to number for backend
    const submitData = {
      ...form,
      booking_id: parseInt(form.booking_id) || 0,
    };
    onSave(submitData);
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box">
        <h2>{initialData ? "Edit Passenger" : "Add Passenger"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking_id">Booking ID</label>
              <input
                id="booking_id"
                type="number"
                name="booking_id"
                value={form.booking_id}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="passenger_type">Passenger Type</label>
              <select
                id="passenger_type"
                name="passenger_type"
                value={form.passenger_type}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Adult">Adult</option>
                <option value="Child">Child</option>
                <option value="Infant">Infant</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="passport_number">Passport Number</label>
              <input
                id="passport_number"
                name="passport_number"
                value={form.passport_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seat_preference">Seat Preference</label>
              <select
                id="seat_preference"
                name="seat_preference"
                value={form.seat_preference}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Window">Window</option>
                <option value="Aisle">Aisle</option>
                <option value="Middle">Middle</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="assigned_seat">Assigned Seat</label>
              <input
                id="assigned_seat"
                name="assigned_seat"
                value={form.assigned_seat}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meal_preference">Meal Preference</label>
              <select
                id="meal_preference"
                name="meal_preference"
                value={form.meal_preference}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="meal">Meal</label>
              <input
                id="meal"
                name="meal"
                value={form.meal}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="travel_class">Travel Class</label>
              <select
                id="travel_class"
                name="travel_class"
                value={form.travel_class}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="special_assistance">Special Assistance</label>
              <input
                id="special_assistance"
                name="special_assistance"
                value={form.special_assistance}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Passengers;