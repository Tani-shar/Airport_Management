import React, { useState, useEffect } from 'react';
import { FaPlane, FaUtensils, FaChair, FaSearch, FaCheckCircle, FaUser } from 'react-icons/fa';
import './FlightBookingPage.css';

const OnlineCheckInPage = () => {
  const [passengerId, setPassengerId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedClass, setSelectedClass] = useState('Economy');
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock flight data - replace with API call in real implementation
  const mockFlight = {
    flightNumber: 'SW123',
    departure: { airport: 'JFK', city: 'New York', time: '08:30' },
    arrival: { airport: 'LAX', city: 'Los Angeles', time: '11:45' },
    date: '2023-11-15',
    aircraft: 'Boeing 737',
    status: 'On Time'
  };

  // Seat map
  const seatMap = [
    ['1A', '1B', '1C', '', '1D', '1E', '1F'],
    ['2A', '2B', '2C', '', '2D', '2E', '2F'],
    ['3A', '3B', '3C', '', '3D', '3E', '3F'],
    ['4A', '4B', '4C', '', '4D', '4E', '4F'],
    ['5A', '5B', '5C', '', '5D', '5E', '5F'],
    ['6A', '6B', '6C', '', '6D', '6E', '6F'],
  ];

  // Meal options
  const mealOptions = [
    { id: 'meal1', name: 'Vegetarian', price: 12.99, description: 'Fresh vegetable platter with tofu' },
    { id: 'meal2', name: 'Chicken', price: 15.99, description: 'Grilled chicken with mashed potatoes' },
    { id: 'meal3', name: 'Pasta', price: 11.99, description: 'Penne with marinara sauce' },
    { id: 'meal4', name: 'Special Meal', price: 18.99, description: 'Chef\'s special of the day' },
  ];

  // Seat upgrade options
  const seatUpgrades = [
    { type: 'Economy', price: 0, description: 'Standard legroom' },
    { type: 'Economy Plus', price: 49.99, description: '4 extra inches of legroom' },
    { type: 'Business Class', price: 199.99, description: 'Luxury seating with premium service' },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);
  
    try {
      if (!passengerId) {
        throw new Error('Please enter a Passenger ID');
      }
  
      const response = await fetch(`http://localhost:3001/api/fetchpassengerdetail?passenger_id=${passengerId}`);
      if (!response.ok) {
        throw new Error('No booking found for this Passenger ID');
      }
  
      const data = await response.json();
      console.log(data);
      const bookingDetails = {
        passengerId: data.passenger_id,
        name: data.full_name,
        currentSeat: data.assigned_seat, // Not returned, so leave blank or fetch separately if needed
        currentMeal: data.meal_preference, // Not returned, update if your DB includes this
        currentClass: data.travel_class || "NULL", // Same
        flight: {
          flightNumber: `Flight ${data.flight_id}`,
          departure: { airport: data.dep_code, city: data.dep_city, time: 'N/A' },
          arrival: { airport: data.arr_code, city: data.arr_city, time: 'N/A' },
          date: 'N/A',
          aircraft: '',
          status: data.flight_status || 'Unknown',
        },
        canUpgrade: true,
        canSelectMeal: true,
      };
  
      setBooking(bookingDetails);
      setSelectedSeat('');
      setSelectedMeal('');
      setSelectedClass('Economy');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // This should match your Rust API endpoint
      console.log(passengerId);
      const response = await fetch('http://localhost:3001/api/online_checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passenger_id: parseInt(passengerId),
          meal: selectedMeal,
          seat_number: selectedSeat,
          travel_class: selectedClass
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update check-in information');
      }

      const data = await response.json();
      console.log('Check-in successful:', data);
      setShowSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      {/* Header */}
      <header className="booking-header">
        <div className="booking-header-content">
          <h1 className="booking-title">Online Check-In</h1>
          <p className="booking-subtitle">Upgrade your seat and select meal options</p>
        </div>
      </header>

      <main className="booking-main">
        {/* Search Form */}
        <div className="checkin-search">
          <form onSubmit={handleSearch}>
            <div className="search-group">
              <label htmlFor="passengerId">Enter Passenger ID or Booking Reference</label>
              <div className="search-input">
                <input
                  type="text"
                  id="passengerId"
                  value={passengerId}
                  onChange={(e) => setPassengerId(e.target.value)}
                  placeholder="e.g. ABC123 or BK1001"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : <><FaSearch /> Find Booking</>}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </div>
          </form>
        </div>

        {booking && (
          <div className="checkin-content">
            {/* Flight Information */}
            <div className="flight-card">
              <div className="flight-header">
                <h2><FaPlane /> Flight Details</h2>
              </div>
              <div className="flight-body">
                <div className="flight-info">
                  <div>
                    <p className="flight-number">{booking.flight.flightNumber}</p>
                    <p>{booking.flight.aircraft}</p>
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
                    <p>{booking.flight.date}</p>
                    <p className="status">{booking.flight.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="passenger-card">
              <div className="passenger-header">
                <h2><FaUser /> Passenger Information</h2>
              </div>
              <div className="passenger-body">
                <div className="passenger-details">
                  <p><strong>Name:</strong> {booking.name}</p>
                  <p><strong>Passenger ID:</strong> {booking.passengerId}</p>
                  <p><strong>Current Seat:</strong> {booking.currentSeat}</p>
                  <p><strong>Current Class:</strong> {booking.currentClass}</p>
                  <p><strong>Meal Preference:</strong> {booking.currentMeal}</p>
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            {booking.canUpgrade && (
              <div className="seat-card">
                <div className="seat-header">
                  <h2><FaChair /> Seat Upgrade</h2>
                </div>
                <div className="seat-body">
                  <div className="seat-options">
                    {seatUpgrades.map((upgrade) => (
                      <div 
                        key={upgrade.type}
                        className={`seat-option ${selectedClass === upgrade.type ? 'selected' : ''}`}
                        onClick={() => setSelectedClass(upgrade.type)}
                      >
                        <h3>{upgrade.type}</h3>
                        <p>{upgrade.description}</p>
                        <p className="price">${upgrade.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="seat-map">
                    <h3>Select Your Seat</h3>
                    <div className="aircraft-layout">
                      {seatMap.map((row, rowIndex) => (
                        <div key={rowIndex} className="seat-row">
                          {row.map((seat, seatIndex) => (
                            seat ? (
                              <div 
                                key={seatIndex}
                                className={`seat ${selectedSeat === seat ? 'selected' : ''}`}
                                onClick={() => setSelectedSeat(seat)}
                              >
                                {seat}
                              </div>
                            ) : (
                              <div key={seatIndex} className="aisle"></div>
                            )
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="seat-legend">
                      <div><span className="seat available"></span> Available</div>
                      <div><span className="seat selected"></span> Selected</div>
                      <div><span className="seat occupied"></span> Occupied</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Selection */}
            {booking.canSelectMeal && (
              <div className="meal-card">
                <div className="meal-header">
                  <h2><FaUtensils /> Meal Selection</h2>
                </div>
                <div className="meal-body">
                  <div className="meal-options">
                    {mealOptions.map((meal) => (
                      <div 
                        key={meal.id}
                        className={`meal-option ${selectedMeal === meal.id ? 'selected' : ''}`}
                        onClick={() => setSelectedMeal(meal.id)}
                      >
                        <h3>{meal.name}</h3>
                        <p>{meal.description}</p>
                        <p className="price">${meal.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <form onSubmit={handleSubmit} className="checkin-submit">
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Complete Check-In'}
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <div>
              <h3>Check-In Complete!</h3>
              <p>Your boarding pass has been updated with your selections.</p>
            </div>
          </div>
        )}
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

export default OnlineCheckInPage;