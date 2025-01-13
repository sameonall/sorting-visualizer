const ROWS = 20;
const COLS = 20;
let grid = [];
let start = null;
let end = null;
let isSettingStart = false;
let isSettingEnd = false;
let isSettingObstacles = false;
let isDragging = false;
let animationSpeed = 50; // Default animation speed

// Initialize the grid
function initializeGrid() {
  const gridElement = document.getElementById('grid');
  gridElement.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
  gridElement.innerHTML = '';

  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('mousedown', () => handleCellClick(row, col));
      cell.addEventListener('mouseover', () => handleCellHover(row, col));
      cell.addEventListener('dblclick', () => handleCellDoubleClick(row, col));
      gridElement.appendChild(cell);
      currentRow.push(cell);
    }
    grid.push(currentRow);
  }
}

// Handle cell click (for setting start/end)
function handleCellClick(row, col) {
  const cell = grid[row][col];
  if (isSettingStart) {
    if (start) start.classList.remove('start');
    start = cell;
    cell.classList.add('start');
    isSettingStart = false;
  } else if (isSettingEnd) {
    if (end) end.classList.remove('end');
    end = cell;
    cell.classList.add('end');
    isSettingEnd = false;
  } else if (isSettingObstacles) {
    isDragging = true;
    cell.classList.toggle('obstacle');
  }
}

// Handle cell hover (for drawing obstacles)
function handleCellHover(row, col) {
  if (isDragging && isSettingObstacles && !grid[row][col].classList.contains('start') && !grid[row][col].classList.contains('end')) {
    grid[row][col].classList.toggle('obstacle', true);
  }
}

// Handle cell double-click (for toggling obstacles)
function handleCellDoubleClick(row, col) {
  if (isSettingObstacles && !grid[row][col].classList.contains('start') && !grid[row][col].classList.contains('end')) {
    grid[row][col].classList.toggle('obstacle');
  }
}

// Event listeners for buttons
document.getElementById('startBtn').addEventListener('click', () => {
  isSettingStart = true;
  isSettingEnd = false;
  isSettingObstacles = false;
});

document.getElementById('endBtn').addEventListener('click', () => {
  isSettingEnd = true;
  isSettingStart = false;
  isSettingObstacles = false;
});

document.getElementById('obstacleBtn').addEventListener('click', () => {
  isSettingObstacles = true;
  isSettingStart = false;
  isSettingEnd = false;
});

document.getElementById('findPathBtn').addEventListener('click', findPath);
document.getElementById('resetBtn').addEventListener('click', resetGrid);

// Slider to control animation speed
document.getElementById('speedSlider').addEventListener('input', (e) => {
  animationSpeed = 210 - e.target.value; // Invert speed for intuitive slider
});

// Reset the grid
function resetGrid() {
  grid = [];
  start = null;
  end = null;
  initializeGrid();
}

// Find path based on selected algorithm
async function findPath() {
  if (!start || !end) {
    alert('Please set start and end points.');
    return;
  }

  const algorithm = document.getElementById('algorithm').value;
  switch (algorithm) {
    case 'astar':
      await aStar();
      break;
    case 'dijkstra':
      await dijkstra();
      break;
    case 'bfs':
      await bfs();
      break;
    default:
      alert('Invalid algorithm selected.');
  }
}

// A* Algorithm
async function aStar() {
  const startRow = parseInt(start.dataset.row);
  const startCol = parseInt(start.dataset.col);
  const endRow = parseInt(end.dataset.row);
  const endCol = parseInt(end.dataset.col);

  const openSet = [];
  const closedSet = new Set();

  const startNode = {
    row: startRow,
    col: startCol,
    g: 0,
    h: heuristic(startRow, startCol, endRow, endCol),
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current.row === endRow && current.col === endCol) {
      await reconstructPath(current);
      return;
    }

    closedSet.add(`${current.row},${current.col}`);

    const neighbors = getNeighbors(current.row, current.col);
    for (const neighbor of neighbors) {
      const [row, col] = neighbor;
      if (closedSet.has(`${row},${col}`) || grid[row][col].classList.contains('obstacle')) {
        continue;
      }

      const gScore = current.g + 1;
      const hScore = heuristic(row, col, endRow, endCol);
      const fScore = gScore + hScore;

      const existingNode = openSet.find((node) => node.row === row && node.col === col);
      if (!existingNode || gScore < existingNode.g) {
        const newNode = {
          row,
          col,
          g: gScore,
          h: hScore,
          f: fScore,
          parent: current,
        };
        if (!existingNode) openSet.push(newNode);
        else Object.assign(existingNode, newNode);
      }
    }

    if (current !== startNode) {
      grid[current.row][current.col].classList.add('visited');
      await sleep(animationSpeed);
    }
  }

  alert('No path found!');
}

