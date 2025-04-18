import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import './logs.css';

// Mock data for logs
const mockLogs = [
  {
    log_id: 1,
    table_name: "passengers",
    action: "INSERT",
    record_id: 100,
    changed_data: {
      passenger_id: 100,
      booking_id: 10,
      full_name: "Bob Wilson",
      passenger_type: "Adult",
      travel_class: "Business",
    },
    changed_at: "2025-04-18T10:00:00Z",
    changed_by: null,
  },
  {
    log_id: 2,
    table_name: "flights",
    action: "UPDATE",
    record_id: 1,
    changed_data: {
      old: { flight_id: 1, status: "On Time" },
      new: { flight_id: 1, status: "Delayed" },
    },
    changed_at: "2025-04-18T10:05:00Z",
    changed_by: null,
  },
  {
    log_id: 3,
    table_name: "users",
    action: "DELETE",
    record_id: 1,
    changed_data: {
      id: 1,
      first_name: "Tan",
      last_name: "Sha",
      email: "tanishq@gmail.com",
    },
    changed_at: "2025-04-18T10:10:00Z",
    changed_by: null,
  },
];

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const useMockData = false; // Set to true to test with mock data

  // Fetch logs
  const fetchLogs = async (retryCount = 3, delay = 1000) => {
    setLoading(true);
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        if (useMockData) {
          setLogs(mockLogs);
          setError(null);
          setLoading(false);
          return;
        } else {
          const response = await fetch("http://localhost:3001/api/admin/logs", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setLogs(data);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err);
        if (attempt === retryCount) {
          setError(err.message || "Unable to load logs. Please try again.");
          setLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Generate and download PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;

    // Title
    doc.setFontSize(16);
    doc.text("Admin Change Logs", 10, yOffset);
    yOffset += 10;

    // Logs Section
    doc.setFontSize(12);
    doc.text("Change Logs", 10, yOffset);
    yOffset += 5;
    doc.setFontSize(10);
    logs.forEach((log, index) => {
      const summary = log.action === "UPDATE"
        ? `Updated ${log.table_name} ID ${log.record_id}`
        : `${log.action} ${log.table_name} ID ${log.record_id}`;
      const dataSummary = JSON.stringify(log.changed_data, null, 2).substring(0, 100) + "...";
      doc.text(
        `${index + 1}. ${summary}, Time: ${new Date(log.changed_at).toLocaleString()}, Data: ${dataSummary}`,
        10,
        yOffset
      );
      yOffset += 7;
    });

    // Save the PDF
    doc.save(`admin_logs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="logs-container">
      <h1>Admin Logs</h1>
      <div className="actions-bar">
        <button className="admin-btn admin-btn-primary" onClick={generatePDF}>
          Download Logs as PDF
        </button>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading logs...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button
            className="admin-btn admin-btn-primary"
            style={{ marginLeft: "10px" }}
            onClick={() => fetchLogs()}
          >
            Retry
          </button>
          <button
            className="admin-btn admin-btn-primary"
            style={{ marginLeft: "10px" }}
            onClick={() => {
              setLogs(mockLogs);
              setError(null);
            }}
          >
            Use Mock Data
          </button>
        </div>
      ) : (
        <table className="logs-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Table</th>
              <th>Action</th>
              <th>Record ID</th>
              <th>Changed At</th>
              <th>Data Summary</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.log_id}>
                  <td>{log.log_id}</td>
                  <td>{log.table_name}</td>
                  <td>{log.action}</td>
                  <td>{log.record_id}</td>
                  <td>{new Date(log.changed_at).toLocaleString()}</td>
                  <td>{JSON.stringify(log.changed_data, null, 2).substring(0, 50) + "..."}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLogs;