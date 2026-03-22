import { useState, useEffect, useCallback, useRef } from "react";

// ─── PUZZLE ENGINE ─────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[br + i][bc + j] === num) return false;
  return true;
}
function fillBoard(board) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) {
        for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n;
            if (fillBoard(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
  return true;
}
function countSolutions(board, limit = 2) {
  let count = 0;
  function solve(b) {
    if (count >= limit) return;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (b[r][c] === 0) {
          for (let n = 1; n <= 9; n++)
            if (isValid(b, r, c, n)) { b[r][c] = n; solve(b); b[r][c] = 0; if (count >= limit) return; }
          return;
        }
    count++;
  }
  solve(board.map(r => [...r]));
  return count;
}
function generateExpertPuzzle() {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(solution);
  const puzzle = solution.map(r => [...r]);
  const cells = shuffle([...Array(81).keys()]);
  let clues = 81;
  for (const idx of cells) {
    if (clues <= 23) break;
    const r = Math.floor(idx / 9), c = idx % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle) === 1) clues--;
    else puzzle[r][c] = backup;
  }
  return { puzzle, solution, clues };
}

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const C = {
  bg:          "#f8f9fb",
  card:        "#ffffff",
  border:      "#e2e8f0",
  borderBox:   "#94a3b8",
  borderThick: "#1e293b",
  given:       "#1e293b",
  user:        "#2563eb",
  error:       "#dc2626",
  note:        "#94a3b8",
  noteOn:      "#3b82f6",
  selCell:     "#bfdbfe",
  hlCell:      "#eff6ff",
  sameNum:     "#dbeafe",
  accent:      "#2563eb",
  accentSoft:  "rgba(37,99,235,0.08)",
  purple:      "#7c3aed",
  purpleSoft:  "rgba(124,58,237,0.08)",
  muted:       "#64748b",
  success:     "#16a34a",
  warn:        "#d97706",
  shadow:      "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
  shadowLg:    "0 4px 6px rgba(0,0,0,0.05), 0 20px 48px rgba(0,0,0,0.12)",
};