// Dijkstra's Algorithm
async function dijkstra() {
  const startRow = parseInt(start.dataset.row);
  const startCol = parseInt(start.dataset.col);
  const endRow = parseInt(end.dataset.row);
  const endCol = parseInt(end.dataset.col);

  const distances = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
  const previous = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const visited = new Set();

  distances[startRow][startCol] = 0;
  const queue = [{ row: startRow, col: startCol, distance: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift();

    if (current.row === endRow && current.col === endCol) {
      await reconstructPath(previous[endRow][endCol]);
      return;
    }

    visited.add(`${current.row},${current.col}`);

    const neighbors = getNeighbors(current.row, current.col);
    for (const neighbor of neighbors) {
      const [row, col] = neighbor;
      if (visited.has(`${row},${col}`) || grid[row][col].classList.contains('obstacle')) {
        continue;
      }

      const newDistance = current.distance + 1;
      if (newDistance < distances[row][col]) {
        distances[row][col] = newDistance;
        previous[row][col] = current;
        queue.push({ row, col, distance: newDistance });
      }
    }

    if (current.row !== startRow || current.col !== startCol) {
      grid[current.row][current.col].classList.add('visited');
      await sleep(animationSpeed);
    }
  }

  alert('No path found!');
}

// Breadth-First Search (BFS)
async function bfs() {
  const startRow = parseInt(start.dataset.row);
  const startCol = parseInt(start.dataset.col);
  const endRow = parseInt(end.dataset.row);
  const endCol = parseInt(end.dataset.col);

  const queue = [{ row: startRow, col: startCol, parent: null }];
  const visited = new Set();
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.row === endRow && current.col === endCol) {
      await reconstructPath(current);
      return;
    }

    const neighbors = getNeighbors(current.row, current.col);
    for (const neighbor of neighbors) {
      const [row, col] = neighbor;
      if (visited.has(`${row},${col}`) || grid[row][col].classList.contains('obstacle')) {
        continue;
      }

      visited.add(`${row},${col}`);
      queue.push({ row, col, parent: current });
    }

    if (current.row !== startRow || current.col !== startCol) {
      grid[current.row][current.col].classList.add('visited');
      await sleep(animationSpeed);
    }
  }

  alert('No path found!');
}

// Heuristic function (Manhattan distance)
function heuristic(row1, col1, row2, col2) {
  return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

// Get valid neighbors
function getNeighbors(row, col) {
  const neighbors = [];
  if (row > 0) neighbors.push([row - 1, col]);
  if (row < ROWS - 1) neighbors.push([row + 1, col]);
  if (col > 0) neighbors.push([row, col - 1]);
  if (col < COLS - 1) neighbors.push([row, col + 1]);
  return neighbors;
}

// Reconstruct and animate the path
async function reconstructPath(node) {
  const path = [];
  while (node.parent) {
    path.push(node);
    node = node.parent;
  }
  path.reverse();

  // Clear visited nodes to show only the shortest path
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col].classList.contains('visited')) {
        grid[row][col].classList.remove('visited');
      }
    }
  }

  // Animate the shortest path sequentially
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    if (grid[p.row][p.col] !== start && grid[p.row][p.col] !== end) {
      grid[p.row][p.col].classList.add('path');
      await sleep(animationSpeed);
    }
  }

  // Add a final glowing effect to the path
  for (const p of path) {
    if (grid[p.row][p.col] !== start && grid[p.row][p.col] !== end) {
      grid[p.row][p.col].style.animation = 'glow 1s infinite alternate, move 0.5s ease';
    }
  }
}

// Sleep function for animation delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initialize the grid on page load
initializeGrid();

// Handle mouseup to stop dragging
document.addEventListener('mouseup', () => {
  isDragging = false;
});