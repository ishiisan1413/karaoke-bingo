document.addEventListener('DOMContentLoaded', () => {
    // 定数
    const BINGO_SIZE = 5;

    // DOM要素
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const minNumInput = document.getElementById('min-num'); // ★ 変更点
    const maxNumInput = document.getElementById('max-num'); // ★ 変更点
    const playerCountInput = document.getElementById('player-count');
    const setPlayersButton = document.getElementById('set-players-button');
    const playerNamesContainer = document.getElementById('player-names-container');
    const startGameButton = document.getElementById('start-game-button');
    const scoreInput = document.getElementById('scoreInput');
    const submitScoreButton = document.getElementById('submitScore');
    const playersContainer = document.getElementById('players-container');
    const resetButton = document.getElementById('resetButton');

    // プレイヤーデータ
    let players = [];

    // --- セットアップ関連の処理 ---

    // プレイヤー数に応じて名前入力欄を生成
    setPlayersButton.addEventListener('click', () => {
        const count = parseInt(playerCountInput.value, 10);
        if (count < 1 || count > 10) {
            alert('プレイヤー数は1人から10人までです。');
            return;
        }
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

    // ゲーム開始処理
    startGameButton.addEventListener('click', () => {
        // ★ 変更点: HTMLから範囲を取得
        const minNum = parseInt(minNumInput.value, 10);
        const maxNum = parseInt(maxNumInput.value, 10);

        // ★ 変更点: 範囲の妥当性チェック
        if (isNaN(minNum) || isNaN(maxNum) || minNum >= maxNum) {
            alert('有効な数字の範囲を入力してください。');
            return;
        }
        if ((maxNum - minNum + 1) < 24) {
            alert('ビンゴカードを作成するには、少なくとも24個のユニークな数字が必要です。範囲を広げてください。');
            return;
        }
        
        // ゲーム画面の入力欄に範囲を設定
        scoreInput.min = minNum;
        scoreInput.max = maxNum;

        players = [];
        const nameInputs = document.querySelectorAll('.player-name-input');
        nameInputs.forEach((input, index) => {
            players.push({
                id: index,
                name: input.value || `Player ${index + 1}`,
                card: generateCardData(minNum, maxNum), // ★ 変更点
                bingoCount: 0
            });
        });

        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        renderAllPlayerCards();
    });

    // --- ゲーム中の処理 ---

    // ビンゴカードのデータ構造を生成（DOM操作はしない）
    function generateCardData(min, max) { // ★ 変更点: 引数を受け取る
        let card = Array(BINGO_SIZE).fill(null).map(() => Array(BINGO_SIZE).fill(null));
        const numbers = [];
        for (let i = min; i <= max; i++) { // ★ 変更点
            numbers.push(i);
        }
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        let numberIndex = 0;
        for (let row = 0; row < BINGO_SIZE; row++) {
            for (let col = 0; col < BINGO_SIZE; col++) {
                if (row === 2 && col === 2) {
                    card[row][col] = { number: 'FREE', marked: true };
                } else {
                    card[row][col] = { number: numbers[numberIndex++], marked: false };
                }
            }
        }
        return card;
    }

    // 全プレイヤーのカードを描画
    function renderAllPlayerCards() {
        playersContainer.innerHTML = '';
        players.forEach(player => {
            const playerCardDiv = document.createElement('div');
            playerCardDiv.className = 'player-card';
            playerCardDiv.innerHTML = `
                <h3 class="player-name">${player.name}</h3>
                <div class="bingo-card-grid" id="card-${player.id}"></div>
                <p class="bingo-result" id="result-${player.id}"></p>
            `;
            playersContainer.appendChild(playerCardDiv);

            const grid = document.getElementById(`card-${player.id}`);
            player.card.forEach(rowData => {
                rowData.forEach(cellData => {
                    const cellDiv = document.createElement('div');
                    cellDiv.className = 'cell';
                    cellDiv.textContent = cellData.number;
                    if (cellData.marked) {
                        cellDiv.classList.add('marked');
                    }
                    if (cellData.number === 'FREE') {
                        cellDiv.classList.add('free');
                    }
                    grid.appendChild(cellDiv);
                });
            });
            updateBingoStatus(player);
        });
    }

    // 数字入力の処理
    submitScoreButton.addEventListener('click', () => {
        const score = parseInt(scoreInput.value, 10);
        // ★ 変更点: 動的に設定された範囲でバリデーション
        const min = parseInt(scoreInput.min, 10);
        const max = parseInt(scoreInput.max, 10);
        if (!score || score < min || score > max) {
            alert(`${min}から${max}までの有効な数字を入力してください。`);
            return;
        }
        markNumberForAllPlayers(score);
        scoreInput.value = '';
    });
     scoreInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitScoreButton.click();
        }
    });

    // 全プレイヤーのカードで数字をマーク
    function markNumberForAllPlayers(score) {
        players.forEach(player => {
            player.card.forEach(rowData => {
                rowData.forEach(cellData => {
                    if (cellData.number == score) {
                        cellData.marked = true;
                    }
                });
            });
            checkBingo(player);
        });
        renderAllPlayerCards();
    }

    // 特定のプレイヤーのビンゴをチェック
    function checkBingo(player) {
        let count = 0;
        const card = player.card;
        // 横
        for (let row = 0; row < BINGO_SIZE; row++) {
            if (card[row].every(cell => cell.marked)) count++;
        }
        // 縦
        for (let col = 0; col < BINGO_SIZE; col++) {
            if (card.every(row => row[col].marked)) count++;
        }
        // 斜め
        if (Array.from({ length: BINGO_SIZE }, (_, i) => card[i][i]).every(cell => cell.marked)) count++;
        if (Array.from({ length: BINGO_SIZE }, (_, i) => card[i][BINGO_SIZE - 1 - i]).every(cell => cell.marked)) count++;
        
        player.bingoCount = count;
    }

    // ビンゴステータスメッセージを更新
    function updateBingoStatus(player) {
        const resultEl = document.getElementById(`result-${player.id}`);
        if (player.bingoCount > 0) {
            resultEl.textContent = `🎉 BINGO! 🎉 (${player.bingoCount}ライン)`;
        } else {
            resultEl.textContent = '';
        }
    }
    
    // リセット処理
    resetButton.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        playerNamesContainer.innerHTML = '';
        startGameButton.classList.add('hidden');
        playerCountInput.value = '1';
    });
});
