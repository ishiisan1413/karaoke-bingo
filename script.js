document.addEventListener('DOMContentLoaded', () => {
    const BINGO_SIZE = 5;
    const OTHER_LUCKY_NUMBERS = [77, 88, 99]; // ゾロ目などのラッキーナンバー

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
    const calledNumbersList = document.getElementById('called-numbers-list');
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalLuckyNumber = document.getElementById('modal-lucky-number');
    const closeModalButton = document.getElementById('close-modal-button');

    // ゲームデータ
    let players = [];
    let calledNumbers = [];
    let todaysLuckyNumber = 0; // ★ 本日のラッキーナンバー
    let isTodaysLuckyNumberCalled = false; // ★ 既に出たかどうかのフラグ

    // ★ 日付からその日のラッキーナンバーを決定する関数
    function generateTodaysLuckyNumber() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        // 擬似乱数生成（単純なXorshift）
        let x = seed;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        // 80〜92の範囲にマッピング
        const range = 92 - 80 + 1;
        return (x & 0x7FFFFFFF) % range + 80;
    }

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
        if ((maxNum - minNum + 1) < 24) { alert('ビンゴカードを作成するには、少なくとも24個のユニークな数字が必要です。'); return; }
        
        // ★ ゲーム開始時にラッキーナンバーを決定＆表示
        todaysLuckyNumber = generateTodaysLuckyNumber();
        isTodaysLuckyNumberCalled = false;
        showModal('本日のラッキーナンバーは...', '', todaysLuckyNumber);

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
    
    // ★ モーダル表示を制御する関数
    function showModal(title, message, luckyNumber = null) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        if (luckyNumber) {
            modalLuckyNumber.textContent = luckyNumber;
            modalLuckyNumber.classList.remove('hidden');
        } else {
            modalLuckyNumber.classList.add('hidden');
        }
        modalContainer.classList.remove('hidden');
    }

    // --- ゲーム中の処理 ---
    function generateCardData(min, max) { /* (変更なし) */
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

    function renderAll() { /* (変更なし) */
        renderAllPlayerCards();
        renderCalledNumbers();
    }
    
    function renderAllPlayerCards() { /* (変更なし) */
        playersContainer.innerHTML = '';
        players.forEach(player => {
            const playerCardDiv = document.createElement('div');
            playerCardDiv.className = 'player-card';
            if (player.isReach) playerCardDiv.classList.add('reach');
            const playerNameDiv = document.createElement('h3');
            playerNameDiv.className = 'player-name';
            playerNameDiv.textContent = player.name;
            if (player.isReach) playerNameDiv.classList.add('reach');
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

    function renderCalledNumbers() { /* (変更なし) */
        calledNumbersList.innerHTML = '';
        calledNumbers.sort((a, b) => a - b).forEach(num => {
            const numDiv = document.createElement('div');
            numDiv.className = 'called-number';
            numDiv.textContent = num;
            calledNumbersList.appendChild(numDiv);
        });
    }

    function handleCellClick(event) { /* (変更なし) */
        const cell = event.target;
        if (!cell.classList.contains('cell') || !cell.dataset.playerId) return;
        const number = parseInt(cell.dataset.number, 10);
        if (calledNumbers.includes(number)) return; // 既に出ている番号はクリックで追加しない
        markNumberForAllPlayers(number);
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

    function markNumberForAllPlayers(score) {
        calledNumbers.push(score);

        // ★ ラッキーナンバー判定
        if (score === todaysLuckyNumber && !isTodaysLuckyNumberCalled) {
            isTodaysLuckyNumberCalled = true;
            showModal('おめでとうございます！', '本日のラッキーナンバーが出ました！ママから特別なサービスがあるかも...？', score);
        } else if (OTHER_LUCKY_NUMBERS.includes(score)) {
            showModal('🎉 ラッキーナンバー！ 🎉', 'ゾロ目が出ました！何か良いことがあるかも！');
        }

        players.forEach(player => {
            const prevBingoCount = player.bingoCount;
            player.card.forEach(row => row.forEach(cell => { if (cell.number == score) cell.marked = true; }));
            updatePlayerStatus(player);
            if (player.bingoCount > prevBingoCount) { confetti(); }
        });
        renderAll();
    }
    
    function updatePlayerStatus(player) { /* (変更なし) */
        const card = player.card;
        let bingoCount = 0, reachLines = 0;
        const lines = [];
        for (let i = 0; i < BINGO_SIZE; i++) { lines.push(card[i]); lines.push(card.map(row => row[i])); }
        lines.push(card.map((row, i) => row[i])); lines.push(card.map((row, i) => row[BINGO_SIZE - 1 - i]));
        lines.forEach(line => {
            const unmarkedCount = line.filter(cell => !cell.marked).length;
            if (unmarkedCount === 0) bingoCount++;
            if (unmarkedCount === 1) reachLines++;
        });
        player.bingoCount = bingoCount;
        player.isReach = bingoCount === 0 && reachLines > 0;
    }

    // --- イベントリスナー (変更なし) ---
    resetButton.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        playerNamesContainer.innerHTML = '';
        startGameButton.classList.add('hidden');
        playerCountInput.value = '1';
    });
    playersContainer.addEventListener('click', handleCellClick);
    closeModalButton.addEventListener('click', () => modalContainer.classList.add('hidden'));
    scoreInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitScoreButton.click(); });
});
