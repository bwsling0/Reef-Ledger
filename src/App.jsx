import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, X, Plus, Camera, Calendar, Trash2, ChevronDown,
  Check, StickyNote, RotateCcw, Award, Settings, ArrowLeft, Lock
} from "lucide-react";

/* ---------------------------------------------------------
   Regions & Phyla
--------------------------------------------------------- */
const REGIONS = [
  { id: "north-atlantic", name: "North Atlantic Ocean", subtitle: "Canada to Cape May" },
];

const PHYLA = [
  { id: "fish-vertebrates", name: "Fish & Vertebrates" },
  { id: "mollusks", name: "Mollusks" },
  { id: "crustaceans", name: "Crustaceans & Arthropods" },
  { id: "echinoderms", name: "Echinoderms" },
  { id: "cnidarians", name: "Jellyfish, Corals & Anemones" },
  { id: "worms-other", name: "Worms & Other Invertebrates" },
];

/* ---------------------------------------------------------
   Default species data — North Atlantic (Canada to Cape May)
--------------------------------------------------------- */
const RAW_SPECIES = [
  ["Atlantic Cod", "Gadus morhua", "fish-vertebrates"],
  ["Atlantic Mackerel", "Scomber scombrus", "fish-vertebrates"],
  ["Atlantic Herring", "Clupea harengus", "fish-vertebrates"],
  ["Striped Bass", "Morone saxatilis", "fish-vertebrates"],
  ["Winter Flounder", "Pseudopleuronectes americanus", "fish-vertebrates"],
  ["Haddock", "Melanogrammus aeglefinus", "fish-vertebrates"],
  ["Pollock", "Pollachius virens", "fish-vertebrates"],
  ["Atlantic Sturgeon", "Acipenser oxyrinchus", "fish-vertebrates"],
  ["Bluefin Tuna", "Thunnus thynnus", "fish-vertebrates"],
  ["Spiny Dogfish", "Squalus acanthias", "fish-vertebrates"],
  ["Little Skate", "Leucoraja erinacea", "fish-vertebrates"],
  ["Harbor Seal", "Phoca vitulina", "fish-vertebrates"],
  ["Gray Seal", "Halichoerus grypus", "fish-vertebrates"],
  ["Harbor Porpoise", "Phocoena phocoena", "fish-vertebrates"],
  ["Humpback Whale", "Megaptera novaeangliae", "fish-vertebrates"],
  ["North Atlantic Right Whale", "Eubalaena glacialis", "fish-vertebrates"],
  ["Loggerhead Sea Turtle", "Caretta caretta", "fish-vertebrates"],

  ["Atlantic Sea Scallop", "Placopecten magellanicus", "mollusks"],
  ["Blue Mussel", "Mytilus edulis", "mollusks"],
  ["Eastern Oyster", "Crassostrea virginica", "mollusks"],
  ["Northern Quahog", "Mercenaria mercenaria", "mollusks"],
  ["Atlantic Razor Clam", "Ensis leei", "mollusks"],
  ["Channeled Whelk", "Busycotypus canaliculatus", "mollusks"],
  ["Knobbed Whelk", "Busycon carica", "mollusks"],
  ["Moon Snail", "Euspira heros", "mollusks"],
  ["Atlantic Longfin Squid", "Doryteuthis pealeii", "mollusks"],
  ["Common Periwinkle", "Littorina littorea", "mollusks"],

  ["American Lobster", "Homarus americanus", "crustaceans"],
  ["Atlantic Rock Crab", "Cancer irroratus", "crustaceans"],
  ["Jonah Crab", "Cancer borealis", "crustaceans"],
  ["Blue Crab", "Callinectes sapidus", "crustaceans"],
  ["Green Crab", "Carcinus maenas", "crustaceans"],
  ["Horseshoe Crab", "Limulus polyphemus", "crustaceans"],
  ["Sand Shrimp", "Crangon septemspinosa", "crustaceans"],
  ["Northern Krill", "Meganyctiphanes norvegica", "crustaceans"],
  ["Acorn Barnacle", "Semibalanus balanoides", "crustaceans"],

  ["Forbes Sea Star", "Asterias forbesi", "echinoderms"],
  ["Northern Sea Star", "Asterias rubens", "echinoderms"],
  ["Green Sea Urchin", "Strongylocentrotus droebachiensis", "echinoderms"],
  ["Sand Dollar", "Echinarachnius parma", "echinoderms"],
  ["Orange-Footed Sea Cucumber", "Cucumaria frondosa", "echinoderms"],
  ["Basket Star", "Gorgonocephalus arcticus", "echinoderms"],

  ["Moon Jellyfish", "Aurelia aurita", "cnidarians"],
  ["Lion's Mane Jellyfish", "Cyanea capillata", "cnidarians"],
  ["Frilled Anemone", "Metridium senile", "cnidarians"],
  ["Northern Star Coral", "Astrangia poculata", "cnidarians"],
  ["Portuguese Man o' War", "Physalia physalis", "cnidarians"],

  ["Clam Worm", "Alitta virens", "worms-other"],
  ["Lugworm", "Arenicola marina", "worms-other"],
  ["Bloodworm", "Glycera dibranchiata", "worms-other"],
  ["Breadcrumb Sponge", "Halichondria panicea", "worms-other"],
  ["Red Beard Sponge", "Microciona prolifera", "worms-other"],
  ["Comb Jelly", "Mnemiopsis leidyi", "worms-other"],
];

const DEFAULT_SPECIES = RAW_SPECIES.map(([name, latin, phylum], i) => ({
  id: "d" + i, name, latin, phylum, region: "north-atlantic",
}));

const STORAGE_KEY = "reef-ledger-data";

