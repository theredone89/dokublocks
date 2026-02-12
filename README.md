# BlockLogic - Blockudoku Game

A browser-based puzzle game combining Sudoku grids with Tetris-style block placement mechanics. Players strategically place polyomino shapes on a 9x9 grid to clear rows, columns, and 3x3 subgrids.

## Play Offline Demo
[BlockLogic Game](https://theredone89.github.io/dokublocks/public/index.html)


## Features

- 🎮 **Classic Blockudoku Gameplay** - Place Tetris-like pieces on a 9x9 Sudoku grid
- 🏆 **Scoring System** - Earn points for placing blocks and clearing lines with combo multipliers
- 📊 **Leaderboard** - Compete with others and track high scores
- 📱 **Touch & Mouse Support** - Playable on desktop and mobile devices
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 💾 **Persistent Scores** - High scores saved locally and to server

## How to Play

1. **Drag and Drop** - Select a piece from the hand (bottom of screen) and drag it to the grid
2. **Place Strategically** - Position pieces to fill rows, columns, or 3x3 squares
3. **Clear Lines** - Complete lines disappear, earning you points
4. **Plan Ahead** - Game ends when no valid moves remain for any piece in your hand

## Installation

```bash
# Clone the repository
git clone https://github.com/theredone89/dokublocks.git
cd dokublocks

# Install dependencies
npm install

# Start the server
npm start
```

The game will be available at `http://localhost:3000`

## Development

```bash
# Run in development mode with auto-restart
npm run dev
```

## Technology Stack

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API for rendering
- CSS3 for styling
- Class-based OOP architecture

### Backend
- Node.js
- Express.js
- JSON file-based data storage
- RESTful API

## Game Mechanics

- **Grid Size:** 9x9 playing field
- **Subgrids:** Divided into nine 3x3 sections
- **Pieces:** Random polyomino shapes (3 pieces per batch)
- **Scoring:**
  - 10 points per block placed
  - 100 points per line/square cleared
  - Combo bonuses for multiple simultaneous clears
  - Streak bonuses for consecutive clears

## API Endpoints

- `GET /api/leaderboard` - Retrieve top 10 scores
- `POST /api/score` - Submit a new score

## Project Structure

```
dokublocks/
├── public/           # Frontend files
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── Grid.js
│   │   ├── Pieces.js
│   │   ├── ScoreManager.js
│   │   ├── Renderer.js
│   │   ├── InputHandler.js
│   │   ├── Game.js
│   │   └── main.js
│   └── index.html
├── src/              # Backend files
│   └── server.js
├── db/               # Data storage
│   └── scores.json
└── tasks/            # Development tasks and specs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License - See LICENSE file for details

## Credits

Developed as a web implementation of the popular Blockudoku puzzle game concept.

## Live Demo

🎮 **Server is running!** Open http://localhost:3000 in your browser to play!

---

**Enjoy the game!** 🎲
