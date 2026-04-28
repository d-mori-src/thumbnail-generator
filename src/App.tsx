import React, { useState } from "react";

type SizeOption = "1280x720" | "1:1";
type Mode = "single" | "multi";

const tasteOptions = ["メディア風", "エンタメ", "高級感"] as const;

function App() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [taste, setTaste] = useState<(typeof tasteOptions)[number]>("メディア風");
  const [size, setSize] = useState<SizeOption>("1280x720");
  const [mode, setMode] = useState<Mode>("single");

  const [prompt, setPrompt] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const generatePrompt = () => {
    const styleMap = {
      "メディア風":
        "ニュースやYouTubeサムネイルのような強いコントラストと視認性の高いデザイン",
      "エンタメ":
        "明るくカラフルで感情表現が強いエンタメ系ビジュアル",
      "高級感":
        "ミニマルで洗練された高級感のあるプレミアムデザイン"
    };

    const baseCommon = `
あなたはプロのグラフィックデザイナーです。
YouTubeサムネイルとしてクリック率が最大化される画像を生成してください。

タイトル:
「${title}」

スタイル:
${styleMap[taste]}

画像素材:
${image ? "アップロード画像を主要被写体として使用（顔・構図は保持）" : "画像なしで完全生成"}

■制約
・元画像の被写体を改変しない
・顔の特徴を保持する
・構図の位置関係を維持する
・スタイルのみ変更する

重要:
・日本語テキストを必ず正しく配置
・読みやすさ最優先
・強い視覚インパクト
・プロ品質のデザイン
`.trim();

    if (mode === "single") {
      const sizeText =
        size === "1280x720"
          ? "横長 16:9（YouTubeサムネイルサイズ）"
          : "正方形 1:1";

      const promptSingle = `
${baseCommon}

出力形式:
1枚のみ生成してください

サイズ:
${sizeText}

構図:
タイトルを大きく配置し、視線誘導を意識したレイアウト
    `.trim();

      setPrompt(promptSingle);
      return;
    }

    // ✅ multi FIX（ここが重要）
    const promptMulti = `
${baseCommon}

出力形式:
以下の9種類をそれぞれ並べて生成してください。

【絶対条件】
・すべて必ず「${size}」サイズで生成すること
・アスペクト比を厳守すること（変更禁止）

【共通ルール】
・すべての画像に「${title}」を必ず含める
・クリック率最大化を目的とする
・文字は必ず読みやすくする
`.trim();

    setPrompt(promptMulti);
  };

  return (
    <div>
      <h1>サムネイル生成アプリ</h1>

      <div>
        <label>タイトル</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label>画像アップロード</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <div>
        <label>テイスト</label>
        <select value={taste} onChange={(e) => setTaste(e.target.value as any)}>
          {tasteOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>サイズ</label>
        <select value={size} onChange={(e) => setSize(e.target.value as SizeOption)}>
          <option value="1280x720">1280x720</option>
          <option value="1:1">1:1</option>
        </select>
      </div>

      <div>
        <label>生成モード</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="single">1案生成（指定サイズ）</option>
          <option value="multi">9案生成（バリエーション）</option>
        </select>
      </div>

      <button onClick={generatePrompt}>プロンプト生成</button>

      <hr />

      <div>
        <h3>生成プロンプト</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>{prompt}</pre>
      </div>
    </div>
  );
}

export default App;