/* ---------------------------------------------------------
   Placeholder silhouette icons per phylum
--------------------------------------------------------- */
function FishIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 24c6-9 16-13 26-13 5 0 9 2 12 5-3 3-4 5-4 8s1 5 4 8c-3 3-7 5-12 5-10 0-20-4-26-13z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M44 24l4-6v12l-4-6z" fill="currentColor" />
      <circle cx="16" cy="21" r="1.6" fill="currentColor" />
    </svg>
  );
}
function ShellIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M10 34c0-14 6-22 14-22s14 8 14 22" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 12v22M18 15c2 6 2 13 0 19M30 15c-2 6-2 13 0 19" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 34h28" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function CrabIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <ellipse cx="24" cy="24" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 20L4 14M12 28L4 34M36 20l8-6M36 28l8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 12c-2 0-3 1-3 3M42 12c2 0 3 1 3 3M6 36c-2 0-3-1-3-3M42 36c2 0 3-1 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 19l-4-6M33 19l4-6M15 29l-4 6M33 29l4 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function StarIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M24 6l4.5 12.5L41 20l-9.5 9 3 13L24 35l-10.5 7 3-13L7 20l12.5-1.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function JellyIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M12 20a12 10 0 0 1 24 0z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 20c2 6 1 8 0 10M18 21c1 7 0 9-1 12M24 21v14M30 21c-1 7 0 9 1 12M36 20c-2 6-1 8 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function WormIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path d="M6 30c4-8 6-16 4-22M10 8c6 2 9 8 7 15M17 23c4 3 4 9 0 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 34c6 4 14 4 20-2s14-4 18 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
const PHYLUM_ICON = {
  "fish-vertebrates": FishIcon, "mollusks": ShellIcon, "crustaceans": CrabIcon,
  "echinoderms": StarIcon, "cnidarians": JellyIcon, "worms-other": WormIcon,
};

