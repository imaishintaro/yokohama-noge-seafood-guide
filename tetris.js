// テトリスゲームのコード
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.tetris-grid');
  const scoreDisplay = document.querySelector('#score');
  const startBtn = document.querySelector('#start-button');
  const width = 10;
  const height = 20;
  let squares = [];
  let currentPosition = 4;
  let currentRotation = 0;
  let timerId;
  let score = 0;
  let isGameOver = false;
  
  // テトロミノの形
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ];
  
  const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
  ];
  
  const tTetromino = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
  ];
  
  const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
  ];
  
  const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
  ];
  
  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
  
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let currentTetromino = theTetrominoes[random][currentRotation];
  
  // グリッドを作成
  function createGrid() {
    // メインのグリッド
    for (let i = 0; i < height * width; i++) {
      const square = document.createElement('div');
      square.classList.add('tetris-square');
      grid.appendChild(square);
      squares.push(square);
    }
    
    // 下部の境界線を追加
    for (let i = 0; i < width; i++) {
      const square = document.createElement('div');
      square.classList.add('boundary');
      grid.appendChild(square);
      squares.push(square);
    }
  }
  
  createGrid();
  
  // テトロミノを描画
  function draw() {
    currentTetromino.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino');
    });
  }
  
  // テトロミノを消す
  function undraw() {
    currentTetromino.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino');
    });
  }
  
  // テトロミノを下に移動
  function moveDown() {
    if (!isGameOver) {
      undraw();
      currentPosition += width;
      draw();
      freeze();
    }
  }
  
  // 凍結機能（底または他のテトロミノに触れた時）
  function freeze() {
    // 下部の境界線または別のテトロミノの上に着地したかをチェック
    if (currentTetromino.some(index => squares[currentPosition + index + width].classList.contains('boundary') || 
        squares[currentPosition + index + width].classList.contains('taken'))) {
      // 現在のテトロミノを位置に固定
      currentTetromino.forEach(index => squares[currentPosition + index].classList.add('taken'));
      
      // 新しいテトロミノを開始
      random = Math.floor(Math.random() * theTetrominoes.length);
      currentRotation = 0;
      currentTetromino = theTetrominoes[random][currentRotation];
      currentPosition = 4;
      
      // ゲームオーバーチェック
      if (currentTetromino.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        isGameOver = true;
        clearInterval(timerId);
        scoreDisplay.textContent = 'GAME OVER - ' + score;
        return;
      }
      
      draw();
      checkForLines();
    }
  }
  
  // 左に移動、ただし端に達した場合は移動しない
  function moveLeft() {
    if (!isGameOver) {
      undraw();
      const isAtLeftEdge = currentTetromino.some(index => (currentPosition + index) % width === 0);
      
      if (!isAtLeftEdge) currentPosition -= 1;
      
      // もし移動先に既に別のテトロミノがある場合は元の位置に戻す
      if (currentTetromino.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition += 1;
      }
      
      draw();
    }
  }
  
  // 右に移動、ただし端に達した場合は移動しない
  function moveRight() {
    if (!isGameOver) {
      undraw();
      const isAtRightEdge = currentTetromino.some(index => (currentPosition + index) % width === width - 1);
      
      if (!isAtRightEdge) currentPosition += 1;
      
      // もし移動先に既に別のテトロミノがある場合は元の位置に戻す
      if (currentTetromino.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition -= 1;
      }
      
      draw();
    }
  }
  
  // テトロミノを回転
  function rotate() {
    if (!isGameOver) {
      undraw();
      currentRotation++;
      // 回転が4に達したら0に戻す
      if (currentRotation === 4) {
        currentRotation = 0;
      }
      currentTetromino = theTetrominoes[random][currentRotation];
      
      // 回転後の位置が有効かチェック
      const isAtRightEdge = currentTetromino.some(index => (currentPosition + index) % width === width - 1);
      const isAtLeftEdge = currentTetromino.some(index => (currentPosition + index) % width === 0);
      const isTaken = currentTetromino.some(index => squares[currentPosition + index].classList.contains('taken'));
      
      // 回転が無効な場合は元に戻す
      if ((isAtRightEdge && isAtLeftEdge) || isTaken) {
        currentRotation--;
        if (currentRotation === -1) {
          currentRotation = 3;
        }
        currentTetromino = theTetrominoes[random][currentRotation];
      }
      
      draw();
    }
  }
  
  // キーボード操作の割り当て
  function control(e) {
    if (e.keyCode === 37) { // 左矢印
      moveLeft();
    } else if (e.keyCode === 38) { // 上矢印
      rotate();
    } else if (e.keyCode === 39) { // 右矢印
      moveRight();
    } else if (e.keyCode === 40) { // 下矢印
      moveDown();
    }
  }
  
  document.addEventListener('keydown', control);
  
  // ゲームスタート／一時停止
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      startBtn.textContent = 'Start';
    } else {
      if (isGameOver) {
        // ゲームをリセット
        squares.forEach(square => {
          square.classList.remove('tetromino', 'taken');
        });
        score = 0;
        scoreDisplay.textContent = score;
        isGameOver = false;
        random = Math.floor(Math.random() * theTetrominoes.length);
        currentRotation = 0;
        currentTetromino = theTetrominoes[random][currentRotation];
        currentPosition = 4;
      }
      draw();
      timerId = setInterval(moveDown, 500);
      startBtn.textContent = 'Pause';
    }
  });
  
  // 完成した行をチェックして削除
  function checkForLines() {
    for (let i = 0; i < height * width; i += width) {
      const row = Array.from({length: width}, (_, j) => i + j);
      const isRowComplete = row.every(index => squares[index].classList.contains('taken') || 
                                           squares[index].classList.contains('tetromino'));
      
      if (isRowComplete) {
        score += 10;
        scoreDisplay.textContent = score;
        
        row.forEach(index => {
          squares[index].classList.remove('taken', 'tetromino');
        });
        
        // 上の行を下に落とす
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
      }
    }
  }
  
  // モバイル向けコントロールボタン
  document.getElementById('left-btn').addEventListener('click', moveLeft);
  document.getElementById('right-btn').addEventListener('click', moveRight);
  document.getElementById('rotate-btn').addEventListener('click', rotate);
  document.getElementById('down-btn').addEventListener('click', moveDown);
});
