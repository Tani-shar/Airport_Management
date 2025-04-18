import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlane, FaUser, FaCalendarAlt, FaTicketAlt, FaTrash } from 'react-icons/fa';
import './FlightBookingPage.css'; // Reuse your existing styles
import useAuthStore from '../store/useAuthStore';

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const user_id = useAuthStore((state) => state.user_id); // Get user ID from Zustand store

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/bookings?user_id=${user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();  // Assumes the response is in JSON format
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        
        setBookings(data.bookings); // Access nested array
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user_id]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      String(booking.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(booking.flight.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const cancelBooking = async (bookingId) => {
    console.log('Cancel booking:', bookingId);
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        // Call API to cancel booking
        await fetch(`http://localhost:3001/api/bookings/cancel?booking_id=${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });

        // Update local state
        setBookings(bookings.filter((booking) => booking.id !== bookingId));
            } catch (error) {
        console.error('Error cancelling booking:', error);
            }
          }
        };

        if (loading) {
          return (
            <div className="booking-container">
        <div className="loading-spinner">Loading your bookings...</div>
            </div>
          );
        }

        return (
          <div className="booking-container">
            {/* Header */}
            <header className="booking-header">
        <div className="booking-header-content">
          <h1 className="booking-title">Manage Your Bookings</h1>
          <p className="booking-subtitle">View, modify or cancel your upcoming trips</p>
        </div>
            </header>

            <main className="booking-main">
        {/* Search and Filter */}
        <div className="manage-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by booking or flight number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <label>Filter by status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
          <div className="booking-card-header">
            <div>
              <h3>Booking #{booking.id}</h3>
              <p className="booking-date">
                <FaCalendarAlt /> Booked on {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
            </div>
            <span className={`status-badge ${booking.status}`}>{booking.status}</span>
          </div>

          <div className="booking-card-body">
            <div className="flight-info">
              <div className="airline-info">
                <h4>{booking.flight.airline}</h4>
                <p>Flight {booking.flight.id}</p>
              </div>

              <div className="flight-timeline">
                <div className="time-point">
            <p className="time">{booking.flight.departure.time}</p>
            <p className="airport">{booking.flight.departure.airport}</p>
            <p className="city">{booking.flight.departure.city}</p>
                </div>

                <div className="duration-line">
            <div className="line"></div>
                </div>

                <div className="time-point">
            <p className="time">{booking.flight.arrival.time}</p>
            <p className="airport">{booking.flight.arrival.airport}</p>
            <p className="city">{booking.flight.arrival.city}</p>
                </div>
              </div>

              <div className="flight-date">
                <p>{new Date(booking.flight.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="passengers-info">
              <h4>
                <FaUser /> Passengers ({booking.passengers.length})
              </h4>
              <ul>
                {booking.passengers.map((passenger, index) => (
            <li key={index}>
              {passenger.name} (Seat: {passenger.seat})
            </li>
                ))}
              </ul>
            </div>

            <div className="booking-actions">
              <div className="booking-total">Total: ${booking.totalAmount ? booking.totalAmount.toFixed(2) : '0.00'}</div>

              <div className="action-buttons">
                <button className="view-btn">View Details</button>
                <button className="print-btn">Print Ticket</button>
                {booking.status !== 'cancelled' && (
            <button className="cancel-btn" onClick={() => cancelBooking(booking.id)}>
              <FaTrash /> Cancel
            </button>
                )}
              </div>
            </div>
          </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="booking-footer">
        <div className="footer-content">
          <div className="footer-layout">
            <div className="footer-brand">
              <h2>SkyWings Airlines</h2>
              <p>Travel with comfort and style</p>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Contact Us</a>
            </div>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} SkyWings Airlines. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ManageBookingsPage;
