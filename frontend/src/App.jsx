import React, { useState, useEffect } from 'react';
import { apiClient } from './api/client.js';
import Timeline from './components/Timeline.jsx';
import EmpireMap from './components/EmpireMap.jsx';

export default function App() {
  const [emperors, setEmperors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('timeline'); // 'timeline' | 'map'
  const [selectedEmperor, setSelectedEmperor] = useState(null);

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

  function handleSelectEmperor(emperor) {
    setSelectedEmperor(emperor);
    // If in timeline view and emperor is selected, switching to map shows their territory
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">🏛️</span>
          <div className="header-titles">
            <h1>Roman Emperors</h1>
            <p className="header-subtitle">27 BC – AD 476</p>
          </div>

          {/* View toggle tabs */}
          <nav className="view-tabs" aria-label="View">
            <button
              className={`view-tab ${view === 'timeline' ? 'view-tab--active' : ''}`}
              onClick={() => setView('timeline')}
              aria-pressed={view === 'timeline'}
            >
              📜 Timeline
            </button>
            <button
              className={`view-tab ${view === 'map' ? 'view-tab--active' : ''}`}
              onClick={() => setView('map')}
              aria-pressed={view === 'map'}
            >
              🗺️ Map
            </button>
          </nav>
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

        {!loading && !error && view === 'timeline' && (
          <Timeline
            emperors={emperors}
            selectedEmperor={selectedEmperor}
            onSelectEmperor={handleSelectEmperor}
          />
        )}

        {!loading && !error && view === 'map' && (
          <div className="map-layout">
            <EmpireMap emperor={selectedEmperor} />

            {/* Emperor list sidebar for the map view */}
            <aside className="map-sidebar">
              <h3 className="map-sidebar-title">Select Emperor</h3>
              <ul className="map-emperor-list">
                {[...emperors]
                  .filter(e => e.reign_start != null)
                  .sort((a, b) => a.reign_start - b.reign_start)
                  .map(e => {
                    const isActive = selectedEmperor?.id === e.id;
                    return (
                      <li key={e.id}>
                        <button
                          className={`map-emperor-btn ${isActive ? 'map-emperor-btn--active' : ''}`}
                          onClick={() => setSelectedEmperor(isActive ? null : e)}
                        >
                          <span className="map-emperor-btn-name">{e.name}</span>
                          <span className="map-emperor-btn-year">
                            {e.reign_start < 0 ? `${Math.abs(e.reign_start)} BC` : `AD ${e.reign_start}`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
