import { useState, useEffect, useCallback, useRef } from "react";

// ─── DESIGN TOKENS (LinkedIn palette) ──────────────────────────────────────
const C = {
  bg:          "#f3f2ef",
  card:        "#ffffff",
  border:      "#e0ddd8",
  borderThick: "#1b1f23",
  accent:      "#0A66C2",
  accentDark:  "#004182",
  accentSoft:  "rgba(10,102,194,0.08)",
  accentSoft2: "rgba(10,102,194,0.15)",
  given:       "#1b1f23",
  user:        "#0A66C2",
  error:       "#cc1016",
  note:        "#86888a",
  noteOn:      "#0A66C2",
  selCell:     "#cce4f7",
  hlCell:      "#edf3f8",
  sameNum:     "#d0e8f5",
  muted:       "#56687a",
  success:     "#057642",
  warn:        "#b24020",
  shadow:      "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
  shadowLg:    "0 4px 6px rgba(0,0,0,0.05), 0 12px 40px rgba(0,0,0,0.12)",
};

// ─── SUDOKU ENGINE ──────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function isValidSudoku(board, row, col, num) {
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
          if (isValidSudoku(board, r, c, n)) {
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
            if (isValidSudoku(b, r, c, n)) { b[r][c] = n; solve(b); b[r][c] = 0; if (count >= limit) return; }
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

// ─── PATCHES ENGINE ─────────────────────────────────────────────────────────
const PSIZE = 6; // 6x6 like LinkedIn

function getShapeType(rows, cols) {
  if (rows === cols) return 'square';
  if (cols > rows) return 'wide';
  return 'tall';
}

// SVG mini silhouette icon matching LinkedIn visual style
function ShapeIcon({ type, size = 16 }) {
  const s = size;
  if (type === 'square') {
    const m = Math.round(s * 0.15), box = s - m * 2;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display:'block'}}>
        <rect x={m} y={m} width={box} height={box} rx="1" fill="currentColor"/>
      </svg>
    );
  }
  if (type === 'wide') {
    const px = Math.round(s * 0.06), h = Math.round(s * 0.35), y = (s - h) / 2;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display:'block'}}>
        <rect x={px} y={Math.round(y)} width={s - px * 2} height={h} rx="1" fill="currentColor"/>
      </svg>
    );
  }
  // tall
  const py = Math.round(s * 0.06), w = Math.round(s * 0.35), x = (s - w) / 2;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display:'block'}}>
      <rect x={Math.round(x)} y={py} width={w} height={s - py * 2} rx="1" fill="currentColor"/>
    </svg>
  );
}

function generatePatches() {
  const COLORS = [
    '#bbdefb','#c8e6c9','#fff9c4','#ffcdd2',
    '#e1bee7','#b2dfdb','#ffe0b2','#b3e5fc',
    '#f8bbd0','#dcedc8','#d1c4e9','#e8eaf6',
  ];

  function getRectOptions(maxH, maxW) {
    const opts = [];
    for (let h = 1; h <= maxH; h++)
      for (let w = 1; w <= maxW; w++)
        if (h * w >= 2) opts.push([h, w]); // no 1x1
    return opts;
  }

  for (let attempt = 0; attempt < 600; attempt++) {
    const grid = Array.from({ length: PSIZE }, () => Array(PSIZE).fill(-1));
    const patches = [];
    let id = 0;
    let failed = false;

    for (let r = 0; r < PSIZE && !failed; r++) {
      for (let c = 0; c < PSIZE && !failed; c++) {
        if (grid[r][c] !== -1) continue;
        const maxH = Math.min(4, PSIZE - r);
        const maxW = Math.min(4, PSIZE - c);
        const opts = shuffle(getRectOptions(maxH, maxW));
        let placed = false;
        for (const [h, w] of opts) {
          let ok = true;
          for (let rr = r; rr < r + h && ok; rr++)
            for (let cc = c; cc < c + w && ok; cc++)
              if (grid[rr][cc] !== -1) ok = false;
          if (!ok) continue;
          for (let rr = r; rr < r + h; rr++)
            for (let cc = c; cc < c + w; cc++)
              grid[rr][cc] = id;
          // Place clue in a random cell within the rectangle
          const cells = [];
          for (let rr = r; rr < r + h; rr++)
            for (let cc = c; cc < c + w; cc++)
              cells.push([rr, cc]);
          const [cr, cc2] = cells[Math.floor(Math.random() * cells.length)];
          patches.push({
            id, r1:r, c1:c, r2:r+h-1, c2:c+w-1,
            size: h*w, type: getShapeType(h,w),
            color: COLORS[id % COLORS.length],
            clueR: cr, clueC: cc2,
          });
          id++;
          placed = true;
          break;
        }
        if (!placed) { failed = true; }
      }
    }
    if (!failed && patches.length >= 6) return { patches, size: PSIZE };
  }
  return { patches: [], size: PSIZE };
}

