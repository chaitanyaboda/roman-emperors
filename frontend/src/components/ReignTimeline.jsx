import React from 'react';
import { BATTLES } from '../data/battles.js';

function formatYear(year) {
  if (year == null) return '?';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `AD ${year}`;
}

export default function ReignTimeline({ emperor }) {
  const start = emperor.reign_start;
  const end = emperor.reign_end ?? emperor.reign_start;
  const duration = Math.max(end - start, 1);

  const battles = BATTLES[emperor.name] || [];

  // Position of an event along the bar (0–100%)
  function pct(year) {
    return Math.min(100, Math.max(0, ((year - start) / duration) * 100));
  }

  return (
    <div className="reign-timeline">
      <h4 className="rt-heading">Reign: {formatYear(start)} – {formatYear(end)}</h4>

      <div className="rt-bar-wrap">
        {/* The bar */}
        <span className="rt-label rt-label-start">{formatYear(start)}</span>
        <div className="rt-bar">
          {battles.map((b, i) => (
            <div
              key={i}
              className="rt-event"
              style={{ left: `${pct(b.year)}%` }}
              title={`${formatYear(b.year)}: ${b.name}`}
            >
              <div className="rt-event-dot" />
              <div className="rt-event-label">{b.name}</div>
            </div>
          ))}
        </div>
        <span className="rt-label rt-label-end">{formatYear(end)}</span>
      </div>

      {battles.length > 0 && (
        <ul className="rt-battle-list">
          {battles.map((b, i) => (
            <li key={i} className="rt-battle-item">
              <span className="rt-battle-year">{formatYear(b.year)}</span>
              <span className="rt-battle-name">{b.name}</span>
            </li>
          ))}
        </ul>
      )}

      {battles.length === 0 && (
        <p className="rt-no-battles">No major battles recorded for this reign.</p>
      )}
    </div>
  );
}
