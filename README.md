# Sudoku Expert

A fully-featured Expert Sudoku app with puzzle generation and photo import.

## Features
- Expert puzzle generator (22–26 clues, unique solution)
- Import puzzle from a photo (uses Claude Vision API)
- Notes / pencil marks
- Error highlighting — wrong entries shown in red
- Unlimited play after 3 mistakes — total counted at finish
- Undo, Erase, Hint
- Keyboard support (arrows + numbers)

## Deploy to Netlify in 3 steps

### Option A — Netlify Drop (no account needed, instant)
1. Run the build:
   ```
   npm install
   npm run build
   ```
2. Go to **netlify.com/drop**
3. Drag and drop the `dist/` folder onto the page
4. Done — you get a live URL immediately

### Option B — GitHub + Netlify (auto-deploys on every push)
1. Push this folder to a GitHub repo
2. Go to **netlify.com** → Add new site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click Deploy

### Option C — Vercel
1. Push to GitHub
2. Go to **vercel.com** → New Project → Import repo
3. Framework preset: Vite
4. Click Deploy

## Local development
```
npm install
npm run dev
```
Open http://localhost:5173

## Notes
- The photo import feature calls the Anthropic API directly from the browser.
  This works in the Claude artifact environment. For a standalone deployment,
  you will need to add your own API key — see the handlePhotoUpload function
  in src/App.jsx and add your key to the fetch headers:
  `"x-api-key": "your-key-here"`
- Keep your API key server-side in production (use a Netlify/Vercel serverless
  function as a proxy) to avoid exposing it publicly.
