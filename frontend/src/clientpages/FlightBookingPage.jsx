import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlane, FaUser, FaCheckCircle, FaClock, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import './FlightBookingPage.css';
import useBookingStore from '../store/UseBookingStore';
import useAuthStore from '../store/useAuthStore';

const FlightBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, passengers, tripType } = location.state || {};
  console.log(flight);

  // Default data in case of direct access
  const defaultFlight = {
    id: 'FL123',
    airline: 'SkyWings Airlines',
    departure: { time: '08:30', airport: 'JFK', city: 'New York' },
    arrival: { time: '11:45', airport: 'LAX', city: 'Los Angeles' },
    duration: '5h 15m',
    price: 349,
    date: '2023-11-15',
    seatsAvailable: 24
  };

  const defaultPassengers = [
    { id: 1, type: 'Adult', name: 'John Doe', passport: 'AB1234567' },
    { id: 2, type: 'Child', name: 'Jane Doe', passport: 'CD8910111' }
  ];

  const currentFlight = flight || defaultFlight;
  console.log("Flight from props:", currentFlight);
  const price = parseFloat(currentFlight.price);
  const currentPassengers = passengers || defaultPassengers;
  const user_id = useAuthStore((state) => state.user_id);
  console.log("User ID from store:", user_id);
  // const currentTripType = tripType || 'roundtrip';

  console.log("Passengers from props:", currentPassengers);
  const handlePayment = async () => {
    console.log(JSON.stringify({
      flight_id: currentFlight.id,
      passengers: currentPassengers,
      total_price: parseFloat(price) * currentPassengers.length,
      user_id: user_id,
    }));
    
    const response = await fetch('http://localhost:3001/api/book_flight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flight_id: currentFlight.id,
        passengers: currentPassengers,
        total_price: parseFloat(price) * currentPassengers.length,
        user_id: user_id,
      }),
      
    });
    // console.log("Response from booking API:", response);

    if (!response.ok) {
      console.error('Error during booking:', response.statusText);
      return;
    }
    const data = await response.json();
    console.log('Booking successful:', data);
    alert('Booking successful! Booking ID: ' + data.bookingId);


    navigate('/booking-confirmation', { 

      state: { 
        bookingId: data.bookingId, 
        flight: currentFlight,
        passengers: currentPassengers
      } 
    });
  };

  return (
    <div className="booking-container">
      {/* Header */}
      <header className="booking-header">
        <div className="booking-header-content">
          <h1 className="booking-title">Confirm Your Flight</h1>
          <p className="booking-subtitle">Review your flight details and passenger information</p>
        </div>
      </header>

      <main className="booking-main">
        <div className="booking-layout">
          {/* Flight Details Section */}
          <div className="flight-details-container lg:w-2/3"> 
            <div className="flight-details-card">
              <div className="flight-details-header">
                <h2 className="flight-details-title">
                  <FaPlane /> Flight Details
                </h2>
              </div>
              <div className="flight-details-body">
                <div className="airline-info">
                  <div>
                    <h3 className="airline-name">{currentFlight.airline}</h3>
                    <span className="flight-id">{currentFlight.id}</span>
                  </div>
                  <div className="departure-info">
                    <span className="departure-label">Departure</span>
                    <p className="departure-date">{currentFlight.date}</p>
                  </div>
                </div>

                <div className="flight-timeline">
                  <div className="time-point">
                    <p className="time-display">{currentFlight.departureTime}</p>
                    <p className="airport-code">{currentFlight.departure}</p>
                    <p className="city-name">{currentFlight.departure.city}</p>
                  </div>

                  <div className="duration-line">
                    <div className="duration-line-inner"></div>
                    <span className="duration-text">{currentFlight.duration}</span>
                  </div>

                  <div className="time-point">
                    <p className="time-display">{currentFlight.arrivalTime}</p>
                    <p className="airport-code">{currentFlight.arrival}</p>
                    <p className="city-name">{currentFlight.arrival.city}</p>
                  </div>
                </div>

                {/* {currentTripType === 'roundtrip' && (
                  <div className="return-flight">
                    <h4 className="return-flight-title">
                      <FaClock /> Return Flight
                    </h4>
                    <div className="return-flight-details">
                      <div>
                        <p className="font-medium">Sat, Nov 22 • 14:20</p>
                        <p className="text-sm text-gray-600">LAX to JFK</p>
                      </div>
                      <div>
                        <p className="font-medium">5h 35m</p>
                        <p className="text-sm text-gray-600">Non-stop</p>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            </div>

            {/* Passenger Details Section */}
            <div className="passenger-card">
              <div className="passenger-header">
                <h2 className="passenger-title">
                  <FaUser /> Passenger Details
                </h2>
              </div>
              <div className="passenger-body">
                {currentPassengers.map((passenger) => (
                  <div key={passenger.id} className="passenger-item">
                    <h3 className="passenger-name">
                      {passenger.type}: {passenger.name}
                    </h3>
                    <div className="passenger-details-grid">
                      <div>
                        <label className="detail-label">Passport Number</label>
                        <p className="detail-value">{passenger.passport}</p>
                      </div>
                      <div>
                        <label className="detail-label">Seat Preference</label>
                        <p className="detail-value">{passenger.seatPreference}</p>
                      </div>
                      <div>
                        <label className="detail-label">Meal Preference</label>
                        <p className="detail-value">{passenger.mealPreference}</p>
                      </div>
                      <div>
                        <label className="detail-label">Special Assistance</label>
                        <p className="detail-value">{passenger.specialAssistance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary Section */}
                <div className="lg:w-1/3">
                <div className="payment-summary-card">
                  <div className="payment-header">
                  <h2 className="payment-title">Payment Summary</h2>
                  </div>
                  <div className="payment-body">
                  <div className="space-y-4">
                    <div className="payment-row">
                    <span>Base Fare ({currentPassengers.length} {currentPassengers.length > 1 ? 'passengers' : 'passenger'})</span>
                    <span>Rs {price * currentPassengers.length}</span>
                    </div>
                    <div className="payment-row">
                    <span>Taxes & Fees</span>
                    <span>$87.25</span>
                    </div>
                    <div className="payment-row">
                    <span>Seat Selection</span>
                    <span>$0.00</span>
                    </div>
                    <div className="payment-total-row">
                    <span className="payment-total-label">Total</span>
                    <span className="payment-total-value">
                      Rs {(parseFloat(currentFlight.price) * currentPassengers.length + 87.25).toFixed(2)}
                    </span>
                    </div>
                  </div>

                  <div className="payment-methods">
                    <h3 className="payment-method-title">
                    <FaCreditCard /> Payment Method
                    </h3>
                    <div className="space-y-3">
                    <div className="payment-option">
                      <input type="radio" id="credit-card" name="payment" defaultChecked />
                      <label htmlFor="credit-card" className="flex-1">Credit/Debit Card</label>
                    </div>
                    <div className="payment-option">
                      <input type="radio" id="paypal" name="payment" />
                      <label htmlFor="paypal" className="flex-1">PayPal</label>
                    </div>
                    <div className="payment-option">
                      <input type="radio" id="apple-pay" name="payment" />
                      <label htmlFor="apple-pay" className="flex-1">Apple Pay</label>
                    </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="payment-info-card">
                    <FaCheckCircle className="text-indigo-600 mt-1 flex-shrink-0" />
                    <p className="payment-info-text">
                      Free cancellation available up to 24 hours before departure
                    </p>
                    </div>

                    <div className="payment-info-card">
                    <FaShieldAlt className="text-indigo-600 mt-1 flex-shrink-0" />
                    <p className="payment-info-text">
                      Your payment is secured with 256-bit SSL encryption
                    </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    className="book-button"
                  >
                    Complete Booking
                  </button>

                  <p className="terms-text">
                    By completing this booking, you agree to our Terms of Service and Privacy Policy
                  </p>
                  </div>
                </div>
                </div>
              </div>
              </main>

              {/* Footer */}
      <footer className="booking-footer">
        <div className="footer-content">
          <div className="footer-layout">
            <div className="footer-brand">
              <h2 className="text-xl font-bold">SkyWings Airlines</h2>
              <p className="text-gray-400">Travel with comfort and style</p>
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

export default FlightBookingPage;