// ─── GLOBAL CSS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { -webkit-tap-highlight-color: transparent; }

  body {
    font-family: 'Inter', sans-serif;
    background: ${C.bg};
    min-height: 100vh;
    color: ${C.given};
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── PAGE SHELL ── */
  .page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── TOPBAR ── */
  .topbar {
    width: 100%;
    background: ${C.card};
    border-bottom: 1px solid ${C.border};
    padding: 0 24px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 0 ${C.border};
  }

  .logo {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: ${C.given};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    width: 30px; height: 30px;
    background: ${C.accent};
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .expert-pill {
    background: linear-gradient(135deg, #f97316, #ef4444);
    color: white;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
  }

  /* ── MAIN LAYOUT ── */
  .main {
    width: 100%;
    max-width: 960px;
    padding: 10px 8px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  /* Desktop: side by side */
  @media (min-width: 700px) {
    .main {
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
      gap: 24px;
      padding-top: 32px;
    }
  }

  /* ── LEFT PANEL (board) ── */
  .panel-board {
    width: 100%;
    max-width: 480px;
    flex-shrink: 0;
  }

  @media (min-width: 700px) {
    .panel-board {
      width: min(480px, 55vw);
    }
  }

  /* ── RIGHT PANEL (controls) ── */
  .panel-controls {
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (min-width: 700px) {
    .panel-controls {
      width: 220px;
      flex-shrink: 0;
      max-width: 220px;
    }
  }

  /* ── STATS ROW ── */
  .stats-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: ${C.shadow};
    margin-bottom: 8px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-val {
    font-family: 'Outfit', sans-serif;
    font-size: 19px;
    font-weight: 800;
    color: ${C.given};
    letter-spacing: -0.5px;
    line-height: 1;
  }

  .stat-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: ${C.muted};
  }

  .stat-divider {
    width: 1px;
    height: 32px;
    background: ${C.border};
  }

  .mistakes-dots {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .mdot {
    width: 10px; height: 10px;
    border-radius: 50%;
    border: 2px solid ${C.error};
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .mdot.on { background: ${C.error}; box-shadow: 0 0 0 2px rgba(220,38,38,0.15); }
  .mdot.extra { border-color: ${C.warn}; background: ${C.warn}; }

  /* ── BOARD ── */
  .board-card {
    background: ${C.card};
    border-radius: 16px;
    padding: 6px;
    box-shadow: ${C.shadowLg};
    border: 1px solid ${C.border};
  }

  .board {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);
    width: 100%;
    aspect-ratio: 1;
    border: 2.5px solid ${C.borderThick};
    border-radius: 8px;
    overflow: hidden;
    contain: strict;
  }

  .cell {
    position: relative;
    border: 0.5px solid ${C.border};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0; min-height: 0;
    overflow: hidden;
    transition: background 0.06s;
    background: white;
  }

  .cell[data-col="3"], .cell[data-col="6"] { border-left: 2.5px solid ${C.borderThick}; }
  .cell[data-row="3"], .cell[data-row="6"] { border-top: 2.5px solid ${C.borderThick}; }

  .cell.sel   { background: ${C.selCell} !important; }
  .cell.hl    { background: ${C.hlCell}; }
  .cell.snum  { background: ${C.sameNum}; }
  .cell.ecell { background: rgba(220,38,38,0.06); }

  .cval {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(13px, 3.6vw, 22px);
    font-weight: 800;
    line-height: 1;
    pointer-events: none;
    transition: color 0.1s;
  }

  .cell.given .cval  { color: ${C.given}; }
  .cell.uc .cval     { color: ${C.user}; font-weight: 700; }
  .cell.uc.wrong .cval { color: ${C.error}; }

  .ngrid {
    position: absolute; inset: 0;
    display: grid;
    grid-template-columns: repeat(3,1fr);
    grid-template-rows: repeat(3,1fr);
    padding: 1px;
    pointer-events: none;
  }

  .nn {
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(7px, 1.5vw, 10px);
    font-weight: 600;
    color: ${C.note};
    line-height: 1;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
  }

  .nn.on { color: ${C.noteOn}; }

  /* ── SECTION LABEL ── */
  .section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 4px;
  }

  /* ── TOOL BUTTONS ── */
  .tools-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 8px 10px;
    box-shadow: ${C.shadow};
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tools-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 4px;
    border: 1.5px solid ${C.border};
    border-radius: 10px;
    background: white;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: ${C.muted};
    transition: all 0.15s;
    touch-action: manipulation;
    min-height: 48px;
  }

  .tool-btn:hover  { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentSoft}; }
  .tool-btn.active { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentSoft}; }
  .tool-btn svg    { width: 18px; height: 18px; }

  /* ── NUMPAD ── */
  .numpad-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 8px 6px;
    box-shadow: ${C.shadow};
  }

  .numpad {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 4px;
  }

  @media (min-width: 700px) {
    .numpad { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  }

  .nkey {
    aspect-ratio: 1;
    border: 1.5px solid ${C.border};
    border-radius: 10px;
    background: white;
    font-family: 'Outfit', sans-serif;
    font-size: clamp(17px, 4.2vw, 22px);
    font-weight: 800;
    color: ${C.given};
    cursor: pointer;
    transition: all 0.12s;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
    position: relative;
    min-height: 40px;
  }

  .nkey:hover  { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentSoft}; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.15); }
  .nkey:active { transform: translateY(0); }
  .nkey.done   { opacity: 0.18; pointer-events: none; }

  .nkey-count {
    display: none;
  }
  @media (min-width: 700px) {
    .nkey-count {
      display: block;
      position: absolute;
      bottom: 2px; right: 3px;
      font-size: 7px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      color: ${C.muted};
      line-height: 1;
    }
  }

  @media (min-width: 700px) {
    .nkey { aspect-ratio: 1; font-size: 20px; }
  }

  /* ── ACTION BUTTONS ── */
  .action-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 8px 10px;
    box-shadow: ${C.shadow};
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .action-btn {
    width: 100%;
    padding: 10px 16px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    touch-action: manipulation;
  }

  .action-btn.primary {
    background: ${C.accent};
    border: none;
    color: white;
    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  }

  .action-btn.primary:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 16px rgba(37,99,235,0.4);
    transform: translateY(-1px);
  }

  .action-btn.secondary {
    background: white;
    border: 1.5px solid ${C.purple};
    color: ${C.purple};
  }

  .action-btn.secondary:hover {
    background: ${C.purpleSoft};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124,58,237,0.2);
  }

  .action-btn:active   { transform: translateY(0) !important; box-shadow: none !important; }
  .action-btn.disabled { opacity: 0.5; pointer-events: none; }

  /* ── MISTAKE BANNER ── */
  .banner {
    width: 100%;
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #92400e;
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

  /* ── PHOTO STATUS ── */
  .pstatus {
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideIn 0.2s ease;
  }

  .pstatus.proc { background: #f5f3ff; border: 1px solid #c4b5fd; color: #5b21b6; }
  .pstatus.ok   { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
  .pstatus.err  { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; }

  /* ── SPINNER ── */
  .spin {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: rot 0.7s linear infinite;
    flex-shrink: 0;
  }

  .spin.dark { border-color: rgba(124,58,237,0.2); border-top-color: ${C.purple}; }
  .spin.blue { border-color: rgba(37,99,235,0.2); border-top-color: ${C.accent}; }
  @keyframes rot { to { transform: rotate(360deg); } }

  /* ── WIN MODAL ── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
    padding: 20px;
  }

  .modal {
    background: white;
    border-radius: 20px;
    padding: 36px 32px;
    text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.25);
    width: 100%;
    max-width: 340px;
    animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }

  .modal-emoji { font-size: 56px; margin-bottom: 12px; line-height: 1; }

  .modal-title {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .modal-sub { font-size: 13px; color: ${C.muted}; margin-bottom: 20px; }

  .score-box {
    border-radius: 12px;
    padding: 14px 20px;
    margin-bottom: 20px;
  }

  .score-num {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
  }

  .score-label { font-size: 12px; color: ${C.muted}; font-weight: 500; }

  .modal-btn {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    background: ${C.accent};
    border: none;
    color: white;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.35);
    transition: all 0.15s;
  }

  .modal-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

  /* ── RESPONSIVE TWEAKS ── */
  @media (max-width: 380px) {
    .topbar { padding: 0 16px; }
    .main { padding: 16px 12px 40px; }
    .stats-card { padding: 12px 14px; }
    .stat-val { font-size: 19px; }
  }

  @media (min-width: 700px) {
    .stats-card { display: none; }
    .desktop-stats {
      display: flex !important;
      flex-direction: column;
      gap: 4px;
    }
  }

  .desktop-stats { display: none; }

  .ds-item {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: ${C.shadow};
  }

  .ds-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${C.muted}; }
  .ds-val { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: ${C.given}; }
`;

// ─── MODAL ─────────────────────────────────────────────────────────────────
function WinModal({ seconds, mistakes, onNewGame }) {
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const perfect = mistakes === 0;
  const great = mistakes <= 3;
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-emoji">{perfect ? '🏆' : great ? '🎉' : '✅'}</div>
        <div className="modal-title" style={{ color: perfect ? C.success : C.accent }}>
          {perfect ? 'Perfect!' : great ? 'Solved!' : 'Completed!'}
        </div>
        <div className="modal-sub">Time: {fmtTime(seconds)}</div>
        <div className="score-box" style={{ background: perfect ? '#f0fdf4' : great ? '#eff6ff' : '#fffbeb' }}>
          <div className="score-num" style={{ color: perfect ? C.success : great ? C.accent : C.warn }}>
            {mistakes} mistake{mistakes !== 1 ? 's' : ''}
          </div>
          <div className="score-label">
            {perfect ? 'Flawless solve 🎯' : great ? 'Well played!' : `3 base + ${mistakes - 3} extra`}
          </div>
        </div>
        <button className="modal-btn" onClick={onNewGame}>New Puzzle</button>
      </div>
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [grid, setGrid]             = useState(null);
  const [solution, setSolution]     = useState(null);
  const [selected, setSelected]     = useState(null);
  const [notesMode, setNotesMode]   = useState(false);
  const [mistakes, setMistakes]     = useState(0);
  const [history, setHistory]       = useState([]);
  const [seconds, setSeconds]       = useState(0);
  const [generating, setGenerating] = useState(false);
  const [win, setWin]               = useState(false);
  const [clueCount, setClueCount]   = useState(0);
  const [banner, setBanner]         = useState(false);
  const [photoStatus, setPhotoStatus] = useState(null);
  const [photoMsg, setPhotoMsg]     = useState('');
  const [importing, setImporting]   = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const fileRef   = useRef(null);
  const timerRef  = useRef(null);
  const bannerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }, []);

  const initFromData = useCallback(({ puzzle, solution: sol, clues }) => {
    const g = puzzle.map(row => row.map(v => ({ value: v, given: v !== 0, notes: new Set() })));
    setGrid(g); setSolution(sol); setClueCount(clues);
    setSelected(null); setNotesMode(false); setMistakes(0);
    setHistory([]); setSeconds(0); setWin(false);
    setBanner(false); setPhotoStatus(null);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    handleNewGame();
    return () => { clearInterval(timerRef.current); clearTimeout(bannerRef.current); };
  }, []);

  const handleNewGame = useCallback(() => {
    setGenerating(true);
    setTimeout(() => { initFromData(generateExpertPuzzle()); setGenerating(false); }, 30);
  }, [initFromData]);

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const isErr = useCallback((g, r, c, val) => {
    if (!val) return false;
    for (let i = 0; i < 9; i++) {
      if (i !== c && g[r][i].value === val) return true;
      if (i !== r && g[i][c].value === val) return true;
    }
    const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if ((br+i!==r||bc+j!==c) && g[br+i][bc+j].value === val) return true;
    return false;
  }, []);

  const saveHistory = useCallback(g => {
    setHistory(h => [...h.slice(-49), g.map(row => row.map(c => ({ ...c, notes: new Set(c.notes) })))]);
  }, []);

  const enterNum = useCallback(n => {
    if (!selected || !grid) return;
    const { row, col } = selected;
    if (grid[row][col].given) return;
    const g = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));

    if (notesMode) {
      if (g[row][col].value) return;
      saveHistory(grid);
      if (g[row][col].notes.has(n)) g[row][col].notes.delete(n); else g[row][col].notes.add(n);
      setGrid(g); return;
    }

    saveHistory(grid);
    if (g[row][col].value === n) { g[row][col].value = 0; setGrid(g); return; }
    g[row][col].value = n;
    g[row][col].notes.clear();
    const br = Math.floor(row/3)*3, bc = Math.floor(col/3)*3;
    for (let i = 0; i < 9; i++) { g[row][i].notes.delete(n); g[i][col].notes.delete(n); }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g[br+i][bc+j].notes.delete(n);

    if (solution && solution[row][col] !== n) {
      setMistakes(m => m + 1);
      setBanner(true);
      clearTimeout(bannerRef.current);
      bannerRef.current = setTimeout(() => setBanner(false), 2500);
    }

    setGrid(g);
    const allFilled = g.every(row => row.every(c => c.value !== 0));
    if (allFilled && solution) {
      const correct = g.every((row, r) => row.every((c, ci) => c.value === solution[r][ci]));
      if (correct) { clearInterval(timerRef.current); setTimeout(() => setWin(true), 300); }
    }
  }, [selected, grid, notesMode, solution, saveHistory]);

  const handleUndo = useCallback(() => {
    if (!history.length) return;
    setGrid(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  }, [history]);

  const handleErase = useCallback(() => {
    if (!selected || !grid) return;
    const d = grid[selected.row][selected.col];
    if (d.given) return;
    saveHistory(grid);
    const g = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
    g[selected.row][selected.col].value = 0;
    g[selected.row][selected.col].notes.clear();
    setGrid(g);
  }, [selected, grid, saveHistory]);

  const handleHint = useCallback(() => {
    if (!grid || !solution) return;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) {
        const d = grid[r][c];
        if (!d.given && d.value !== solution[r][c]) {
          saveHistory(grid);
          const g = grid.map(row => row.map(c => ({ ...c, notes: new Set(c.notes) })));
          g[r][c].value = solution[r][c]; g[r][c].given = true; g[r][c].notes.clear();
          setGrid(g); setSelected({ row: r, col: c }); return;
        }
      }
  }, [grid, solution, saveHistory]);

  const handlePhotoUpload = useCallback(async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true); setPhotoStatus('proc'); setPhotoMsg('Reading puzzle from photo…');
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = () => rej(new Error('Read failed'));
        r.readAsDataURL(file);
      });
      const resp = await fetch('/api/import-puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: file.type || 'image/jpeg', data: base64 } },
            { type: 'text', text: `Extract ONLY the bold printed given numbers from this sudoku puzzle. Ignore all handwriting, pencil marks, and small corner annotations.\n\nReturn ONLY valid JSON, no markdown:\n{"grid": [[r0c0,...,r0c8],...,[r8c0,...,r8c8]]}\n\nUse 0 for empty cells.` }
          ]}]
        })
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === 'text')?.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      const puzzle = parsed.grid;
      if (!Array.isArray(puzzle) || puzzle.length !== 9 || puzzle.some(r => r.length !== 9))
        throw new Error('Bad grid');
      const sol = puzzle.map(r => [...r]);
      function solve(b) {
        for (let r = 0; r < 9; r++)
          for (let c = 0; c < 9; c++)
            if (b[r][c] === 0) {
              for (let n = 1; n <= 9; n++)
                if (isValid(b, r, c, n)) { b[r][c] = n; if (solve(b)) return true; b[r][c] = 0; }
              return false;
            }
        return true;
      }
      const solvable = solve(sol);
      const clues = puzzle.flat().filter(v => v !== 0).length;
      initFromData({ puzzle, solution: solvable ? sol : null, clues });
      setPhotoStatus('ok'); setPhotoMsg(`✓ Imported ${clues} clues successfully`);
      setTimeout(() => setPhotoStatus(null), 4000);
    } catch (err) {
      setPhotoStatus('err'); setPhotoMsg('Could not read puzzle — try a clearer, well-lit photo');
      setTimeout(() => setPhotoStatus(null), 5000);
    } finally { setImporting(false); }
  }, [initFromData]);

  useEffect(() => {
    const h = e => {
      if (e.key >= '1' && e.key <= '9') { enterNum(parseInt(e.key)); return; }
      if (e.key === 'Backspace' || e.key === 'Delete') { handleErase(); return; }
      if (e.key === 'n' || e.key === 'N') { setNotesMode(m => !m); return; }
      if (!selected) return;
      const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
      if (moves[e.key]) {
        e.preventDefault();
        const [dr,dc] = moves[e.key];
        setSelected(s => s ? { row: Math.max(0,Math.min(8,s.row+dr)), col: Math.max(0,Math.min(8,s.col+dc)) } : s);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [enterNum, handleErase, selected]);

  const counts = Array(10).fill(0);
  if (grid) grid.forEach(row => row.forEach(c => { if (c.value) counts[c.value]++; }));
  const selVal = selected && grid ? grid[selected.row][selected.col].value : 0;
  const extraMistakes = Math.max(0, mistakes - 3);

  return (
    <>
      <style>{css}</style>
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload} />

      <div className="page">
        {/* Top bar */}
        <header className="topbar">
          <div className="logo">
            <div className="logo-icon">S</div>
            Sudoku
          </div>
          <div className="expert-pill">Expert</div>
        </header>

        <div className="main">
          {/* ── LEFT: board ── */}
          <div className="panel-board">
            {/* Mobile stats */}
            <div className="stats-card">
              <div className="stat-item">
                <div className="stat-val">{fmtTime(seconds)}</div>
                <div className="stat-label">Time</div>
              </div>
              <div className="stat-divider"/>
              <div className="stat-item">
                <div className="mistakes-dots">
                  {[1,2,3].map(i => <div key={i} className={`mdot${mistakes >= i ? ' on' : ''}`}/>)}
                  {extraMistakes > 0 && <div className="mdot extra"/>}
                  {extraMistakes > 1 && <span style={{fontSize:10,color:C.warn,fontWeight:700,marginLeft:2}}>+{extraMistakes-1}</span>}
                </div>
                <div className="stat-label">Mistakes{mistakes > 0 ? ` (${mistakes})` : ''}</div>
              </div>
              <div className="stat-divider"/>
              <div className="stat-item">
                <div className="stat-val">{clueCount}</div>
                <div className="stat-label">Clues</div>
              </div>
            </div>

            {banner && (
              <div className="banner" style={{marginBottom:10}}>
                <span>⚠️</span>
                <span><strong>Mistake #{mistakes}</strong> — keep going, total counted at finish</span>
              </div>
            )}

            {/* Board */}
            <div className="board-card">
              <div className="board">
                {grid && grid.map((row, r) => row.map((d, c) => {
                  const isSel  = selected?.row === r && selected?.col === c;
                  const sameBox = selected && Math.floor(r/3)===Math.floor(selected.row/3) && Math.floor(c/3)===Math.floor(selected.col/3);
                  const isHL   = selected && !isSel && (r===selected.row || c===selected.col || sameBox);
                  const isSame = !isSel && selVal && d.value === selVal;
                  const hasErr = d.value && !d.given && isErr(grid, r, c, d.value);
                  const isWrong = d.value && !d.given && solution && solution[r][c] !== d.value;
                  let cls = 'cell';
                  if (isSel)  cls += ' sel';
                  else if (isSame) cls += ' snum';
                  else if (isHL)   cls += ' hl';
                  if (hasErr)  cls += ' ecell';
                  if (isWrong) cls += ' wrong';
                  if (d.given) cls += ' given'; else if (d.value) cls += ' uc';
                  return (
                    <div key={`${r}-${c}`} className={cls} data-row={r} data-col={c} onClick={() => setSelected({row:r,col:c})}>
                      {d.value ? (
                        <span className="cval">{d.value}</span>
                      ) : d.notes.size > 0 ? (
                        <div className="ngrid">
                          {[1,2,3,4,5,6,7,8,9].map(n => (
                            <div key={n} className={`nn${d.notes.has(n) ? ' on' : ''}`}>{d.notes.has(n) ? n : ''}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: controls ── */}
          <div className="panel-controls">
            {/* Desktop stats */}
            <div className="desktop-stats">
              <div className="ds-item">
                <span className="ds-label">⏱ Time</span>
                <span className="ds-val">{fmtTime(seconds)}</span>
              </div>
              <div className="ds-item">
                <span className="ds-label">❌ Mistakes</span>
                <span className="ds-val" style={{color: mistakes === 0 ? C.success : mistakes <= 3 ? C.given : C.warn}}>
                  {mistakes}
                </span>
              </div>
              <div className="ds-item">
                <span className="ds-label">🔢 Clues</span>
                <span className="ds-val">{clueCount}</span>
              </div>
            </div>

            {/* Tools */}
            <div className="tools-card">
              <div className="section-label">Tools</div>
              <div className="tools-row">
                <button className="tool-btn" onClick={handleUndo}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
                  Undo
                </button>
                <button className="tool-btn" onClick={handleErase}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 18l4-4"/></svg>
                  Erase
                </button>
                <button className={`tool-btn${notesMode ? ' active' : ''}`} onClick={() => setNotesMode(m => !m)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Notes
                </button>
                <button className="tool-btn" onClick={handleHint}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  Hint
                </button>
              </div>
            </div>

            {/* Numpad */}
            <div className="numpad-card">
              <div className="section-label">Numbers</div>
              <div className="numpad">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} className={`nkey${counts[n] >= 9 ? ' done' : ''}`} onClick={() => enterNum(n)}>
                    {n}
                    {counts[n] > 0 && counts[n] < 9 && <span className="nkey-count">{9-counts[n]}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo status */}
            {photoStatus && (
              <div className={`pstatus ${photoStatus}`}>
                {photoStatus === 'proc' && <div className="spin dark"/>}
                <span>{photoMsg}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="action-card">
              <button className={`action-btn primary${generating ? ' disabled' : ''}`} onClick={() => setConfirmNew(true)}>
                {generating
                  ? <><div className="spin"/><span>Generating…</span></>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg><span>New Expert Puzzle</span></>}
              </button>
              <button className={`action-btn secondary${importing ? ' disabled' : ''}`} onClick={() => fileRef.current?.click()}>
                {importing
                  ? <><div className="spin dark"/><span>Reading…</span></>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Import from Photo</span></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {win && <WinModal seconds={seconds} mistakes={mistakes} onNewGame={() => { setWin(false); handleNewGame(); }} />}
      {confirmNew && (
        <div className="overlay" style={{zIndex:300}}>
          <div className="modal" style={{maxWidth:300}}>
            <div className="modal-emoji">⚠️</div>
            <div className="modal-title" style={{fontSize:20,color:C.given}}>Start New Puzzle?</div>
            <div className="modal-sub" style={{marginBottom:24}}>Your current progress will be lost.</div>
            <div style={{display:'flex',gap:10}}>
              <button className="modal-btn" style={{background:'#f1f5f9',color:C.given,boxShadow:'none',border:`1.5px solid ${C.border}`}} onClick={() => setConfirmNew(false)}>Cancel</button>
              <button className="modal-btn" onClick={() => { setConfirmNew(false); handleNewGame(); }}>Yes, new puzzle</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
