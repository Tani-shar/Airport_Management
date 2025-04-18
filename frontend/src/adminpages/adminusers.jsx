import React, { useEffect, useState } from 'react';

// Mock data for testing layout
const mockUsers = [
  {
    user_id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "+1-555-123-4567",
    date_of_birth: "1990-05-15",
    gender: "M",
    passport_number: "AB123456",
    id_number: "ID789012",
    address: "123 Main St, Cityville",
    nationality: "USA",
  },
  {
    user_id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    phone: "+1-555-987-6543",
    date_of_birth: "1985-08-22",
    gender: "F",
    passport_number: "XY789012",
    id_number: "ID345678",
    address: "456 Oak Ave, Townsville",
    nationality: "Canada",
  },
  {
    user_id: 3,
    first_name: "Alex",
    last_name: "Patel",
    email: "alex.patel@example.com",
    phone: "+91-555-456-7890",
    date_of_birth: "1995-03-10",
    gender: "O",
    passport_number: "",
    id_number: "ID901234",
    address: "789 Pine Rd, Villagetown",
    nationality: "India",
  },
];

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle this flag to switch between mock data and API
  const useMockData = false;

  const fetchUsers = async () => {
    setLoading(true);
    if (useMockData) {
      // Use mock data
      setUsers(mockUsers);
      setError(null);
      setLoading(false);
    } else {
      // Fetch from API
      try {
        const response = await fetch("http://localhost:3001/api/admin/users", {
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
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user record?")) {
      return;
    }

    if (useMockData) {
      // Simulate delete with mock data
      setUsers(users.filter((u) => u.user_id !== userId));
    } else {
      // Delete via API
      try {
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const handleSaveUser = async (userData) => {
    if (useMockData) {
      // Simulate save with mock data
      if (isEditing) {
        setUsers(
          users.map((u) =>
            u.user_id === currentUser.user_id ? { ...userData, user_id: currentUser.user_id } : u
          )
        );
      } else {
        setUsers([...users, { ...userData, user_id: users.length + 1 }]);
      }
    } else {
      // Save via API
      try {
        const url = isEditing
          ? `http://localhost:3001/api/admin/users/${currentUser.user_id}`
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

        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Failed to save user:", err);
        alert("Failed to save user information. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users Management</h1>
      <div className="actions-bar">
        {/* <button className="admin-btn admin-btn-primary" onClick={handleAddUser}>
          Add New User
        </button> */}
      </div>

      {loading ? (
        <div className="loading-indicator">Loading users data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No user records found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.id}</td>
                  <td>{`${user.first_name} ${user.last_name}`}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.gender}</td>
                  <td>{user.age || user.id_number || "N/A"}</td>
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
                      onClick={() => handleDeleteUser(user.user_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
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
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "M",
    passport_number: "",
    id_number: "",
    address: "",
    nationality: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        date_of_birth: initialData.date_of_birth ? formatDateForInput(initialData.date_of_birth) : "",
        gender: initialData.gender || "M",
        passport_number: initialData.passport_number || "",
        id_number: initialData.id_number || "",
        address: initialData.address || "",
        nationality: initialData.nationality || "",
      });
    } else {
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "M",
        passport_number: "",
        id_number: "",
        address: "",
        nationality: "",
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
        <h2>{initialData ? "Edit User" : "Add User"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="passport_number">Passport Number</label>
              <input
                id="passport_number"
                name="passport_number"
                value={form.passport_number}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="id_number">ID Number</label>
              <input
                id="id_number"
                name="id_number"
                value={form.id_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nationality">Nationality</label>
            <input
              id="nationality"
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
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
            <button type="submit" className="admin-btn admin-btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper functions
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

export default Users;