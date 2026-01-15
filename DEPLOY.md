# Deployment Guide (Static Site)

Great news! Your app has been refactored into a **Static Single Page Application (SPA)**. 
 This means you don't need a complex Node.js backend server. The app runs entirely in the browser, and data is saved to the user's device (LocalStorage).

## Recommended: Vercel (Free & Fastest)

Vercel is optimized for **Vite** apps like this one.

### Method 1: Deploy using GitHub (Best)
1.  **Push your code** to a GitHub repository.
2.  Go to [Vercel.com](https://vercel.com) and sign up/log in.
3.  Click **"Add New..."** -> **"Project"**.
4.  Select your `french_learning_app` repository.
5.  **Settings**:
    *   Framework Preset: `Vite` (It should auto-detect this).
    *   Root Directory: `./` (Default).
    *   Build Command: `npm run build` (Default).
    *   Output Directory: `dist` (Default).
6.  Click **Deploy**.

### Method 2: Drag & Drop (Netlify)
1.  Run the build command locally:
    ```bash
    npm run build
    ```
2.  This creates a `dist` folder in your project.
3.  Go to [Netlify Drop](https://app.netlify.com/drop).
4.  Drag and drop the `dist` folder onto the page.
5.  It will be live in seconds!

## Note on Data Persistence
Since this is now a client-side app:
*   **Default Categories**: Everyone sees the categories defined in `src/data/initialCategories.js`.
*   **User Edits**: If you (or a user) edits a category, that change is saved to **LocalStorage** on that specific device/browser. It is **not** shared with other users.
*   This is perfect for a personal learning tool or a standalone app.
