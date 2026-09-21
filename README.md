# DEA Flow Lab

AWS Certified Data Engineer – Associate（DEA-C01）の学習用Webアプリです。サービス単体の説明から、比較、アーキテクチャ、問題文での判断へ進めます。ローカルでも利用できます。

トップページ（`/` または `#home`）でサイトの目的と学び方を案内します。「順番に学ぶ」「気になることを調べる」「問題で確認する」から目的に合う入口を選べます。初回は第1章を案内し、学習を始めた後は保存した進捗から未完了章を開けます。ロゴやサイドバーからいつでもトップに戻れます。

入口の「体系的に学ぶ」には、基礎から4分野を読む23章、入力と結果を追う具体例、24問の章末確認、30項目の用語辞典を収録しています。2026-09-21に公式試験ガイドv1.1と照合しました。全17タスクへの対応章を表示しますが、全120スキルの習得や合格を保証する教材ではありません。

[敵対的レビューと実装後の判定](docs/adversarial-review-2026-09-21.md) · [追加教材の出典確認記録](docs/source-check-2026-09-21.json)

**公開サイト：[DEA Flow Lab](https://oxyut.github.io/aws-dea-learning-app/)**

## GitHub Pagesへの自動公開

`.github/workflows/pages.yml` で、`main` へのpush時に以下を実行します。

1. Node.js 22で `npm ci` を実行。
2. `npm test` とTypeScriptチェックを含む `npm run build` を実行。
3. 成功した場合のみ、生成した `dist/` をGitHub Pagesへ公開。

GitHub Actions画面から手動実行もできます。個人アクセストークン等の追加シークレットは不要で、GitHubが発行するトークンとOIDCを利用します。デプロイ権限は公開ジョブに限定しています。

Pagesのパスは `actions/configure-pages` の出力からViteの `BASE_PATH` へ渡します。通常のローカル起動では `/` を使用します。公開と同じパスでビルドを試す場合：

```sh
BASE_PATH=/aws-dea-learning-app/ npm run build
BASE_PATH=/aws-dea-learning-app/ npm run preview
```

この場合は `http://127.0.0.1:4173/aws-dea-learning-app/` を開きます。

[デプロイの実行履歴](https://github.com/oXyut/aws-dea-learning-app/actions/workflows/pages.yml)

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

- **23章の学習コース**：前提用語、取り込みと冪等性、Spark、SQL、モデリング、品質、IAM/VPC、監査とガバナンスまで。各章に到達目標・本文・具体例・失敗条件・解説付き確認問題・出典を用意。
- **試験範囲への導線**：17タスクと章の対応、ドメインの出題比率、学習範囲と未収録事項を表示。改訂項目のLLM、Iceberg/S3 Tables、HNSW/IVF、SageMaker Catalog/Unified Studioも扱います。
- **学習の継続**：既読と章末確認を分け、両方を満たした章だけ確認済みにします。本文検索、分野・未完了フィルタ、用語辞典、次の未完了章への案内、章URL・ブラウザの戻る操作に対応。
- **14構成の探索**：Serverless Data Lake、Batch Analytics、Streaming Analytics、Streaming Data Lake、Data Warehouse、CDC、Big Data Processing、Event Driven Pipelineに加え、定期API収集、Firehose形式変換、PII検出後の処理、Lambda＋EFS、SaaS取り込み、Redshiftデータ共有。
- **動くデータフロー**：実データ・メタデータ・制御イベントを色と線種で区別。再生・停止、ノード選択、ステップ解説。
- **40サービスの解説**：既存35サービスにEFS・EKS・Scheduler・Parameter Store・AppFlowを追加。主要9サービスの基礎説明に加え、公式出典付きの応用解説47項目を追加。
- **サービス検索**：名前・用途・キーワード・詳細解説の本文検索、8カテゴリの絞り込み。詳細から関連サービス・比較・構成へ移動。
- **12組の比較**：用途、データ量、リアルタイム性、サーバーレス、運用、SQL、スケール、コスト、適する用途、不適な用途。Secrets Manager対Parameter Store、S3対EFSの比較を追加。
- **10問の独自シナリオ**：空欄形式、単一選択、4候補すべての判断理由、構成図への復習導線、再挑戦。
- **20問の応用シナリオ**：運用・権限・ライフサイクルの判断を学ぶ独自問題。単一／複数選択、全選択肢の解説、公式資料、関連サービス・構成への導線。複数選択は正解の集合が一致した場合のみ正解。
- **アクセシビリティ**：キーボード操作、ネイティブdialogのフォーカス制御・Escape、本文スキップ、動きを抑える設定への対応。
- **レスポンシブ**：PC主体。小さな画面ではナビゲーションを開閉し、図と比較表は領域内で横スクロール。

章の既読・確定済み回答、基礎/応用シナリオの確定済み回答はlocalStorageへ自動保存します。再読み込み・タブを閉じた後も同じブラウザと配信元で復元されます。未確定の選択は保存しません。アカウントや別端末との同期はありません。ブラウザの保存データを削除すると進捗も消えます。保存が拒否された場合やデータが壊れている場合は画面で通知し、学習は継続できます。

章URL例：ローカルでは `http://127.0.0.1:5173/#learn/sql`。GitHub PagesではサイトURLの末尾に `#learn/sql` を付けます。存在しない章URLは最初の章へ安全に戻します。

## 構成

React + TypeScript + Vite。図はHTMLの選択可能なサービスカードとSVGの接続線、CSSアニメーションで描画します。

```text
src/
  App.tsx                      ナビゲーション・アーキテクチャ探索・状態
  components/
    HomePage.tsx               サイトの目的・目的別の入口・学習の再開
    Curriculum.tsx             学習コース・範囲表・用語辞典・章末確認
    Diagram.tsx                接続線とサービスノードの描画
    LearningViews.tsx           サービス詳細・比較・基礎シナリオ
    AdvancedPractice.tsx       応用シナリオ・複数選択の採点と復習
  data/
    curriculum*.ts             23章の本文・具体例・確認問題・17タスク
    glossary.ts                用語と本文への参照
    learningProgress.ts        完了条件・採点・保存値の検証
    navigation.ts              ハッシュURLの解釈
    practiceProgress.ts        既存シナリオの保存値の検証
    services.ts                サービス、カテゴリ、連携、公式資料
    patterns.ts                ノード、エッジ、役割、ステップ
    comparisons.ts             比較軸と10組の比較
    quizzes.ts                 基礎問題・選択肢・理由・対応構成
    advancedQuizzes.ts         応用20問・判断理由・公式根拠・採点
  styles.css                   テーマとレスポンシブ表示
  main.tsx                     エントリーポイント
  hooks/useStoredState.ts      保存失敗時も使えるlocalStorageフック
tests/content.test.ts          参照整合性と重要な教育上の制約
tests/curriculum.test.ts       教材参照・採点・完了条件・復元・URL
public/favicon.svg             アプリアイコン
spec.md                        元の仕様書
```

## 教材を拡張する

章を追加する場合は `Lesson` 型に従い、本文・入力例・結果・理由・確認問題・出典と確認日をそろえます。タスク対応はリンク先の章が実際に説明している内容に限定し、対応章があることを全スキル習得率へ換算しません。問題IDと選択肢の意味を変える場合は保存済み回答の互換性を確認し、必要なら保存キーの版を上げてください。

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

## AWS公式アイコン

構成図・サービス一覧・詳細画面に、[AWS Architecture Icons](https://aws.amazon.com/architecture/icons/) の2026年7月31日版を使用しています。元の色・形を変更せず、SVGを同梱しています。出典とファイルの対応は [ATTRIBUTION.md](public/aws-icons/ATTRIBUTION.md)、元ファイル名とハッシュは [manifest.json](public/aws-icons/manifest.json) を参照してください。40サービス中39サービスに対応し、今回の配布物に単独アイコンがないQuickSightは汎用アイコンを使用しています。

## 応用教材の範囲

20の知識テーマと教材への対応は [教材対応表](docs/learning-scope.md) に記載しています。サービス名だけでなく、誤答になりやすい設定や条件の違いも扱います。

- SQSの保持期限切れとDLQへの移動は別の仕組みです。
- Glueの旧版向けDPU計算式は現行ワーカーへ一般化しません。
- LambdaのJSON整形とFirehoseのParquet変換を分けます。
- Kinesisの遅延は、読取帯域・キーの偏り・バッチ並列性・関数の同時実行制限を切り分けます。

教材・確認問題は独自に作成しており、元の公式問題文・選択肢や個人の受験記録は公開リポジトリに含めていません。知識テーマの対応は本試験全体の網羅や合格を保証するものではありません。
