document.addEventListener('DOMContentLoaded', () => {
    const BINGO_SIZE = 5;
    const MIN_NUM = 70; // 70-100の範囲に設定済み
    const MAX_NUM = 100; // 70-100の範囲に設定済み

    const cardContainer = document.getElementById('bingo-card');
    const scoreInput = document.getElementById('scoreInput');
    const submitScoreButton = document.getElementById('submitScore');
    const resetButton = document.getElementById('resetButton');
    const resultMessage = document.getElementById('resultMessage');

    let bingoCard = [];

    // 1. ビンゴカードを生成する関数
    function generateCard() {
        // 初期化
        cardContainer.innerHTML = '';
        resultMessage.textContent = '';
        bingoCard = Array(BINGO_SIZE).fill(null).map(() => Array(BINGO_SIZE).fill({ number: 0, marked: false }));

        // 指定範囲の数字リストを作成
        const numbers = [];
        for (let i = MIN_NUM; i <= MAX_NUM; i++) {
            numbers.push(i);
        }

        // 数字をシャッフル
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        
        // カードに数字を配置
        let numberIndex = 0;
        for (let row = 0; row < BINGO_SIZE; row++) {
            for (let col = 0; col < BINGO_SIZE; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                // 中央はFREE
                if (row === 2 && col === 2) {
                    cell.textContent = 'FREE';
                    cell.classList.add('free', 'marked');
                    bingoCard[row][col] = { number: 'FREE', marked: true };
                } else {
                    const number = numbers[numberIndex++];
                    cell.textContent = number;
                    cell.dataset.number = number;
                    bingoCard[row][col] = { number: number, marked: false };

                    // ★ 変更点 1: 各マスにクリックイベントを追加
                    cell.addEventListener('click', handleCellClick);
                }
                cardContainer.appendChild(cell);
            }
        }
    }

    // ★ 変更点 2: マスがクリックされたときの処理を追加
    function handleCellClick(event) {
        const clickedCell = event.target;
        const number = clickedCell.dataset.number;

        // すでにマークされている場合は何もしない
        if (clickedCell.classList.contains('marked')) {
            return;
        }

        // 対応するデータを更新
        for (let row = 0; row < BINGO_SIZE; row++) {
            for (let col = 0; col < BINGO_SIZE; col++) {
                if (bingoCard[row][col].number == number) {
                    bingoCard[row][col].marked = true;
                    break;
                }
            }
        }
        
        // 見た目を更新してビンゴをチェック
        clickedCell.classList.add('marked');
        checkBingo();
    }

    // 2. 入力された数字をマークする関数
    function markNumber(score) {
        if (!score || score < MIN_NUM || score > MAX_NUM) {
            alert(`${MIN_NUM}から${MAX_NUM}までの有効な数字を入力してください。`);
            return;
        }

        let found = false;
        for (let row = 0; row < BINGO_SIZE; row++) {
            for (let col = 0; col < BINGO_SIZE; col++) {
                if (bingoCard[row][col].number == score) {
                    // すでにマークされていなければマークする
                    if (!bingoCard[row][col].marked) {
                        bingoCard[row][col].marked = true;
                    }
                    found = true;
                    break;
                }
            }
            if(found) break;
        }

        if(found) {
            updateCardView();
            checkBingo();
        } else {
            alert('その数字はカードにありません。');
        }
        scoreInput.value = '';
    }

    // 3. カードの表示を更新する関数
    function updateCardView() {
        const cells = document.querySelectorAll('.cell');
        let cellIndex = 0;
        for (let row = 0; row < BINGO_SIZE; row++) {
            for (let col = 0; col < BINGO_SIZE; col++) {
                if (bingoCard[row][col].marked) {
                    cells[cellIndex].classList.add('marked');
                }
                cellIndex++;
            }
        }
    }

    // 4. ビンゴを判定する関数
    function checkBingo() {
        let bingoCount = 0;
        
        // 横列チェック
        for (let row = 0; row < BINGO_SIZE; row++) {
            if (bingoCard[row].every(cell => cell.marked)) {
                bingoCount++;
            }
        }
        
        // 縦列チェック
        for (let col = 0; col < BINGO_SIZE; col++) {
            if (bingoCard.every(row => row[col].marked)) {
                bingoCount++;
            }
        }
        
        // 斜めチェック (左上から右下)
        if (Array.from({ length: BINGO_SIZE }, (_, i) => bingoCard[i][i]).every(cell => cell.marked)) {
            bingoCount++;
        }
        
        // 斜めチェック (右上から左下)
        if (Array.from({ length: BINGO_SIZE }, (_, i) => bingoCard[i][BINGO_SIZE - 1 - i]).every(cell => cell.marked)) {
            bingoCount++;
        }

        if (bingoCount > 0) {
            resultMessage.textContent = `🎉 BINGO! 🎉 (${bingoCount}ライン)`;
        }
    }
    
    // イベントリスナーの設定
    submitScoreButton.addEventListener('click', () => markNumber(scoreInput.value));
    scoreInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            markNumber(scoreInput.value);
        }
    });
    resetButton.addEventListener('click', generateCard);

    // 初期カードの生成
    generateCard();
});
