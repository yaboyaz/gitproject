const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const tileSize = 32;
const board = [
    // 20x20 grid where 1=wall, 0=pellet
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

let pacman = { x: 1, y: 1 };
let ghosts = [
    { x: 9, y: 9, dir: 'left' },
    { x: 10, y: 9, dir: 'right' }
];
let score = 0;
let pellets = countPellets();

function countPellets() {
    let count = 0;
    for (const row of board) {
        for (const cell of row) {
            if (cell === 0) count++;
        }
    }
    return count;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            const cell = board[y][x];
            if (cell === 1) {
                ctx.fillStyle = '#003399';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = '#000';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                if (cell === 0) {
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    // Draw Pacman
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw ghosts
    ctx.fillStyle = 'red';
    for (const g of ghosts) {
        ctx.beginPath();
        ctx.arc(g.x * tileSize + tileSize / 2, g.y * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 24);
}

function movePacman(dx, dy) {
    const nx = pacman.x + dx;
    const ny = pacman.y + dy;
    if (board[ny][nx] !== 1) {
        pacman.x = nx;
        pacman.y = ny;
        if (board[ny][nx] === 0) {
            board[ny][nx] = 2;
            score += 10;
            pellets--;
            if (pellets === 0) {
                alert('You win!');
                resetGame();
            }
        }
    }
}

function randomMoveGhost(g) {
    const dirs = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];
    const possible = dirs.filter(d => board[g.y + d.dy][g.x + d.dx] !== 1);
    const move = possible[Math.floor(Math.random() * possible.length)];
    g.x += move.dx;
    g.y += move.dy;
}

function checkCollision() {
    for (const g of ghosts) {
        if (g.x === pacman.x && g.y === pacman.y) {
            alert('Game over!');
            resetGame();
        }
    }
}

function resetGame() {
    pacman = { x: 1, y: 1 };
    ghosts = [
        { x: 9, y: 9, dir: 'left' },
        { x: 10, y: 9, dir: 'right' }
    ];
    score = 0;
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 2) board[y][x] = 0;
        }
    }
    pellets = countPellets();
}

function gameLoop() {
    moveGhosts();
    checkCollision();
    draw();
    requestAnimationFrame(gameLoop);
}

function moveGhosts() {
    for (const g of ghosts) {
        randomMoveGhost(g);
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') movePacman(-1, 0);
    else if (e.key === 'ArrowRight') movePacman(1, 0);
    else if (e.key === 'ArrowUp') movePacman(0, -1);
    else if (e.key === 'ArrowDown') movePacman(0, 1);
});

draw();
requestAnimationFrame(gameLoop);
