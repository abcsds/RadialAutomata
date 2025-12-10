// Radial grid parameters
let initialCellCount = 16; // Number of cells in the first ring
let numRings = 20; // Total number of rings to generate
let expansionIntervals = []; // Array of expansion intervals, one per ring

// Cellular automata parameters
let ruleset = [0, 1, 0, 1, 1, 0, 1, 0]; // Rule 90

// Helper function to get all divisors of a number
function getDivisors(n) {
  let divisors = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      divisors.push(i);
      if (i !== n / i) {
        divisors.push(n / i);
      }
    }
  }
  return divisors.sort((a, b) => a - b);
}

// Get default expansion interval for spherical curvature (κ ≈ 0.5-0.6)
// This creates a natural bowl/dome shape, perfect for crochet hats, bowls, and amigurumi
function getDefaultExpansionInterval(cellCount) {
  let divisors = getDivisors(cellCount);
  let validDivisors = divisors.filter(d => d > 1);
  
  // If only prime (no divisors except 1 and itself), use the number itself
  if (validDivisors.length === 0) {
    return cellCount;
  }
  
  // For spherical curvature (κ ≈ 0.5), choose from upper 60% of divisors
  // This creates less expansion = bowl/dome shape (positive curvature)
  // Lower divisors = more expansion = hyperbolic (negative curvature)
  // Higher divisors = less expansion = spherical (positive curvature)
  let targetIndex = Math.floor(validDivisors.length * 0.6); // 60% through the list
  targetIndex = Math.max(0, Math.min(validDivisors.length - 1, targetIndex));
  
  return validDivisors[targetIndex];
}

// Initialize expansion intervals with defaults
// Start with 2, then increment: 2, 3, 4, 5, 6, etc.
// This creates a circular/spherical expansion pattern
function initializeExpansionIntervals() {
  expansionIntervals = [];
  let currentCellCount = initialCellCount;
  
  for (let r = 0; r < numRings - 1; r++) {
    // Start with interval 2, increment by 1 each ring
    let interval = 2 + r;
    
    // Make sure interval doesn't exceed cell count
    // If it does, use a valid divisor
    if (interval > currentCellCount) {
      let divisors = getDivisors(currentCellCount);
      let validDivisors = divisors.filter(d => d > 1);
      interval = validDivisors.length > 0 ? validDivisors[validDivisors.length - 1] : currentCellCount;
    }
    
    expansionIntervals[r] = interval;
    
    // Calculate next ring's cell count
    let expansionCount = Math.floor(currentCellCount / interval);
    currentCellCount = currentCellCount + expansionCount;
  }
}

// Data structures
let rings = []; // 2D array: rings[ringIndex][cellIndex]
let expansionMap = []; // Tracks which cells are expansions

// Visual parameters
let centerX, centerY;
let startRadius = 40; // Radius of first ring
let ringSpacing = 20; // Distance between rings
let cellSize = 20; // Diameter of cell circles
let currentRing = 0; // Current generation
let initialPattern = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // Initial pattern (all ones)

// Color parameters
let color0 = '#FFFFFF'; // Color for state 0 (white by default)
let color1 = '#000000'; // Color for state 1 (black by default)
let colorBackground = '#7F7F7F'; // Background color (gray by default)

function setup() {
  let canvas = createCanvas(1000, 1000);
  canvas.parent('canvas-container');
  initializeSimulation();
}

