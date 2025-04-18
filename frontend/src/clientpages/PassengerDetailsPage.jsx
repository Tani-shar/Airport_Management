import React, { use, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './FlightBookingPage.css'; // Reusing your existing CSS
import useBookingStore from '../store/UseBookingStore';

const PassengerDetailsPage = () => {
//   const location = useLocation();
  const navigate = useNavigate();
  const flight = useBookingStore((state) => state.flight);
  const passengercount = useBookingStore((state) => state.passengers);
//   const flight = useBookingStore((state) => state.flight);
//   console.log("Passenger count from store:", passengercount);
    console.log("Flight from store:", flight);

  const [passengers, setPassengers] = useState(
    Array(passengercount).fill().map((_, i) => ({
        id: i + 1,
        type: 'Adult',
        name: '',
        passport: '',
        seatPreference: 'Window',
        mealPreference: 'Standard',
        specialAssistance: 'None'
    }))
);

  const handleInputChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/flight-booking', {
      state: {
        passengers,
        flight,
      }
    });
  };

  return (
    <div className="booking-container">
      {/* Header */}
      <header className="booking-header">
        <div className="booking-header-content">
          <h1 className="booking-title">Passenger Details</h1>
          <p className="booking-subtitle">
            Please enter information for all {passengercount} passenger{passengercount > 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <main className="booking-main">
        <form onSubmit={handleSubmit}>
          <div className="passenger-card">
            <div className="passenger-header">
              <h2 className="passenger-title">
                <FaUser /> Passenger Information
              </h2>
            </div>
            <div className="passenger-body">
              {passengers.map((passenger, index) => (
                <div key={passenger.id} className="passenger-item">
                  <h3 className="passenger-name">Passenger {index + 1}</h3>
                  <div className="passenger-details-grid">
                    <div>
                      <label className="detail-label">Passenger Type</label>
                      <select
                        value={passenger.type}
                        onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                        className="detail-input"
                      >
                        <option value="Adult">Adult</option>
                        <option value="Child">Child (2-11)</option>
                        <option value="Infant">Infant (0-2)</option>
                      </select>
                    </div>
                    <div>
                      <label className="detail-label">Full Name</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                        className="detail-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="detail-label">Passport Number</label>
                      <input
                        type="text"
                        value={passenger.passport}
                        onChange={(e) => handleInputChange(index, 'passport', e.target.value)}
                        className="detail-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="detail-label">Seat Preference</label>
                      <select
                        value={passenger.seatPreference}
                        onChange={(e) => handleInputChange(index, 'seatPreference', e.target.value)}
                        className="detail-input"
                      >
                        <option value="Window">Window</option>
                        <option value="Aisle">Aisle</option>
                        <option value="Middle">Middle</option>
                      </select>
                    </div>
                    <div>
                      <label className="detail-label">Meal Preference</label>
                      <select
                        value={passenger.mealPreference}
                        onChange={(e) => handleInputChange(index, 'mealPreference', e.target.value)}
                        className="detail-input"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Gluten-Free">Gluten-Free</option>
                      </select>
                    </div>
                    <div>
                      <label className="detail-label">Special Assistance</label>
                      <select
                        value={passenger.specialAssistance}
                        onChange={(e) => handleInputChange(index, 'specialAssistance', e.target.value)}
                        className="detail-input"
                      >
                        <option value="None">None</option>
                        <option value="Wheelchair">Wheelchair</option>
                        <option value="Visual Impairment">Visual Impairment</option>
                        <option value="Hearing Impairment">Hearing Impairment</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="back-button"
            >
              <FaArrowLeft /> Back to Flight Selection
            </button>
            <button
              type="submit"
              className="continue-button"
              disabled={!passengers.every(p => p.name && p.passport)}
              
            >
              Continue to Payment <FaArrowRight />
            </button>
          </div>
        </form>
      </main>

      {/* Footer (reused from your existing design) */}
      <footer className="booking-footer">
        <div className="footer-content">
          <div className="footer-layout">
            <div className="footer-brand">
              <h2>SkyWings Airlines</h2>
              <p>Travel with comfort and style</p>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Help Center</a>
            </div>
          </div>
          <div className="footer-copyright">
            © 2023 SkyWings Airlines. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PassengerDetailsPage;