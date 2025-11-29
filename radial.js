// Radial grid parameters
let initialCellCount = 8; // Number of cells in the first ring
let numRings = 15; // Total number of rings to generate
let expansionInterval = 5; // Add expansion cell every N cells

// Cellular automata parameters
let ruleset = [0, 1, 0, 1, 1, 0, 1, 0]; // Rule 90

// Data structures
let rings = []; // 2D array: rings[ringIndex][cellIndex]
let expansionMap = []; // Tracks which cells are expansions

// Visual parameters
let centerX, centerY;
let startRadius = 40; // Radius of first ring
let ringSpacing = 25; // Distance between rings
let cellSize = 20; // Diameter of cell circles
let currentRing = 0; // Current generation
let initialPattern = [1, 0, 1, 0, 1, 0, 1, 0]; // Initial pattern

function setup() {
  let canvas = createCanvas(1000, 1000);
  canvas.parent('canvas-container');
  initializeSimulation();
}

function initializeSimulation() {
  background(127);
  centerX = width / 2;
  centerY = height / 2;
  currentRing = 0;
  rings = [];
  expansionMap = [];
  
  // Initialize first ring with the initial pattern
  rings[0] = initialPattern.slice(0, initialCellCount);
  // Pad with zeros if pattern is shorter than initialCellCount
  while (rings[0].length < initialCellCount) {
    rings[0].push(0);
  }
  expansionMap[0] = new Array(initialCellCount).fill(false);
  
  // Pre-calculate all ring structures
  for (let r = 1; r < numRings; r++) {
    let prevCount = rings[r - 1].length;
    let expansionCount = floor(prevCount / expansionInterval);
    let newCount = prevCount + expansionCount;
    
    rings[r] = new Array(newCount);
    expansionMap[r] = new Array(newCount).fill(false);
    
    // Mark expansion cells evenly distributed
    for (let i = 0; i < newCount; i++) {
      if (i % (expansionInterval + 1) === expansionInterval) {
        expansionMap[r][i] = true;
      }
    }
  }
  
  stroke(150); // Gray outline
  strokeWeight(1);
}

function draw() {
  if (currentRing >= numRings) {
    noLoop();
    updateStatistics();
    return;
  }
  
  // Draw current ring
  let radius = startRadius + currentRing * ringSpacing;
  let cellCount = rings[currentRing].length;
  
  // Draw concentric circle guide (very light)
  stroke(220);
  strokeWeight(0.5);
  noFill();
  circle(centerX, centerY, radius * 2);
  
  // Draw radial lines from previous ring to current ring (non-expansion points only)
  if (currentRing > 0) {
    stroke(150);
    strokeWeight(1);
    
    let prevRadius = startRadius + (currentRing - 1) * ringSpacing;
    let prevCount = rings[currentRing - 1].length;
    
    let prevIndex = 0;
    for (let i = 0; i < cellCount; i++) {
      if (!expansionMap[currentRing][i]) {
        // This is a non-expansion cell, draw line from corresponding previous cell
        let angle1 = (TWO_PI / prevCount) * prevIndex;
        let x1 = centerX + prevRadius * cos(angle1);
        let y1 = centerY + prevRadius * sin(angle1);
        
        let angle2 = (TWO_PI / cellCount) * i;
        let x2 = centerX + radius * cos(angle2);
        let y2 = centerY + radius * sin(angle2);
        
        line(x1, y1, x2, y2);
        prevIndex++;
      }
    }
  }
  
  // Draw circles for each cell
  stroke(150);
  strokeWeight(1);
  for (let i = 0; i < cellCount; i++) {
    let angle = (TWO_PI / cellCount) * i;
    let x = centerX + radius * cos(angle);
    let y = centerY + radius * sin(angle);
    
    if (rings[currentRing][i] === 1) {
      fill(0);
    } else {
      fill(255);
    }
    circle(x, y, cellSize);
  }
  
  // Generate next ring
  if (currentRing < numRings - 1) {
    generateNextRing(currentRing);
  }
  
  currentRing++;
}

function generateNextRing(ringIndex) {
  let currentCells = rings[ringIndex];
  let nextCells = rings[ringIndex + 1];
  let nextExpansions = expansionMap[ringIndex + 1];
  
  let prevIndex = 0; // Track position in previous ring
  
  for (let i = 0; i < nextCells.length; i++) {
    if (nextExpansions[i]) {
      // Expansion cell: copy from last non-expansion cell
      if (prevIndex > 0) {
        nextCells[i] = currentCells[prevIndex - 1];
      } else {
        nextCells[i] = currentCells[currentCells.length - 1];
      }
    } else {
      // Regular cell: apply CA rules
      let left = currentCells[(prevIndex - 1 + currentCells.length) % currentCells.length];
      let center = currentCells[prevIndex];
      let right = currentCells[(prevIndex + 1) % currentCells.length];
      
      nextCells[i] = rules(left, center, right);
      prevIndex++;
    }
  }
}

function rules(a, b, c) {
  let s = "" + a + b + c;
  let index = parseInt(s, 2);
  return ruleset[7 - index];
}

function updateStatistics() {
  let statsHTML = `<p><strong>Total Rows:</strong> ${numRings}</p>`;
  statsHTML += '<div style="max-height: 400px; overflow-y: auto;">';
  
  for (let r = 0; r < rings.length; r++) {
    let cellCount = rings[r].length;
    let blackCount = rings[r].filter(cell => cell === 1).length;
    let whiteCount = cellCount - blackCount;
    let blackPercent = ((blackCount / cellCount) * 100).toFixed(1);
    let whitePercent = ((whiteCount / cellCount) * 100).toFixed(1);
    
    statsHTML += `<div class="stat-row">Row ${r + 1}: ${cellCount} points | Black: ${blackCount} (${blackPercent}%) | White: ${whiteCount} (${whitePercent}%)</div>`;
  }
  
  statsHTML += '</div>';
  document.getElementById('stats-content').innerHTML = statsHTML;
}

function restartSimulation() {
  // Read values from controls
  initialCellCount = parseInt(document.getElementById('initialCellCount').value);
  numRings = parseInt(document.getElementById('numRings').value);
  expansionInterval = parseInt(document.getElementById('expansionInterval').value);
  startRadius = parseInt(document.getElementById('startRadius').value);
  ringSpacing = parseInt(document.getElementById('ringSpacing').value);
  cellSize = parseInt(document.getElementById('cellSize').value);
  
  // Parse ruleset
  let rulesetStr = document.getElementById('ruleset').value;
  if (rulesetStr.length === 8) {
    ruleset = rulesetStr.split('').map(bit => parseInt(bit));
  }
  
  // Parse initial pattern
  let patternStr = document.getElementById('initialPattern').value;
  initialPattern = patternStr.split(',').map(val => parseInt(val.trim())).filter(val => val === 0 || val === 1);
  
  // Update initial pattern to match initialCellCount
  if (initialPattern.length !== initialCellCount) {
    let newPattern = [];
    for (let i = 0; i < initialCellCount; i++) {
      newPattern.push(initialPattern[i % initialPattern.length] || 0);
    }
    initialPattern = newPattern;
    document.getElementById('initialPattern').value = initialPattern.join(',');
  }
  
  // Reset statistics
  document.getElementById('stats-content').innerHTML = 'Generating...';
  
  // Restart simulation - call initializeSimulation first, then loop
  initializeSimulation();
  loop();
}
