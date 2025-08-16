document.addEventListener('DOMContentLoaded', () => {
    // (BINGO_SIZE, OTHER_LUCKY_NUMBERS, AVATARSは変更なし)

    // ★ ヒントリストを2種類に分割
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

    // DOM要素 (hint-buttons関連を追加)
    const easyHintBtn = document.getElementById('easy-hint-btn');
    const normalHintBtn = document.getElementById('normal-hint-btn');
    const hardHintBtn = document.getElementById('hard-hint-btn');
    // (その他DOM要素は変更なし)
    
    // (ゲームデータ、generateTodaysLuckyNumberは変更なし)

    // --- セットアップ関連 (変更なし) ---
    // (setPlayersButton, startGameButtonのロジックはほぼ同じ)

    startGameButton.addEventListener('click', () => {
        // ... (既存のゲーム開始処理)
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        hintWord.textContent = '難易度を選んでね'; // ★ ヒントを初期化
        renderAll();
    });

    // --- ★ 選曲ヒント生成ロジック ---
    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function displayHint(text) {
        hintWord.textContent = text;
        hintWord.classList.remove('fadeIn');
        void hintWord.offsetWidth;
        hintWord.classList.add('fadeIn');
    }

    easyHintBtn.addEventListener('click', () => {
        const hint = getRandomItem(HINT_THEMES);
        displayHint(hint);
    });

    normalHintBtn.addEventListener('click', () => {
        let hint1 = getRandomItem(HINT_THEMES);
        let hint2;
        // 同じヒントが選ばれないようにする
        do {
            hint2 = getRandomItem(HINT_THEMES.concat(HINT_SPECIFICS.slice(0, 11))); // ジャンルや年代も候補に
        } while (hint1 === hint2);
        displayHint(`${hint1} & ${hint2}`);
    });

    hardHintBtn.addEventListener('click', () => {
        const hint1 = getRandomItem(HINT_THEMES);
        const hint2 = getRandomItem(HINT_SPECIFICS);
        displayHint(`${hint1} & ${hint2}`);
    });
    
    // --- ゲームロジック ---
    // (markNumberForAllPlayers, updatePlayerStatusなど、ゲームのコアロジックは変更なし)

    // --- イベントリスナー ---
    resetButton.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        // (その他のリセット処理)
        hintWord.textContent = '難易度を選んでね'; // ★ ヒントをリセット
    });
    
    // (その他のイベントリスナーは変更なし)
    
    // 以下の関数は、簡略化のため変更がないものとして省略します。
    // 実際には、前回のコードからコピーしてください。
    function generateCardData(min, max) { /* (変更なし) */ }
    function renderAll() { /* (変更なし) */ }
    function renderAllPlayerCards() { /* (変更なし) */ }
    function renderCalledNumbers() { /* (変更なし) */ }
    function handleCellClick(event) { /* (変更なし) */ }
    function handleCalledNumberClick(event) { /* (変更なし) */ }
    function markNumberForAllPlayers(score) { /* (変更なし) */ }
    function updatePlayerStatus(player) { /* (変更なし) */ }
    function showModal(title, message, luckyNumber = null) { /* (変更なし) */ }
    // ... その他の関数やイベントリスナーも同様
});
