document.addEventListener('DOMContentLoaded', () => {
    const BINGO_SIZE = 5;
    const OTHER_LUCKY_NUMBERS = [77, 88, 99];
    const HINT_WORDS = [
        '愛', '夏', '友情', '90年代', 'アニメソング', '失恋', '旅立ち',
        '盛り上がる曲', '泣ける曲', 'デュエット曲', '最新ヒット', '昭和の名曲',
        '春', '秋', '冬', '空', '夢', '星', '海', '桜', 'ありがとう', 'アイドルソング'
    ];
    const AVATARS = ['🎤', '🍺', '👑', '✨', '🕺', '💃', '⭐', '❤️', '😎', '🤠'];

    // DOM要素 (変更なし)
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
    const hintWord = document.getElementById('hint-word');
    const newHintButton = document.getElementById('new-hint-button');

    // ゲームデータ
    let players = [];
    let calledNumbers = [];
    let todaysLuckyNumber = 0;
    let isTodaysLuckyNumberCalled = false;
    let currentHint = '';

    function generateTodaysLuckyNumber() { /* (変更なし) */ }

    // --- セットアップ関連 ---
    setPlayersButton.addEventListener('click', () => {
        const count = parseInt(playerCountInput.value, 10);
        if (count < 1 || count > 10) { alert('プレイヤー数は1人から10人までです。'); return; }
        playerNamesContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'player-input-group';

            const avatarSelect = document.createElement('select');
            avatarSelect.className = 'avatar-input';
            AVATARS.forEach(avatar => {
                const option = document.createElement('option');
                option.value = avatar;
                option.textContent = avatar;
                avatarSelect.appendChild(option);
            });
            avatarSelect.value = AVATARS[i % AVATARS.length]; // デフォルトのアバターを割り当て

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'player-name-input';
            nameInput.placeholder = `プレイヤー ${i + 1}`;
            nameInput.value = `Player ${i + 1}`;

            groupDiv.appendChild(avatarSelect);
            groupDiv.appendChild(nameInput);
            playerNamesContainer.appendChild(groupDiv);
        }
        startGameButton.classList.remove('hidden');
    });

    startGameButton.addEventListener('click', () => {
        // (範囲チェックなどは変更なし)
        todaysLuckyNumber = generateTodaysLuckyNumber();
        isTodaysLuckyNumberCalled = false;
        showModal('本日のラッキーナンバーは...', '', todaysLuckyNumber);
        
        calledNumbers = [];
        players = [];
        const playerInputs = document.querySelectorAll('.player-input-group');
        playerInputs.forEach((group, index) => {
            const avatar = group.querySelector('.avatar-input').value;
            const name = group.querySelector('.player-name-input').value || `Player ${index + 1}`;
            players.push({
                id: index, name: name, avatar: avatar, title: '', // ★
                card: generateCardData(parseInt(minNumInput.value), parseInt(maxNumInput.value)),
                bingoCount: 0, isReach: false
            });
        });
        
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        updateHint();
        renderAll();
    });
    
    // --- 描画関連 ---
    function renderAllPlayerCards() {
        playersContainer.innerHTML = '';
        players.forEach(player => {
            const playerCardDiv = document.createElement('div');
            playerCardDiv.className = 'player-card';
            if (player.isReach) playerCardDiv.classList.add('reach');

            // ★ プレイヤー情報エリア (アバター、名前、称号)
            playerCardDiv.innerHTML = `
                <div class="player-info">
                    <span class="player-avatar">${player.avatar}</span>
                    <span class="player-name ${player.isReach ? 'reach' : ''}">${player.name}</span>
                    <span class="player-title">${player.title || ''}</span>
                </div>
            `;
            
            const grid = document.createElement('div');
            grid.className = 'bingo-card-grid';
            player.card.forEach((rowData, rIndex) => {
                rowData.forEach((cellData, cIndex) => {
                    const cellDiv = document.createElement('div');
                    cellDiv.className = 'cell';
                    cellDiv.textContent = cellData.number;
                    if (cellData.marked) cellDiv.classList.add('marked');
                    if (cellData.number === 'FREE') { cellDiv.classList.add('free'); }
                    else {
                        cellDiv.dataset.playerId = player.id;
                        cellDiv.dataset.row = rIndex;
                        cellDiv.dataset.col = cIndex;
                    }
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
    
    function renderCalledNumbers() {
        calledNumbersList.innerHTML = '';
        calledNumbers.sort((a, b) => a - b).forEach(num => {
            const numDiv = document.createElement('div');
            numDiv.className = 'called-number';
            numDiv.textContent = num;
            numDiv.dataset.number = num; // ★ 取り消し用に番号をセット
            calledNumbersList.appendChild(numDiv);
        });
    }

    // --- ゲームロジック ---
    function handleCellClick(event) {
        const cell = event.target;
        if (!cell.classList.contains('cell') || !cell.dataset.playerId) return;
        
        const playerId = parseInt(cell.dataset.playerId);
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const player = players.find(p => p.id === playerId);
        const cellData = player.card[row][col];
        
        // ★ マスの状態をトグル（開ける/閉じる）
        cellData.marked = !cellData.marked;
        
        // データの再計算と再描画
        updatePlayerStatus(player);
        renderAllPlayerCards();
    }
    
    function handleCalledNumberClick(event) {
        const target = event.target;
        if (!target.classList.contains('called-number')) return;
        
        const numberToRemove = parseInt(target.dataset.number);
        
        // ★ 出現済みリストから番号を削除
        calledNumbers = calledNumbers.filter(num => num !== numberToRemove);
        
        // ★ 全員のカードからその番号のマークを外す
        players.forEach(player => {
            player.card.forEach(row => {
                row.forEach(cell => {
                    if (cell.number === numberToRemove) {
                        cell.marked = false;
                    }
                });
            });
            updatePlayerStatus(player);
        });
        
        renderAll();
    }
    
    function markNumberForAllPlayers(score) {
        if (calledNumbers.includes(score)) return; // 既にあれば何もしない
        calledNumbers.push(score);
        
        // (ラッキーナンバー判定は変更なし)

        players.forEach(player => {
            const prevBingoCount = player.bingoCount;
            let numberFound = false;
            player.card.forEach(row => row.forEach(cell => { if (cell.number == score) { cell.marked = true; numberFound = true; } }));
            
            // ★ 称号チェック
            if (numberFound) {
                if (score >= 95 && !player.title) {
                    player.title = '美声の持ち主';
                    showModal('称号ゲット！', `${player.name} さんは「美声の持ち主」の称号を獲得しました！`);
                }
                if (score === todaysLuckyNumber && isTodaysLuckyNumberCalled) {
                     player.title = player.title ? player.title + ' / ラッキースター' : 'ラッキースター';
                }
            }

            updatePlayerStatus(player);
            if (player.bingoCount > prevBingoCount) {
                confetti();
                if (!player.title.includes('ビンゴマスター')) {
                     player.title = player.title ? player.title + ' / ビンゴマスター' : 'ビンゴマスター';
                }
            }
        });
        renderAll();
    }
    
    // --- イベントリスナー ---
    playersContainer.addEventListener('click', handleCellClick);
    calledNumbersList.addEventListener('click', handleCalledNumberClick); // ★ 追加
    // (その他は変更なし)
    
    // (その他の関数: submitScoreButton, resetButton, updateHintなどは変更なし)

    // 以下の関数は、簡略化のため変更がないものとして省略します。
    // 実際には、前回のコードからコピーしてください。
    function updatePlayerStatus(player) { /* (変更なし) */ }
    function generateCardData(min, max) { /* (変更なし) */ }
    function updateHint() { /* (変更なし) */ }
    function showModal(title, message, luckyNumber = null) { /* (変更なし) */ }
    submitScoreButton.addEventListener('click', () => {
        const score = parseInt(scoreInput.value, 10);
        if(!score) return;
        markNumberForAllPlayers(score);
        scoreInput.value = '';
    });
    resetButton.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    });
});
