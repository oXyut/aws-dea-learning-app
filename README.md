# DEA Flow Lab

AWS Certified Data Engineer – Associate（DEA-C01）の学習用ローカルWebアプリです。サービス単体の説明から、比較、アーキテクチャ、問題文での判断へ進めます。Miroの成果物には依存していません。

## 起動

Node.js 22以上、npmが必要です。

GitHubから初めて取得する場合：

```sh
gh repo clone oXyut/aws-dea-learning-app
cd aws-dea-learning-app
npm ci
npm run dev
```

すでにローカルにある場合は、`aws-dea-learning-app` ディレクトリで `npm run dev` を実行します。

ターミナルに表示されるURL（通常 `http://127.0.0.1:5173/`）を開きます。開発サーバーはローカルホストだけで待ち受けます。

```sh
npm test       # 教材・グラフ・比較・問題のデータ整合性
npm run build  # TypeScriptチェックと静的ビルド
npm run preview # ビルド済みアプリをプレビュー
npm run format # ソース整形
```

`dist/` が静的な配信物です。バックエンド、AWS認証情報、AWSリソース、データベースは不要です。依存関係インストール後、教材閲覧に外部APIや外部フォントの通信は不要です。公式ドキュメントを開くときのみインターネットが必要です。

## できること

- **8構成の探索**：Serverless Data Lake、Batch Analytics、Streaming Analytics、Streaming Data Lake、Data Warehouse、CDC、Big Data Processing、Event Driven Pipeline。
- **動くデータフロー**：実データ・メタデータ・制御イベントを色と線種で区別。再生・停止、ノード選択、ステップ解説。
- **35サービスの解説**：仕様指定の33サービス／機能と、QuickSight・Managed Service for Apache Flink。主要9サービスには追加解説。
- **サービス検索**：名前・用途・キーワード検索、8カテゴリの絞り込み。詳細から関連サービス・比較・構成へ移動。
- **10組の比較**：用途、データ量、リアルタイム性、サーバーレス、運用、SQL、スケール、コスト、適する用途、不適な用途。
- **10問の独自シナリオ**：空欄形式、単一選択、4候補すべての判断理由、構成図への復習導線、再挑戦。
- **アクセシビリティ**：キーボード操作、ネイティブdialogのフォーカス制御・Escape、本文スキップ、動きを抑える設定への対応。
- **レスポンシブ**：PC主体。小さな画面ではナビゲーションを開閉し、図と比較表は領域内で横スクロール。

シナリオの回答はアプリを開いている間、画面切り替え後も維持します。再読み込みやタブを閉じるとリセットします。永続的な学習履歴やアカウント機能はありません。

## 構成

React + TypeScript + Vite。図はHTMLの選択可能なサービスカードとSVGの接続線、CSSアニメーションで描画します。

```text
src/
  App.tsx                      ナビゲーション・アーキテクチャ探索・状態
  components/
    Diagram.tsx                接続線とサービスノードの描画
    LearningViews.tsx           サービス詳細・比較・シナリオ
  data/
    services.ts                サービス、カテゴリ、連携、公式資料
    patterns.ts                ノード、エッジ、役割、ステップ
    comparisons.ts             比較軸と10組の比較
    quizzes.ts                 問題・選択肢・理由・対応構成
  styles.css                   テーマとレスポンシブ表示
  main.tsx                     エントリーポイント
tests/content.test.ts          参照整合性と重要な教育上の制約
public/favicon.svg             アプリアイコン
spec.md                        元の仕様書
```

## 教材を拡張する

1. サービス追加：`services.ts` の `Service` 型に従ってエントリーを追加します。安定したID、適さない用途、比較対象、公式資料のURLを含めます。
2. 図を追加：`patterns.ts` の `Pattern` にノード・エッジ・学習ステップを追加します。ノードはサービスIDを参照。接続は `data` / `metadata` / `event` を使い分けます。
3. 比較追加：`comparisons.ts` の10軸に対応する両サービスの説明を追加します。
4. 問題追加：4候補と各候補の理由を記載し、正解サービスと対応パターンを指定します。空欄は対象ノードIDを指定します。
5. `npm test` と `npm run build` を実行し、画面で文量とノード配置を確認します。現在の件数を検証するテストも、意図的な追加に合わせて更新してください。

## 教材の扱い・根拠

本アプリはAWS非公式の独自教材であり、実際の試験問題の転載や合格保証ではありません。各サービスの詳細にはAWS公式ドキュメントへのリンクを用意しています。主要な誤解を避けるため、次を確認して構成しています。

- [AthenaとData Catalog](https://docs.aws.amazon.com/athena/latest/ug/data-sources-glue.html)：実データはS3、Catalogは定義。CrawlerはETLではなく発見・登録を行います。
- [Amazon Data Firehose](https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html)：旧称Kinesis Data Firehose。保持・再読用のStreamsと配信役割を区別します。
- [DMSからRedshiftへの移行](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Target.Redshift.html)：S3ステージングを経由することを注記しています。
- [Glue job bookmarks](https://docs.aws.amazon.com/glue/latest/dg/monitor-continuations.html)：出力の重複排除が自動で保証されるわけではありません。
- [Lambdaのクォータ](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)：1回の実行は最大15分。
- [EMR Serverless](https://docs.aws.amazon.com/emr/latest/EMR-Serverless-UserGuide/emr-serverless.html)、[Redshift Serverless](https://docs.aws.amazon.com/redshift/latest/gsg/)：「サーバーレス」という単語だけで選択を決めないようにしています。
- [DEA-C01公式試験ガイド](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html)：試験範囲は改訂されるため、受験前に最新版を確認してください。

図は役割を学ぶための概念図です。VPC、IAM、KMS、エラーパス等を含む実際のデプロイ図ではありません。CDC図の複数ターゲットは選択肢であり、1タスクがすべてに同時配信する意味ではありません。課金単価や細かなクォータは変動するため固定値を掲載していません。
