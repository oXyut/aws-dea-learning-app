export const glossary = [
  ['スキーマ / schema', '列名・データ型・必須条件など、データの形についての約束。', 'foundations'],
  [
    'メタデータ / metadata',
    'データの場所・構造・所有者など、データそのものを説明する情報。',
    'catalogs',
  ],
  [
    'ETL / ELT',
    '抽出・変換・ロードの順序。ETLは変換してから、ELTはロードしてから変換する。',
    'foundations',
  ],
  ['CDC', 'Change Data Capture。DBの変更を継続して取り込む方式。', 'ingestion'],
  [
    '冪等性 / idempotency',
    '同じ操作を繰り返しても最終結果が増えたり変わったりしない性質。',
    'ingestion',
  ],
  ['upsert', 'キーが既にあれば更新し、なければ追加する処理。', 'ingestion'],
  ['チェックポイント', '再開に必要な読取位置や処理状態の記録。出力の重複排除とは別。', 'streams'],
  [
    'スロットリング / throttling',
    '処理可能な量や回数の上限に達したため要求が制限されること。',
    'streams',
  ],
  ['シャード / shard', '負荷を分散して扱うためのデータ・処理の分割単位。', 'streams'],
  ['fan-in / fan-out', '複数の入力を集約すること / 一つの入力を複数の処理へ配ること。', 'streams'],
  [
    'stateful / stateless',
    '過去の累計などの状態を持つ処理 / 個々の入力を独立に処理する方式。',
    'streams',
  ],
  [
    'DPU',
    'Data Processing Unit。Glueの計算容量を表す単位。必要量はジョブの実測で決める。',
    'monitoring',
  ],
  [
    'shuffle / spill / skew',
    '分散処理でのデータ再配分 / メモリからディスクへの退避 / データや負荷の偏り。',
    'transforms',
  ],
  [
    'カーディナリティ',
    '異なる値の数。種類が多すぎるキーでの細かな分割は小ファイルを増やし得る。',
    'transforms',
  ],
  ['DAG', '循環しない有向グラフ。タスクの実行依存を表す。', 'orchestration'],
  [
    'IaC / CI/CD',
    'インフラをコードで定義する方法 / 変更を継続的に検証・配布する仕組み。',
    'programming',
  ],
  ['OLTP / OLAP', '個別の取引を処理する用途 / 大量の履歴を集約・分析する用途。', 'stores'],
  [
    'GSI / LSI',
    'DynamoDBの副次インデックス。GSIは別のpartition key、LSIは同じpartition keyを使用する。',
    'dynamodb-design',
  ],
  ['fact / dimension / grain', '出来事や測定値 / 分析の切り口 / 1行が表す単位。', 'modeling'],
  [
    'SCD',
    'Slowly Changing Dimension。顧客属性等の変化を上書きするか、版を分けて履歴にするかという設計。',
    'modeling',
  ],
  ['RPO / RTO', '許容するデータ損失の時間幅 / 復旧までに許容する時間。', 'lifecycle'],
  ['TTL', 'Time To Live。期限の指定。DynamoDBでは期限後に非同期で項目が削除される。', 'lifecycle'],
  [
    'snapshot / compaction',
    'テーブルのある時点の状態 / 小ファイル等をまとめて読取効率を改善する保守。',
    'iceberg',
  ],
  [
    'embedding / chunk / RAG',
    '意味を数値のベクトルにする処理 / 文書の分割片 / 関連文書を検索して生成に使う方式。',
    'vectors',
  ],
  [
    'WLM',
    'Workload Management。Redshiftのクエリの実行資源や待ち行列を管理する仕組み。',
    'monitoring',
  ],
  [
    'PII',
    '個人を識別し得る情報。氏名・メール等を、用途と方針に応じて分類・保護する。',
    'governance',
  ],
  [
    'IAM / KMS',
    'AWSの主体と操作の権限を管理するサービス / 暗号鍵と鍵の利用を管理するサービス。',
    'authorization',
  ],
  [
    'VPC / SG / NACL',
    'AWS内の仮想ネットワーク / リソースの通信制御 / サブネットの通信制御。',
    'authentication',
  ],
  [
    'SCP / ABAC / RBAC',
    '組織内の権限上限を定めるポリシー / 属性に基づく認可 / 役割に基づく認可。',
    'authorization',
  ],
  ['リネージ / lineage', 'どの入力がどの変換を経て出力になったかを示す来歴。', 'modeling'],
] as const;
