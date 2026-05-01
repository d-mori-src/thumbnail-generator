import React, { useState } from "react";
// 1. SDKのインポート
import { GoogleGenerativeAI } from "@google/generative-ai";

// eslint-disable-next-line
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

// 2. Geminiの初期化（apiKeyがない場合はエラーにならないようチェック）
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

type SizeOption = "1200x630" | "1:1";
type Mode = "single" | "multi";

const tasteOptions = ["メディア風", "エンタメ", "高級感"] as const;

function App() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [taste, setTaste] = useState<(typeof tasteOptions)[number]>("メディア風");
  const [size, setSize] = useState<SizeOption>("1200x630");
  const [mode, setMode] = useState<Mode>("single");
  const [prompt, setPrompt] = useState("");

  // 3. 通信状態を管理するステート
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // プロンプト生成（既存ロジック）
  const generatePrompt = () => {
    const styleMap = {
      "メディア風": "ニュースやYouTubeサムネイルのような強いコントラストと視認性の高いデザイン",
      "エンタメ": "明るくカラフルで感情表現が強いエンタメ系ビジュアル",
      "高級感": "ミニマルで洗練された高級感のあるプレミアムデザイン"
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

    const sizeText = size === "1200x630" ? "横長 1200x630（OGP/SNS広告サイズ）" : "正方形 1:1";
    const promptSingle = `${baseCommon}\n\n出力形式:\n1枚のみ生成してください\n\nサイズ:\n${sizeText}\n\n構図:\nタイトルを大きく配置し、視線誘導を意識したレイアウト`.trim();

    setPrompt(promptSingle);
  };

  // 4. Gemini API 疎通テスト用関数
  // const testGeminiCommunication = async () => {
  //   if (!genAI) {
  //     alert("APIキーが設定されていません。.envを確認してください。");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  //     const testMessage = `以下のプロンプトを受け取りましたか？「OK」とだけ返してください。\n\n${prompt}`;

  //     const result = await model.generateContent(testMessage);
  //     const response = await result.response;
  //     console.log("Geminiからの応答:", response.text());
  //     alert("疎通確認成功！コンソールを確認してください。");
  //   } catch (error) {
  //     console.error("通信エラー:", error);
  //     alert("通信に失敗しました。");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // 1. Helper関数: FileオブジェクトをGeminiが扱えるBase64形式に変換
  async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      // @ts-ignore
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        data: await base64EncodedDataPromise as string,
        mimeType: file.type,
      },
    };
  }

  // 2. 通信関数をアップグレード
  const testGeminiCommunication = async () => {
    if (!genAI) return;
    if (!image) {
      alert("画像をアップロードしてからテストしてください。");
      return;
    }

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 画像を変換
      const imagePart = await fileToGenerativePart(image);

      // テキストと画像を配列で渡す
      const promptMessage = "この画像には何が写っていますか？短く簡潔に説明してください。";

      const result = await model.generateContent([promptMessage, imagePart]);
      const response = await result.response;

      console.log("Geminiの画像解析結果:", response.text());
      alert("画像解析成功！コンソールを確認してください。");
    } catch (error) {
      console.error("通信エラー:", error);
      alert("画像送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>サムネイル生成アプリ</h1>

      <div>
        <label>タイトル</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>画像アップロード</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>テイスト</label>
        <select value={taste} onChange={(e) => setTaste(e.target.value as any)}>
          {tasteOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>サイズ</label>
        <select value={size} onChange={(e) => setSize(e.target.value as SizeOption)}>
          <option value="1200x630">1200x630</option>
          <option value="1:1">1:1</option>
        </select>
      </div>

      <button onClick={generatePrompt} style={{ marginTop: "20px" }}>
        プロンプト生成
      </button>

      <hr />

      {prompt && (
        <div>
          <h3>生成プロンプト</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f0f0f0", padding: "10px" }}>{prompt}</pre>

          {/* 5. 疎通確認用ボタンを表示 */}
          <button
            onClick={testGeminiCommunication}
            disabled={loading}
            style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px" }}
          >
            {loading ? "通信中..." : "Geminiに送信テスト"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;