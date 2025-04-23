import React, { use, useState } from "react";
import { Routes, Route, Outlet, NavLink, useNavigate } from "react-router-dom";
import style from "./adminstyles.css";
import { Flights } from "./adminflights";
import { useEffect } from "react";
import { Users } from "./adminusers";
import Passengers, { passengers } from "./adminpassengers";
import AdminLogs from "./adminlogs";

// Admin layout component that will render child routes
const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

// Admin Sidebar with navigation
const AdminSidebar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="admin-sidebar">
      <h3>Admin Panel</h3>
      <ul>
        <li onClick={() => navigate("/admin")}>
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </li>
        <li onClick={() => navigate("/admin/flights")}>
          <i className="fas fa-plane"></i> Flights
        </li>
        <li onClick={() => navigate("/admin/users")}>
          <i className="fas fa-users"></i> Users
        </li>
        {/* <li onClick={() => navigate("/admin/bookings")}>
          <i className="fas fa-ticket-alt"></i> Bookings
        </li> */}
        <li onClick={() => navigate("/admin/passengers")}>
          <i className="fas fa-chart-bar"></i> Passengers
        </li>
        <li onClick={() => navigate("/admin/logs")}>
          <i className="fas fa-list"></i> Logs
        </li>
      </ul>
    </div>
  );
};

// Dashboard component with stats and recent activity
const AdminHomepage = () => {
  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [passenger_count, setpassengerno] = useState(0);
  const [flight_count, setflightno] = useState(0);
  // const [dashboarddetail, setdashboarddetail] = useState();
  // const [] = useState([]);
  
  const booking = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // setFlights(data.flights);
        // setPassengers(data.passengers);
        setBookings(data);
        // setRevenue(data.revenue);
      }
      // console.log(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }

  const fetchdashboard = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setpassengerno(data.passenger_count);
        setflightno(data.flight_count);
        setRevenue(data.total_revenue);
        console.log(data.total_revenue);
        // setRevenue(data.revenue);
      }
      console.log(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }

  useEffect(() => {
    booking();
    fetchdashboard();
  },[])

//   useEffect(() => {
//   console.log("Updated bookings:", bookings);
// }, [bookings]); 

  const mockStats = {
    flights: flight_count,
    passengers: passenger_count,
    bookings: bookings.length,
    revenue: revenue,
  };

  // const recentBookings = [
  //   { id: "B-1234", passenger: "Rahul Sharma", flight: "AI-456", date: "2025-04-15", status: "Confirmed" },
  //   { id: "B-1235", passenger: "Priya Patel", flight: "SG-789", date: "2025-04-16", status: "Confirmed" },
  //   { id: "B-1236", passenger: "Amit Kumar", flight: "UK-123", date: "2025-04-16", status: "Pending" },
  //   { id: "B-1237", passenger: "Neha Singh", flight: "AI-789", date: "2025-04-17", status: "Confirmed" },
  // ];

  let recentBookings = bookings;

  

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Flights</h3>
          <div className="value">{mockStats.flights}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Passengers</h3>
          <div className="value">{mockStats.passengers}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <div className="value">{mockStats.bookings}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="value">{mockStats.revenue}</div>
        </div>
      </div>
      
      <h2>Recent Bookings</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Booked by</th>
            <th>Flight</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recentBookings.map(booking => (
            <tr key={booking.booking_id}>
              <td>{booking.booking_id}</td>
              <td>{booking.first_name}</td>
              <td>{booking.flight_id}</td>
              <td>{booking.date}</td>
              <td>{booking.payment_status}</td>
              <td>
                <button className="admin-btn admin-btn-primary">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Flights management component

// Simple placeholder components for other pages
// const Passengers = () => (
//   <div>
//     <h1>Passengers Management</h1>
//     <p>This page will display passenger information and allow admins to manage passenger records.</p>
//   </div>
// );

// const Bookings = () => (
//   <div>
//     <h1>Bookings Management</h1>
//     <p>This page will display booking information and allow admins to manage bookings.</p>
//   </div>
// );

// const Reports = () => (
//   <div>
//     <h1>Reports</h1>
//     <p>This page will display various reports and analytics for the airport management system.</p>
//   </div>
// );

// const Logs = () => (
//   <div>
//     <h1>System Logs</h1>
//     <p>This page will display system logs and activity history.</p>
//   </div>
// );

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminHomepage />} />
        <Route path="flights" element={<Flights />} />
        <Route path="users" element={<Users />} />
        {/* <Route path="bookings" element={<Bookings />} /> */}
        <Route path="passengers" element={<Passengers/>} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;