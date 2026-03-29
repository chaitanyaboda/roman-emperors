import React, { useRef, useState } from 'react';
import EmperorCard, { getDynastyColor } from './EmperorCard.jsx';
import ReignTimeline from './ReignTimeline.jsx';

function formatYear(year) {
  if (year == null) return '?';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `AD ${year}`;
}

const PX_PER_YEAR = 4;
const MIN_GAP_PX = 18;

function DynastyLegend({ emperors, onDynastyClick }) {
  const seen = new Set();
  const dynasties = [];
  for (const e of emperors) {
    if (e.dynasty && !seen.has(e.dynasty)) {
      seen.add(e.dynasty);
      dynasties.push([e.dynasty, getDynastyColor(e.dynasty)]);
    }
  }

  if (!dynasties.length) return null;

  return (
    <div className="dynasty-legend">
      <h3 className="legend-title">Dynasties</h3>
      <div className="legend-items">
        {dynasties.map(([name, color]) => (
          <button
            key={name}
            className="legend-item legend-item--btn"
            onClick={() => onDynastyClick(name)}
            title={`Scroll to ${name}`}
          >
            <span className="legend-dot" style={{ background: color }} />
            <span className="legend-name">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Timeline({ emperors, onSelectEmperor, selectedEmperor }) {
  const dynastyRefs = useRef({});

  if (!emperors.length) {
    return (
      <div className="state-message">
        <p>No emperors found. Have you run <code>npm run seed</code>?</p>
      </div>
    );
  }

  const sorted = [...emperors]
    .filter((e) => e.reign_start != null)
    .sort((a, b) => a.reign_start - b.reign_start);

  const seenDynasties = new Set();

  function handleDynastyClick(dynasty) {
    const el = dynastyRefs.current[dynasty];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCardClick(emperor) {
    // Toggle: clicking selected emperor collapses it
    onSelectEmperor(selectedEmperor?.id === emperor.id ? null : emperor);
  }

  return (
    <div className="timeline-root">
      <DynastyLegend emperors={sorted} onDynastyClick={handleDynastyClick} />

      <section className="timeline-section">
        <h2 className="timeline-section-title">All Emperors</h2>

        <div className="timeline-list">
          {sorted.map((emperor, idx) => {
            const start = emperor.reign_start;
            const end = emperor.reign_end ?? emperor.reign_start;
            const durationYears = Math.max(end - start, 0);
            const gapPx = Math.max(durationYears * PX_PER_YEAR, MIN_GAP_PX);

            const isFirstOfDynasty = emperor.dynasty && !seenDynasties.has(emperor.dynasty);
            if (isFirstOfDynasty) seenDynasties.add(emperor.dynasty);

            const isSelected = selectedEmperor?.id === emperor.id;

            return (
              <React.Fragment key={emperor.id}>
                <div
                  ref={isFirstOfDynasty ? (el) => { dynastyRefs.current[emperor.dynasty] = el; } : null}
                  className={`timeline-entry ${idx % 2 === 0 ? 'entry-left' : 'entry-right'}`}
                  style={{ marginBottom: isSelected ? '0' : `${gapPx}px` }}
                >
                  <div
                    className="timeline-dot"
                    style={{ background: getDynastyColor(emperor.dynasty) }}
                  />
                  <EmperorCard
                    emperor={emperor}
                    onClick={() => handleCardClick(emperor)}
                    isSelected={isSelected}
                  />
                </div>

                {/* Expanded reign detail panel */}
                <div
                  className={`reign-detail-panel ${isSelected ? 'reign-detail-panel--open' : ''}`}
                  aria-hidden={!isSelected}
                >
                  {isSelected && (
                    <>
                      <ReignTimeline emperor={emperor} />
                      <button
                        className="reign-detail-close"
                        onClick={() => onSelectEmperor(null)}
                        aria-label="Collapse detail"
                      >
                        ▲ Collapse
                      </button>
                    </>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </section>
    </div>
  );
}
