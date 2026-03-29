// Approximate GeoJSON polygons for the Roman Empire at different eras.
// These are intentionally simplified (visual aid, not cartographic precision).
// Coordinates are [lng, lat] per GeoJSON spec.

export const EMPIRE_SNAPSHOTS = [
  {
    era: "Late Republic",
    label: "Late Republic (~60 BC)",
    yearRange: [-100, -27],
    center: [12.5, 41.9],
    zoom: 4,
    // Italy, Sicily, Sardinia, Corsica, North Africa coast, Greece, Asia Minor, Syria
    coordinates: [
      [
        [-10, 35], [5, 30], [15, 30], [25, 30], [38, 34], [42, 36],
        [44, 38], [42, 42], [30, 44], [22, 42], [18, 42], [14, 46],
        [8, 44], [3, 44], [-2, 44], [-8, 38], [-8, 36], [-5, 34],
        [0, 32], [10, 30], [-10, 35],
      ],
    ],
  },
  {
    era: "Augustus",
    label: "Augustan Empire (~14 AD)",
    yearRange: [-27, 68],
    center: [15, 42],
    zoom: 4,
    // Adds Iberia, Gaul, Rhine/Danube frontier, Anatolia, Egypt
    coordinates: [
      [
        [-9, 44], [-9, 38], [-5, 34], [0, 30], [12, 29], [20, 30],
        [28, 30], [36, 31], [40, 34], [44, 38], [44, 42], [40, 44],
        [32, 48], [28, 46], [22, 46], [18, 48], [16, 48], [13, 47],
        [8, 46], [2, 46], [-2, 46], [-4, 44], [-6, 44], [-8, 44],
        [-9, 44],
      ],
    ],
  },
  {
    era: "Trajan Peak",
    label: "Trajan's Peak (~117 AD)",
    yearRange: [98, 117],
    center: [20, 40],
    zoom: 4,
    // Maximum extent — adds Dacia, Mesopotamia, Armenia
    coordinates: [
      [
        [-9, 44], [-9, 38], [-5, 34], [0, 30], [12, 28], [22, 30],
        [30, 30], [38, 32], [44, 36], [48, 38], [48, 42], [44, 46],
        [40, 48], [30, 50], [25, 50], [22, 48], [18, 48], [16, 48],
        [14, 48], [8, 46], [2, 46], [-2, 46], [-4, 44], [-9, 44],
      ],
    ],
  },
  {
    era: "Antonine",
    label: "Antonine Empire (~160 AD)",
    yearRange: [117, 235],
    center: [18, 41],
    zoom: 4,
    // Hadrian pulled back from Mesopotamia; Britain, Dacia still held
    coordinates: [
      [
        [-4, 56], [-4, 50], [-9, 44], [-9, 38], [-5, 34], [0, 30],
        [12, 28], [22, 30], [30, 30], [36, 31], [40, 34], [44, 38],
        [44, 42], [40, 46], [30, 50], [25, 50], [22, 48], [18, 48],
        [16, 48], [14, 48], [8, 46], [2, 46], [-2, 46], [-4, 50],
        [-4, 56],
      ],
    ],
  },
  {
    era: "Late Empire",
    label: "Late Empire (~350 AD)",
    yearRange: [235, 395],
    center: [18, 40],
    zoom: 4,
    // Lost Dacia; Mesopotamia gone; Britain shrinking
    coordinates: [
      [
        [-3, 54], [-3, 50], [-9, 44], [-9, 38], [-5, 34], [0, 30],
        [12, 28], [22, 30], [30, 30], [36, 31], [40, 34], [42, 38],
        [42, 42], [36, 46], [28, 48], [22, 48], [18, 48], [16, 48],
        [14, 48], [8, 46], [2, 46], [-2, 46], [-3, 50], [-3, 54],
      ],
    ],
  },
  {
    era: "Fall West",
    label: "Western Empire (~450 AD)",
    yearRange: [395, 476],
    center: [10, 42],
    zoom: 4,
    // Only western half — Italy, bits of Gaul, North Africa, Hispania shrinking
    coordinates: [
      [
        [-9, 44], [-9, 38], [-5, 34], [0, 30], [12, 28], [16, 32],
        [16, 38], [18, 42], [14, 46], [8, 46], [5, 44], [2, 44],
        [-2, 44], [-4, 43], [-9, 44],
      ],
    ],
  },
];

/**
 * Returns the best-matching era snapshot for a given reign_start year.
 */
export function getEraForYear(year) {
  if (year == null) return EMPIRE_SNAPSHOTS[1]; // default Augustus

  for (const snap of EMPIRE_SNAPSHOTS) {
    const [from, to] = snap.yearRange;
    if (year >= from && year <= to) return snap;
  }

  // Beyond known range — clamp
  if (year < EMPIRE_SNAPSHOTS[0].yearRange[0]) return EMPIRE_SNAPSHOTS[0];
  return EMPIRE_SNAPSHOTS[EMPIRE_SNAPSHOTS.length - 1];
}
