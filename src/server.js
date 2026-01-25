const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, '../db/scores.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper functions for data persistence
async function readScores() {
  try {
    const data = await fs.readFile(SCORES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

async function writeScores(scores) {
  await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
}

// API Routes

// GET /api/leaderboard - Get top 10 scores
app.get('/api/leaderboard', async (req, res) => {
  try {
    const scores = await readScores();
    
    // Sort by score descending and get top 10
    const leaderboard = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// POST /api/score - Submit a new score
app.post('/api/score', async (req, res) => {
  try {
    const { username, score } = req.body;
    
    // Validation
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Username is required and must be a string'
      });
    }
    
    if (username.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Username must be 20 characters or less'
      });
    }
    
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Score must be a non-negative number'
      });
    }
    
    // Read existing scores
    const scores = await readScores();
    
    // Create new score entry
    const newScore = {
      id: Date.now(), // Use timestamp as simple ID
      username: username.trim(),
      score: score,
      timestamp: new Date().toISOString()
    };
    
    // Add to scores
    scores.push(newScore);
    
    // Save scores
    await writeScores(scores);
    
    // Calculate rank
    const sortedScores = scores.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.id === newScore.id) + 1;
    
    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      rank: rank
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit score'
    });
  }
});

// Start server
const HOST = process.env.EXPN === 'true' ? '0.0.0.0' : 'localhost';
app.listen(PORT, HOST, () => {
  console.log(`BlockLogic server running on http://${HOST}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`Server exposed to local network - access from other devices using your machine's IP`);
  }
});
