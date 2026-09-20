# 応用教材の対応表

サービスを選ぶだけでなく、設定・制約・運用上の違いを判断するための20テーマです。サイトの「応用シナリオ」の番号に対応します。元の試験問題ではなく、独自の場面と選択肢で学び直します。

「サービスを知る」の検索は詳細解説の本文も対象です。表のキーワードを入力すると、関連するサービスの詳細へ進めます。各追加解説の下にAWS公式資料へのリンクがあります。

| 番号 | 判断する知識 | 教材・検索キーワード | 関連する構成図 |
|---:|---|---|---|
| 01 | 直近データと履歴を分け、分析後にアーカイブする | Redshift：UNLOAD、Spectrum／S3：Lifecycle／Glacier：取得費用 | Data Warehouse |
| 02 | オンライン分析、復元期限、保存期限を照合する | S3：Transition、Expiration／Glacier：復元時間 | Serverless Data Lake |
| 03 | DB認証情報の自動ローテーションを選ぶ | Secrets Manager：SQL Server、STS／Parameter Store：SecureString | — |
| 04 | キューの保持期間と不可視期間を区別する | SQS：MessageRetentionPeriod、DelaySeconds、DLQ | — |
| 05 | S3本文を読む最小権限を設定する | IAM：GetObject、Object ARN、広いAllowの置換 | — |
| 06 | コピーせずに別の計算環境から分析する | Redshift：datashare、Producer、Consumer、Serverless | Redshift Data Sharing |
| 07 | Glueへサービスロールを渡す | IAM：AssumeRole、PassRole、GetObject、PutObject | Batch Analytics |
| 08 | S3暗号化方式とCOPYの対応を判断する | KMS：SSE-KMS、SSE-C、kms:Decrypt | Batch Analytics |
| 09 | 行・列・セルのデータ権限を設定する | Lake Formation：データフィルター／Catalogの権限との違い | Serverless Data Lake |
| 10 | PIIの検出を条件に処理を起動する | Macie：Finding、default event bus／EventBridge | Sensitive Data Remediation |
| 11 | 原本と検索インデックスの役割を分ける | OpenSearch：抽出済み本文、インデックス、S3参照 | — |
| 12 | 受信・削除・再表示・DLQ・パージを区別する | SQS：ReceiveMessage、DeleteMessage、maxReceiveCount、PurgeQueue | — |
| 13 | Pod内の一時領域を選ぶ | EKS：emptyDir、Memory、tmpfs、Podの寿命 | — |
| 14 | 複数LambdaでNFSファイルを共有する | EFS：アクセスポイント、POSIX／Lambda：/tmp | Shared Files with Lambda |
| 15 | 定期収集の起動と実行を分ける | Scheduler：cron、rate／Lambda：Python、API収集 | Scheduled API Ingestion |
| 16 | Glueの容量不足と処理の偏りを見分ける | Glue：DPU、Job run monitoring、Observability、Auto Scaling | — |
| 17 | ネストJSONを構造のまま分析する | Redshift：SUPER、PartiQL、JSON_PARSE／Spectrumとの違い | — |
| 18 | ストリーム消費遅延のボトルネックを探す | Kinesis：IteratorAgeMilliseconds、ParallelizationFactor、Enhanced fan-out／Lambda：同時実行 | Streaming Analytics |
| 19 | ログ整形と列指向形式への変換を分ける | Firehose：JSON、Parquet、Catalogスキーマ | Firehose Format Conversion |
| 20 | SaaSとDWHの定型連携をマネージドで構成する | AppFlow：対応コネクタ、イベント、スケジュール、S3中間保存 | SaaS to Data Warehouse |

## 学び方

1. 応用シナリオを読み、各選択肢が要件を満たすか独立に判断します。
2. 回答後は正解だけでなく、全選択肢の理由を確認します。
3. 関連サービスから詳細解説へ、構成がある場合は図へ進みます。
4. サービスの役割・データの経路・制約を自分の言葉で説明してから再挑戦します。

複数選択では、正しい選択肢の選び漏れや誤った選択肢の追加がある場合は不正解です。回答は画面を切り替えても保持し、再読み込みするとリセットします。

## 条件を省略しないための注記

- SQSは保持期限が切れるとDLQへ移動するわけではありません。受信回数によるredriveと保存期限を分けて学びます。[SQS DLQ](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)
- Redshift COPY / UNLOADのクライアント側暗号化は2026年4月30日に提供終了しています。古い暗号化手順をそのまま現在の設計へ適用せず、SSE-KMSなどの対応方式を確認します。[Redshift COPY](https://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html)
- Glueの旧版向けDPU計算例と、現行版のワーカー・Auto Scaling・Observabilityは適用範囲を確認します。[容量計画](https://docs.aws.amazon.com/glue/latest/dg/monitor-debug-capacity.html)、[Observability](https://docs.aws.amazon.com/glue/latest/dg/monitor-observability.html)
- Kinesisの読取帯域不足とLambdaの同時実行不足は別です。同時実行数の変更が常に無効とは限りません。[Lambda＋Kinesis](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html)
- Firehose標準形式変換では、必要ならLambdaでJSONに整えてから、FirehoseがParquet / ORCへ変換します。[形式変換](https://docs.aws.amazon.com/firehose/latest/dev/record-format-conversion.html)

## 実装の参照

- [サービス解説](../src/data/services.ts)
- [構成図](../src/data/patterns.ts)
- [応用シナリオと採点](../src/data/advancedQuizzes.ts)
- [比較教材](../src/data/comparisons.ts)

この対応表は20テーマの学習範囲を示すもので、DEA-C01全体の網羅性や合格可能性を表すものではありません。個別サービスの対応条件は各解説の公式資料で確認できます。