function initializeSimulation() {
  background(colorBackground);
  centerX = width / 2;
  centerY = height / 2;
  currentRing = 0;
  rings = [];
  expansionMap = [];
  
  // Initialize expansion intervals if not already set
  if (expansionIntervals.length === 0) {
    initializeExpansionIntervals();
  }
  
  // Initialize first ring with the initial pattern
  rings[0] = initialPattern.slice(0, initialCellCount);
  // Pad with zeros if pattern is shorter than initialCellCount
  while (rings[0].length < initialCellCount) {
    rings[0].push(0);
  }
  expansionMap[0] = new Array(initialCellCount).fill(false);
  
  // Pre-calculate all ring structures using variable expansion intervals
  for (let r = 1; r < numRings; r++) {
    let prevCount = rings[r - 1].length;
    let expansionInterval = expansionIntervals[r - 1] || prevCount; // Use specific interval for this ring
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
  noStroke();
  for (let i = 0; i < cellCount; i++) {
    let angle = (TWO_PI / cellCount) * i;
    let x = centerX + radius * cos(angle);
    let y = centerY + radius * sin(angle);
    
    if (rings[currentRing][i] === 1) {
      fill(color1);
    } else {
      fill(color0);
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

// Update colors immediately when color pickers change
function updateColors() {
  color0 = document.getElementById('color0').value;
  color1 = document.getElementById('color1').value;
  colorBackground = document.getElementById('colorBackground').value;
  
  // Redraw all rings with new colors
  background(colorBackground);
  
  for (let r = 0; r < rings.length; r++) {
    let radius = startRadius + r * ringSpacing;
    let cellCount = rings[r].length;
    
    // Draw concentric circle guide (very light)
    stroke(220);
    strokeWeight(0.5);
    noFill();
    circle(centerX, centerY, radius * 2);
    
    // Draw radial lines from previous ring to current ring (non-expansion points only)
    if (r > 0) {
      stroke(150);
      strokeWeight(1);
      
      let prevRadius = startRadius + (r - 1) * ringSpacing;
      let prevCount = rings[r - 1].length;
      
      let prevIndex = 0;
      for (let i = 0; i < cellCount; i++) {
        if (!expansionMap[r][i]) {
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
    
    // Draw circles for each cell with updated colors
    noStroke();
    for (let i = 0; i < cellCount; i++) {
      let angle = (TWO_PI / cellCount) * i;
      let x = centerX + radius * cos(angle);
      let y = centerY + radius * sin(angle);
      
      if (rings[r][i] === 1) {
        fill(color1);
      } else {
        fill(color0);
      }
      circle(x, y, cellSize);
    }
  }
}

function restartSimulation() {
  // Read values from controls
  initialCellCount = parseInt(document.getElementById('initialCellCount').value);
  numRings = parseInt(document.getElementById('numRings').value);
  startRadius = parseInt(document.getElementById('startRadius').value);
  ringSpacing = parseInt(document.getElementById('ringSpacing').value);
  cellSize = parseInt(document.getElementById('cellSize').value);
  
  // Read expansion intervals from dropdowns
  expansionIntervals = [];
  for (let r = 0; r < numRings - 1; r++) {
    let dropdown = document.getElementById('expansionInterval_' + r);
    if (dropdown) {
      expansionIntervals[r] = parseInt(dropdown.value);
    }
  }
  
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

// Update expansion interval dropdowns based on current parameters
function updateExpansionIntervalControls() {
  let container = document.getElementById('expansion-intervals-container');
  if (!container) return;
  
  // Calculate cell counts for each ring
  let cellCounts = [initialCellCount];
  for (let r = 0; r < numRings - 1; r++) {
    let prevCount = cellCounts[r];
    let interval = expansionIntervals[r] || getDefaultExpansionInterval(prevCount);
    let expansionCount = Math.floor(prevCount / interval);
    cellCounts.push(prevCount + expansionCount);
  }
  
  // Generate HTML for expansion interval controls
  let html = '<div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 3px;">';
  
  for (let r = 0; r < numRings - 1; r++) {
    let prevCount = cellCounts[r];
    let divisors = getDivisors(prevCount);
    let currentValue = expansionIntervals[r] || getDefaultExpansionInterval(prevCount);
    
    html += '<div style="margin-bottom: 8px;">';
    html += '<label style="font-size: 11px; display: block; margin-bottom: 2px;">Ring ' + (r + 1) + ' → ' + (r + 2) + ' (' + prevCount + ' cells):</label>';
    html += '<select id="expansionInterval_' + r + '" style="width: 100%; padding: 3px; font-size: 11px;" onchange="onExpansionIntervalChange(' + r + ')">';
    
    // Always include interval=1 option (doubles the cell count)
    let selected1 = (1 === currentValue) ? ' selected' : '';
    let nextCount1 = prevCount + Math.floor(prevCount / 1);
    html += '<option value="1"' + selected1 + '>1 (→ ' + nextCount1 + ' cells)</option>';
    
    for (let d of divisors) {
      if (d > 1 || divisors.length === 1) { // Include divisors > 1, or include 1 if it's the only option
        let selected = (d === currentValue) ? ' selected' : '';
        let nextCount = prevCount + Math.floor(prevCount / d);
        html += '<option value="' + d + '"' + selected + '>' + d + ' (→ ' + nextCount + ' cells)</option>';
      }
    }
    
    html += '</select></div>';
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// Handle change in expansion interval dropdown
function onExpansionIntervalChange(ringIndex) {
  let dropdown = document.getElementById('expansionInterval_' + ringIndex);
  if (dropdown) {
    expansionIntervals[ringIndex] = parseInt(dropdown.value);
    
    // Recalculate subsequent rings and update their dropdowns
    let cellCounts = [initialCellCount];
    for (let r = 0; r < numRings - 1; r++) {
      let prevCount = cellCounts[r];
      let interval = expansionIntervals[r] || getDefaultExpansionInterval(prevCount);
      let expansionCount = Math.floor(prevCount / interval);
      cellCounts.push(prevCount + expansionCount);
    }
    
    // Update dropdowns for subsequent rings
    for (let r = ringIndex + 1; r < numRings - 1; r++) {
      let prevCount = cellCounts[r];
      let divisors = getDivisors(prevCount);
      let dropdown = document.getElementById('expansionInterval_' + r);
      
      if (dropdown) {
        let currentValue = parseInt(dropdown.value);
        let newValue = currentValue;
        
        // If current value is not a valid divisor (and not 1), use default
        if (currentValue !== 1 && !divisors.includes(currentValue)) {
          newValue = getDefaultExpansionInterval(prevCount);
        }
        
        // Rebuild dropdown options
        let html = '';
        
        // Always include interval=1 option first
        let selected1 = (1 === newValue) ? ' selected' : '';
        let nextCount1 = prevCount + Math.floor(prevCount / 1);
        html += '<option value="1"' + selected1 + '>1 (→ ' + nextCount1 + ' cells)</option>';
        
        for (let d of divisors) {
          if (d > 1 || divisors.length === 1) {
            let selected = (d === newValue) ? ' selected' : '';
            let nextCount = prevCount + Math.floor(prevCount / d);
            html += '<option value="' + d + '"' + selected + '>' + d + ' (→ ' + nextCount + ' cells)</option>';
          }
        }
        dropdown.innerHTML = html;
        expansionIntervals[r] = newValue;
      }
    }
  }
}

// Update controls when initial parameters change
function onInitialParametersChange() {
  initialCellCount = parseInt(document.getElementById('initialCellCount').value);
  numRings = parseInt(document.getElementById('numRings').value);
  
  // Reinitialize expansion intervals with defaults
  initializeExpansionIntervals();
  
  // Update the UI
  updateExpansionIntervalControls();
}
