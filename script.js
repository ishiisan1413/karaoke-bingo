document.addEventListener('DOMContentLoaded', () => {
    const BINGO_SIZE = 5;
    const OTHER_LUCKY_NUMBERS = [77, 88, 99];
    const AVATARS = ['🎤', '🍺', '👑', '✨', '🕺', '💃', '⭐', '❤️', '😎', '🤠'];

    const HINT_THEMES = [
        '愛', '恋', '友情', '青春', '夢', '希望', '未来', '旅立ち', '卒業', '結婚',
        '応援歌', '感謝', 'ありがとう', 'さよなら', '失恋', '涙', '孤独', '奇跡',
        '約束', '永遠', '春', '夏', '秋', '冬', '桜', '花火', '雪', '雨', '風',
        '空', '海', '星', '月', '太陽', '夜', '朝日', '盛り上がる曲', '泣ける曲',
        '感動する曲', '元気が出る曲', 'しっとり聴かせる', 'ストレス発散',
    ];
    const HINT_SPECIFICS = [
        '90年代', '2000年代', '昭和歌謡', '平成ヒット', '令和ソング', 'アニソン', 'ボカロ',
        'アイドルソング', 'デュエット曲', 'バンドサウンド', 'ドラマ主題歌',
        'Mr.Children', 'サザンオールスターズ', 'スピッツ', 'Official髭男dism', 'King Gnu',
        'B\'z', 'X JAPAN', 'DREAMS COME TRUE', '宇多田ヒカル', 'ZARD', 'あいみょん',
        'YOASOBI', 'Ado', '中島みゆき', '松任谷由実', 'ジブリ', 'ディズニー',
    ];

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
    const hintWord = document.getElementById('hint-word');
    const easyHintBtn = document.getElementById('easy-hint-btn');
    const normalHintBtn = document.getElementById('normal-hint-btn');
    const hardHintBtn = document.getElementById('hard-hint-btn');

    // ゲームデータ
    let players = [];
    let calledNumbers = [];
    let todaysLuckyNumber = 0;
    let isTodaysLuckyNumberCalled = false;

    function generateTodaysLuckyNumber() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        let x = seed;
        x ^= x << 13; x ^= x >> 17; x ^= x << 5;
        const range = 92 - 80 + 1;
        return (x & 0x7FFFFFFF) % range + 80;
    }

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
                option.value = avatar; option.textContent = avatar;
                avatarSelect.appendChild(option);
            });
            avatarSelect.value = AVATARS[i % AVATARS.length];
            const nameInput = document.createElement('input');
            nameInput.type = 'text'; nameInput.className = 'player-name-input';
            nameInput.placeholder = `プレイヤー ${i + 1}`; nameInput.value = `Player ${i + 1}`;
            groupDiv.appendChild(avatarSelect);
            groupDiv.appendChild(nameInput);
            playerNamesContainer.appendChild(groupDiv);
        }
        startGameButton.classList.remove('hidden');
    });

    startGameButton.addEventListener('click', () => {
        const minNum = parseInt(minNumInput.value, 10);
        const maxNum = parseInt(maxNumInput.value, 10);
        if (isNaN(minNum) || isNaN(maxNum) || minNum >= maxNum) { alert('有効な数字の範囲を入力してください。'); return; }
        if ((maxNum - minNum + 1) < 24) { alert('ビンゴカードを作成するには、少なくとも24個のユニークな数字が必要です。'); return; }
        todaysLuckyNumber = generateTodaysLuckyNumber();
        isTodaysLuckyNumberCalled = false;
        showModal('本日のラッキーナンバーは...', '', todaysLuckyNumber);
        scoreInput.min = minNum; scoreInput.max = maxNum;
        calledNumbers = [];
        players = [];
        const playerInputs = document.querySelectorAll('.player-input-group');
        playerInputs.forEach((group, index) => {
            const avatar = group.querySelector('.avatar-input').value;
            const name = group.querySelector('.player-name-input').value || `Player ${index + 1}`;
            players.push({
                id: index, name: name, avatar: avatar, title: '',
                card: generateCardData(minNum, maxNum),
                bingoCount: 0, isReach: false
            });
        });
        setupScreen.classList.add('hidden'); gameScreen.classList.remove('hidden');
        hintWord.textContent = '難易度を選んでね';
        renderAll();
    });
    
    function showModal(title, message, luckyNumber = null) {
        modalTitle.textContent = title; modalMessage.textContent = message;
        if (luckyNumber) {
            modalLuckyNumber.textContent = luckyNumber;
            modalLuckyNumber.classList.remove('hidden');
        } else {
            modalLuckyNumber.classList.add('hidden');
        }
        modalContainer.classList.remove('hidden');
    }

    // --- 選曲ヒント ---
    function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function displayHint(text) {
        hintWord.textContent = text;
        hintWord.classList.remove('fadeIn');
        void hintWord.offsetWidth;
        hintWord.classList.add('fadeIn');
    }
    easyHintBtn.addEventListener('click', () => displayHint(getRandomItem(HINT_THEMES)));
    normalHintBtn.addEventListener('click', () => {
        let hint1 = getRandomItem(HINT_THEMES);
        let hint2;
        do { hint2 = getRandomItem(HINT_THEMES.concat(HINT_SPECIFICS.slice(0, 11))); } while (hint1 === hint2);
        displayHint(`${hint1} & ${hint2}`);
    });
    hardHintBtn.addEventListener('click', () => displayHint(`${getRandomItem(HINT_THEMES)} & ${getRandomItem(HINT_SPECIFICS)}`));

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
            if (player.isReach) playerCardDiv.classList.add('reach');
            playerCardDiv.innerHTML = `<div class="player-info"><span class="player-avatar">${player.avatar}</span><span class="player-name ${player.isReach ? 'reach' : ''}">${player.name}</span><span class="player-title">${player.title || ''}</span></div>`;
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
                        cellDiv.dataset.number = cellData.number;
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
            numDiv.dataset.number = num;
            calledNumbersList.appendChild(numDiv);
        });
    }

    function addNumberToGame(score) {
        if (calledNumbers.includes(score)) return;
        calledNumbers.push(score);
        if (score === todaysLuckyNumber && !isTodaysLuckyNumberCalled) {
            isTodaysLuckyNumberCalled = true;
            showModal('おめでとうございます！', `本日のラッキーナンバー【${score}】が出ました！特別なサービスがあるかも...？`);
        } else if (OTHER_LUCKY_NUMBERS.includes(score)) {
            showModal('🎉 ラッキーナンバー！ 🎉', `ゾロ目【${score}】が出ました！何か良いことがあるかも！`);
        }
        players.forEach(player => {
            const prevBingoCount = player.bingoCount;
            let numberFound = false;
            player.card.forEach(row => row.forEach(cell => { if (cell.number == score) { cell.marked = true; numberFound = true; } }));
            if (numberFound) {
                if (score >= 95 && !player.title.includes('美声の持ち主')) {
                    player.title = player.title ? `${player.title} / 美声の持ち主` : '美声の持ち主';
                    showModal('称号ゲット！', `${player.name} さんは「美声の持ち主」の称号を獲得しました！`);
                }
                if (score === todaysLuckyNumber) {
                     player.title = player.title ? `${player.title} / ラッキースター` : 'ラッキースター';
                }
            }
            updatePlayerStatus(player);
            if (player.bingoCount > prevBingoCount) {
                confetti();
                if (!player.title.includes('ビンゴマスター')) {
                     player.title = player.title ? `${player.title} / ビンゴマスター` : 'ビンゴマスター';
                }
            }
        });
        renderAll();
    }

    function removeNumberFromGame(numberToRemove) {
        calledNumbers = calledNumbers.filter(num => num !== numberToRemove);
        players.forEach(player => {
            player.card.forEach(row => row.forEach(cell => { if (cell.number === numberToRemove) cell.marked = false; }));
            updatePlayerStatus(player);
        });
        renderAll();
    }
    
    function handleCellClick(event) {
        const cell = event.target;
        if (!cell.classList.contains('cell') || cell.classList.contains('free') || !cell.dataset.number) return;
        const number = parseInt(cell.dataset.number, 10);
        if (calledNumbers.includes(number)) {
            removeNumberFromGame(number);
        } else {
            addNumberToGame(number);
        }
    }
    
    function handleCalledNumberClick(event) {
        const target = event.target;
        if (!target.classList.contains('called-number')) return;
        const numberToRemove = parseInt(target.dataset.number);
        removeNumberFromGame(numberToRemove);
    }
    
    submitScoreButton.addEventListener('click', () => {
        const score = parseInt(scoreInput.value, 10);
        const min = parseInt(scoreInput.min, 10);
        const max = parseInt(scoreInput.max, 10);
        if (!score || score < min || score > max) { alert(`${min}から${max}までの有効な数字を入力してください。`); return; }
        if (calledNumbers.includes(score)) { alert('その番号は既に出ています。'); return; }
        addNumberToGame(score);
        scoreInput.value = '';
    });
    
    function updatePlayerStatus(player) {
        const card = player.card;
        let bingoCount = 0, reachLines = 0;
        const lines = [];
        for (let i = 0; i < BINGO_SIZE; i++) { lines.push(card[i]); lines.push(card.map(row => row[i])); }
        lines.push(card.map((row, i) => row[i]));
        lines.push(card.map((row, i) => row[BINGO_SIZE - 1 - i]));
        lines.forEach(line => {
            const unmarkedCount = line.filter(cell => !cell.marked).length;
            if (unmarkedCount === 0) bingoCount++;
            if (unmarkedCount === 1) reachLines++;
        });
        player.bingoCount = bingoCount;
        player.isReach = bingoCount === 0 && reachLines > 0;
    }

    // --- イベントリスナー ---
    resetButton.addEventListener('click', () => {
        gameScreen.classList.add('hidden'); setupScreen.classList.remove('hidden');
        playerNamesContainer.innerHTML = ''; startGameButton.classList.add('hidden');
        playerCountInput.value = '1'; hintWord.textContent = '難易度を選んでね';
    });
    playersContainer.addEventListener('click', handleCellClick);
    calledNumbersList.addEventListener('click', handleCalledNumberClick);
    closeModalButton.addEventListener('click', () => modalContainer.classList.add('hidden'));
    scoreInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitScoreButton.click(); });
});
