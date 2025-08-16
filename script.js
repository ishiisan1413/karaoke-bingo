document.addEventListener('DOMContentLoaded', () => {
    const BINGO_SIZE = 5;
    const LUCKY_NUMBERS = [77, 88, 99]; // ★ ラッキーナンバーを定義

    // DOM要素
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const minNumInput = document.getElementById('min-num');
    const maxNumInput = document.getElementById('max-num');
    const playerCountInput = document.getElementById('player-count');
    const setPlayersButton = document.getElementById('set-players-button');
    const playerNamesContainer = document.getElementById('player-names-container');
    const startGameButton = document.getElementById('start-game-button');
    const scoreInput = document.getElementById('scoreInput');
    const submitScoreButton = document.getElementById('submitScore');
    const playersContainer = document.getElementById('players-container');
    const resetButton = document.getElementById('resetButton');
    const calledNumbersList = document.getElementById('called-numbers-list'); // ★
    const luckyModal = document.getElementById('lucky-modal'); // ★
    const closeModalButton = document.getElementById('close-modal-button'); // ★

    // ゲームデータ
    let players = [];
    let calledNumbers = []; // ★ 出現済み番号リスト

    // --- セットアップ関連 ---
    setPlayersButton.addEventListener('click', () => {
        const count = parseInt(playerCountInput.value, 10);
        if (count < 1 || count > 10) { alert('プレイヤー数は1人から10人までです。'); return; }
        playerNamesContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = `プレイヤー ${i + 1} の名前: `;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-name-input';
            input.value = `Player ${i + 1}`;
            div.appendChild(label);
            div.appendChild(input);
            playerNamesContainer.appendChild(div);
        }
        startGameButton.classList.remove('hidden');
    });

    startGameButton.addEventListener('click', () => {
        const minNum = parseInt(minNumInput.value, 10);
        const maxNum = parseInt(maxNumInput.value, 10);
        if (isNaN(minNum) || isNaN(maxNum) || minNum >= maxNum) { alert('有効な数字の範囲を入力してください。'); return; }
        if ((maxNum - minNum + 1) < 24) { alert('ビンゴカードを作成するには、少なくとも24個のユニークな数字が必要です。範囲を広げてください。'); return; }
        scoreInput.min = minNum;
        scoreInput.max = maxNum;
        calledNumbers = [];
        players = [];
        const nameInputs = document.querySelectorAll('.player-name-input');
        nameInputs.forEach((input, index) => {
            players.push({ id: index, name: input.value || `Player ${index + 1}`, card: generateCardData(minNum, maxNum), bingoCount: 0, isReach: false });
        });
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        renderAll();
    });

    // --- ゲーム中の処理 ---
    function generateCardData(min, max) {
        let card = Array(BINGO_SIZE).fill(null).map(() => Array(BINGO_SIZE).fill(null));
        const numbers = [];
        for (let i = min; i <= max; i++) { numbers.push(i); }
        for (let i = numbers.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; }
        let numberIndex = 0;
        for (let row = 0; row < BINGO_SIZE; row++) {
            for (let col = 0; col < BINGO_SIZE; col++) {
                if (row === 2 && col === 2) { card[row][col] = { number: 'FREE', marked: true }; }
                else { card[row][col] = { number: numbers[numberIndex++], marked: false }; }
            }
        }
        return card;
    }

    function renderAll() {
        renderAllPlayerCards();
        renderCalledNumbers();
    }

    function renderAllPlayerCards() {
        playersContainer.innerHTML = '';
        players.forEach(player => {
            const playerCardDiv = document.createElement('div');
            playerCardDiv.className = 'player-card';
            if (player.isReach) playerCardDiv.classList.add('reach'); // リーチならクラス追加
            const playerNameDiv = document.createElement('h3');
            playerNameDiv.className = 'player-name';
            playerNameDiv.textContent = player.name;
            if (player.isReach) playerNameDiv.classList.add('reach'); // リーチならクラス追加
            playerCardDiv.appendChild(playerNameDiv);
            const grid = document.createElement('div');
            grid.className = 'bingo-card-grid';
            player.card.forEach(rowData => {
                rowData.forEach(cellData => {
                    const cellDiv = document.createElement('div');
                    cellDiv.className = 'cell';
                    cellDiv.textContent = cellData.number;
                    if (cellData.marked) cellDiv.classList.add('marked');
                    if (cellData.number === 'FREE') { cellDiv.classList.add('free'); }
                    else { cellDiv.dataset.playerId = player.id; cellDiv.dataset.number = cellData.number; }
                    grid.appendChild(cellDiv);
                });
            });
            playerCardDiv.appendChild(grid);
            const resultP = document.createElement('p');
            resultP.className = 'bingo-result';
            if (player.bingoCount > 0) resultP.textContent = `🎉 BINGO! 🎉 (${player.bingoCount}ライン)`;
            playerCardDiv.appendChild(resultP);
            playersContainer.appendChild(playerCardDiv);
        });
    }

    function renderCalledNumbers() { // ★ 出現済み番号リストを描画
        calledNumbersList.innerHTML = '';
        calledNumbers.sort((a, b) => a - b).forEach(num => {
            const numDiv = document.createElement('div');
            numDiv.className = 'called-number';
            numDiv.textContent = num;
            calledNumbersList.appendChild(numDiv);
        });
    }

    function handleCellClick(event) {
        const cell = event.target;
        if (!cell.classList.contains('cell') || !cell.dataset.playerId) return;
        const playerId = parseInt(cell.dataset.playerId, 10);
        const number = parseInt(cell.dataset.number, 10);
        const player = players.find(p => p.id === playerId);
        if (player && !cell.classList.contains('marked')) {
            markNumberForAllPlayers(number);
        }
    }

    submitScoreButton.addEventListener('click', () => {
        const score = parseInt(scoreInput.value, 10);
        const min = parseInt(scoreInput.min, 10);
        const max = parseInt(scoreInput.max, 10);
        if (!score || score < min || score > max) { alert(`${min}から${max}までの有効な数字を入力してください。`); return; }
        if (calledNumbers.includes(score)) { alert('その番号は既に出ています。'); return; }
        markNumberForAllPlayers(score);
        scoreInput.value = '';
    });
    scoreInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitScoreButton.click(); });

    function markNumberForAllPlayers(score) {
        calledNumbers.push(score);
        if (LUCKY_NUMBERS.includes(score)) { luckyModal.classList.remove('hidden'); } // ★ ラッキーナンバー判定
        players.forEach(player => {
            const prevBingoCount = player.bingoCount;
            player.card.forEach(row => row.forEach(cell => { if (cell.number == score) cell.marked = true; }));
            updatePlayerStatus(player);
            if (player.bingoCount > prevBingoCount) { confetti(); } // ★ BINGO演出
        });
        renderAll();
    }

    function updatePlayerStatus(player) { // ビンゴとリーチをチェック
        const card = player.card;
        let bingoCount = 0;
        let reachLines = 0;
        const lines = [];
        // 横・縦のライン
        for (let i = 0; i < BINGO_SIZE; i++) { lines.push(card[i]); lines.push(card.map(row => row[i])); }
        // 斜めのライン
        lines.push(card.map((row, i) => row[i])); lines.push(card.map((row, i) => row[BINGO_SIZE - 1 - i]));
        lines.forEach(line => {
            const unmarkedCount = line.filter(cell => !cell.marked).length;
            if (unmarkedCount === 0) bingoCount++;
            if (unmarkedCount === 1) reachLines++; // ★ リーチ判定
        });
        player.bingoCount = bingoCount;
        player.isReach = bingoCount === 0 && reachLines > 0;
    }

    // --- イベントリスナー ---
    resetButton.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        playerNamesContainer.innerHTML = '';
        startGameButton.classList.add('hidden');
        playerCountInput.value = '1';
    });
    playersContainer.addEventListener('click', handleCellClick);
    closeModalButton.addEventListener('click', () => luckyModal.classList.add('hidden'));
});
