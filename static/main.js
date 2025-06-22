
// HTML要素を取得
const solveButton = document.getElementById('solve-button');
const numbersInput = document.getElementById('numbers');
const targetInput = document.getElementById('target');
const resultOutput = document.getElementById('result');

// 計算可能な数字の最大個数を設定
const MAX_NUMBERS_ALLOWED = 5;

// Web Worker生成
const worker = new Worker('./worker.js', { type: 'module' });

// 計算ボタンを初期状態では無効化しておく
solveButton.disabled = true;
solveButton.textContent = '初期化中...';

// Workerからメッセージを受け取ったときの処理
worker.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === 'ready') {
    solveButton.disabled = false;
    solveButton.textContent = '計算実行';
    return;
  }

  if (type === 'result') {
    displayResults(payload);
  }

  if (type === 'error') {
    resultOutput.innerHTML = `<p>計算中にエラーが発生しました: ${payload}</p>`;
    solveButton.disabled = false;
    solveButton.textContent = '計算実行';
  }
};

// 「計算実行」ボタンがクリックされたときの処理
solveButton.addEventListener('click', () => {
  solveButton.disabled = true;
  solveButton.textContent = '計算中...';
  resultOutput.innerHTML = '<p>計算を開始しました。進捗をここに表示します...</p>';

  const numbersStr = numbersInput.value;
  const target = parseInt(targetInput.value, 10);
  const numbers = numbersStr.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));

if (numbers.length > MAX_NUMBERS_ALLOWED) {
        resultOutput.innerHTML = `<p>エラー: 数字の個数は${MAX_NUMBERS_ALLOWED}個以下にしてください。（計算量が大きすぎるため）</p>`;
        solveButton.disabled = false;
        solveButton.textContent = '計算実行';
        return;
    }
  if (isNaN(target) || numbers.length === 0) {
    resultOutput.textContent = 'エラー: 数字と目標値を正しく入力してください。';
    solveButton.disabled = false;
    solveButton.textContent = '計算実行';
    return;
  }

  // Workerに計算開始のメッセージを送信
  worker.postMessage({ numbers, target });
});


function displayResults(results) {
  solveButton.disabled = false;
  solveButton.textContent = '計算実行';
  if (results.length === 0) {
    resultOutput.innerHTML = `<p>計算式は見つかりませんでした。</p>`;
    return;
  }
  resultOutput.innerHTML = `<p><span id="result-count">0</span> / ${results.length} 件の計算式を表示中...</p>`;
  const resultList = document.createElement('ul');
  resultOutput.appendChild(resultList);
  const resultCountSpan = document.getElementById('result-count');
  let currentIndex = 0;
  const intervalId = setInterval(() => {
    if (currentIndex >= results.length) {
      clearInterval(intervalId);
      resultOutput.querySelector('p').textContent = `${results.length} 件の計算式が見つかりました。`;
      return;
    }

    // JS側で受け取るのは {prog: "...", tex: "..."} というプロパティを持つオブジェクトの配列
    const expr = results[currentIndex];
    // console.log("Rendering expression:", expr);
    const listItem = document.createElement('li');

    // LaTex表示用のdivを作成
    const texContainer = document.createElement('div');
    texContainer.className = 'tex-format';

    // プログラミング形式表示用のdivを作成
    const progContainer = document.createElement('div');
    progContainer.className = 'prog-format';
    const codeElement = document.createElement('code');
    codeElement.textContent = expr.prog; // `prog`プロパティを使用
    progContainer.appendChild(codeElement);

    try {
      // console.log("Rendering with KaTeX:", expr.tex);
      // KaTeXで数式を描画
      katex.render(expr.tex, texContainer, {"displayMode":true,"leqno":false,"fleqn":false,"throwOnError":true,"errorColor":"#cc0000","strict":"warn","output":"mathml","trust":false,"macros":{"\\f":"#1f(#2)"}})
    } catch (e) {
      console.error("KaTeX rendering error:", e);
      texContainer.textContent = expr.tex;
    }

    // li要素に両方のコンテナを追加
    listItem.appendChild(texContainer);
    listItem.appendChild(progContainer);
    resultList.appendChild(listItem);

    currentIndex++;
    resultCountSpan.textContent = currentIndex;
  }, 50);
}