/* ---------------------------------------------------------
   Themes — token sets driving all visual styling
--------------------------------------------------------- */
const THEMES = {
  real: {
    label: "Real",
    headingFont: "'Fraunces', serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'IBM Plex Mono', monospace",
    headingItalic: true,
    bg: "#0E2626",
    bgIsGradient: false,
    panel: "#0A1D1D",
    panelAlt: "#0E2626",
    border: "#547368",
    borderWidth: 1,
    text: "#EAE3D2",
    textDim: "#547368",
    accent: "#8FBFAE",
    coral: "#E4572E",
    radius: 8,
    radiusLg: 16,
    radiusPill: 8,
    shadow: "none",
    buttonShadow: "none",
    letterSpacing: "0.04em",
  },
  cartoon: {
    label: "Cartoon",
    headingFont: "'Baloo 2', cursive",
    bodyFont: "'Nunito', sans-serif",
    monoFont: "'Nunito', sans-serif",
    headingItalic: false,
    bg: "linear-gradient(180deg, #7FD8F2 0%, #9FE3A0 60%, #7FCB6E 100%)",
    bgIsGradient: true,
    panel: "#FFFBEF",
    panelAlt: "#FFF3D6",
    border: "#8B5A2B",
    borderWidth: 3,
    text: "#3B2412",
    textDim: "#8B5A2B",
    accent: "#2E9E5B",
    coral: "#FF5A5F",
    radius: 20,
    radiusLg: 28,
    radiusPill: 999,
    shadow: "0 3px 0 rgba(139,90,43,0.5)",
    buttonShadow: "0 4px 0 rgba(0,0,0,0.25)",
    letterSpacing: "0",
  },
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');`;

const TIER_COLOR = {
  platinum: { fill: "#E8F1F2", ring: "#5D7A82" },
  gold: { fill: "#F1C232", ring: "#B8860B" },
  silver: { fill: "#D6DBE0", ring: "#8A9BA8" },
  bronze: { fill: "#CD8A4A", ring: "#8A5A2B" },
  locked: { fill: "transparent", ring: "#6B7C74" },
};

const TIER_THRESHOLDS = [
  { tier: "locked", label: "Locked", desc: "0 found" },
  { tier: "bronze", label: "Bronze", desc: "1–49% found" },
  { tier: "silver", label: "Silver", desc: "50–89% found" },
  { tier: "gold", label: "Gold", desc: "90–99% found" },
  { tier: "platinum", label: "Platinum", desc: "100% found" },
];

function getTier(found, total) {
  if (!total || found === 0) return "locked";
  if (found === total) return "platinum";
  const pct = (found / total) * 100;
  if (pct >= 90) return "gold";
  if (pct >= 50) return "silver";
  return "bronze";
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
function compressImage(file, maxDim = 700, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

/* ---------------------------------------------------------
   Medal badge
--------------------------------------------------------- */
function MedalBadge({ tier, size = 46, t }) {
  const c = TIER_COLOR[tier];
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 48 56">
      <path d="M14 26l-6 22 16-8 16 8-6-22" fill={tier === "locked" ? "none" : c.fill} stroke={c.ring} strokeWidth="2" strokeLinejoin="round" opacity={tier === "locked" ? 0.5 : 1} />
      <circle cx="24" cy="20" r="16" fill={tier === "locked" ? "none" : c.fill} stroke={c.ring} strokeWidth="2.5" />
      {tier === "locked" ? (
        <Lock x="17" y="13" width="14" height="14" color={c.ring} strokeWidth={2} />
      ) : (
        <circle cx="24" cy="20" r="10" fill="none" stroke={c.ring} strokeWidth="1.5" opacity="0.5" />
      )}
    </svg>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */
export default function ReefLedger() {
  const [records, setRecords] = useState({});
  const [customSpecies, setCustomSpecies] = useState([]);
  const [themeName, setThemeName] = useState("real");
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0].id);
  const [selectedPhylum, setSelectedPhylum] = useState(PHYLA[0].id);
  const [search, setSearch] = useState("");
  const [foundOnly, setFoundOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mapPhylum, setMapPhylum] = useState(null);

  const t = THEMES[themeName];
  const styles = useMemo(() => getStyles(t), [themeName]);

  const allSpecies = useMemo(() => [...DEFAULT_SPECIES, ...customSpecies], [customSpecies]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRecords(parsed.records || {});
        setCustomSpecies(parsed.customSpecies || []);
        setThemeName(parsed.theme === "cartoon" ? "cartoon" : "real");
      }
    } catch (err) {
      // first run
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ records, customSpecies, theme: themeName }));
      setSaveError(null);
    } catch (err) {
      setSaveError("Couldn't save — your changes may not persist. Photos take up a lot of space; try removing some if this keeps happening.");
    }
  }, [records, customSpecies, themeName, loaded]);

  const regionSpecies = allSpecies.filter((s) => s.region === selectedRegion);
  const foundCountRegion = regionSpecies.filter((s) => records[s.id]?.found).length;

  const filtered = regionSpecies.filter((s) => {
    if (s.phylum !== selectedPhylum) return false;
    if (foundOnly && !records[s.id]?.found) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const phylumStats = PHYLA.map((p) => {
    const list = regionSpecies.filter((s) => s.phylum === p.id);
    const found = list.filter((s) => records[s.id]?.found).length;
    return { ...p, total: list.length, found, tier: getTier(found, list.length) };
  });

  function toggleFound(id) {
    setRecords((prev) => {
      const existing = prev[id] || {};
      const nowFound = !existing.found;
      return { ...prev, [id]: { ...existing, found: nowFound, date: nowFound ? existing.date || todayStr() : existing.date } };
    });
  }
  function updateRecord(id, patch) {
    setRecords((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  }
  function addCustomSpecies({ name, latin, phylum }) {
    const id = "c" + Date.now();
    setCustomSpecies((prev) => [...prev, { id, name, latin, phylum, region: selectedRegion }]);
    setShowAddForm(false);
  }
  function removeCustomSpecies(id) {
    setCustomSpecies((prev) => prev.filter((s) => s.id !== id));
    setRecords((prev) => { const next = { ...prev }; delete next[id]; return next; });
    setSelectedId(null);
  }
  function handleReset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
    setRecords({});
    setCustomSpecies([]);
    setShowResetConfirm(false);
  }

  const selected = allSpecies.find((s) => s.id === selectedId);
  const currentPhylumName = PHYLA.find((p) => p.id === selectedPhylum)?.name || "";

  const cartoon = t.label === "Cartoon";

  return (
    <div style={styles.app}>
      <style>{FONT_IMPORT}</style>
      {cartoon && (
        <>
          <div style={styles.frameBolt("tl")} />
          <div style={styles.frameBolt("tr")} />
          <div style={styles.frameBolt("bl")} />
          <div style={styles.frameBolt("br")} />
        </>
      )}
      <div style={styles.panel}>

      <header style={styles.header}>
        <button style={styles.iconBtn} onClick={() => { setShowAchievements(true); setMapPhylum(null); }} title="Achievements">
          <Award size={20} />
        </button>

        <div style={styles.headerCenter}>
          <div style={styles.eyebrow}>PERSONAL OCEAN SPECIES LOG</div>
          <h1 style={styles.title}>Reef Ledger</h1>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.stamp}>
            <div style={styles.stampCount}>{foundCountRegion}</div>
            <div style={styles.stampTotal}>/ {regionSpecies.length}</div>
          </div>
          <button style={styles.iconBtn} onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div style={styles.regionTabs}>
        {REGIONS.map((r) => (
          <button key={r.id} onClick={() => setSelectedRegion(r.id)} style={{ ...styles.regionTab, ...(selectedRegion === r.id ? styles.regionTabActive : {}) }}>
            <div style={styles.regionTabName}>{r.name}</div>
            <div style={styles.regionTabSub}>{r.subtitle}</div>
          </button>
        ))}
        <button style={styles.regionTabGhost} disabled title="More regions coming later">
          <Plus size={14} /> More regions soon
        </button>
      </div>

      <div style={styles.phylumTabs}>
        {PHYLA.map((p) => (
          <button key={p.id} onClick={() => setSelectedPhylum(p.id)} style={{ ...styles.phylumTab, ...(selectedPhylum === p.id ? styles.phylumTabActive : {}) }}>
            {p.name}
          </button>
        ))}
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={16} color={t.accent} />
          <input style={styles.searchInput} placeholder={`Search ${currentPhylumName.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <X size={15} color={t.accent} style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
        </div>
        <button style={{ ...styles.toggleChip, ...(foundOnly ? styles.toggleChipActive : {}) }} onClick={() => setFoundOnly((v) => !v)}>
          <Check size={13} /> Found only
        </button>
      </div>

      <main style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>Nothing here yet. Try a different search, or log a species you've spotted that isn't on the list.</div>
        )}
        {filtered.map((s) => {
          const rec = records[s.id];
          const PlaceholderIcon = PHYLUM_ICON[s.phylum] || FishIcon;
          const isCustom = s.id.startsWith("c");
          const thumb = rec?.photos?.[0];
          return (
            <div key={s.id} style={styles.row} onClick={() => setSelectedId(s.id)}>
              <div style={{ ...styles.stampButton, ...(rec?.found ? styles.stampButtonActive : {}) }} onClick={(e) => { e.stopPropagation(); toggleFound(s.id); }}>
                {rec?.found ? <Check size={15} strokeWidth={3} /> : null}
              </div>
              <div style={styles.rowText}>
                <div style={styles.rowName}>{s.name}{isCustom && <span style={styles.customTag}>added</span>}</div>
                <div style={styles.rowLatin}>{s.latin}</div>
                {rec?.found && rec?.date && <div style={styles.metaDate}>{rec.date}</div>}
              </div>
              <div style={styles.rowThumb}>
                {thumb ? <img src={thumb} style={styles.rowThumbImg} alt="" /> : <PlaceholderIcon style={styles.rowThumbIcon} />}
              </div>
            </div>
          );
        })}
        <button style={styles.addRow} onClick={() => setShowAddForm(true)}>
          <Plus size={15} /> Log a species not on this list
        </button>
        <div style={styles.footerRow}>
          {saveError && <span style={styles.saveError}>{saveError}</span>}
          <button style={styles.resetLink} onClick={() => setShowResetConfirm(true)}><RotateCcw size={12} /> Reset all data</button>
        </div>
      </main>

      </div>

      {selected && (
        <DetailModal
          styles={styles} t={t}
          species={selected} record={records[selected.id] || {}}
          onClose={() => setSelectedId(null)}
          onUpdate={(patch) => updateRecord(selected.id, patch)}
          onToggleFound={() => toggleFound(selected.id)}
          onDeleteCustom={selected.id.startsWith("c") ? () => removeCustomSpecies(selected.id) : null}
        />
      )}

      {showAddForm && (
        <AddSpeciesModal styles={styles} defaultPhylum={selectedPhylum} onClose={() => setShowAddForm(false)} onAdd={addCustomSpecies} />
      )}

      {showResetConfirm && (
        <ConfirmModal styles={styles} message="This clears every sighting, note, and photo you've logged. This can't be undone." onCancel={() => setShowResetConfirm(false)} onConfirm={handleReset} />
      )}

      {showAchievements && (
        <AchievementsModal
          styles={styles} t={t}
          phylumStats={phylumStats}
          mapPhylum={mapPhylum}
          setMapPhylum={setMapPhylum}
          allSpeciesForPhylum={(pid) => regionSpecies.filter((s) => s.phylum === pid)}
          records={records}
          onClose={() => { setShowAchievements(false); setMapPhylum(null); }}
        />
      )}

      {showSettings && (
        <SettingsModal styles={styles} t={t} themeName={themeName} setThemeName={setThemeName} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Achievements + Collection Map
--------------------------------------------------------- */
function AchievementsModal({ styles, t, phylumStats, mapPhylum, setMapPhylum, allSpeciesForPhylum, records, onClose }) {
  const cartoon = t.label === "Cartoon";
  if (mapPhylum) {
    const phylum = phylumStats.find((p) => p.id === mapPhylum);
    const species = allSpeciesForPhylum(mapPhylum);
    const found = species.filter((s) => records[s.id]?.found).length;
    const pct = species.length ? Math.round((found / species.length) * 100) : 0;
    const PlaceholderIcon = PHYLUM_ICON[mapPhylum] || FishIcon;
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={{ ...styles.modal, ...(cartoon ? { maxWidth: 560 } : {}) }} onClick={(e) => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          <button style={styles.backBtn} onClick={() => setMapPhylum(null)}><ArrowLeft size={15} /> All achievements</button>
          <div style={styles.modalTitle}>{phylum.name}</div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${pct}%` }} />
          </div>
          <div style={styles.progressLabel}>{found} / {species.length} discovered — {pct}%</div>
          {cartoon ? (
            <TreasureMapView styles={styles} species={species} records={records} PlaceholderIcon={PlaceholderIcon} />
          ) : (
            <div style={styles.mapGrid}>
              {species.map((s) => {
                const rec = records[s.id];
                const thumb = rec?.photos?.[0];
                return (
                  <div key={s.id} style={styles.mapTile} title={rec?.found ? s.name : "Not yet found"}>
                    <div style={{ ...styles.mapCircle, ...(rec?.found ? styles.mapCircleFound : styles.mapCircleLocked) }}>
                      {rec?.found ? (
                        thumb ? <img src={thumb} style={styles.rowThumbImg} alt="" /> : <PlaceholderIcon style={styles.mapCircleIcon} />
                      ) : (
                        <PlaceholderIcon style={styles.mapCircleIconLocked} />
                      )}
                    </div>
                    {rec?.found && <div style={styles.mapTileName}>{s.name}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalTitle}>Achievements</div>
        <div style={styles.hint}>Tap a badge to see which species you've found in that group.</div>

        <div style={styles.legendRow}>
          {TIER_THRESHOLDS.map((tt) => (
            <div key={tt.tier} style={styles.legendItem}>
              <MedalBadge tier={tt.tier} size={26} t={t} />
              <div>
                <div style={styles.legendLabel}>{tt.label}</div>
                <div style={styles.legendDesc}>{tt.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          {phylumStats.map((p) => (
            <button key={p.id} style={styles.achievementRow} onClick={() => setMapPhylum(p.id)}>
              <MedalBadge tier={p.tier} size={40} t={t} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.achievementName}>{p.name}</div>
                <div style={styles.achievementSub}>{p.found} / {p.total} found</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Treasure map — cartoon-theme achievement view
--------------------------------------------------------- */
const MAP_POSITIONS = [
  [15, 22], [36, 12], [58, 20], [78, 14], [90, 32],
  [10, 48], [30, 58], [50, 42], [68, 52], [86, 46],
  [18, 72], [40, 80], [60, 68], [78, 82], [92, 66],
  [26, 90], [50, 88], [72, 92], [8, 90], [95, 88],
];

function CompassRose(props) {
  return (
    <svg viewBox="0 0 60 60" {...props}>
      <circle cx="30" cy="30" r="25" fill="none" stroke="#8B5A2B" strokeWidth="1.5" />
      <path d="M30 7l4 19-4 4-4-4z" fill="#8B5A2B" />
      <path d="M30 53l4-19-4-4-4 4z" fill="#8B5A2B" opacity="0.55" />
      <path d="M7 30l19-4 4 4-4 4z" fill="#8B5A2B" opacity="0.55" />
      <path d="M53 30l-19-4-4 4 4 4z" fill="#8B5A2B" opacity="0.55" />
      <text x="30" y="15" fontSize="7" textAnchor="middle" fill="#8B5A2B" fontWeight="bold">N</text>
    </svg>
  );
}

function TreasureMapView({ styles, species, records, PlaceholderIcon }) {
  const pts = species.map((s, i) => MAP_POSITIONS[i % MAP_POSITIONS.length]);
  return (
    <div style={styles.mapParchment}>
      <svg style={styles.mapPathSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none" stroke="#8B5A2B" strokeWidth="0.5" strokeDasharray="1.5,2" opacity="0.55"
        />
      </svg>
      {species.map((s, i) => {
        const [x, y] = MAP_POSITIONS[i % MAP_POSITIONS.length];
        const rec = records[s.id];
        const thumb = rec?.photos?.[0];
        return (
          <div key={s.id} style={{ ...styles.mapMarker, left: `${x}%`, top: `${y}%` }} title={rec?.found ? s.name : "Not yet found"}>
            <div style={{ ...styles.mapMarkerCircle, ...(rec?.found ? styles.mapMarkerFound : styles.mapMarkerLocked) }}>
              {rec?.found
                ? (thumb ? <img src={thumb} style={styles.rowThumbImg} alt="" /> : <PlaceholderIcon style={styles.mapMarkerIcon} />)
                : <span style={styles.mapMarkerQ}>?</span>}
            </div>
            {rec?.found && <div style={styles.mapMarkerLabel}>{s.name}</div>}
          </div>
        );
      })}
      <CompassRose style={styles.compassRose} />
    </div>
  );
}

/* ---------------------------------------------------------
   Settings
--------------------------------------------------------- */
function SettingsModal({ styles, t, themeName, setThemeName, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalTitle}>Settings</div>
        <div style={{ ...styles.fieldLabel, marginTop: 16, marginBottom: 10 }}>Theme</div>
        <div style={styles.themeGrid}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => setThemeName(key)} style={{ ...styles.themeCard, ...(themeName === key ? styles.themeCardActive : {}) }}>
              <div style={{ ...styles.themeSwatch, background: theme.bgIsGradient ? theme.bg : theme.bg }} />
              <div style={styles.themeCardLabel}>{theme.label}</div>
              {themeName === key && <Check size={14} style={{ position: "absolute", top: 8, right: 8 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Detail modal
--------------------------------------------------------- */
function DetailModal({ styles, t, species, record, onClose, onUpdate, onToggleFound, onDeleteCustom }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const PlaceholderIcon = PHYLUM_ICON[species.phylum] || FishIcon;

  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true); setErr(null);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      onUpdate({ photos: [...(record.photos || []), ...compressed] });
    } catch (error) {
      setErr("Couldn't add that photo. Try a different file.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  function removePhoto(idx) {
    const next = [...(record.photos || [])];
    next.splice(idx, 1);
    onUpdate({ photos: next });
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalHeader}>
          <div style={styles.modalThumb}>
            {record.photos?.[0] ? <img src={record.photos[0]} style={styles.rowThumbImg} alt="" /> : <PlaceholderIcon style={styles.modalThumbIcon} />}
          </div>
          <div>
            <div style={styles.modalTitle}>{species.name}</div>
            <div style={styles.modalLatin}>{species.latin}</div>
          </div>
        </div>
        <button style={{ ...styles.foundToggle, ...(record.found ? styles.foundToggleActive : {}) }} onClick={onToggleFound}>
          <div style={{ ...styles.stampButton, ...(record.found ? styles.stampButtonActive : {}), width: 22, height: 22 }}>
            {record.found ? <Check size={14} strokeWidth={3} /> : null}
          </div>
          {record.found ? "Marked as found" : "Mark as found"}
        </button>
        {record.found && (
          <label style={styles.field}>
            <span style={styles.fieldLabel}><Calendar size={12} /> Date spotted</span>
            <input type="date" value={record.date || ""} onChange={(e) => onUpdate({ date: e.target.value })} style={styles.dateInput} />
          </label>
        )}
        <label style={styles.field}>
          <span style={styles.fieldLabel}><StickyNote size={12} /> Notes</span>
          <textarea value={record.notes || ""} onChange={(e) => onUpdate({ notes: e.target.value })} placeholder="Where, how deep, what it was doing…" style={styles.textarea} />
        </label>
        <div style={styles.field}>
          <span style={styles.fieldLabel}><Camera size={12} /> Photos</span>
          <div style={styles.photoGrid}>
            {(record.photos || []).map((src, i) => (
              <div key={i} style={styles.photoThumbWrap}>
                <img src={src} style={styles.photoThumb} alt="" />
                <button style={styles.photoRemove} onClick={() => removePhoto(i)}><X size={11} /></button>
              </div>
            ))}
            <button style={styles.photoAdd} onClick={() => fileRef.current?.click()} disabled={busy}>
              <Plus size={16} /><span style={{ fontSize: 10 }}>{busy ? "Adding…" : "Add"}</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" style={{ display: "none" }} onChange={handlePhotoSelect} />
          {err && <div style={styles.saveError}>{err}</div>}
          <div style={styles.hint}>The first photo you add becomes this species' thumbnail. Video isn't supported yet.</div>
        </div>
        {onDeleteCustom && (
          <button style={styles.deleteRow} onClick={onDeleteCustom}><Trash2 size={13} /> Remove this species from your list</button>
        )}
      </div>
    </div>
  );
}

function AddSpeciesModal({ styles, defaultPhylum, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [latin, setLatin] = useState("");
  const [phylum, setPhylum] = useState(defaultPhylum);
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <div style={styles.modalTitle}>Log a new species</div>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Name</span>
          <input style={styles.dateInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ocean Sunfish" />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Scientific name (optional)</span>
          <input style={styles.dateInput} value={latin} onChange={(e) => setLatin(e.target.value)} placeholder="e.g. Mola mola" />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Phylum group</span>
          <div style={{ position: "relative" }}>
            <select style={styles.select} value={phylum} onChange={(e) => setPhylum(e.target.value)}>
              {PHYLA.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown size={14} style={styles.selectChevron} />
          </div>
        </label>
        <button style={styles.primaryBtn} disabled={!name.trim()} onClick={() => onAdd({ name: name.trim(), latin: latin.trim() || "—", phylum })}>
          Add to my list
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ styles, message, onCancel, onConfirm }) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={{ ...styles.modal, maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalTitle}>Are you sure?</div>
        <div style={{ ...styles.hint, marginTop: 8 }}>{message}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          <button style={{ ...styles.primaryBtn, background: "#B5432A" }} onClick={onConfirm}>Reset everything</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Style generator — driven by theme tokens
--------------------------------------------------------- */
function getStyles(t) {
  const cartoon = t.label === "Cartoon";
  const woodGrain = "repeating-linear-gradient(180deg, #C68642 0px, #B5701F 5px, #C68642 10px, #A5650F 15px)";
  return {
    app: cartoon
      ? {
          fontFamily: t.bodyFont, background: woodGrain, color: t.text, minHeight: "100%",
          padding: 16, position: "relative", maxWidth: 720, margin: "0 auto", boxSizing: "border-box",
          borderRadius: 26, boxShadow: "0 8px 0 rgba(0,0,0,0.2), inset 0 0 0 4px rgba(0,0,0,0.15)",
        }
      : {
          fontFamily: t.bodyFont, background: t.bg, color: t.text, minHeight: "100%",
          padding: "20px 20px 40px", position: "relative", maxWidth: 720, margin: "0 auto", boxSizing: "border-box",
        },
    panel: cartoon
      ? { background: "#3B2412", border: "2px solid #6B4423", borderRadius: 20, padding: "18px 16px 30px", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.4)" }
      : {},
    frameBolt: (corner) => {
      const pos = {
        tl: { top: 8, left: 8 }, tr: { top: 8, right: 8 },
        bl: { bottom: 8, left: 8 }, br: { bottom: 8, right: 8 },
      }[corner];
      return {
        position: "absolute", ...pos, width: 12, height: 12, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #DDD, #888 70%, #555)",
        border: "1px solid #444", zIndex: 2,
      };
    },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 10 },
    headerCenter: cartoon
      ? {
          textAlign: "center", flex: 1, background: "linear-gradient(180deg, #F6D186, #D9A441)",
          border: "3px solid #8B5A2B", borderRadius: 14, padding: "8px 16px",
          boxShadow: "0 4px 0 rgba(0,0,0,0.25)",
        }
      : { textAlign: "center", flex: 1 },
    headerRight: { display: "flex", alignItems: "center", gap: 10 },
    iconBtn: cartoon
      ? {
          width: 42, height: 42, borderRadius: "50%", border: "2px solid #8B5A2B",
          background: "linear-gradient(180deg, #F6D186, #D9A441)", color: "#3B2412",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 3px 0 rgba(0,0,0,0.25)", flexShrink: 0,
        }
      : {
          width: 40, height: 40, borderRadius: t.radiusPill, border: `${t.borderWidth}px solid ${t.border}`,
          background: t.panel, color: t.text, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: t.buttonShadow, flexShrink: 0,
        },
    eyebrow: { fontFamily: t.monoFont, fontSize: cartoon ? 9.5 : 10.5, letterSpacing: t.letterSpacing || "0.18em", color: cartoon ? "#6B4423" : t.accent, marginBottom: 2, fontWeight: cartoon ? 700 : 400 },
    title: { fontFamily: t.headingFont, fontSize: cartoon ? 26 : 32, fontWeight: cartoon ? 700 : 600, margin: 0, color: cartoon ? "#3B2412" : t.text },
    stamp: {
      border: `${t.borderWidth + 0.5}px solid ${t.border}`, borderRadius: "50%", width: 54, height: 54,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transform: cartoon ? "none" : "rotate(-6deg)", flexShrink: 0, background: t.panel,
    },
    stampCount: { fontFamily: t.monoFont, fontSize: 15, lineHeight: 1, color: t.coral, fontWeight: 700 },
    stampTotal: { fontFamily: t.monoFont, fontSize: 8.5, color: t.textDim },

    regionTabs: { display: "flex", gap: 8, overflowX: "auto", marginBottom: 12, paddingBottom: 2 },
    regionTab: { background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "8px 14px", cursor: "pointer", textAlign: "left", flexShrink: 0, boxShadow: t.shadow },
    regionTabActive: { borderColor: t.coral, background: cartoon ? t.panelAlt : "rgba(228,87,46,0.12)" },
    regionTabName: { fontSize: 13.5, fontWeight: cartoon ? 700 : 500, color: t.text, fontFamily: cartoon ? t.headingFont : t.bodyFont },
    regionTabSub: { fontFamily: t.monoFont, fontSize: 9.5, color: t.textDim, marginTop: 1 },
    regionTabGhost: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `${t.borderWidth}px dashed ${t.border}`, borderRadius: t.radius, padding: "8px 14px", color: t.textDim, fontSize: 12, flexShrink: 0, cursor: "not-allowed" },

    phylumTabs: { display: "flex", gap: cartoon ? 8 : 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 },
    phylumTab: cartoon
      ? { fontFamily: t.headingFont, fontSize: 12.5, color: t.textDim, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radiusPill, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap", boxShadow: t.shadow }
      : { fontFamily: t.monoFont, fontSize: 11, letterSpacing: "0.02em", color: t.textDim, background: "transparent", border: "none", borderBottom: "2px solid transparent", padding: "4px 2px", cursor: "pointer", whiteSpace: "nowrap", marginRight: 12 },
    phylumTabActive: cartoon
      ? { color: t.panel, background: t.accent, borderColor: t.accent }
      : { color: t.coral, borderBottomColor: t.coral },

    toolbar: { display: "flex", gap: 10, marginBottom: 14 },
    searchBox: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "9px 12px" },
    searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: t.text, fontSize: 14, fontFamily: t.bodyFont },
    toggleChip: { display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontFamily: t.bodyFont, color: t.accent, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radiusPill, padding: "0 12px", cursor: "pointer", whiteSpace: "nowrap" },
    toggleChipActive: { background: t.accent, color: t.panel, borderColor: t.accent },

    list: {},
    row: { display: "flex", alignItems: "center", gap: 12, padding: cartoon ? "10px 10px" : "10px 2px", cursor: "pointer", borderBottom: cartoon ? "none" : `1px dotted rgba(143,191,174,0.18)`, background: cartoon ? t.panel : "transparent", borderRadius: cartoon ? t.radius : 0, marginBottom: cartoon ? 8 : 0, border: cartoon ? `${t.borderWidth}px solid ${t.border}` : "none", boxShadow: cartoon ? t.shadow : "none" },
    stampButton: { width: 24, height: 24, borderRadius: "50%", border: `${t.borderWidth + 0.5}px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.panel, cursor: "pointer", background: t.panel },
    stampButtonActive: { background: t.coral, borderColor: t.coral, color: "#fff", transform: cartoon ? "none" : "rotate(-8deg)" },
    rowText: { minWidth: 0, flex: 1 },
    rowName: { fontSize: 14.5, fontWeight: cartoon ? 700 : 500, color: t.text, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontFamily: cartoon ? t.headingFont : t.bodyFont },
    customTag: { fontFamily: t.monoFont, fontSize: 8.5, color: t.textDim, border: `1px solid ${t.border}`, borderRadius: 4, padding: "1px 4px" },
    rowLatin: { fontSize: 11, fontStyle: cartoon ? "normal" : "italic", color: t.textDim },
    metaDate: { fontFamily: t.monoFont, fontSize: 10, color: t.textDim, marginTop: 2 },
    rowThumb: { width: 46, height: 46, borderRadius: cartoon ? "50%" : 8, border: `${t.borderWidth}px solid ${t.border}`, background: t.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
    rowThumbImg: { width: "100%", height: "100%", objectFit: "cover" },
    rowThumbIcon: { width: 26, height: 26, color: t.textDim },

    empty: { color: t.textDim, fontSize: 13.5, padding: "30px 4px", lineHeight: 1.6 },
    addRow: { display: "flex", alignItems: "center", gap: 7, background: t.panel, border: `${t.borderWidth}px dashed ${t.border}`, borderRadius: t.radius, color: t.accent, fontSize: 13, fontFamily: t.bodyFont, padding: "11px 14px", cursor: "pointer", width: "100%", marginTop: 12 },
    footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
    resetLink: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: t.textDim, fontSize: 11.5, cursor: "pointer", marginLeft: "auto" },
    saveError: { color: t.coral, fontSize: 11.5 },

    overlay: { position: "fixed", inset: 0, background: "rgba(10,20,20,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 },
    modal: { background: t.bgIsGradient ? t.panel : t.bg, border: `${t.borderWidth}px solid ${t.border}`, borderBottom: "none", borderRadius: `${t.radiusLg}px ${t.radiusLg}px 0 0`, padding: "22px 20px 28px", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", position: "relative", boxSizing: "border-box" },
    closeBtn: cartoon
      ? {
          position: "absolute", top: -12, right: -12, width: 32, height: 32, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #FF7A7A, #D93B3B 70%, #A82424)",
          border: "2px solid #7A1A1A", color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 0 rgba(0,0,0,0.3)",
        }
      : { position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: t.textDim, cursor: "pointer" },
    backBtn: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: t.accent, fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 },
    modalHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
    modalThumb: { width: 52, height: 52, borderRadius: cartoon ? "50%" : 10, border: `${t.borderWidth}px solid ${t.border}`, background: t.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
    modalThumbIcon: { width: 30, height: 30, color: t.textDim },
    modalTitle: { fontFamily: t.headingFont, fontSize: 20, fontWeight: cartoon ? 700 : 600, color: t.text },
    modalLatin: { fontSize: 12, fontStyle: cartoon ? "normal" : "italic", color: t.textDim },
    foundToggle: { display: "flex", alignItems: "center", gap: 9, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "10px 14px", color: t.text, fontSize: 13.5, cursor: "pointer", width: "100%", marginBottom: 16, boxShadow: t.shadow },
    foundToggleActive: { borderColor: t.coral },
    field: { display: "block", marginBottom: 16 },
    fieldLabel: { display: "flex", alignItems: "center", gap: 5, fontFamily: t.monoFont, fontSize: 10.5, letterSpacing: "0.04em", color: t.accent, marginBottom: 6 },
    dateInput: { width: "100%", background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius - 1, padding: "9px 11px", color: t.text, fontSize: 13.5, fontFamily: t.bodyFont, boxSizing: "border-box", outline: "none" },
    select: { width: "100%", background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius - 1, padding: "9px 11px", color: t.text, fontSize: 13.5, fontFamily: t.bodyFont, boxSizing: "border-box", appearance: "none", outline: "none" },
    selectChevron: { position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: t.textDim, pointerEvents: "none" },
    textarea: { width: "100%", minHeight: 64, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius - 1, padding: "9px 11px", color: t.text, fontSize: 13.5, fontFamily: t.bodyFont, boxSizing: "border-box", outline: "none", resize: "vertical" },
    photoGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
    photoThumbWrap: { position: "relative", width: 68, height: 68 },
    photoThumb: { width: "100%", height: "100%", objectFit: "cover", borderRadius: cartoon ? "50%" : 6, border: `${t.borderWidth}px solid ${t.border}` },
    photoRemove: { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: t.coral, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    photoAdd: { width: 68, height: 68, borderRadius: cartoon ? "50%" : 6, border: `${t.borderWidth}px dashed ${t.border}`, background: "transparent", color: t.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer" },
    hint: { fontSize: 11, color: t.textDim, lineHeight: 1.5, marginTop: 8 },
    deleteRow: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#C97A63", fontSize: 12.5, cursor: "pointer", marginTop: 6 },
    primaryBtn: { width: "100%", background: t.coral, color: "#fff", border: "none", borderRadius: t.radiusPill === 999 ? 20 : t.radius, padding: "11px 14px", fontSize: 14, fontWeight: cartoon ? 700 : 500, cursor: "pointer", fontFamily: t.bodyFont, boxShadow: t.buttonShadow },
    secondaryBtn: { flex: 1, background: t.panel, color: t.accent, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radiusPill === 999 ? 20 : t.radius, padding: "11px 14px", fontSize: 14, cursor: "pointer", fontFamily: t.bodyFont },

    achievementRow: { display: "flex", alignItems: "center", gap: 14, width: "100%", background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: "10px 14px", cursor: "pointer", marginBottom: 10, boxShadow: t.shadow },
    achievementName: { fontSize: 14, fontWeight: cartoon ? 700 : 500, color: t.text, fontFamily: cartoon ? t.headingFont : t.bodyFont },
    achievementSub: { fontSize: 11.5, color: t.textDim, marginTop: 2, fontFamily: t.monoFont },

    legendRow: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, padding: "10px 12px", background: t.panelAlt, border: `1px solid ${t.border}`, borderRadius: t.radius },
    legendItem: { display: "flex", alignItems: "center", gap: 6, minWidth: 110 },
    legendLabel: { fontSize: 11, fontWeight: cartoon ? 700 : 600, color: t.text, fontFamily: cartoon ? t.headingFont : t.bodyFont },
    legendDesc: { fontSize: 9.5, color: t.textDim, fontFamily: t.monoFont },

    progressTrack: { width: "100%", height: 10, borderRadius: 999, background: t.panelAlt, border: `1px solid ${t.border}`, overflow: "hidden", marginTop: 6 },
    progressFill: { height: "100%", background: t.coral, borderRadius: 999, transition: "width 0.3s ease" },
    progressLabel: { fontFamily: t.monoFont, fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 16 },

    mapGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 14 },
    mapTile: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
    mapCircle: { width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: `2px solid ${t.border}` },
    mapCircleFound: { background: t.panelAlt },
    mapCircleLocked: { background: "#0a0a0a" },
    mapCircleIcon: { width: 28, height: 28, color: t.accent },
    mapCircleIconLocked: { width: 24, height: 24, color: "#2a2a2a" },
    mapTileName: { fontSize: 8.5, color: t.textDim, textAlign: "center", lineHeight: 1.2 },

    mapParchment: {
      position: "relative", width: "100%", minHeight: 320, boxSizing: "border-box",
      background: "radial-gradient(circle at 20% 25%, rgba(139,90,43,0.18), transparent 55%), radial-gradient(circle at 82% 72%, rgba(139,90,43,0.16), transparent 50%), #EBD8AE",
      border: "3px solid #8B5A2B", borderRadius: "60px 14px 60px 14px", padding: 16, overflow: "hidden",
    },
    mapPathSvg: { position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 },
    mapMarker: { position: "absolute", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 1 },
    mapMarkerCircle: { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #6B4423", overflow: "hidden" },
    mapMarkerFound: { background: "#F6D186" },
    mapMarkerLocked: { background: "rgba(107,68,35,0.2)", borderStyle: "dashed" },
    mapMarkerIcon: { width: 18, height: 18, color: "#6B4423" },
    mapMarkerQ: { fontSize: 14, color: "#6B4423", fontWeight: 700 },
    mapMarkerLabel: { fontSize: 7.5, color: "#4A2E12", textAlign: "center", maxWidth: 62, lineHeight: 1.15, background: "rgba(235,216,174,0.9)", padding: "1px 3px", borderRadius: 4 },
    compassRose: { position: "absolute", bottom: 10, right: 10, width: 44, height: 44, opacity: 0.7 },

    themeGrid: { display: "flex", gap: 12 },
    themeCard: { position: "relative", flex: 1, background: t.panel, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, padding: 10, cursor: "pointer", color: t.text },
    themeCardActive: { borderColor: t.coral, borderWidth: 2 },
    themeSwatch: { width: "100%", height: 50, borderRadius: t.radius - 2, marginBottom: 8 },
    themeCardLabel: { fontSize: 13, fontWeight: 600, textAlign: "center" },
  };
}
