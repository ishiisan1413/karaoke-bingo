document.addEventListener('DOMContentLoaded', () => {
    const BINGO_SIZE = 5;
    const OTHER_LUCKY_NUMBERS = [77, 88, 99];
    const AVATARS = ['🎤', '🍺', '👑', '✨', '🕺', '💃', '⭐', '❤️', '😎', '🤠', '🎉', '🥂', '🍾', '🍕', '🍓'];
    const DEFAULT_PLAYER_NAMES = [
        '常連さん', 'マスター', '謎の紳士', '噂の美女', '宴会部長', '盛り上げ隊長', 'ハイボール',
        'タンバリンの神', '遅れてきた主役', '一見さん', 'とりあえず生', 'からあげ', '焼酎ロック'
    ];
    const HINT_THEMES = [
        '1980年代', '1990年代', '2000年代', '2010年代', '昭和歌謡', '平成ヒット', '令和ソング', 
        '愛', '恋', '友情', '青春', '夢', '希望', '未来', '旅立ち', '卒業', '結婚',
        '応援歌', '感謝', 'ありがとう', 'さよなら', '失恋', '涙', '孤独', '奇跡',
        '約束', '永遠', '春', '夏', '秋', '冬', '桜', '花火', '雪', '雨', '風',
        '空', '海', '星', '月', '太陽', '夜', '朝日', '盛り上がる曲', '泣ける曲',
        '感動する曲', '元気が出る曲', 'しっとり聴かせる', 'ストレス発散',
        '家族', '仲間', '故郷', '別れ', '出会い', '笑顔', '勇気', '情熱', '闘い',
        '人生', '道', '自由', '始まり', '挑戦', '勝利', '翼', '時間', '過去',
        '光', '闇', '心', '声', '色', '嘘', '真実', '秘密', '思い出', '天使',
        '悪魔', '神様', '地球', '世界', '虹', '花', '宝石', '魔法', 'カクテル',
        'ドライブ', 'ウェディング', 'クリスマス', 'イントロが印象的', 'サビが最高',
        'みんなで歌える', 'CMソング', 'カラオケ鉄板曲', 'ハイトーン曲', '低音ボイス曲',
        'MVが面白い', 'タイトルが長い曲'
    ];
    const HINT_SPECIFICS = [
        'アニソン', 'ボカロ', 'アイドルソング', 'デュエット曲', 'バンドサウンド', 'ドラマ主題歌',
        'ジブリ', 'ディズニー', 'ヴィジュアル系', 'フォークソング', '演歌',
        'バラード', '洋楽', 'K-POP', '特撮ソング', 'ゲーム音楽',
        '長髪のボーカル', 'メガネがトレードマーク', '帽子がトレードマーク', 'ヒゲが印象的なボーカル',
        '派手な衣装', '俳優としても有名', '2人組', '3人組', '4人組バンド', '大人数アイドル',
        'パワフルな女性ボーカル', 'ハイトーン男性ボーカル', '綺麗なコーラス', 'ラップがある', '沖縄出身アーティスト',
        'デビュー曲が大ヒット', '解散したグループ'
    ];

    // DOM要素
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const minNumSelect = document.getElementById('min-num-select');
    const maxNumSelect = document.getElementById('max-num-select');
    const playerCountSelect = document.getElementById('player-count-select');
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
    const luckyNumberSpan = document.getElementById('lucky-number-span');

    let players = [];
    let calledNumbers = [];
    let todaysLuckyNumber = 0;
    let isTodaysLuckyNumberCalled = false;

    // --- ★ 変更点: ランダム生成ボタンの処理 ---
    function setRandomPlayerInfo(groupDiv) {
        const avatarSelect1 = groupDiv.querySelector('.avatar-select-1');
        const avatarSelect2 = groupDiv.querySelector('.avatar-select-2');
        const nameInput = groupDiv.querySelector('.player-name-input');
        
        nameInput.value = getRandomItem(DEFAULT_PLAYER_NAMES);
        
        let randomAvatar1 = getRandomItem(AVATARS);
        let randomAvatar2;
        do {
            randomAvatar2 = getRandomItem(AVATARS);
        } while (randomAvatar1 === randomAvatar2); // アイコンが被らないようにする

        avatarSelect1.value = randomAvatar1;
        avatarSelect2.value = randomAvatar2;
    }

    // ★ 変更点: プレイヤー入力欄の生成ロジックを全面的に書き換え
    function generatePlayerNameInputs() {
        const count = parseInt(playerCountSelect.value, 10);
        playerNamesContainer.innerHTML = '';
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'player-input-group';

                // アイコン選択1
                const avatarSelect1 = document.createElement('select');
                avatarSelect1.className = 'avatar-select avatar-select-1';
                populateSelect(avatarSelect1, AVATARS, AVATARS[i % AVATARS.length]);

                // アイコン選択2
                const avatarSelect2 = document.createElement('select');
                avatarSelect2.className = 'avatar-select avatar-select-2';
                populateSelect(avatarSelect2, AVATARS, AVATARS[(i + 1) % AVATARS.length]);

                // 名前入力
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.className = 'player-name-input';
                nameInput.placeholder = `プレイヤー ${i + 1}`;
                nameInput.value = ''; // デフォルトは空欄

                // ランダムボタン
                const randomBtn = document.createElement('button');
                randomBtn.className = 'random-name-btn';
                randomBtn.textContent = 'ランダム';
                randomBtn.addEventListener('click', () => setRandomPlayerInfo(groupDiv));

                groupDiv.appendChild(avatarSelect1);
                groupDiv.appendChild(avatarSelect2);
                groupDiv.appendChild(nameInput);
                groupDiv.appendChild(randomBtn);
                playerNamesContainer.appendChild(groupDiv);
            }
            startGameButton.classList.remove('hidden');
        } else {
            startGameButton.classList.add('hidden');
        }
    }

    // --- 初期化処理 ---
    function populateSelect(selectElement, options, defaultValue) {
        if (Array.isArray(options)) {
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt; option.textContent = opt;
                selectElement.appendChild(option);
            });
        } else { // 数字の場合
            for (let i = options; i <= end; i++) { // この部分は元のコードから修正が必要
                const option = document.createElement('option');
                option.value = i; option.textContent = i;
                selectElement.appendChild(option);
            }
        }
        selectElement.value = defaultValue;
    }
    // 上のpopulateSelectを修正
    function populateSelectWithOptions(selectElement, optionsArray, defaultValue) {
        optionsArray.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt; option.textContent = opt;
            selectElement.appendChild(option);
        });
        selectElement.value = defaultValue;
    }
    function populateSelectWithNumbers(selectElement, start, end, defaultValue) {
        for (let i = start; i <= end; i++) {
            const option = document.createElement('option');
            option.value = i; option.textContent = i;
            selectElement.appendChild(option);
        }
        selectElement.value = defaultValue;
    }

    populateSelectWithNumbers(minNumSelect, 60, 100, 70);
    populateSelectWithNumbers(maxNumSelect, 60, 100, 95);
    populateSelectWithNumbers(playerCountSelect, 1, 10, 2);
    generatePlayerNameInputs();
    playerCountSelect.addEventListener('change', generatePlayerNameInputs);

    startGameButton.addEventListener('click', () => {
        const minNum = parseInt(minNumSelect.value, 10);
        const maxNum = parseInt(maxNumSelect.value, 10);
        if (minNum >= maxNum) { alert('番号の範囲が正しくありません。'); return; }
        if ((maxNum - minNum + 1) < 24) { alert('ビンゴカードを作成するには、少なくとも24個のユニークな数字が必要です。'); return; }
        
        todaysLuckyNumber = generateTodaysLuckyNumber();
        isTodaysLuckyNumberCalled = false;
        
        luckyNumberSpan.textContent = todaysLuckyNumber;
        showModal('本日のラッキーナンバーは...', '', todaysLuckyNumber);
        
        scoreInput.min = minNum; scoreInput.max = maxNum;
        calledNumbers = [];
        players = [];
        const playerInputs = document.querySelectorAll('.player-input-group');
        playerInputs.forEach((group, index) => {
            const avatar1 = group.querySelector('.avatar-select-1').value;
            const avatar2 = group.querySelector('.avatar-select-2').value;
            const name = group.querySelector('.player-name-input').value || DEFAULT_PLAYER_NAMES[index % DEFAULT_PLAYER_NAMES.length];
            players.push({
                id: index, name: name, avatar1: avatar1, avatar2: avatar2,
                card: generateCardData(minNum, maxNum),
                bingoCount: 0, isReach: false
            });
        });
        setupScreen.classList.add('hidden'); gameScreen.classList.remove('hidden');
        hintWord.textContent = '難易度を選んでね';
        renderAll();
    });

    // --- ★ 変更点: 描画処理をアイコン2つに対応 ---
    function renderAllPlayerCards() {
        playersContainer.innerHTML = '';
        players.forEach(player => {
            const playerCardDiv = document.createElement('div');
            playerCardDiv.className = 'player-card';
            if (player.isReach) playerCardDiv.classList.add('reach');
            playerCardDiv.innerHTML = `<div class="player-info"><span class="player-avatar">${player.avatar1}${player.avatar2}</span><span class="player-name ${player.isReach ? 'reach' : ''}">${player.name}</span></div>`;
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

    // (以下の関数は、前回の回答から一切変更ありません)
    function generateTodaysLuckyNumber() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        let x = seed;
        x ^= x << 13; x ^= x >> 17; x ^= x << 5;
        const range = 92 - 80 + 1;
        return (x & 0x7FFFFFFF) % range + 80;
    }
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
        do { hint2 = getRandomItem(HINT_SPECIFICS); } while (hint1 === hint2);
        displayHint(`${hint1} & ${hint2}`);
    });
    hardHintBtn.addEventListener('click', () => {
        let hint1 = getRandomItem(HINT_SPECIFICS);
        let hint2;
        do { hint2 = getRandomItem(HINT_SPECIFICS); } while (hint1 === hint2);
        displayHint(`${hint1} & ${hint2}`);
    });
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
            player.card.forEach(row => row.forEach(cell => { if (cell.number == score) { cell.marked = true; } }));
            updatePlayerStatus(player);
            if (player.bingoCount > prevBingoCount) {
                confetti();
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
    resetButton.addEventListener('click', () => {
        gameScreen.classList.add('hidden'); setupScreen.classList.remove('hidden');
        playerNamesContainer.innerHTML = ''; startGameButton.classList.add('hidden');
        playerCountSelect.value = '2';
        hintWord.textContent = '難易度を選んでね';
        generatePlayerNameInputs();
    });
    playersContainer.addEventListener('click', handleCellClick);
    calledNumbersList.addEventListener('click', handleCalledNumberClick);
    closeModalButton.addEventListener('click', () => modalContainer.classList.add('hidden'));
    scoreInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitScoreButton.click(); });
});
