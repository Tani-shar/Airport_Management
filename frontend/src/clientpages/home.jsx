// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route , useNavigate} from "react-router-dom";
// import Navbar from "./component/Navbar";
// import SignUp from "./pages/SignUp";
// import Login from "./pages/Login";
// import FlightBookingPage from "./pages/FlightBookingPage";
// import "./App.css";
// import PassengerDetailsPage from "./pages/PassengerDetailsPage";
// import useBookingStore from "./store/UseBookingStore";
// import BookingConfirmationPage from "./pages/confirmationpage";
// import PrivateRoute from "./component/PrivateRoutes";
// import ManageBookingsPage from "./pages/ManageBooking";
// import OnlineCheckInPage from "./pages/OnlineCheckin";
// import ProfilePage from "./pages/ProfilePage";

// function App() {
//   // Flight search state
//   const [flightType, setFlightType] = useState("roundtrip");
//   const [departure, setDeparture] = useState("JFK");
//   const [arrival, setArrival] = useState("BOM");
//   const [departure_date, setDepartureDate] = useState("");
//   const [returnDate, setReturnDate] = useState("");
//   const [passengers, setPassengers] = useState(1);
//   const [searchResults, setSearchResults] = useState([]);
//   const [showResults, setShowResults] = useState(false);

//   const setFlight = useBookingStore((state) => state.setFlight);
//   const setPassenger = useBookingStore((state) => state.setPassengers);
//   // const navigate = useNavigate(); // Moved to a child component
//   // const formData = {
//   //   // flightType,
//   //   departure,
//   //   arrival,
//   //   departureDate,
//   //   // returnDate,
//   //   passengers,
//   // };
//   // Airport data

//   const airports = [
//     { code: "JFK", city: "New York" },
//     { code: "LHR", city: "London" },
//     { code: "CDG", city: "Paris" },
//     { code: "DXB", city: "Dubai" },
//     { code: "HND", city: "Tokyo" },
//     { code: "LAX", city: "Los Angeles" },
//     { code: "SIN", city: "Singapore" },
//     { code: "SYD", city: "Sydney" },
//     { code: "FRA", city: "Frankfurt" },
//     { code: "YYZ", city: "Toronto" },
//     { code: "MAN", city: "Manchester" },
//     { code: "BCN", city: "Barcelona" },
//     { code: "BOM", city: "Mumbai" },
//     { code: "GRU", city: "São Paulo" },
//     { code: "PEK", city: "Beijing" },
//     { code: "KEF", city: "Reykjavik" },
//     { code: "AMM", city: "Amman" },
//     { code: "CPT", city: "Cape Town" },
//     { code: "AKL", city: "Auckland" },
//     { code: "CUN", city: "Cancun" },
//   ];

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setShowResults(false); // Reset results before new search


//     try {
//       console.log({
//         departure,
//         arrival,
//         departure_date,
//         passengers,
//       });
//       const response = await fetch("http://localhost:3001/api/search_flights", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           departure,
//           arrival,
//           departure_date,
//           passengers,
//         }),
//       }
//     );
//     console.log("Response from server:", response);
      
    

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await response.json();
//       console.log("Data from server:", data);

//       // Transform the backend data to match your frontend structure
//       const formattedFlights = data.flights.map((flight) => ({
//         id: flight.flight_id,
//         airline: flight.airline_name || "Unknown Airline", // Fallback if not provided
//         flightNumber: flight.flight_number || "N/A",
//         departure: flight.source,
//         arrival: flight.destination,
//         departureTime: formatTime(flight.departure_time),
//         arrivalTime: formatTime(flight.arrival_time),
//         duration:
//           flight.duration ||
//           calculateDuration(flight.departure_time, flight.arrival_time),
//         price: flight.price,
//         seatsAvailable: flight.seats_available || 0,
//       }));

//       // Set the formatted flights to state
      
//       setPassenger(passengers);
      
//       setSearchResults(formattedFlights);
//       setShowResults(true);
//     } catch (error) {
//       console.error("Error fetching flights:", error);
//       // You might want to show an error message to the user
//     }
//   };

//   // Helper function to format time (add this outside your component)
//   function formatTime(dateTimeString) {
//     const date = new Date(dateTimeString);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   }

//   // Helper function to calculate duration (add this outside your component)
//   function calculateDuration(departure, arrival) {
//     const dep = new Date(departure);
//     const arr = new Date(arrival);
//     const diff = arr - dep;

//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

//     return `${hours}h ${minutes}m`;
//   }

//   // Basic page components (defined inline for simplicity)
//   const HomePage = () => {
//       const navigate = useNavigate();
      
//       return (
//       <>
//       <header className="hero">
//         <div className="hero-content">
//           <h1>Manipal Airport Management</h1>
//           <p>
//             Book your flights with ease and enjoy seamless travel experiences
//             across Globe
//           </p>
//         </div>
//       </header>

//       <section className="flight-search">
//         <div className="container">
//           <form onSubmit={handleSearch}>
//             <div className="flight-type">
//               <button
//                 type="button"
//                 className={flightType === "roundtrip" ? "active" : ""}
//                 onClick={() => setFlightType("roundtrip")}
//               >
//                 Round Trip
//               </button>
//               <button
//                 type="button"
//                 className={flightType === "oneway" ? "active" : ""}
//                 onClick={() => setFlightType("oneway")}
//               >
//                 One Way
//               </button>
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label>From</label>
//                 <select
//                   value={departure}
//                   onChange={(e) => setDeparture(e.target.value)}
//                 >
//                   {airports.map((airport) => (
//                     <option key={airport.code} value={airport.code}>
//                       {airport.code}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <button
//                 type="button"
//                 className="swap-btn"
//                 onClick={() => {
//                   const temp = departure;
//                   setDeparture(arrival);
//                   setArrival(temp);
//                 }}
//               >
//                 <i className="fas fa-exchange-alt"></i>
//               </button>

//               <div className="form-group">
//                 <label>To</label>
//                 <select
//                   value={arrival}
//                   onChange={(e) => setArrival(e.target.value)}
//                 >
//                   {airports.map((airport) => (
//                     <option key={airport.code} value={airport.code}>
//                       {airport.code}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label>Departure Date</label>
//                 <input
//                   type="date"
//                   value={departure_date}
//                   onChange={(e) => setDepartureDate(e.target.value)}
//                   required
//                 />
//               </div>

//               {flightType === "roundtrip" && (
//                 <div className="form-group">
//                   <label>Return Date</label>
//                   <input
//                     type="date"
//                     value={returnDate}
//                     onChange={(e) => setReturnDate(e.target.value)}
//                     required={flightType === "roundtrip"}
//                   />
//                 </div>
//               )}

//               <div className="form-group">
//                 <label>Passengers</label>
//                 <select
//                   value={passengers}
//                   onChange={(e) => setPassengers(parseInt(e.target.value))}
//                 >
//                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
//                     <option key={num} value={num}>
//                       {num}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <button type="submit" className="search-btn">
//               Search Flights
//             </button>
//           </form>
//         </div>
//       </section>

//       {showResults && (
//         <section className="flight-results">
//           <div className="container">
//             <h2>Available Flights</h2>
//             <div className="results-grid">
//               {searchResults.map((flight) => (
//                 <div key={flight.id} className="flight-card">
//                   <div className="flight-header">
//                     <h3>{flight.airline}</h3>
//                     <span className="flight-number">{flight.flightNumber}</span>
//                   </div>
//                   <div className="flight-details">
//                     <div className="time-details">
//                       <div>
//                         <span className="time">{flight.departureTime}</span>
//                         <span className="airport">{flight.departure}</span>
//                       </div>
//                       <div className="duration">
//                         <span>{flight.duration}</span>
//                         <div className="line"></div>
//                       </div>
//                       <div>
//                         <span className="time">{flight.arrivalTime}</span>
//                         <span className="airport">{flight.arrival}</span>
//                       </div>
//                     </div>
//                     <div className="price-details">
//                       <span className="price">₹{flight.price}</span>
//                       <span className="seats">
//                       <button className="book-btn"
//                         onClick={() => {
//                           setFlight(flight)
//                           navigate('/passenger-details')
//                         }}
//                       >Book Now</button>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       <section className="features">
//         <div className="container">
//           <h2>Why Choose SkyLink?</h2>
//           <div className="features-grid">
//             <div className="feature-card">
//               <i className="fas fa-clock"></i>
//               <h3>Real-time Updates</h3>
//               <p>Get instant updates on flight statuses and gate changes.</p>
//             </div>
//             <div className="feature-card">
//               <i className="fas fa-ticket-alt"></i>
//               <h3>Easy Booking</h3>
//               <p>Simple and intuitive flight booking process.</p>
//             </div>
//             <div className="feature-card">
//               <i className="fas fa-headset"></i>
//               <h3>24/7 Support</h3>
//               <p>Our customer service team is always available to help.</p>
//             </div>
//           </div>
//         </div>
//       </section>
//       </>
//     );
//   };
//   <footer className="footer">
//   <div className="container">
//     <p>
//       &copy; 2023 SkyLink Airport Management System. All rights
//       reserved.
//     </p>
//   </div>
// </footer>
// </div>