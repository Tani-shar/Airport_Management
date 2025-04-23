import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaCheckCircle, FaPlane, FaUser, FaCalendarAlt, FaTicketAlt, FaCreditCard } from 'react-icons/fa';
import jsPDF from 'jspdf';
import './FlightBookingPage.css';

const BookingConfirmationPage = () => {
  const { state } = useLocation();
  const { bookingId, flight, passengers } = state || {};

  // Default data in case of direct access
  const defaultFlight = {
    id: 'FL123',
    airline: 'SkyWings Airlines',
    departure: { time: '08:30', airport: 'JFK', city: 'New York' },
    arrival: { time: '11:45', airport: 'LAX', city: 'Los Angeles' },
    duration: '5h 15m',
    price: 349,
    date: '2023-11-15',
    seatsAvailable: 24,
  };

  const defaultPassengers = [
    {
      id: 1,
      type: 'Adult',
      name: 'John Doe',
      passport: 'AB1234567',
      seatPreference: 'Window',
      mealPreference: 'Vegetarian',
      specialAssistance: 'None',
    },
    {
      id: 2,
      type: 'Child',
      name: 'Jane Doe',
      passport: 'CD8910111',
      seatPreference: 'Aisle',
      mealPreference: 'Standard',
      specialAssistance: 'None',
    },
  ];

  const currentFlight = flight || defaultFlight;
  console.log(currentFlight);
  const currentPassengers = passengers || defaultPassengers;
  const currentBookingId = bookingId || `BK${Math.floor(Math.random() * 1000000)}`;

  // Function to generate and print ticket
  const generateTicketPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Colors and fonts
    const primaryColor = '#003087'; // Dark blue
    const accentColor = '#007bff'; // Light blue
    const textColor = '#333333'; // Dark gray
    const lightGray = '#f5f5f5';

    // Set fonts
    doc.setFont('Helvetica');

    // Header: Airline logo and title
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F'); // Header background
    doc.setTextColor('#ffffff');
    doc.setFontSize(20);
    doc.text('SkyWings Airlines E-Ticket', 10, 15);
    doc.setFontSize(12);
    doc.text(`Booking Reference: ${currentBookingId}`, 10, 25);

    // Reset text color
    doc.setTextColor(textColor);

    // Flight Details Section
    let yOffset = 40;
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Flight Details', 10, yOffset);
    doc.setLineWidth(0.5);
    doc.setDrawColor(accentColor);
    doc.line(10, yOffset + 2, 200, yOffset + 2); // Underline
    yOffset += 10;

    doc.setFontSize(12);
    doc.text(`Flight: ${currentFlight.id} | ${currentFlight.airline}`, 10, yOffset);
    yOffset += 8;
    doc.text(`Date: ${currentFlight.date}`, 10, yOffset);
    yOffset += 8;

    // Departure and Arrival
    doc.setFontSize(10);
    doc.setFillColor(lightGray);
    doc.rect(10, yOffset, 190, 20, 'F'); // Background for timeline
    doc.setTextColor(textColor);
    doc.text(`Departure: ${currentFlight.departure.time} | ${currentFlight.departure.airport} (${currentFlight.departure.city})`, 15, yOffset + 8);
    doc.text(`Arrival: ${currentFlight.arrival.time} | ${currentFlight.arrival.airport} (${currentFlight.arrival.city})`, 15, yOffset + 16);
    doc.setFontSize(8);
    doc.setTextColor(accentColor);
    doc.text(`Duration: ${currentFlight.duration}`, 180, yOffset + 12, { align: 'right' });
    yOffset += 30;

    // Passenger Details Section
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Passenger Details', 10, yOffset);
    doc.setDrawColor(accentColor);
    doc.line(10, yOffset + 2, 200, yOffset + 2);
    yOffset += 10;

    currentPassengers.forEach((passenger, index) => {
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.text(`${index + 1}. ${passenger.name} (${passenger.type})`, 10, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      doc.text(`Passport: ${passenger.passport}`, 15, yOffset);
      yOffset += 6;
      doc.text(`Seat Preference: ${passenger.seatPreference}`, 15, yOffset);
      yOffset += 6;
      doc.text(`Meal Preference: ${passenger.mealPreference}`, 15, yOffset);
      yOffset += 6;
      doc.text(`Special Assistance: ${passenger.specialAssistance}`, 15, yOffset);
      yOffset += 10;
    });

    // Booking Summary Section
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Booking Summary', 10, yOffset);
    doc.setDrawColor(accentColor);
    doc.line(10, yOffset + 2, 200, yOffset + 2);
    yOffset += 10;

    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`Booking Reference: ${currentBookingId}`, 10, yOffset);
    yOffset += 8;
    doc.text(`Flight: ${currentFlight.departure.airport} → ${currentFlight.arrival.airport}`, 10, yOffset);
    yOffset += 8;
    doc.text(`Passengers: ${currentPassengers.length}`, 10, yOffset);
    yOffset += 8;
    doc.text(`Total Paid: $${currentFlight.price * currentPassengers.length}`, 10, yOffset);
    yOffset += 15;

    // Footer
    doc.setFillColor(primaryColor);
    doc.rect(0, 270, 210, 27, 'F'); // Footer background
    doc.setTextColor('#ffffff');
    doc.setFontSize(8);
    doc.text('SkyWings Airlines | Contact: support@skywings.com | Terms at skywings.com/terms', 10, 280);
    doc.text(`© ${new Date().getFullYear()} SkyWings Airlines. All rights reserved.`, 10, 288);

    // Optional: Barcode placeholder
    doc.setDrawColor(textColor);
    doc.setLineWidth(0.2);
    for (let i = 0; i < 30; i++) {
      doc.line(180, yOffset, 180 + (i % 2 ? 1 : 0.5), yOffset + 10);
      doc.line(180 + i * 1, yOffset, 180 + i * 1, yOffset + 10);
    }
    doc.text(`Ticket ID: ${currentBookingId}`, 180, yOffset + 15, { align: 'right' });

    // Save the PDF
    doc.save(`SkyWings_Ticket_${currentBookingId}.pdf`);
  };

  return (
    <div className="booking-container">
      {/* Confirmation Header */}
      <header className="booking-header">
        <div className="booking-header-content">
          <h1 className="booking-title">Booking Confirmed!</h1>
          <p className="booking-subtitle">Your reservation is complete. Here are your flight details.</p>
        </div>
      </header>

      <main className="booking-main">
        <div className="booking-layout">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Success Message Card */}
            <div className="confirmation-card">
              <div className="confirmation-header">
                <FaCheckCircle className="text-green-500 text-4xl" />
                <h2 className="text-2xl font-bold">Thank you for your booking!</h2>
                <p>Your booking reference is: <span className="font-bold">{currentBookingId}</span></p>
              </div>
              <div className="confirmation-body">
                <p>We've sent a confirmation email with your itinerary and e-ticket.</p>
                <div className="confirmation-details">
                  <div className="detail-item">
                    <FaCalendarAlt className="text-blue-500" />
                    <span>Booking Date: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <FaTicketAlt className="text-blue-500" />
                    <span>E-ticket will be emailed within 24 hours</span>
                  </div>
                  <div className="detail-item">
                    <FaCreditCard className="text-blue-500" />
                    <span>Payment completed successfully</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details Card */}
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
                    <span className="departure-label">Departure Date</span>
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
              </div>
            </div>

            {/* Passenger Details Card */}
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

          {/* Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="summary-card">
              <div className="summary-header">
                <h2>Booking Summary</h2>
              </div>
              <div className="summary-body">
                <div className="summary-item">
                  <span>Booking Reference</span>
                  <span className="font-bold">{currentBookingId}</span>
                </div>
                <div className="summary-item">
                  <span>Flight</span>
                  <span>{currentFlight.departure.airport} → {currentFlight.arrival.airport}</span>
                </div>
                <div className="summary-item">
                  <span>Departure</span>
                  <span>{currentFlight.date} at {currentFlight.departure.time}</span>
                </div>
                <div className="summary-item">
                  <span>Passengers</span>
                  <span>{currentPassengers.length}</span>
                </div>
                <div className="summary-total">
                  <span>Total Paid</span>
                  <span className="text-xl font-bold text-blue-600">${currentFlight.price * currentPassengers.length}</span>
                </div>
              </div>
            </div>

            <div className="actions-card">
              <button className="print-btn" onClick={generateTicketPDF}>
                Print Itinerary
              </button>
              <button className="email-btn">Email Confirmation</button>
              <button
                className="manage-btn"
                onClick={() => window.location.href = '/manage-booking'}
              >
                Manage Booking
              </button>
            </div>
          </div>
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
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Privacy</a>
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

export default BookingConfirmationPage;