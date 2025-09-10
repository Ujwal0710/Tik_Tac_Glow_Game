// Tic Tac Toe with unbeatable AI (minimax)
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const resetAllBtn = document.getElementById('resetAll');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
let cells = [];
let board = Array(9).fill(null);
let current = 'X';
let vsCpu = false;
let gameOver = false;
let scores = { X:0, O:0 };

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createGrid(){
  boardEl.innerHTML = '';
  cells = [];
  for(let i=0;i<9;i++){
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.setAttribute('data-i', i);
    cell.setAttribute('role','gridcell');
    cell.addEventListener('click', ()=>handleClick(i));
    boardEl.appendChild(cell);
    cells.push(cell);
  }
}

function handleClick(i){
  if(gameOver || board[i]) return;
  makeMove(i, current);
  if(!gameOver && vsCpu && current === 'O') return; // prevent double
  if(!gameOver && vsCpu && current === 'O') aiMove();
  if(!gameOver && vsCpu && current === 'X') {
    // after human X move, AI (O) responds
    setTimeout(()=> aiMove(), 250);
  }
}

function makeMove(i, player){
  if(gameOver || board[i]) return;
  board[i] = player;
  cells[i].textContent = player;
  cells[i].classList.add(player.toLowerCase());
  checkState();
  current = player === 'X' ? 'O' : 'X';
  updateStatus();
}

function updateStatus(){
  if(gameOver) return;
  statusEl.textContent = `${current} to move`;
}

function checkState(){
  for(const combo of wins){
    const [a,b,c] = combo;
    if(board[a] && board[a] === board[b] && board[a] === board[c]){
      // win
      gameOver = true;
      highlight(combo);
      statusEl.textContent = `${board[a]} wins!`;
      scores[board[a]] += 1;
      updateScores();
      disableRemaining();
      return;
    }
  }
  if(board.every(Boolean)){
    gameOver = true;
    statusEl.textContent = `Draw`;
  }
}

function highlight(combo){
  combo.forEach(i=>cells[i].classList.add('win'));
}

function disableRemaining(){
  cells.forEach(c=>c.classList.add('disabled'));
}

function resetBoard(){
  board = Array(9).fill(null);
  gameOver = false;
  current = 'X';
  cells.forEach(c=>{c.textContent='';c.className='cell';c.classList.remove('win')});
  updateStatus();
}

function updateScores(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
}

function aiMove(){
  if(gameOver) return;
  const best = findBestMove(board, 'O');
  if(best !== -1){
    makeMove(best, 'O');
  }
}

// Minimax implementation for Tic-Tac-Toe
function findBestMove(state, player){
  // If empty, take center
  if(state.every(s=>s===null)) return 4;
  let bestVal = -Infinity;
  let bestMove = -1;
  for(let i=0;i<9;i++){
    if(!state[i]){
      state[i]=player;
      const moveVal = minimax(state, 0, false);
      state[i]=null;
      if(moveVal>bestVal){
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function evaluate(s){
  for(const combo of wins){
    const [a,b,c] = combo;
    if(s[a] && s[a] === s[b] && s[a] === s[c]){
      return s[a] === 'O' ? 10 : -10;
    }
  }
  return 0;
}

function minimax(s, depth, isMax){
  const score = evaluate(s);
  if(score === 10) return score - depth;
  if(score === -10) return score + depth;
  if(s.every(Boolean)) return 0;

  if(isMax){
    let best = -Infinity;
    for(let i=0;i<9;i++){
      if(!s[i]){
        s[i]='O';
        best = Math.max(best, minimax(s, depth+1, false));
        s[i]=null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for(let i=0;i<9;i++){
      if(!s[i]){
        s[i]='X';
        best = Math.min(best, minimax(s, depth+1, true));
        s[i]=null;
      }
    }
    return best;
  }
}

// wire UI
createGrid();
updateStatus();

document.querySelectorAll('input[name="mode"]').forEach(r=>{
  r.addEventListener('change', e=>{
    vsCpu = e.target.value === 'cpu';
    resetBoard();
    // If CPU starts as X, let it go first (not exposed in UI now)
    if(vsCpu && current === 'O') setTimeout(()=>aiMove(),200);
  });
});

restartBtn.addEventListener('click', ()=>{
  resetBoard();
});
resetAllBtn.addEventListener('click', ()=>{
  scores = {X:0,O:0}; updateScores(); resetBoard();
});

// accessibility: allow keyboard navigation
boardEl.addEventListener('keydown', (e)=>{
  const active = document.activeElement;
  if(!active || !active.classList.contains('cell')) return;
  const i = Number(active.dataset.i);
  if(e.key === 'Enter' || e.key === ' ') handleClick(i);
});

// small enhancement: clicking cell uses player then AI responds
// The makeMove function advances the current player itself

