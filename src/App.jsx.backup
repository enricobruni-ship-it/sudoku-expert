import { useState, useEffect, useCallback, useRef } from "react";

// ─── GENERATOR ENGINE ──────────────────────────────────────────────────────
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
  const br = Math.floor(row/3)*3, bc = Math.floor(col/3)*3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[br+i][bc+j] === num) return false;
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
  const solution = Array.from({length:9}, () => Array(9).fill(0));
  fillBoard(solution);
  const puzzle = solution.map(r => [...r]);
  const cells = shuffle([...Array(81).keys()]);
  let clues = 81;
  for (const idx of cells) {
    if (clues <= 23) break;
    const r = Math.floor(idx/9), c = idx%9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle) === 1) clues--;
    else puzzle[r][c] = backup;
  }
  return { puzzle, solution, clues };
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const C = {
  bg: "#f0f4f8", surface: "#ffffff", border: "#c8d0e0", borderThick: "#2d3748",
  given: "#1a202c", user: "#2563eb", error: "#dc2626",
  note: "#94a3b8", noteActive: "#2563eb",
  selected: "#b8d4f0", highlight: "#deedf8",
  accent: "#2563eb", muted: "#64748b", success: "#16a34a",
  warn: "#f59e0b",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; font-family: 'DM Mono', monospace; color: ${C.given}; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; }
  .app { display: flex; flex-direction: column; align-items: center; padding: 20px 16px 40px; width: 100%; max-width: 480px; }
  .header { width: 100%; display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
  .title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; color: ${C.given}; }
  .badge { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${C.accent}; border: 1px solid ${C.accent}; padding: 3px 9px; border-radius: 20px; }
  .stats { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .stat-group { display: flex; gap: 20px; }
  .stat { display: flex; flex-direction: column; gap: 1px; }
  .stat-val { font-size: 18px; font-weight: 500; color: ${C.given}; letter-spacing: -0.5px; }
  .stat-label { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.muted}; }
  .mistakes-row { display: flex; gap: 5px; align-items: center; }
  .dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid ${C.error}; transition: background 0.2s; }
  .dot.filled { background: ${C.error}; }
  .dot.extra { border-color: ${C.warn}; background: ${C.warn}; }
  .clue-count { font-size: 10px; color: ${C.muted}; letter-spacing: 1px; }

  /* MISTAKE BANNER */
  .mistake-banner { width: 100%; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 8px 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #92400e; font-weight: 500; }
  .mistake-banner span { font-weight: 700; }

  /* BOARD */
  .board-wrap { width: 100%; background: #fff; border: 1px solid ${C.border}; border-radius: 12px; padding: 10px; margin-bottom: 12px; }
  .board { display: grid; grid-template-columns: repeat(9,1fr); grid-template-rows: repeat(9,1fr); width: 100%; aspect-ratio: 1; border: 2px solid ${C.borderThick}; border-radius: 6px; overflow: hidden; contain: strict; }
  .cell { position: relative; border: 0.5px solid ${C.border}; cursor: pointer; display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; overflow: hidden; transition: background 0.08s; background: #fff; }
  .cell[data-col="3"], .cell[data-col="6"] { border-left: 1.5px solid ${C.borderThick}; }
  .cell[data-row="3"], .cell[data-row="6"] { border-top: 1.5px solid ${C.borderThick}; }
  .cell.selected { background: ${C.selected} !important; }
  .cell.highlight { background: ${C.highlight}; }
  .cell.same-num { background: ${C.highlight}; }
  .cell.error-cell { background: rgba(220,38,38,0.08); }
  .cell-val { font-size: clamp(14px, 3.8vw, 21px); font-weight: 500; line-height: 1; pointer-events: none; }
  .cell.given .cell-val { color: ${C.given}; font-weight: 600; }
  .cell.user-cell .cell-val { color: ${C.user}; }
  .cell.user-cell.error-cell .cell-val { color: ${C.error}; }
  .cell.user-cell.wrong .cell-val { color: ${C.error}; font-weight: 600; }
  .notes-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(3,1fr); grid-template-rows: repeat(3,1fr); padding: 1px; pointer-events: none; }
  .note-n { display: flex; align-items: center; justify-content: center; font-size: clamp(9px, 2.1vw, 13px); font-weight: 500; color: ${C.note}; line-height: 1; overflow: hidden; }
  .note-n.on { color: ${C.noteActive}; }

  /* CONTROLS */
  .controls { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; justify-content: center; }
  .ctrl { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 10px; border: 1px solid ${C.border}; border-radius: 10px; background: #fff; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: ${C.muted}; transition: all 0.15s; min-width: 50px; }
  .ctrl:hover { border-color: ${C.accent}; color: ${C.accent}; }
  .ctrl.active { border-color: ${C.accent}; color: ${C.accent}; background: rgba(37,99,235,0.07); }
  .ctrl svg { width: 19px; height: 19px; }

  /* NUMPAD */
  .numpad { display: grid; grid-template-columns: repeat(9,1fr); gap: 5px; width: 100%; margin-bottom: 12px; }
  .num-btn { aspect-ratio: 1; border: 1px solid ${C.border}; border-radius: 8px; background: #fff; font-family: 'DM Mono', monospace; font-size: clamp(14px, 3.2vw, 20px); font-weight: 500; color: ${C.given}; cursor: pointer; transition: all 0.12s; display: flex; align-items: center; justify-content: center; }
  .num-btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: rgba(37,99,235,0.06); }
  .num-btn.done { opacity: 0.2; pointer-events: none; }

  /* BOTTOM BUTTONS */
  .bottom-btns { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 20px; }
  .action-btn { width: 100%; padding: 13px; border: 1px solid ${C.accent}; border-radius: 12px; background: rgba(37,99,235,0.06); font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.accent}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .action-btn:hover { background: rgba(37,99,235,0.14); transform: translateY(-1px); }
  .action-btn:active { transform: translateY(0); }
  .action-btn.loading { opacity: 0.55; pointer-events: none; }
  .action-btn.photo-btn { border-color: #7c3aed; color: #7c3aed; background: rgba(124,58,237,0.06); }
  .action-btn.photo-btn:hover { background: rgba(124,58,237,0.13); }
  .spinner { width: 15px; height: 15px; border: 2px solid rgba(37,99,235,0.25); border-top-color: ${C.accent}; border-radius: 50%; animation: spin 0.7s linear infinite; }
  .spinner.purple { border-color: rgba(124,58,237,0.25); border-top-color: #7c3aed; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* PHOTO STATUS */
  .photo-status { width: 100%; padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .photo-status.processing { background: #f5f3ff; border: 1px solid #7c3aed; color: #5b21b6; }
  .photo-status.success { background: #f0fdf4; border: 1px solid #16a34a; color: #15803d; }
  .photo-status.error { background: #fef2f2; border: 1px solid #dc2626; color: #b91c1c; }
`;

// ─── MODAL ─────────────────────────────────────────────────────────────────
function Modal({ title, emoji, titleColor, lines, btnLabel, onBtn, extraContent }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:18,padding:'32px 40px',textAlign:'center',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',fontFamily:"'DM Mono',monospace",minWidth:280,maxWidth:340}}>
        <div style={{fontSize:52,marginBottom:10}}>{emoji}</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:titleColor,marginBottom:10}}>{title}</h2>
        {lines.map((l,i) => <p key={i} style={{color:'#64748b',fontSize:13,marginBottom:6}}>{l}</p>)}
        {extraContent}
        <button onClick={onBtn} style={{marginTop:20,padding:'11px 28px',border:`1.5px solid ${C.accent}`,borderRadius:10,background:'rgba(37,99,235,0.07)',fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,letterSpacing:1,color:C.accent,cursor:'pointer',display:'block',width:'100%'}}>
          {btnLabel}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function SudokuApp() {
  const [grid, setGrid]           = useState(null);
  const [solution, setSolution]   = useState(null);
  const [selected, setSelected]   = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes]   = useState(0);
  const [history, setHistory]     = useState([]);
  const [seconds, setSeconds]     = useState(0);
  const [generating, setGenerating] = useState(false);
  const [win, setWin]             = useState(false);
  const [clueCount, setClueCount] = useState(0);
  const [showMistakeBanner, setShowMistakeBanner] = useState(false);
  // Photo import
  const [photoStatus, setPhotoStatus] = useState(null); // null | 'processing' | 'success' | 'error'
  const [photoMsg, setPhotoMsg]   = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef              = useRef(null);
  const timerRef                  = useRef(null);
  const bannerTimerRef            = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }, []);

  const initFromData = useCallback(({ puzzle, solution: sol, clues }) => {
    const g = puzzle.map(row => row.map(v => ({ value: v, given: v !== 0, notes: new Set() })));
    setGrid(g); setSolution(sol); setClueCount(clues);
    setSelected(null); setNotesMode(false); setMistakes(0);
    setHistory([]); setSeconds(0); setWin(false);
    setShowMistakeBanner(false); setPhotoStatus(null);
    startTimer();
  }, [startTimer]);

  useEffect(() => { handleNewGame(); return () => { clearInterval(timerRef.current); clearTimeout(bannerTimerRef.current); }; }, []);

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

    // mistake tracking — no longer stops play
    if (solution && solution[row][col] !== n) {
      setMistakes(m => m + 1);
      // show banner for 2.5s
      setShowMistakeBanner(true);
      clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = setTimeout(() => setShowMistakeBanner(false), 2500);
    }

    setGrid(g);

    // check win
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

  // ── PHOTO IMPORT ────────────────────────────────────────────────────────
  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    setPhotoStatus('processing');
    setPhotoMsg('Reading puzzle from photo…');

    try {
      // Convert to base64
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = () => rej(new Error('Read failed'));
        reader.readAsDataURL(file);
      });

      const mediaType = file.type || 'image/jpeg';

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 }
              },
              {
                type: 'text',
                text: `This is a sudoku puzzle. Extract ONLY the pre-printed/given numbers (bold, printed font — NOT handwritten pencil entries, NOT small annotation notes in corners of cells).

Return ONLY a JSON object in this exact format, nothing else, no markdown:
{"grid": [[r0c0,r0c1,...,r0c8],[r1c0,...,r1c8],...,[r8c0,...,r8c8]]}

Use 0 for empty cells. Use the actual digit for given/printed numbers.
The grid must be exactly 9 rows × 9 columns.`
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.find(b => b.type === 'text')?.text || '';
      
      // Parse JSON from response
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      const puzzle = parsed.grid;

      // Validate: 9x9, values 0-9
      if (!Array.isArray(puzzle) || puzzle.length !== 9 || puzzle.some(r => r.length !== 9))
        throw new Error('Invalid grid shape');

      // Try to solve to get solution
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
      setPhotoStatus('success');
      setPhotoMsg(`Imported ${clues} clues from photo${solvable ? '' : ' (solution unavailable — puzzle may be partial)'}`);
      setTimeout(() => setPhotoStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setPhotoStatus('error');
      setPhotoMsg('Could not read puzzle. Try a clearer photo with good lighting.');
      setTimeout(() => setPhotoStatus(null), 5000);
    } finally {
      setImporting(false);
    }
  }, [initFromData]);

  // ── KEYBOARD ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if (e.key >= '1' && e.key <= '9') { enterNum(parseInt(e.key)); return; }
      if (e.key === 'Backspace' || e.key === 'Delete') { handleErase(); return; }
      if (e.key === 'n') { setNotesMode(m => !m); return; }
      if (!selected) return;
      const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
      if (moves[e.key]) {
        e.preventDefault();
        const [dr,dc] = moves[e.key];
        setSelected(s => s ? { row: Math.max(0,Math.min(8,s.row+dr)), col: Math.max(0,Math.min(8,s.col+dc)) } : s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enterNum, handleErase, selected]);

  const counts = Array(10).fill(0);
  if (grid) grid.forEach(row => row.forEach(c => { if (c.value) counts[c.value]++; }));
  const selVal = selected && grid ? grid[selected.row][selected.col].value : 0;
  const extraMistakes = Math.max(0, mistakes - 3);

  return (
    <>
      <style>{css}</style>
      <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload} />
      <div className="app">

        {/* Header */}
        <div className="header">
          <span className="title">Sudoku</span>
          <span className="badge">Expert</span>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-group">
            <div className="stat">
              <span className="stat-val">{fmtTime(seconds)}</span>
              <span className="stat-label">Time</span>
            </div>
            <div className="stat">
              <div className="mistakes-row">
                {[1,2,3].map(i => (
                  <div key={i} className={`dot${mistakes >= i ? ' filled' : ''}`} title={`Mistake ${i}`} />
                ))}
                {extraMistakes > 0 && (
                  <div className="dot extra" title={`+${extraMistakes} extra`} style={{marginLeft:2}} />
                )}
                {extraMistakes > 1 && (
                  <span style={{fontSize:10,color:C.warn,fontWeight:700,marginLeft:1}}>+{extraMistakes - 1}</span>
                )}
              </div>
              <span className="stat-label">Mistakes{mistakes > 0 ? ` (${mistakes})` : ''}</span>
            </div>
          </div>
          <span className="clue-count">{clueCount} clues</span>
        </div>

        {/* Mistake banner — flashes on each mistake after 3 */}
        {showMistakeBanner && mistakes > 3 && (
          <div className="mistake-banner">
            <span>⚠ Mistake #{mistakes}</span>
            <span style={{fontSize:11,opacity:0.8}}>Keep going — total tracked at finish</span>
          </div>
        )}

        {/* Board */}
        <div className="board-wrap">
          <div className="board">
            {grid && grid.map((row, r) => row.map((d, c) => {
              const isSel = selected?.row === r && selected?.col === c;
              const sameBox = selected && Math.floor(r/3)===Math.floor(selected.row/3) && Math.floor(c/3)===Math.floor(selected.col/3);
              const isHL = selected && !isSel && (r===selected.row || c===selected.col || sameBox);
              const isSame = !isSel && selVal && d.value === selVal;
              const hasErr = d.value && !d.given && isErr(grid, r, c, d.value);
              const isWrong = d.value && !d.given && solution && solution[r][c] !== d.value;
              let cls = 'cell';
              if (isSel) cls += ' selected';
              else if (isSame) cls += ' same-num';
              else if (isHL) cls += ' highlight';
              if (hasErr) cls += ' error-cell';
              if (isWrong) cls += ' wrong';
              if (d.given) cls += ' given'; else if (d.value) cls += ' user-cell';
              return (
                <div key={`${r}-${c}`} className={cls} data-row={r} data-col={c} onClick={() => setSelected({row:r,col:c})}>
                  {d.value ? (
                    <span className="cell-val">{d.value}</span>
                  ) : d.notes.size > 0 ? (
                    <div className="notes-grid">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <div key={n} className={`note-n${d.notes.has(n) ? ' on' : ''}`}>{d.notes.has(n) ? n : ''}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <button className="ctrl" onClick={handleUndo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
            Undo
          </button>
          <button className="ctrl" onClick={handleErase}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6 18l4-4"/></svg>
            Erase
          </button>
          <button className={`ctrl${notesMode ? ' active' : ''}`} onClick={() => setNotesMode(m => !m)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Notes
          </button>
          <button className="ctrl" onClick={handleHint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            Hint
          </button>
        </div>

        {/* Numpad */}
        <div className="numpad">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className={`num-btn${counts[n] >= 9 ? ' done' : ''}`} onClick={() => enterNum(n)}>{n}</button>
          ))}
        </div>

        {/* Photo status */}
        {photoStatus && (
          <div className={`photo-status ${photoStatus}`} style={{marginBottom:8}}>
            {photoStatus === 'processing' && <div className="spinner purple" style={{flexShrink:0}}/>}
            {photoStatus === 'success' && <span>✓</span>}
            {photoStatus === 'error' && <span>✗</span>}
            <span>{photoMsg}</span>
          </div>
        )}

        {/* Bottom buttons */}
        <div className="bottom-btns">
          <button className={`action-btn${generating ? ' loading' : ''}`} onClick={handleNewGame}>
            {generating
              ? <><div className="spinner"/><span>Generating…</span></>
              : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg><span>New Expert Puzzle</span></>}
          </button>
          <button className={`action-btn photo-btn${importing ? ' loading' : ''}`} onClick={() => fileInputRef.current?.click()}>
            {importing
              ? <><div className="spinner purple"/><span>Reading photo…</span></>
              : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Import from Photo</span></>}
          </button>
        </div>
      </div>

      {/* Win modal */}
      {win && (
        <Modal
          emoji="🎉"
          title="Puzzle Solved!"
          titleColor={C.success}
          lines={[`Time: ${fmtTime(seconds)}`]}
          extraContent={
            <div style={{margin:'12px 0',padding:'10px 16px',background: mistakes > 0 ? '#fef3c7' : '#f0fdf4',borderRadius:8}}>
              <div style={{fontSize:22,fontWeight:800,color: mistakes === 0 ? C.success : mistakes <= 3 ? C.accent : C.warn}}>
                {mistakes} mistake{mistakes !== 1 ? 's' : ''}
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                {mistakes === 0 ? 'Perfect solve! 🏆' : mistakes <= 3 ? 'Great work!' : `3 + ${mistakes-3} extra`}
              </div>
            </div>
          }
          btnLabel="New Puzzle"
          onBtn={() => { setWin(false); handleNewGame(); }}
        />
      )}
    </>
  );
}
