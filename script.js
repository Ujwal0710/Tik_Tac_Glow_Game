// Tic Tac Toe with unbeatable AI (minimax)
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const resetAllBtn = document.getElementById('resetAll');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const startModal = document.getElementById('startModal');
const startBtn = document.getElementById('startBtn');
const cpuOptionsEl = document.getElementById('cpuOptions');
const cpuDifficultyEl = document.getElementById('cpuDifficulty');
let cells = [];
let board = Array(9).fill(null);
let current = 'X';
let vsCpu = false;
let gameOver = false;
let scores = { X:0, O:0 };
let cpuSide = 'O';
let cpuDifficulty = 'unbeatable';
let onlineMode = false;
let pc = null;
let dataChannel = null;
let isHost = false; // creator of offer

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
  // Player move
  makeMove(i, current);
  // If playing vs CPU and game continues, and it's CPU's turn, let AI respond
  if(vsCpu && !gameOver && current === cpuSide){
    setTimeout(()=> aiMove(), 220);
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
  const aiPlayer = cpuSide;
  const human = aiPlayer === 'X' ? 'O' : 'X';
  let move = -1;
  if(cpuDifficulty === 'unbeatable'){
    move = findBestMove(board, aiPlayer);
  } else {
    // smart heuristic: win if possible, block if necessary, take center, else random best
    move = heuristicMove(board, aiPlayer, human);
  }
  if(move !== -1) makeMove(move, aiPlayer);
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

// Heuristic AI for "smart" difficulty
function heuristicMove(state, ai, human){
  // 1) Win immediately
  for(let i=0;i<9;i++){
    if(!state[i]){ state[i]=ai; if(evaluate(state)===10){ state[i]=null; return i } state[i]=null }
  }
  // 2) Block opponent win
  for(let i=0;i<9;i++){
    if(!state[i]){ state[i]=human; if(evaluate(state)===-10){ state[i]=null; return i } state[i]=null }
  }
  // 3) Take center
  if(!state[4]) return 4;
  // 4) Take a corner
  const corners = [0,2,6,8].filter(i=>!state[i]);
  if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
  // 5) Fallback: any side
  const sides = [1,3,5,7].filter(i=>!state[i]);
  if(sides.length) return sides[Math.floor(Math.random()*sides.length)];
  return -1;
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

// Start modal logic
function showStart(){
  if(startModal) startModal.style.display = 'flex';
}
function hideStart(){ if(startModal) startModal.style.display = 'none'; }

document.querySelectorAll('input[name="startMode"]').forEach(r=> r.addEventListener('change', e=>{
  const v = e.target.value;
  cpuOptionsEl.style.display = v === 'cpu' ? 'block' : 'none';
}));

document.querySelectorAll('input[name="cpuSide"]').forEach(r=> r.addEventListener('change', e=> cpuSide = e.target.value));
cpuDifficultyEl.addEventListener('change', e=> cpuDifficulty = e.target.value);

startBtn.addEventListener('click', ()=>{
  const mode = document.querySelector('input[name="startMode"]:checked').value;
  vsCpu = mode === 'cpu';
  onlineMode = mode === 'online';
  // if cpu side is auto, pick side probabilistically (or based on random)
  const autoSide = document.querySelector('input[name="cpuSide"][value="auto"]');
  if(autoSide && autoSide.checked){ cpuSide = Math.random() < 0.5 ? 'X' : 'O'; }
  // apply difficulty
  cpuDifficulty = cpuDifficultyEl.value;
  hideStart();
  resetBoard();
  updateStatus();
  // If CPU is X and starts, let it play first
  if(vsCpu && cpuSide === 'X'){
    setTimeout(()=> aiMove(), 250);
  }
  // For online mode we keep a simple placeholder — the user can share board state manually
  if(onlineMode){
    setupOnlineUI();
  }
});

// small convenience: keep the small mode radios in sync with modal selections
document.querySelectorAll('input[name="mode"]').forEach(r=>{
  r.addEventListener('change', e=>{
    const val = e.target.value;
    if(val === 'cpu' && !vsCpu){
      // open modal to configure CPU options
      showStart();
    } else if(val === 'pvp'){
      vsCpu = false;
    }
  });
});

// --- Online / WebRTC (manual signaling) ---
const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const signalOut = document.getElementById('signalOut');
const signalIn = document.getElementById('signalIn');
const createAnswerBtn = document.getElementById('createAnswer');
const applyAnswerBtn = document.getElementById('applyAnswer');
const onlinePanel = document.getElementById('onlinePanel');

function setupOnlineUI(){
  if(onlinePanel) onlinePanel.style.display = 'block';
}

function initPeer(){
  pc = new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
  pc.onicecandidate = e=>{
    if(e.candidate) return; // wait until gathering done; we will use full SDP
  };
  pc.ondatachannel = ev=>{
    dataChannel = ev.channel;
    setupDC();
  };
}

function setupDC(){
  if(!dataChannel) return;
  dataChannel.onopen = ()=>{
    statusEl.textContent = 'Online: connected';
    // when connected, hide start and start local play
    hideStart();
  };
  dataChannel.onmessage = evt=>{
    try{
      const msg = JSON.parse(evt.data);
      if(msg.type === 'move'){
        // remote made a move — apply it if valid
        if(!board[msg.pos] && !gameOver){
          makeMove(msg.pos, msg.player);
        }
      } else if(msg.type === 'reset'){
        resetBoard();
      }
    }catch(e){console.warn('Bad message', e)}
  };
}

createRoomBtn && createRoomBtn.addEventListener('click', async ()=>{
  isHost = true;
  initPeer();
  dataChannel = pc.createDataChannel('tictac');
  setupDC();
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  // wait a short moment for ICE, then export SDP
  setTimeout(()=>{
    signalOut.value = JSON.stringify(pc.localDescription);
  }, 500);
});

joinRoomBtn && joinRoomBtn.addEventListener('click', ()=>{
  // user will paste an offer into signalIn and then click createAnswer
  alert('Paste the remote offer into the "Paste remote offer/answer here" box, then click "Create Answer".');
});

createAnswerBtn && createAnswerBtn.addEventListener('click', async ()=>{
  // create answer after pasting offer
  try{
    const offer = JSON.parse(signalIn.value);
    initPeer();
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    // output answer to copy back to host
    setTimeout(()=> signalOut.value = JSON.stringify(pc.localDescription), 300);
  }catch(e){ alert('Invalid offer pasted.'); }
});

applyAnswerBtn && applyAnswerBtn.addEventListener('click', async ()=>{
  // host pastes answer here to finish setup
  try{
    const answer = JSON.parse(signalIn.value);
    if(!pc) initPeer();
    await pc.setRemoteDescription(answer);
    statusEl.textContent = 'Online: connected (peer)';
    hideStart();
  }catch(e){ alert('Invalid answer pasted.'); }
});

// share / copy / QR helpers
const copyOutBtn = document.getElementById('copyOut');
const copyInBtn = document.getElementById('copyIn');
const genLinkBtn = document.getElementById('genLink');
const showQRBtn = document.getElementById('showQR');
const shareLinkInput = document.getElementById('shareLink');
const qrWrap = document.getElementById('qrWrap');
const qrImg = document.getElementById('qrImg');

// helper to create a share link that embeds the SDP in the hash (base64)
function makeShareLink(sdp){
  try{
    const b = btoa(unescape(encodeURIComponent(sdp)));
    return location.origin + location.pathname + '#s=' + b;
  }catch(e){ return ''; }
}

// populate share link when offer/answer is generated
function populateShare(sdp){
  if(!sdp) return;
  try{ shareLinkInput.value = makeShareLink(sdp); }catch(e){}
}

// copy / gen handlers
copyOutBtn && copyOutBtn.addEventListener('click', ()=>{
  if(signalOut.value){ navigator.clipboard.writeText(signalOut.value); alert('Copied offer/answer to clipboard'); }
});
copyInBtn && copyInBtn.addEventListener('click', ()=>{
  if(signalIn.value){ navigator.clipboard.writeText(signalIn.value); alert('Copied remote text to clipboard'); }
});
genLinkBtn && genLinkBtn.addEventListener('click', ()=>{
  if(!signalOut.value){ alert('Create an offer/answer first'); return; }
  const link = makeShareLink(signalOut.value);
  shareLinkInput.value = link;
  navigator.clipboard.writeText(link);
  alert('Share link copied to clipboard');
});
showQRBtn && showQRBtn.addEventListener('click', ()=>{
  const link = shareLinkInput.value || makeShareLink(signalOut.value || '');
  if(!link){ alert('Nothing to show yet'); return; }
  const src = 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent(link);
  if(qrImg) { qrImg.src = src; qrWrap.style.display = 'block'; }
});

// ensure shareLink is updated when offers/answers are produced
const oldSetSignalOut = () => {};

// update share link after offer/answer text is set in the UI
// Patch: we update in the points where signalOut is set earlier via timeouts.

// Auto-apply hash-based SDP if page opened with a link
window.addEventListener('load', ()=>{
  const h = location.hash;
  if(h && h.startsWith('#s=')){
    try{
      const b64 = h.slice(3);
      const sdp = decodeURIComponent(escape(atob(b64)));
      // show modal and populate signalIn
      signalIn.value = sdp;
      showStart();
      document.querySelector('input[name="startMode"][value="online"]').checked = true;
      onlineMode = true; setupOnlineUI();
      alert('Offer detected in link. Paste it into the bottom box and click Create Answer to connect.');
    }catch(e){ console.warn('Invalid hash SDP', e); }
  }
});

// send move over channel when playing online
const oldMakeMove = makeMove;
makeMove = function(i, player){
  oldMakeMove(i, player);
  if(onlineMode && dataChannel && dataChannel.readyState === 'open'){
    dataChannel.send(JSON.stringify({type:'move', pos:i, player}));
  }
};


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