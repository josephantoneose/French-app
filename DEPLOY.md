
# Deployment Guide

To deploy this application so that users can share the database (questions), you need to deploy the Backend (`server.js`) and Frontend (`dist`).

## Option 1: Render.com (Simplest for Node + JSON persistence)

Render offers a Web Service that can run your server. Note: On the free tier, files (like `questions.json`) are **ephemeral**, meaning if the server restarts (which happens on free tier spin-downs), you lose data. For persistent data, you need a "Disk" (paid) or use a real database.

**However**, for a quick demo:

1.  **Push code to GitHub**.
2.  **Create a Web Service** on Render connected to your repo.
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `node server.js`
    *   *Note*: You need to serve the React frontend FROM the Node backend for this to work as a single service.

### Serving Frontend from Backend (Recommended for easy deploy)
Update `server.js` to serve the static files from `dist`:

```javascript
// Add these lines to server.js before app.listen
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Option 2: Frontend (Vercel) + Backend (Render/Heroku/Railway)
This is better if you want a reliable frontend, but separating them requires configuring CORS and env vars.

## Recommended: Use a Database (Supabase/Firebase)
Since file-based persistence (`questions.json`) is hard to keep persistent on modern serverless platforms, simply swapping the `server.js` logic to read/write from a **MongoDB Atlas** (Free Tier) or **Supabase** is best.

### Quick Fix for "Persistence" on Free Tier
If you just want to share questions *temporarily* or restart often isn't an issue, the current `questions.json` approach on Render works until the next deploy/restart.
