// WASMモジュールをWorkerのスコープにインポートします
import init, { find_calculation } from './pkg/expression_finder.js';

// Workerが生成されたら、まずWASMモジュールを初期化します
async function initialize() {
    await init();
    // 初期化が完了したことをメインスレッドに通知します
    self.postMessage({ type: 'ready' });
}
initialize();

// メインスレッドからメッセージを受け取ったときの処理を定義します
self.onmessage = (event) => {
    // メインスレッドから渡された計算用のデータを取得します
    const { numbers, target } = event.data;
    
    try {
        // WASMの計算関数を呼び出します。結果の最大数は100に固定します。
        const results = find_calculation(new Uint32Array(numbers), target, 100);

        // console.log('Worker received data:', results);
        // results.forEach((result, index) => {
        //    console.log(`Result ${index + 1}:`, result.tex);
        //});

        // WASMオブジェクトの配列を、postMessageで送信可能なプレーンなJSオブジェクトの配列に変換します。
        const plain_results = results.map(expr => {
            // .prog と .tex はgetterなので、アクセスして値を取り出します
            return {
                prog: expr.prog,
                tex: expr.tex
            };
        });

        // 変換したプレーンな結果の配列をメインスレッドに送信します
        self.postMessage({ type: 'result', payload: plain_results });

    } catch (e) {
        console.error('Error in worker:', e);
        // 計算中にエラーが発生した場合、エラー情報をメインスレッドに送信します
        self.postMessage({ type: 'error', payload: e.toString() });
    }
};