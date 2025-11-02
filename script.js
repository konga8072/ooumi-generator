document.addEventListener('DOMContentLoaded', function () {
  // CSVから読み込んだ攻略法パターンを格納
  let allTemplates = [];
  let remainingTemplates = [];
  let currentText = "";
  let isGenerating = false;
  let isLoading = true;

  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const result = document.getElementById('result');
  const status = document.getElementById('status');
  
  // 入力フィールド
  const currentRotation = document.getElementById('currentRotation');
  const todayBigWin = document.getElementById('todayBigWin');
  const topNumber = document.getElementById('topNumber');
  const middleNumber = document.getElementById('middleNumber');
  const bottomNumber = document.getElementById('bottomNumber');
  const areaPosition = document.getElementById('areaPosition');

  // CSVファイルを読み込む
  function loadTemplatesFromCSV() {
    result.textContent = '📁 攻略法データを読み込み中...';
    generateBtn.disabled = true;

    fetch('templates.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('CSVファイルが見つかりません');
        }
        return response.text();
      })
      .then(data => {
        // CSVをパース（1行目はヘッダーなのでスキップ）
        const lines = data.split('\n').slice(1);
        
        // 空行を除外して配列に格納
        allTemplates = lines
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (allTemplates.length === 0) {
          throw new Error('CSVファイルにデータがありません');
        }

        isLoading = false;
        generateBtn.disabled = false;
        result.textContent = `✅ ${allTemplates.length}件の攻略法を読み込みました。データを入力して生成ボタンを押してください`;
        
        reset();
      })
      .catch(error => {
        console.error('CSV読み込みエラー:', error);
        result.textContent = `❌ エラー: ${error.message}\n\ntemplates.csvファイルが同じフォルダにあるか確認してください。`;
        result.style.color = '#e53e3e';
        generateBtn.disabled = true;
      });
  }

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function reset() {
    remainingTemplates = shuffle(allTemplates);
    updateStatus();
  }

  function updateStatus() {
    const used = allTemplates.length - remainingTemplates.length;
    status.textContent = `${used} / ${allTemplates.length} 件表示済み`;
    
    if (remainingTemplates.length === 0) {
      status.textContent += ' - 全件表示完了！リセットしました。';
    }
  }

  // 入力データを取得
  function getInputData() {
    return {
      rotation: parseInt(currentRotation.value) || 0,
      todayWin: parseInt(todayBigWin.value) || 0,
      topNumber: topNumber.value || '未選択',
      middleNumber: middleNumber.value || '未選択',
      bottomNumber: bottomNumber.value || '未選択',
      areaPosition: areaPosition.value || '未選択'
    };
  }

  // AI生成風の演出（データ分析版）
  async function showGeneratingEffect() {
    isGenerating = true;
    generateBtn.disabled = true;
    copyBtn.disabled = true;
    result.classList.add('generating');

    const data = getInputData();

    // データに基づいたメッセージ
    const messages = [
      `📊 回転数 ${data.rotation}回転 を分析中`,
      `🎰 本日の大当り ${data.todayWin}回 を解析中`,
      `🎲 出目パターン（上:${data.topNumber}/中:${data.middleNumber}/下:${data.bottomNumber}）を検証中`,
      `🧭 集中領域 ${data.areaPosition} を分析中`,
      '🤖 AIが最適な攻略法を計算中',
      '⚡ データベースと照合中',
      '🎯 推奨手順を生成中'
    ];

    let messageIndex = 0;
    let dotCount = 0;

    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      result.textContent = messages[messageIndex] + dots;
    }, 250);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
    }, 800);

    // データ量に応じた待機時間（よりリアルに）
    const baseTime = 2000;
    const dataComplexity = (data.rotation / 100) + (data.todayWin * 50);
    const waitTime = baseTime + Math.min(dataComplexity, 1500) + Math.random() * 500;
    
    await new Promise(resolve => setTimeout(resolve, waitTime));

    clearInterval(interval);
    clearInterval(messageInterval);
    
    result.classList.remove('generating');
    isGenerating = false;
    generateBtn.disabled = false;
  }

  // 文字を1文字ずつ表示する演出
  async function typewriterEffect(text) {
    result.textContent = '';
    result.style.color = '#2d3748';
    
    for (let i = 0; i < text.length; i++) {
      result.textContent += text[i];
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 20));
    }
  }

  // 生成ボタンクリック
  generateBtn.addEventListener('click', async function () {
    if (isGenerating || isLoading) return;

    if (remainingTemplates.length === 0) {
      reset();
    }

    // AI生成演出（データ分析版）
    await showGeneratingEffect();

    // テキスト取得
    currentText = remainingTemplates.shift();
    
    // タイプライター演出で表示
    await typewriterEffect(currentText);
    
    copyBtn.disabled = false;
    updateStatus();
  });

  // コピーボタンクリック
  copyBtn.addEventListener('click', function () {
    if (!currentText) return;

    navigator.clipboard.writeText(currentText).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ コピー完了！';
      copyBtn.classList.add('copied');
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
      }, 1500);
    }).catch(err => {
      alert('コピーに失敗しました: ' + err);
    });
  });

  // 初期化：CSVファイルを読み込む
  loadTemplatesFromCSV();
});
