const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const btnGenerate = document.getElementById('generateBtn');
const diffBtns = document.querySelectorAll('.diff-btn');
const statusText = document.getElementById('statusText');

let gridSize = 10;
let cellSize;
let grid = [];
let frog = { x: 0, y: 0 };
let snail = { x: 0, y: 0 };
let isGameOver = false;

// Game Config
const WALL_COLOR = '#1e293b';
const PATH_COLOR = '#f43f5e';
const VISITED_COLOR = 'rgba(59, 130, 246, 0.4)';

function init() {
    canvas.width = 600;
    canvas.height = 600;
    
    diffBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            diffBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gridSize = parseInt(e.target.dataset.size);
            generateMaze();
        });
    });

    btnGenerate.addEventListener('click', generateMaze);
    window.addEventListener('keydown', handleInput);

    // Initial load
    generateMaze();
}

function generateMaze() {
    isGameOver = false;
    statusText.innerText = "Generating maze...";

    cellSize = canvas.width / gridSize;
    
    // Initialize grid
    grid = [];
    for (let x = 0; x < gridSize; x++) {
        let col = [];
        for (let y = 0; y < gridSize; y++) {
            col.push({ x, y, walls: { t: true, r: true, b: true, l: true }, visited: false, visitedPlayer: false });
        }
        grid.push(col);
    }

    // Recursive Backtracker algorithm
    let stack = [];
    let current = grid[0][0];
    current.visited = true;

    let visitedCount = 1;
    const totalCells = gridSize * gridSize;

    while (visitedCount < totalCells) {
        let neighbors = getUnvisitedNeighbors(current);
        
        if (neighbors.length > 0) {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);
            removeWalls(current, next);
            current = next;
            current.visited = true;
            visitedCount++;
        } else if (stack.length > 0) {
            current = stack.pop();
        }
    }

    // Place entities
    frog = { x: 0, y: 0 };
    snail = { x: gridSize - 1, y: gridSize - 1 };
    grid[0][0].visitedPlayer = true;

    statusText.innerText = "Maze generated! Use Arrow Keys or WASD to catch the snail!";
    
    draw();
}

function getUnvisitedNeighbors(cell) {
    let neighbors = [];
    let x = cell.x;
    let y = cell.y;

    if (y > 0 && !grid[x][y-1].visited) neighbors.push(grid[x][y-1]); // Top
    if (x < gridSize - 1 && !grid[x+1][y].visited) neighbors.push(grid[x+1][y]); // Right
    if (y < gridSize - 1 && !grid[x][y+1].visited) neighbors.push(grid[x][y+1]); // Bottom
    if (x > 0 && !grid[x-1][y].visited) neighbors.push(grid[x-1][y]); // Left

    return neighbors;
}

function removeWalls(a, b) {
    let x = a.x - b.x;
    if (x === 1) { a.walls.l = false; b.walls.r = false; }
    else if (x === -1) { a.walls.r = false; b.walls.l = false; }
    
    let y = a.y - b.y;
    if (y === 1) { a.walls.t = false; b.walls.b = false; }
    else if (y === -1) { a.walls.b = false; b.walls.t = false; }
}

function handleInput(e) {
    if (isGameOver) return;

    let moved = false;
    let currentCell = grid[frog.x][frog.y];

    if (['ArrowUp', 'w', 'W'].includes(e.key)) {
        if (!currentCell.walls.t) {
            frog.y--;
            moved = true;
        }
        e.preventDefault();
    } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        if (!currentCell.walls.r) {
            frog.x++;
            moved = true;
        }
        e.preventDefault();
    } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
        if (!currentCell.walls.b) {
            frog.y++;
            moved = true;
        }
        e.preventDefault();
    } else if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        if (!currentCell.walls.l) {
            frog.x--;
            moved = true;
        }
        e.preventDefault();
    }

    if (moved) {
        grid[frog.x][frog.y].visitedPlayer = true;
        draw();

        if (frog.x === snail.x && frog.y === snail.y) {
            isGameOver = true;
            statusText.innerText = "🎉 Snail caught! You win! 🎉";
        }
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // Draw cells
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            let cell = grid[x][y];
            let px = x * cellSize;
            let py = y * cellSize;

            if (cell.visitedPlayer) {
                ctx.fillStyle = VISITED_COLOR;
                ctx.fillRect(px, py, cellSize, cellSize);
            }
            
            // Draw walls
            ctx.strokeStyle = WALL_COLOR;
            ctx.beginPath();
            if (cell.walls.t) { ctx.moveTo(px, py); ctx.lineTo(px + cellSize, py); }
            if (cell.walls.r) { ctx.moveTo(px + cellSize, py); ctx.lineTo(px + cellSize, py + cellSize); }
            if (cell.walls.b) { ctx.moveTo(px + cellSize, py + cellSize); ctx.lineTo(px, py + cellSize); }
            if (cell.walls.l) { ctx.moveTo(px, py + cellSize); ctx.lineTo(px, py); }
            ctx.stroke();
        }
    }

    // Draw Frog
    ctx.font = `${cellSize * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐸', frog.x * cellSize + cellSize / 2, frog.y * cellSize + cellSize / 2);

    // Draw Snail
    ctx.fillText('🐌', snail.x * cellSize + cellSize / 2, snail.y * cellSize + cellSize / 2);
}

// Start
init();