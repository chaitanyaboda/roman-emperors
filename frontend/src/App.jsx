import React, { useState, useEffect } from 'react';
import { apiClient } from './api/client.js';
import Timeline from './components/Timeline.jsx';

export default function App() {
  const [emperors, setEmperors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .getEmperors()
      .then((data) => {
        setEmperors(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">🏛️</span>
          <div>
            <h1>Roman Emperors</h1>
            <p className="header-subtitle">27 BC – AD 476</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="state-message">
            <div className="spinner" />
            <p>Loading the annals of Rome...</p>
          </div>
        )}
        {error && (
          <div className="state-message error">
            <p>⚠️ {error}</p>
            <p className="error-hint">Is the backend running? Try: <code>npm start</code> in the backend directory.</p>
          </div>
        )}
        {!loading && !error && (
          <Timeline emperors={emperors} />
        )}
      </main>
    </div>
  );
}
