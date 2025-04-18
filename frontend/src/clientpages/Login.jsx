import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import useBookingStore from "../store/UseBookingStore";
import useAuthStore from "../store/useAuthStore";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const user_id = useBookingStore((state) => state.user_id);
  const setUserId = useBookingStore((state) => state.setUserId);
  const login = useAuthStore((state) => state.login);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email, password });

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Parsed data:", JSON.stringify(data, null, 2));
        console.log("user_id:", data.user_id);

        if (data.user_id) {
          console.log("User ID:", data.user_id); // Should log the user ID now

          // Store token in localStorage for future requests
          localStorage.setItem("token", data.token);
          setUserId(data.user_id); // Set user ID in Zustand store
          login(data.user_id);
          // Navigate to the home/dashboard page
          navigate("/");
        } else {
          console.error("User ID not found in response");
          alert("Login failed. Please check your credentials.");
        }
      } else {
        console.error("Invalid credentials");
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
