#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'daily.json')

function pad(n){return n.toString().padStart(2,'0')}

function formatId(date){
  const y = date.getFullYear()
  const m = pad(date.getMonth()+1)
  const d = pad(date.getDate())
  return `${y}${m}${d}`
}

function formatDateISO(date){
  const y = date.getFullYear()
  const m = pad(date.getMonth()+1)
  const d = pad(date.getDate())
  return `${y}-${m}-${d}`
}

// piece names mirrored from public/js/Pieces.js
const PIECE_NAMES = [
  'DOT','DOMINO_H','DOMINO_V','L_SMALL','L_SMALL_R','L_SMALL_F','L_SMALL_FR','LINE_3_H','LINE_3_V',
  'L_LARGE','L_LARGE_R','L_LARGE_F','L_LARGE_FR','T_SHAPE','T_SHAPE_R','T_SHAPE_F','T_SHAPE_L','SQUARE',
  'Z_SHAPE','S_SHAPE','LINE_4_H','LINE_4_V','LINE_5_H','LINE_5_V','PLUS','CORNER_3X3','CORNER_3X3_R'
]

function makeEmptyGrid(){
  return Array.from({length:9},()=>Array.from({length:9},()=>0))
}

function randomGrid(fillProb){
  // ensure a 9x9 matrix
  const grid = Array.from({length:9},()=>Array.from({length:9},()=>0))
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      grid[r][c] = Math.random() < fillProb ? 1 : 0
    }
  }
  return grid
}

function randomHand(){
  const hand = []
  // 3 pieces per hand
  for(let i=0;i<3;i++){
    const idx = Math.floor(Math.random()*PIECE_NAMES.length)
    hand.push(PIECE_NAMES[idx])
  }
  return hand
}

function randomTargetScore(grid){
  const min = 5000
  const max = 12000
  // count filled cells to slightly bias score
  let filled = 0
  for(const row of grid) for(const v of row) if (v) filled++
  const ratio = Math.min(1, filled / 81)
  const randScore = Math.floor(min + Math.random() * (max - min + 1))
  const biasScore = Math.floor(min + ratio * (max - min))
  // mix random with bias (70% random, 30% bias)
  const score = Math.floor(randScore * 0.7 + biasScore * 0.3)
  return Math.max(min, Math.min(max, score))
}

function isEmptyChallenge(challenge){
  if (!challenge) return true
  const {grid, hand, targetScore} = challenge
  if (!Array.isArray(grid) || grid.length !== 9) return true
  // check grid all zeros
  let any = false
  for(const row of grid){
    if (!Array.isArray(row) || row.length !== 9) return true
    for(const v of row) if (v) any = true
  }
  if (any) return false
  if (Array.isArray(hand) && hand.length > 0) return false
  if (typeof targetScore === 'number' && targetScore > 0) return false
  return true
}

async function main(){
  const argYear = process.argv[2]
  const year = argYear ? Number(argYear) : new Date().getFullYear()
  if (Number.isNaN(year) || year < 1000) {
    console.error('Invalid year:', argYear)
    process.exit(2)
  }

  // Read existing file, create backup
  let existing = { daily: [] }
  try{
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    existing = JSON.parse(raw)
    const backupPath = DATA_PATH + '.' + Date.now() + '.bak'
    await fs.writeFile(backupPath, raw, 'utf8')
    console.log('Backup created at', backupPath)
  }catch(err){
    if (err.code === 'ENOENT'){
      console.warn('No existing daily.json found; a new file will be created at', DATA_PATH)
    }else{
      console.error('Failed reading daily.json:', err)
      process.exit(1)
    }
  }

  // map existing entries by id for quick lookup
  const existingMap = new Map()
  for(const e of (existing.daily || [])) existingMap.set(e.id, e)

  // generate or update entries for the full year (in chronological order)
  const yearEntries = []
  for(let m=0;m<12;m++){
    for(let d=1;;d++){
      const dt = new Date(year, m, d)
      if (dt.getMonth() !== m) break
      const id = formatId(dt)
      const date = formatDateISO(dt)

      const existingEntry = existingMap.get(id)
      if (existingEntry){
        if (isEmptyChallenge(existingEntry.challenge)){
          const fillProb = 0.02 + Math.random() * 0.12
          const grid = randomGrid(fillProb)
          yearEntries.push({ id, date, challenge: { grid, hand: randomHand(), targetScore: randomTargetScore(grid) } })
        }else{
          // preserve existing grid/hand but refresh targetScore into new range
          const grid = existingEntry.challenge && Array.isArray(existingEntry.challenge.grid) ? existingEntry.challenge.grid : makeEmptyGrid()
          const hand = existingEntry.challenge && Array.isArray(existingEntry.challenge.hand) ? existingEntry.challenge.hand : randomHand()
          yearEntries.push({ id, date, challenge: { grid, hand, targetScore: randomTargetScore(grid) } })
        }
        existingMap.delete(id)
      }else{
        const fillProb = 0.02 + Math.random() * 0.12
        const grid = randomGrid(fillProb)
        yearEntries.push({ id, date, challenge: { grid, hand: randomHand(), targetScore: randomTargetScore(grid) } })
      }
    }
  }

  // remaining existing entries (outside the year) should be appended after
  const remaining = Array.from(existingMap.values())

  const out = { daily: yearEntries.concat(remaining) }
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${yearEntries.length} daily entries for ${year} to`, DATA_PATH)
}

main().catch(err=>{
  console.error(err)
  process.exit(1)
})
