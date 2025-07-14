

This project is a simple web application that demonstrates device fingerprinting using canvas fingerprinting, user agent, and screen resolution. It tracks a click count associated with a device's fingerprint, stored in a SQLite database, and allows users to toggle between English and Arabic languages.

## Features
- **Canvas Fingerprinting**: Generates a unique fingerprint based on canvas rendering.
- **Click Counter**: Tracks and updates a click count for each unique fingerprint.
- **Language Toggle**: Supports English and Arabic with RTL/LTR layout switching.
- **SQLite Database**: Stores fingerprint data (canvas fingerprint, user agent, screen resolution, and click count).
- **Particle Animation**: Adds a visual effect with animated particles in the background.

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A modern web browser (e.g., Chrome, Firefox)

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
   This installs the required Node.js packages (`sqlite3`).

2. **Run the Server**:
   ```bash
   node server.js
   ```
   The server will start on `http://127.0.0.1:3000`. A SQLite database (`fingerprint.db`) will be created automatically.

3. **Access the Application**:
   Open a web browser and navigate to `http://127.0.0.1:3000`.

## Usage
- **Initial Load**: The application collects the device's fingerprint (canvas, user agent, screen resolution) and sends it to the server. If the fingerprint exists in the database, it retrieves the associated click count; otherwise, it creates a new entry with a default click count of 10.
- **Clicking**: Click the "Click Here" (or "اضغط هنا" in Arabic) button to decrement the click count. The updated count is sent to the server and stored in the database.
- **Language Toggle**: Click the language toggle button (top-left) to switch between English and Arabic. The UI updates accordingly, including text direction (LTR/RTL).
- **Testing Fingerprinting**: Open the application in different browsers or incognito mode to observe how the fingerprint changes and whether the click count persists or resets.

## Project Structure
- `server.js`: Node.js server handling HTTP requests, SQLite database operations, and static file serving.
- `index.html`: Main HTML file for the web interface.
- `script.js`: Client-side JavaScript for fingerprint collection, API requests, and UI updates.
- `fingerprint.db`: SQLite database file (created automatically on server start).
- `styles.css`: (Assumed to exist) Contains styles for the UI and particle animations.

## Endpoints
- **POST `/get-fingerprint`**: Retrieves or initializes the click count for a given fingerprint.
  - Request Body: `{ canvasFingerprint, userAgent, screenResolution }`
  - Response: `{ clickCount }` or `{ error }`
- **POST `/update-clicks`**: Updates the click count for a given fingerprint.
  - Request Body: `{ canvasFingerprint, clickCount }`
  - Response: `{ success: true }` or `{ error }`
- **Static Files**: Serves `index.html`, `script.js`, `styles.css`, and other assets.


- Ensure `styles.css` is present in the project directory for proper styling.

## Troubleshooting
- **Server Errors**: Check the console for errors related to database connections or file serving.
- **CORS Issues**: Ensure the browser is accessing `http://127.0.0.1:3000` directly, as the server is local.

