import React from 'react';

function formatYear(year) {
  if (year == null) return '?';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `AD ${year}`;
}

function formatTenure(start, end) {
  if (start == null) return null;
  const e = end ?? start;
  const years = e - start;
  if (years <= 0) return 'Less than a year';
  if (years === 1) return '1 year';
  return `${years} years`;
}

/**
 * Pick the most interesting sentence from the Wikipedia summary.
 * Strategy: skip the dry "X was a Roman emperor from Y to Z" opener and
 * return the next substantive sentence, capped at ~180 chars.
 */
function extractTrivia(summary) {
  if (!summary) return null;
  // Clean artefacts (IPA blocks, citations, etc.)
  const cleaned = summary
    .replace(/\[.*?\]/g, '')
    .replace(/\(\/[^)]+\/[^)]*\)/g, '')          // IPA pronunciations
    .replace(/\.mw-parser-output[^;]+;/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
  if (!sentences.length) return cleaned.slice(0, 180);

  // Try to find a sentence with interesting keywords beyond "was a Roman emperor"
  const boring = /^[A-Z][^.]+was (a |the )(Roman emperor|emperor of Rome)/i;
  const interesting = sentences.find(
    (s) => s.length > 40 && s.length < 220 && !boring.test(s.trim())
  );
  const pick = interesting || sentences[0];
  return pick.trim().slice(0, 200);
}

// Named pastel colors for known dynasties
const DYNASTY_PASTEL_MAP = {
  'Julio-Claudian':              '#FFB3C6',
  'Flavian':                     '#A8CAFF',
  'Nervan-Antonine':             '#A8EDBE',
  'Nerva–Antonine':              '#A8EDBE',
  'Severan':                     '#CBA8FF',
  'Year of the Four Emperors':   '#FFE985',
  'Year of the Four':            '#FFE985',
  'Year of the Five Emperors':   '#FFD485',
  'Year of the Five':            '#FFD485',
  'Crisis of the Third Century': '#FFBB85',
  'Illyrian':                    '#85DEFF',
  'Constantinian':               '#85E8E2',
  'Valentinianic':               '#D485FF',
  'Theodosian':                  '#FF85B0',
  'Leonid':                      '#B3FFD9',
  'Puppet':                      '#D4D4D4',
};

const FALLBACK_COLORS = [
  '#FFB3C6', '#A8CAFF', '#A8EDBE', '#CBA8FF',
  '#FFE985', '#FFBB85', '#85E8E2', '#D485FF',
  '#FF85B0', '#85DEFF', '#C6FFB3', '#FFD185',
];

const dynastyColorMap = {};
let colorIndex = 0;

export function getDynastyColor(dynasty) {
  if (!dynasty) return FALLBACK_COLORS[0];
  if (DYNASTY_PASTEL_MAP[dynasty]) return DYNASTY_PASTEL_MAP[dynasty];
  if (!dynastyColorMap[dynasty]) {
    dynastyColorMap[dynasty] = FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length];
    colorIndex++;
  }
  return dynastyColorMap[dynasty];
}

export default function EmperorCard({ emperor, onClick, isSelected }) {
  const dynastyColor = getDynastyColor(emperor.dynasty);
  const tenure = formatTenure(emperor.reign_start, emperor.reign_end);
  const trivia = extractTrivia(emperor.summary);

  return (
    <article
      className={`emperor-card${isSelected ? ' emperor-card--selected' : ''}`}
      style={{ '--dynasty-color': dynastyColor }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
    >
      {/* ── Main row ── */}
      <div className="card-body">
        {emperor.image_url ? (
          <img
            className="card-portrait"
            src={emperor.image_url}
            alt={emperor.name}
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="card-portrait card-portrait-placeholder">
            <span>👑</span>
          </div>
        )}
        <div className="card-info">
          <h3 className="card-name">{emperor.name}</h3>
          {emperor.dynasty && (
            <div className="card-dynasty-row">
              <span className="card-dynasty-dot" style={{ background: dynastyColor }} />
              <span className="card-dynasty">{emperor.dynasty}</span>
            </div>
          )}
          <div className="card-reign">
            {formatYear(emperor.reign_start)} – {formatYear(emperor.reign_end)}
            {tenure && <span className="card-tenure"> · {tenure}</span>}
          </div>
        </div>

        {/* Wikipedia icon button — always visible */}
        {emperor.wikipedia_url && (
          <a
            className="card-wiki-btn"
            href={emperor.wikipedia_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Wikipedia: ${emperor.name}`}
            title="Open Wikipedia"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.09 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10S17.62 2 12.09 2zm-.09 2c2.24 0 4.27.91 5.75 2.38L10.5 16.5l-2.5-5L6 14l3 6H8L4.26 13H6l1.5-3L9 13.5 15.75 6.5C14.49 5.57 13.35 4 12 4zm1 0c3.87.47 6.91 3.52 7.38 7.38L15.75 6.5C14.97 5.3 13.97 4.45 13 4z"/>
            </svg>
          </a>
        )}
      </div>

      {/* ── Hover trivia panel ── */}
      {trivia && (
        <div className="card-trivia">
          <p className="card-trivia-text">{trivia}</p>
          {emperor.wikipedia_url && (
            <a
              className="card-trivia-link"
              href={emperor.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Read more on Wikipedia →
            </a>
          )}
        </div>
      )}
    </article>
  );
}