// ─── CSS ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-tap-highlight-color: transparent; }
  body {
    font-family: 'Inter', sans-serif;
    background: ${C.bg};
    min-height: 100vh;
    color: ${C.given};
    display: flex; flex-direction: column; align-items: center;
  }
  .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }

  /* TOPBAR */
  .topbar {
    width: 100%; background: ${C.card}; border-bottom: 1px solid ${C.border};
    padding: 0 24px; height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .logo {
    font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 900;
    letter-spacing: -0.5px; color: ${C.accent};
    display: flex; align-items: center; gap: 8px;
  }
  .logo-icon {
    width: 32px; height: 32px; background: ${C.accent}; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; font-weight: 900; flex-shrink: 0;
  }

  /* TABBAR */
  .tabbar {
    width: 100%; background: ${C.card};
    border-bottom: 2px solid ${C.border};
    display: flex; align-items: flex-end;
    padding: 0 16px; gap: 0;
  }
  .tab {
    padding: 10px 20px 8px;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
    color: ${C.muted}; cursor: pointer; border: none; background: none;
    border-bottom: 3px solid transparent; margin-bottom: -2px;
    transition: all 0.15s; display: flex; align-items: center; gap: 6px;
  }
  .tab:hover { color: ${C.accent}; }
  .tab.active { color: ${C.accent}; border-bottom-color: ${C.accent}; }

  /* LAYOUT */
  .main {
    width: 100%; max-width: 960px;
    padding: 10px 8px 32px;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  @media (min-width: 700px) {
    .main { flex-direction: row; align-items: flex-start; justify-content: center; gap: 24px; padding-top: 28px; }
  }
  .panel-board { width: 100%; max-width: 480px; flex-shrink: 0; }
  @media (min-width: 700px) { .panel-board { width: min(480px, 55vw); } }
  .panel-controls { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 8px; }
  @media (min-width: 700px) { .panel-controls { width: 220px; flex-shrink: 0; max-width: 220px; } }

  /* STATS */
  .stats-card {
    background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px;
    padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;
    box-shadow: ${C.shadow}; margin-bottom: 8px;
  }
  .stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .stat-val { font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; color: ${C.given}; line-height: 1; }
  .stat-label { font-size: 9px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.muted}; }
  .stat-divider { width: 1px; height: 32px; background: ${C.border}; }
  .mistakes-dots { display: flex; gap: 6px; align-items: center; }
  .mdot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid ${C.error}; transition: all 0.2s; }
  .mdot.on { background: ${C.error}; }
  .mdot.extra { border-color: ${C.warn}; background: ${C.warn}; }

  /* SUDOKU BOARD */
  .board-card { background: ${C.card}; border-radius: 16px; padding: 6px; box-shadow: ${C.shadowLg}; border: 1px solid ${C.border}; }
  .board { display: grid; grid-template-columns: repeat(9,1fr); grid-template-rows: repeat(9,1fr); width: 100%; aspect-ratio: 1; border: 2.5px solid ${C.borderThick}; border-radius: 8px; overflow: hidden; contain: strict; }
  .cell { position: relative; border: 0.5px solid ${C.border}; cursor: pointer; display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; overflow: hidden; transition: background 0.06s; background: white; }
  .cell[data-col="3"], .cell[data-col="6"] { border-left: 2.5px solid ${C.borderThick}; }
  .cell[data-row="3"], .cell[data-row="6"] { border-top: 2.5px solid ${C.borderThick}; }
  .cell.sel   { background: ${C.selCell} !important; }
  .cell.hl    { background: ${C.hlCell}; }
  .cell.snum  { background: ${C.sameNum}; }
  .cell.ecell { background: rgba(204,16,22,0.06); }
  .cval { font-family: 'Outfit', sans-serif; font-size: clamp(13px,3.6vw,22px); font-weight: 800; line-height: 1; pointer-events: none; }
  .cell.given .cval  { color: ${C.given}; }
  .cell.uc .cval     { color: ${C.user}; font-weight: 700; }
  .cell.uc.wrong .cval { color: ${C.error}; }
  .ngrid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(3,1fr); grid-template-rows: repeat(3,1fr); padding: 1px; pointer-events: none; }
  .nn { display: flex; align-items: center; justify-content: center; font-size: clamp(7px,1.5vw,10px); font-weight: 600; color: ${C.note}; line-height: 1; overflow: hidden; }
  .nn.on { color: ${C.noteOn}; }

  /* SECTION LABEL */
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.muted}; margin-bottom: 4px; }

  /* TOOL BUTTONS */
  .tools-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 8px 10px; box-shadow: ${C.shadow}; display: flex; flex-direction: column; gap: 4px; }
  .tools-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
  .tool-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 6px 4px; border: 1.5px solid ${C.border}; border-radius: 10px;
    background: white; cursor: pointer; font-family: 'Inter', sans-serif;
    font-size: 10px; font-weight: 600; color: ${C.muted}; transition: all 0.15s;
    touch-action: manipulation; min-height: 48px;
  }
  .tool-btn:hover  { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentSoft}; }
  .tool-btn.active { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentSoft}; }
  .tool-btn svg    { width: 18px; height: 18px; }

  /* NUMPAD */
  .numpad-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 8px 6px; box-shadow: ${C.shadow}; }
  .numpad { display: grid; grid-template-columns: repeat(9,1fr); gap: 4px; }
  @media (min-width: 700px) { .numpad { grid-template-columns: repeat(3,1fr); gap: 8px; } }
  .nkey {
    aspect-ratio: 1; border: 1.5px solid ${C.border}; border-radius: 10px; background: white;
    font-family: 'Outfit', sans-serif; font-size: clamp(17px,4.2vw,22px); font-weight: 800;
    color: ${C.given}; cursor: pointer; transition: all 0.12s;
    display: flex; align-items: center; justify-content: center;
    touch-action: manipulation; position: relative; min-height: 40px;
  }
  .nkey:hover  { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentSoft}; transform: translateY(-1px); }
  .nkey:active { transform: translateY(0); }
  .nkey.done   { opacity: 0.18; pointer-events: none; }
  .nkey-count  { display: none; }
  @media (min-width: 700px) {
    .nkey-count { display: block; position: absolute; bottom: 2px; right: 3px; font-size: 7px; font-family: 'Inter', sans-serif; font-weight: 600; color: ${C.muted}; }
    .nkey { font-size: 20px; }
  }
  .nkey-note {
    aspect-ratio: 1; border: 1.5px solid #b3d4ee; border-radius: 10px; background: #edf4fb;
    font-family: 'Inter', sans-serif; font-size: clamp(11px,2.8vw,15px); font-weight: 500;
    color: #4f90c4; cursor: pointer; transition: all 0.12s;
    display: flex; align-items: center; justify-content: center;
    touch-action: manipulation; min-height: 28px;
  }
  .nkey-note:hover { border-color: ${C.accent}; background: ${C.accentSoft2}; color: ${C.accent}; }

  /* ACTION BUTTONS */
  .action-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 8px 10px; box-shadow: ${C.shadow}; display: flex; flex-direction: column; gap: 6px; }
  .action-btn { width: 100%; padding: 10px 16px; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; cursor: pointer; transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 8px; touch-action: manipulation; }
  .action-btn.primary { background: ${C.accent}; border: none; color: white; box-shadow: 0 2px 8px rgba(10,102,194,0.3); }
  .action-btn.primary:hover { background: ${C.accentDark}; transform: translateY(-1px); }
  .action-btn.secondary { background: white; border: 1.5px solid ${C.accent}; color: ${C.accent}; }
  .action-btn.secondary:hover { background: ${C.accentSoft}; transform: translateY(-1px); }
  .action-btn:active { transform: translateY(0) !important; box-shadow: none !important; }
  .action-btn.disabled { opacity: 0.5; pointer-events: none; }

  /* BANNER */
  .banner { width: 100%; background: #fff7f5; border: 1px solid #f5c6c6; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #8a1a1a; animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

  /* PHOTO STATUS */
  .pstatus { width: 100%; padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 8px; animation: slideIn 0.2s ease; }
  .pstatus.proc { background: #f0f6ff; border: 1px solid #b3d4ee; color: #004182; }
  .pstatus.ok   { background: #f0fdf4; border: 1px solid #86efac; color: #057642; }
  .pstatus.err  { background: #fff5f5; border: 1px solid #fca5a5; color: #b91c1c; }

  /* SPINNER */
  .spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: rot 0.7s linear infinite; flex-shrink: 0; }
  .spin.dark { border-color: rgba(10,102,194,0.2); border-top-color: ${C.accent}; }
  @keyframes rot { to { transform: rotate(360deg); } }

  /* MODAL */
  .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .modal { background: white; border-radius: 20px; padding: 36px 32px; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.25); width: 100%; max-width: 340px; animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes popIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
  .modal-emoji { font-size: 56px; margin-bottom: 12px; line-height: 1; }
  .modal-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 900; margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: ${C.muted}; margin-bottom: 20px; }
  .score-box { border-radius: 12px; padding: 14px 20px; margin-bottom: 20px; }
  .score-num { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
  .score-label { font-size: 12px; color: ${C.muted}; font-weight: 500; }
  .modal-btn { width: 100%; padding: 13px; border-radius: 12px; background: ${C.accent}; border: none; color: white; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(10,102,194,0.35); transition: all 0.15s; }
  .modal-btn:hover { background: ${C.accentDark}; transform: translateY(-1px); }

  /* DESKTOP STATS */
  .desktop-stats { display: none; }
  @media (min-width: 700px) {
    .stats-card { display: none; }
    .desktop-stats { display: flex !important; flex-direction: column; gap: 4px; }
  }
  .ds-item { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: ${C.shadow}; }
  .ds-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${C.muted}; }
  .ds-val { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: ${C.given}; }

  /* PATCHES */
  .patches-board-card { background: ${C.card}; border-radius: 16px; padding: 8px; box-shadow: ${C.shadowLg}; border: 1px solid ${C.border}; user-select: none; }
  .patches-grid { display: grid; border: 2px solid ${C.borderThick}; border-radius: 8px; overflow: hidden; width: 100%; aspect-ratio: 1; }
  .pcell { position: relative; border: 0.5px solid rgba(0,0,0,0.12); cursor: crosshair; display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; transition: filter 0.06s; }
  .pcell.preview-valid   { box-shadow: inset 0 0 0 2.5px #f97316; z-index: 2; }
  .pcell.preview-invalid { box-shadow: inset 0 0 0 2.5px ${C.error}; z-index: 2; filter: brightness(0.9); }
  .pcell-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1px; pointer-events: none; }
  .clue-num { font-family: 'Outfit', sans-serif; font-size: clamp(11px,3vw,18px); font-weight: 900; color: rgba(0,0,0,0.78); line-height: 1; }
  .clue-shape { font-size: clamp(9px,2.2vw,14px); color: rgba(0,0,0,0.45); line-height: 1; }
  .patches-info { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 12px 14px; box-shadow: ${C.shadow}; font-size: 12px; color: ${C.muted}; line-height: 1.7; }
  .patches-info strong { color: ${C.given}; }
  .patches-legend { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
  .legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: ${C.muted}; }
`;

// ─── MODALS ─────────────────────────────────────────────────────────────────
function WinModal({ seconds, mistakes, onNewGame }) {
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const perfect = mistakes === 0, great = mistakes <= 3;
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-emoji">{perfect ? '🏆' : great ? '🎉' : '✅'}</div>
        <div className="modal-title" style={{color: perfect ? C.success : C.accent}}>{perfect ? 'Perfect!' : great ? 'Solved!' : 'Completed!'}</div>
        <div className="modal-sub">Time: {fmt(seconds)}</div>
        <div className="score-box" style={{background: perfect ? '#f0fdf4' : great ? '#edf4fb' : '#fff8f0'}}>
          <div className="score-num" style={{color: perfect ? C.success : great ? C.accent : C.warn}}>{mistakes} mistake{mistakes!==1?'s':''}</div>
          <div className="score-label">{perfect ? 'Flawless solve 🎯' : great ? 'Well played!' : `3 base + ${mistakes-3} extra`}</div>
        </div>
        <button className="modal-btn" onClick={onNewGame}>New Puzzle</button>
      </div>
    </div>
  );
}

function PatchesWinModal({ seconds, onNewGame }) {
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-emoji">🧩</div>
        <div className="modal-title" style={{color: C.accent}}>Patched!</div>
        <div className="modal-sub">Every cell covered perfectly</div>
        <div className="score-box" style={{background:'#edf4fb'}}>
          <div className="score-num" style={{color: C.accent}}>{fmt(seconds)}</div>
          <div className="score-label">Time to solve</div>
        </div>
        <button className="modal-btn" onClick={onNewGame}>New Puzzle</button>
      </div>
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="overlay" style={{zIndex:300}}>
      <div className="modal" style={{maxWidth:300}}>
        <div className="modal-emoji">⚠️</div>
        <div className="modal-title" style={{fontSize:20,color:C.given}}>New Puzzle?</div>
        <div className="modal-sub" style={{marginBottom:24}}>Current progress will be lost.</div>
        <div style={{display:'flex',gap:10}}>
          <button className="modal-btn" style={{background:'#f1f5f9',color:C.given,boxShadow:'none',border:`1.5px solid ${C.border}`}} onClick={onCancel}>Cancel</button>
          <button className="modal-btn" onClick={onConfirm}>Yes, new puzzle</button>
        </div>
      </div>
    </div>
  );
}

// ─── SUDOKU GAME ─────────────────────────────────────────────────────────────
function SudokuGame({ state, setState }) {
  const { grid, solution, selected, notesMode, mistakes, history, seconds, generating, win, clueCount, banner, photoStatus, photoMsg, importing, confirmNew } = state;
  const fileRef = useRef(null);
  const timerRef = useRef(null);
  const bannerRef = useRef(null);
  const set = useCallback(patch => setState(s => ({ ...s, ...patch })), [setState]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setState(s => ({ ...s, seconds: s.seconds + 1 })), 1000);
  }, [setState]);

  const initFromData = useCallback(({ puzzle, solution: sol, clues }) => {
    const g = puzzle.map(row => row.map(v => ({ value: v, given: v !== 0, notes: new Set() })));
    set({ grid: g, solution: sol, clueCount: clues, selected: null, notesMode: false, mistakes: 0, history: [], seconds: 0, win: false, banner: false, photoStatus: null });
    startTimer();
  }, [set, startTimer]);

  useEffect(() => {
    if (!grid) { set({ generating: true }); setTimeout(() => { initFromData(generateExpertPuzzle()); set({ generating: false }); }, 30); }
    return () => { clearInterval(timerRef.current); clearTimeout(bannerRef.current); };
  }, []);

  useEffect(() => { win ? clearInterval(timerRef.current) : startTimer(); }, [win]);

  const handleNewGame = useCallback(() => {
    set({ generating: true, confirmNew: false });
    setTimeout(() => { initFromData(generateExpertPuzzle()); set({ generating: false }); }, 30);
  }, [initFromData, set]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const isErr = useCallback((g, r, c, val) => {
    if (!val) return false;
    for (let i = 0; i < 9; i++) { if (i!==c && g[r][i].value===val) return true; if (i!==r && g[i][c].value===val) return true; }
    const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if ((br+i!==r||bc+j!==c) && g[br+i][bc+j].value===val) return true;
    return false;
  }, []);

  const saveHistory = useCallback(g => {
    setState(s => ({ ...s, history: [...s.history.slice(-49), g.map(row => row.map(c => ({ ...c, notes: new Set(c.notes) })))] }));
  }, [setState]);

  const enterNum = useCallback((n, forceNotes) => {
    if (!selected || !grid) return;
    const { row, col } = selected;
    if (grid[row][col].given) return;
    const g = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
    const isNotes = forceNotes !== undefined ? forceNotes : notesMode;
    if (isNotes) {
      saveHistory(grid);
      g[row][col].value = 0;
      if (g[row][col].notes.has(n)) g[row][col].notes.delete(n); else g[row][col].notes.add(n);
      set({ grid: g }); return;
    }
    saveHistory(grid);
    if (g[row][col].value === n) { g[row][col].value = 0; set({ grid: g }); return; }
    g[row][col].value = n; g[row][col].notes.clear();
    const br = Math.floor(row/3)*3, bc = Math.floor(col/3)*3;
    for (let i = 0; i < 9; i++) { g[row][i].notes.delete(n); g[i][col].notes.delete(n); }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g[br+i][bc+j].notes.delete(n);
    if (solution && solution[row][col] !== n) {
      setState(s => ({ ...s, mistakes: s.mistakes + 1, banner: true }));
      clearTimeout(bannerRef.current);
      bannerRef.current = setTimeout(() => set({ banner: false }), 2500);
    }
    const allFilled = g.every(row => row.every(c => c.value !== 0));
    const correct = allFilled && solution && g.every((row, r) => row.every((c, ci) => c.value === solution[r][ci]));
    set({ grid: g });
    if (correct) { clearInterval(timerRef.current); setTimeout(() => set({ win: true }), 300); }
  }, [selected, grid, notesMode, solution, saveHistory, set, setState]);

  const handleUndo = useCallback(() => {
    if (!history.length) return;
    set({ grid: history[history.length-1], history: history.slice(0,-1) });
  }, [history, set]);

  const handleErase = useCallback(() => {
    if (!selected || !grid) return;
    const d = grid[selected.row][selected.col];
    if (d.given) return;
    saveHistory(grid);
    const g = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
    g[selected.row][selected.col].value = 0; g[selected.row][selected.col].notes.clear();
    set({ grid: g });
  }, [selected, grid, saveHistory, set]);

  const handleHint = useCallback(() => {
    if (!grid || !solution) return;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      const d = grid[r][c];
      if (!d.given && d.value !== solution[r][c]) {
        saveHistory(grid);
        const g = grid.map(row => row.map(c => ({ ...c, notes: new Set(c.notes) })));
        g[r][c].value = solution[r][c]; g[r][c].given = true; g[r][c].notes.clear();
        set({ grid: g, selected: { row:r, col:c } }); return;
      }
    }
  }, [grid, solution, saveHistory, set]);

  const handlePhotoUpload = useCallback(async e => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = '';
    set({ importing: true, photoStatus: 'proc', photoMsg: 'Reading puzzle from photo…' });
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = () => rej(new Error('fail')); r.readAsDataURL(file); });
      const resp = await fetch('/api/import-puzzle', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:file.type||'image/jpeg',data:base64}},{type:'text',text:'Extract ONLY the bold printed given numbers from this sudoku puzzle. Ignore handwriting and pencil marks.\n\nReturn ONLY valid JSON, no markdown:\n{"grid": [[r0c0,...,r0c8],...,[r8c0,...,r8c8]]}\n\nUse 0 for empty cells.'}]}]}) });
      const data = await resp.json();
      const text = data.content?.find(b => b.type==='text')?.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g,'').trim());
      const puzzle = parsed.grid;
      if (!Array.isArray(puzzle)||puzzle.length!==9||puzzle.some(r=>r.length!==9)) throw new Error('bad');
      const sol = puzzle.map(r=>[...r]);
      function solve(b){for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(b[r][c]===0){for(let n=1;n<=9;n++)if(isValidSudoku(b,r,c,n)){b[r][c]=n;if(solve(b))return true;b[r][c]=0;}return false;}return true;}
      const solvable = solve(sol);
      const clues = puzzle.flat().filter(v=>v!==0).length;
      initFromData({ puzzle, solution: solvable?sol:null, clues });
      set({ photoStatus:'ok', photoMsg:`✓ Imported ${clues} clues successfully` });
      setTimeout(() => set({ photoStatus:null }), 4000);
    } catch { set({ photoStatus:'err', photoMsg:'Could not read puzzle — try a clearer photo' }); setTimeout(() => set({ photoStatus:null }), 5000); }
    finally { set({ importing:false }); }
  }, [initFromData, set]);

  useEffect(() => {
    const h = e => {
      if (e.key>='1'&&e.key<='9') { enterNum(parseInt(e.key)); return; }
      if (e.key==='Backspace'||e.key==='Delete') { handleErase(); return; }
      if (e.key==='n'||e.key==='N') { set({ notesMode: !notesMode }); return; }
      if (!selected) return;
      const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
      if (moves[e.key]) { e.preventDefault(); set({ selected: { row:Math.max(0,Math.min(8,selected.row+moves[e.key][0])), col:Math.max(0,Math.min(8,selected.col+moves[e.key][1])) } }); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [enterNum, handleErase, selected, notesMode, set]);

  const counts = Array(10).fill(0);
  if (grid) grid.forEach(row => row.forEach(c => { if (c.value) counts[c.value]++; }));
  const selVal = selected && grid ? grid[selected.row][selected.col].value : 0;
  const extraMistakes = Math.max(0, mistakes - 3);

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload} />
      <div className="main">
        <div className="panel-board">
          <div className="stats-card">
            <div className="stat-item"><div className="stat-val">{fmt(seconds)}</div><div className="stat-label">Time</div></div>
            <div className="stat-divider"/>
            <div className="stat-item">
              <div className="mistakes-dots">
                {[1,2,3].map(i => <div key={i} className={`mdot${mistakes>=i?' on':''}`}/>)}
                {extraMistakes>0 && <div className="mdot extra"/>}
                {extraMistakes>1 && <span style={{fontSize:10,color:C.warn,fontWeight:700,marginLeft:2}}>+{extraMistakes-1}</span>}
              </div>
              <div className="stat-label">Mistakes{mistakes>0?` (${mistakes})`:''}</div>
            </div>
            <div className="stat-divider"/>
            <div className="stat-item"><div className="stat-val">{clueCount}</div><div className="stat-label">Clues</div></div>
          </div>

          {banner && <div className="banner" style={{marginBottom:10}}><span>⚠️</span><span><strong>Mistake #{mistakes}</strong> — keep going!</span></div>}

          <div className="board-card">
            <div className="board">
              {grid && grid.map((row,r) => row.map((d,c) => {
                const isSel = selected?.row===r && selected?.col===c;
                const sameBox = selected && Math.floor(r/3)===Math.floor(selected.row/3) && Math.floor(c/3)===Math.floor(selected.col/3);
                const isHL = selected && !isSel && (r===selected.row || c===selected.col || sameBox);
                const isSame = !isSel && selVal && d.value===selVal;
                const hasErr = d.value && !d.given && isErr(grid,r,c,d.value);
                const isWrong = d.value && !d.given && solution && solution[r][c]!==d.value;
                let cls='cell';
                if(isSel) cls+=' sel'; else if(isSame) cls+=' snum'; else if(isHL) cls+=' hl';
                if(hasErr) cls+=' ecell'; if(isWrong) cls+=' wrong';
                if(d.given) cls+=' given'; else if(d.value) cls+=' uc';
                return (
                  <div key={`${r}-${c}`} className={cls} data-row={r} data-col={c} onClick={() => set({ selected:{row:r,col:c} })}>
                    {d.value ? <span className="cval">{d.value}</span>
                      : d.notes.size>0 ? <div className="ngrid">{[1,2,3,4,5,6,7,8,9].map(n=><div key={n} className={`nn${d.notes.has(n)?' on':''}`}>{d.notes.has(n)?n:''}</div>)}</div>
                      : null}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        <div className="panel-controls">
          <div className="desktop-stats">
            <div className="ds-item"><span className="ds-label">⏱ Time</span><span className="ds-val">{fmt(seconds)}</span></div>
            <div className="ds-item"><span className="ds-label">❌ Mistakes</span><span className="ds-val" style={{color:mistakes===0?C.success:mistakes<=3?C.given:C.warn}}>{mistakes}</span></div>
            <div className="ds-item"><span className="ds-label">🔢 Clues</span><span className="ds-val">{clueCount}</span></div>
          </div>

          <div className="numpad-card">
            <div className="section-label">Numbers</div>
            <div className="numpad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} className={`nkey${counts[n]>=9?' done':''}`} onClick={() => enterNum(n, false)}>
                  {n}{counts[n]>0&&counts[n]<9&&<span className="nkey-count">{9-counts[n]}</span>}
                </button>
              ))}
            </div>
            <div className="numpad" style={{marginTop:6}}>
              {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} className="nkey nkey-note" onClick={() => enterNum(n, true)}>{n}</button>)}
            </div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'#94a3b8',textAlign:'center',marginTop:4}}>Notes row</div>
          </div>

          <div className="tools-card">
            <div className="section-label">Tools</div>
            <div className="tools-row">
              <button className="tool-btn" onClick={handleUndo}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>Undo
              </button>
              <button className="tool-btn" onClick={handleErase}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 18l4-4"/></svg>Erase
              </button>
              <button className={`tool-btn${notesMode?' active':''}`} onClick={() => set({ notesMode: !notesMode })}>
                <div style={{position:'relative',width:18,height:18}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  {notesMode && <svg viewBox="0 0 12 12" style={{position:'absolute',bottom:-3,right:-3,width:11,height:11,background:C.accent,borderRadius:'50%',padding:1.5}} fill="none" stroke="white" strokeWidth="2.5"><path d="M1.5 6l3 3 5-5"/></svg>}
                </div>
                Notes
              </button>
              <button className="tool-btn" onClick={handleHint}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>Hint
              </button>
            </div>
          </div>

          {photoStatus && <div className={`pstatus ${photoStatus}`}>{photoStatus==='proc'&&<div className="spin dark"/>}<span>{photoMsg}</span></div>}

          <div className="action-card">
            <button className={`action-btn primary${generating?' disabled':''}`} onClick={() => set({ confirmNew:true })}>
              {generating ? <><div className="spin"/><span>Generating…</span></> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg><span>New Expert Puzzle</span></>}
            </button>
            <button className={`action-btn secondary${importing?' disabled':''}`} onClick={() => fileRef.current?.click()}>
              {importing ? <><div className="spin dark"/><span>Reading…</span></> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Import from Photo</span></>}
            </button>
          </div>
        </div>
      </div>

      {win && <WinModal seconds={seconds} mistakes={mistakes} onNewGame={() => { set({ win:false }); handleNewGame(); }} />}
      {confirmNew && <ConfirmModal onConfirm={handleNewGame} onCancel={() => set({ confirmNew:false })} />}
    </>
  );
}

// ─── PATCHES GAME ─────────────────────────────────────────────────────────────
function PatchesGame({ state, setState }) {
  const { patches, size, placed, seconds, win, generating, confirmNew } = state;
  const timerRef = useRef(null);
  const boardRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [dragging, setDragging] = useState(false);
  const set = useCallback(patch => setState(s => ({ ...s, ...patch })), [setState]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setState(s => ({ ...s, seconds: s.seconds + 1 })), 1000);
  }, [setState]);

  const newGame = useCallback(() => {
    const result = generatePatches();
    set({ patches: result.patches, size: result.size, placed: [], seconds: 0, win: false, generating: false, confirmNew: false });
    startTimer();
  }, [set, startTimer]);

  useEffect(() => {
    if (!patches) newGame();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => { if (win) clearInterval(timerRef.current); }, [win]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // Build cell ownership
  const cellOwner = {};
  for (const p of (placed||[])) {
    for (let r = p.r1; r <= p.r2; r++)
      for (let c = p.c1; c <= p.c2; c++)
        cellOwner[`${r},${c}`] = p.id;
  }

  const preview = dragStart && dragEnd ? {
    r1: Math.min(dragStart.r, dragEnd.r), c1: Math.min(dragStart.c, dragEnd.c),
    r2: Math.max(dragStart.r, dragEnd.r), c2: Math.max(dragStart.c, dragEnd.c),
  } : null;

  function validatePrev(prev, ownerMap) {
    if (!prev || !patches) return false;
    const h = prev.r2-prev.r1+1, w = prev.c2-prev.c1+1;
    const area = h*w, type = getShapeType(h,w);
    let clueCount = 0, clueMatch = false;
    for (const p of patches) {
      if (p.clueR>=prev.r1 && p.clueR<=prev.r2 && p.clueC>=prev.c1 && p.clueC<=prev.c2) {
        clueCount++;
        if (p.size===area && (p.type===type||p.type==='any')) clueMatch=true;
      }
    }
    for (let r=prev.r1;r<=prev.r2;r++) for (let c=prev.c1;c<=prev.c2;c++) if(ownerMap[`${r},${c}`]!==undefined) return false;
    return clueCount===1 && clueMatch;
  }

  const previewValid = preview ? validatePrev(preview, cellOwner) : null;

  function getCellFromEvent(e) {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const S = PSIZE;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const c = Math.floor((cx-rect.left)/(rect.width/S));
    const r = Math.floor((cy-rect.top)/(rect.height/S));
    if (r<0||r>=S||c<0||c>=S) return null;
    return { r, c };
  }

  function onDown(e) {
    const cell = getCellFromEvent(e); if (!cell) return;
    e.preventDefault();
    setDragging(true); setDragStart(cell); setDragEnd(cell);
  }
  function onMove(e) {
    if (!dragging) return;
    const cell = getCellFromEvent(e); if (cell) setDragEnd(cell);
  }
  function onUp(e) {
    if (!dragging || !dragStart) return;
    const cell = getCellFromEvent(e) || dragEnd;
    setDragging(false); setDragStart(null); setDragEnd(null);
    if (!cell) return;
    const prev = { r1:Math.min(dragStart.r,cell.r), c1:Math.min(dragStart.c,cell.c), r2:Math.max(dragStart.r,cell.r), c2:Math.max(dragStart.c,cell.c) };
    if (validatePrev(prev, cellOwner)) {
      const h=prev.r2-prev.r1+1, w=prev.c2-prev.c1+1, area=h*w, type=getShapeType(h,w);
      const mp = patches.find(p => p.clueR>=prev.r1&&p.clueR<=prev.r2&&p.clueC>=prev.c1&&p.clueC<=prev.c2&&p.size===area&&(p.type===type||p.type==='any'));
      if (mp) {
        setState(s => {
          const newPlaced = [...s.placed, { ...prev, id:mp.id, color:mp.color }];
          const placedIds = new Set(newPlaced.map(p=>p.id));
          const won = patches.every(p => placedIds.has(p.id));
          if (won) clearInterval(timerRef.current);
          return { ...s, placed:newPlaced, win:won };
        });
      }
    }
  }

  function removePatch(r, c) {
    const id = cellOwner[`${r},${c}`];
    if (id===undefined) return;
    setState(s => ({ ...s, placed: s.placed.filter(p=>p.id!==id) }));
  }

  const S = PSIZE;

  return (
    <>
      <div className="main">
        <div className="panel-board">
          <div className="stats-card">
            <div className="stat-item"><div className="stat-val">{fmt(seconds)}</div><div className="stat-label">Time</div></div>
            <div className="stat-divider"/>
            <div className="stat-item"><div className="stat-val">{(placed||[]).length}/{(patches||[]).length}</div><div className="stat-label">Patches</div></div>
          </div>

          <div className="patches-board-card"
            ref={boardRef}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
            onTouchStart={e=>{e.preventDefault();onDown(e);}} onTouchMove={e=>{e.preventDefault();onMove(e);}} onTouchEnd={e=>{e.preventDefault();onUp(e);}}
            style={{touchAction:'none'}}
          >
            <div className="patches-grid" style={{gridTemplateColumns:`repeat(${S},1fr)`,gridTemplateRows:`repeat(${S},1fr)`}}>
              {Array.from({length:S},(_,r) => Array.from({length:S},(_,c) => {
                const key=`${r},${c}`;
                const ownerId = cellOwner[key];
                const placedPatch = ownerId!==undefined ? placed.find(p=>p.id===ownerId) : null;
                const clue = patches?.find(p=>p.clueR===r&&p.clueC===c);
                const inPrev = preview && r>=preview.r1&&r<=preview.r2&&c>=preview.c1&&c<=preview.c2;
                let cls='pcell';
                if(inPrev) cls += previewValid?' preview-valid':' preview-invalid';
                return (
                  <div key={key} className={cls}
                    style={{background: placedPatch ? placedPatch.color : 'white'}}
                    onClick={() => { if(ownerId!==undefined) removePatch(r,c); }}
                  >
                    <div className="pcell-inner">
                      {clue && (
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,pointerEvents:'none'}}>
                          <span className="clue-num">{clue.size}</span>
                          <span style={{color:'rgba(0,0,0,0.5)',display:'flex'}}>
                            <ShapeIcon type={clue.type} size={14}/>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        <div className="panel-controls">
          <div className="desktop-stats">
            <div className="ds-item"><span className="ds-label">⏱ Time</span><span className="ds-val">{fmt(seconds)}</span></div>
            <div className="ds-item"><span className="ds-label">🧩 Patches</span><span className="ds-val">{(placed||[]).length}/{(patches||[]).length}</span></div>
          </div>

          <div className="patches-info">
            <strong>How to play</strong><br/>
            Drag to draw a rectangle. Each patch must:<br/>
            • Cover the exact number of cells shown<br/>
            • Match the shape type in the clue icon<br/>
            • Contain exactly one clue cell<br/><br/>
            <em>Tap a placed patch to remove it.</em>
            <div className="patches-legend">
              <div className="legend-item"><ShapeIcon type="square" size={14}/><span>Square</span></div>
              <div className="legend-item"><ShapeIcon type="wide" size={14}/><span>Wide</span></div>
              <div className="legend-item"><ShapeIcon type="tall" size={14}/><span>Tall</span></div>
            </div>
          </div>

          <div className="tools-card">
            <div className="section-label">Tools</div>
            <div className="tools-row" style={{gridTemplateColumns:'repeat(2,1fr)'}}>
              <button className="tool-btn" onClick={() => setState(s=>({...s,placed:s.placed.slice(0,-1)}))}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>Undo
              </button>
              <button className="tool-btn" onClick={() => setState(s=>({...s,placed:[]}))}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 18l4-4"/></svg>Reset
              </button>
            </div>
          </div>

          <div className="action-card">
            <button className={`action-btn primary${generating?' disabled':''}`} onClick={() => set({ confirmNew:true })}>
              {generating ? <><div className="spin"/><span>Generating…</span></> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg><span>New Puzzle</span></>}
            </button>
          </div>
        </div>
      </div>

      {win && <PatchesWinModal seconds={seconds} onNewGame={newGame} />}
      {confirmNew && <ConfirmModal onConfirm={newGame} onCancel={() => set({ confirmNew:false })} />}
    </>
  );
}

// ─── APP SHELL ───────────────────────────────────────────────────────────────
const SUDOKU_INIT = { grid:null, solution:null, selected:null, notesMode:false, mistakes:0, history:[], seconds:0, generating:false, win:false, clueCount:0, banner:false, photoStatus:null, photoMsg:'', importing:false, confirmNew:false };
const PATCHES_INIT = { patches:null, size:5, placed:[], seconds:0, win:false, generating:false, confirmNew:false };

export default function App() {
  const [tab, setTab] = useState('sudoku');
  const [sudokuState, setSudokuState] = useState(SUDOKU_INIT);
  const [patchesState, setPatchesState] = useState(PATCHES_INIT);

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <header className="topbar">
          <div className="logo">
            <div className="logo-icon">in</div>
            Puzzles
          </div>
          <div style={{fontSize:11,color:C.muted,fontWeight:500,letterSpacing:'0.5px'}}>Daily Games</div>
        </header>

        <div className="tabbar">
          <button className={`tab${tab==='sudoku'?' active':''}`} onClick={() => setTab('sudoku')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
            Sudoku
          </button>
          <button className={`tab${tab==='patches'?' active':''}`} onClick={() => setTab('patches')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="5" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="10" width="8" height="11" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
            Patches
          </button>
        </div>

        {tab==='sudoku'
          ? <SudokuGame state={sudokuState} setState={setSudokuState} />
          : <PatchesGame state={patchesState} setState={setPatchesState} />
        }
      </div>
    </>
  );
}
