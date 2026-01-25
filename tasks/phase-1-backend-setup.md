# Phase 1: Backend Setup

## Task 1.1: Initialize Node.js Project and Install Dependencies

**Description:** Set up the Node.js project environment and install required dependencies.

**Steps:**
1. Run `npm init -y` to create package.json
2. Install core dependencies:
   - `npm install express` - Web framework
   - `npm install cors` - Cross-origin resource sharing
   - `npm install better-sqlite3` - SQLite database driver
3. Install dev dependencies (optional):
   - `npm install --save-dev nodemon` - Auto-restart server

**Acceptance Criteria:**
- [ ] package.json created with project metadata
- [ ] All dependencies installed successfully
- [ ] node_modules/ directory created
- [ ] package-lock.json generated

---

## Task 1.2: Create Project Folder Structure

**Description:** Establish the directory structure for frontend and backend code.

**Structure to Create:**
```
/dokublocks
├── /public
│   ├── /css
│   └── /js
├── /src
└── /db
```

**Steps:**
1. Create `/public` directory for frontend assets
2. Create `/public/css` for stylesheets
3. Create `/public/js` for JavaScript modules
4. Create `/src` directory for backend logic
5. Create `/db` directory for database files

**Acceptance Criteria:**
- [ ] All directories created
- [ ] Folder structure matches specification
- [ ] .gitignore includes node_modules/ and /db/*.db

---

## Task 1.3: Setup SQLite Database Schema

**Description:** Initialize the SQLite database with the scores table.

**Database File:** `/db/game.db`

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_score ON scores(score DESC);
```

**Steps:**
1. Create database initialization script `/src/db-init.js`
2. Import better-sqlite3
3. Create database connection
4. Execute CREATE TABLE statement
5. Create index on score column
6. Add seed data (optional for testing)

**Acceptance Criteria:**
- [ ] Database file created at /db/game.db
- [ ] scores table exists with correct schema
- [ ] Index created on score column
- [ ] Initialization script can be run multiple times safely

---

## Task 1.4: Implement GET /api/leaderboard Endpoint

**Description:** Create API endpoint to retrieve top 10 scores.

**Endpoint:** `GET /api/leaderboard`

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "Player1",
      "score": 5420,
      "timestamp": "2026-01-25T10:30:00Z"
    }
  ]
}
```

**Steps:**
1. Add endpoint handler in server.js
2. Query database: `SELECT * FROM scores ORDER BY score DESC LIMIT 10`
3. Format response as JSON
4. Handle errors with 500 status code

**Acceptance Criteria:**
- [ ] Endpoint returns top 10 scores
- [ ] Scores sorted in descending order
- [ ] Response includes id, username, score, timestamp
- [ ] Error handling implemented
- [ ] CORS headers configured

---

## Task 1.5: Implement POST /api/score Endpoint

**Description:** Create API endpoint to submit and store new scores.

**Endpoint:** `POST /api/score`

**Request Body:**
```json
{
  "username": "Player1",
  "score": 5420
}
```

**Validation Rules:**
- username: Required, string, 1-20 characters
- score: Required, integer, >= 0

**Steps:**
1. Add POST endpoint handler in server.js
2. Validate request body
3. Insert into database: `INSERT INTO scores (username, score) VALUES (?, ?)`
4. Return success response with rank
5. Handle validation errors (400 status)
6. Handle database errors (500 status)

**Acceptance Criteria:**
- [ ] Endpoint accepts JSON payload
- [ ] Input validation works correctly
- [ ] Score inserted into database
- [ ] Response includes success status and rank
- [ ] Error responses for invalid input

---

## Task 1.6: Configure Express Static File Serving

**Description:** Set up Express to serve frontend files from /public directory.

**Steps:**
1. Create server.js in /src directory
2. Import Express and other dependencies
3. Configure middleware (cors, express.json)
4. Set up static file serving: `app.use(express.static('public'))`
5. Mount API endpoints
6. Start server on port 3000 (or environment variable)
7. Add logging middleware

**Server Structure:**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/leaderboard', ...);
app.post('/api/score', ...);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Acceptance Criteria:**
- [ ] Express server starts successfully
- [ ] Static files served from /public
- [ ] API endpoints accessible
- [ ] CORS enabled
- [ ] JSON parsing enabled
- [ ] Server logs requests
- [ ] Environment variable for port configuration
