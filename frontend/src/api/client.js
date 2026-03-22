// Static data mode — reads from public/emperors.json (no backend required).
// This allows the app to be deployed as a fully static site (e.g. GitHub Pages).

const BASE_URL = import.meta.env.BASE_URL || '/';

let _cache = null;

async function loadEmperors() {
  if (_cache) return _cache;
  const res = await fetch(`${BASE_URL}emperors.json`);
  if (!res.ok) throw new Error(`Failed to load emperors.json: ${res.status}`);
  _cache = await res.json();
  return _cache;
}

export const apiClient = {
  getEmperors: () => loadEmperors(),
  getEmperor: async (id) => {
    const all = await loadEmperors();
    const emp = all.find((e) => e.id === id);
    if (!emp) throw new Error(`Emperor ${id} not found`);
    return emp;
  },
};
