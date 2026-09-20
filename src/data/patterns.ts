export type EdgeKind = 'data' | 'metadata' | 'event';
export interface FlowNode {
  id: string;
  service?: string;
  label?: string;
  subtitle: string;
  x: number;
  y: number;
  role: string;
}
export interface FlowEdge {
  from: string;
  to: string;
  label: string;
  kind: EdgeKind;
  bend?: number;
}
export interface Pattern {
  id: string;
  name: string;
  ja: string;
  tag: string;
  time: string;
  description: string;
  why: string;
  alternative: string;
  exam: string;
  keywords: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  steps: { node: string; title: string; text: string }[];
}
export const patterns: Pattern[] = [
  {
    id: 'serverless-lake',
    name: 'Serverless Data Lake',
    ja: 'サーバーレスで、データを分析',
    tag: 'まずはここから',
    time: '8 min',
    description:
      'S3にあるログを、必要なときだけSQLで分析する。保存・メタデータ・計算を分けて、データレイクの基本を学びます。',
    why: 'データをDWHにロードせず、S3に保存したまま分析できます。Crawlerで発見した構造をCatalogに登録し、Athenaが参照します。',
    alternative:
      '複雑なJOINを継続実行する定型BIならRedshiftも候補。スキーマが既知ならCrawlerの代わりにDDLで定義できます。',
    exam: '数TBのS3ログを月に数回SQL分析。管理を最小限にしたい → Athenaが有力。継続的なDWHを前提にする必要はありません。',
    keywords: ['S3 data lake', 'ad-hoc SQL', 'serverless'],
    nodes: [
      {
        id: 'raw',
        service: 's3',
        subtitle: 'データを保存',
        x: 50,
        y: 175,
        role: 'CSV・JSON・Parquetなどの実データを保持します。この図ではAthenaが実データを読み出す唯一の保存先です。',
      },
      {
        id: 'crawl',
        service: 'crawler',
        subtitle: 'スキーマを発見',
        x: 290,
        y: 50,
        role: 'S3を調べて列の型やパーティションを推論します。実データを変換・転送する処理ではありません。',
      },
      {
        id: 'meta',
        service: 'catalog',
        subtitle: '定義を共有',
        x: 530,
        y: 50,
        role: 'S3の場所・列名・型をテーブル定義として記録します。実データは引き続きS3にあります。',
      },
      {
        id: 'query',
        service: 'athena',
        subtitle: 'SQLで分析',
        x: 770,
        y: 175,
        role: 'Catalogの定義を参照し、S3の必要なデータを直接読みます。スキャン量を減らすためにParquetやパーティションを活用します。',
      },
    ],
    edges: [
      { from: 'raw', to: 'crawl', label: 'スキーマを調査', kind: 'metadata' },
      { from: 'crawl', to: 'meta', label: '定義を登録', kind: 'metadata' },
      { from: 'meta', to: 'query', label: 'テーブル定義', kind: 'metadata' },
      { from: 'raw', to: 'query', label: 'S3の実データを直接読み取り', kind: 'data', bend: 120 },
    ],
    steps: [
      {
        node: 'raw',
        title: 'まず、データを置く',
        text: 'ログや業務データをS3へ保存。データと計算を分離する出発点です。',
      },
      {
        node: 'crawl',
        title: 'データの構造を知る',
        text: 'Crawlerがファイルを調査し、列名・型・パーティションを発見します。',
      },
      {
        node: 'meta',
        title: '「データの地図」を共有する',
        text: 'Catalogが場所と構造を保持。ここに元データをコピーするわけではありません。',
      },
      {
        node: 'query',
        title: '必要なデータだけを読む',
        text: 'Athenaが定義を使ってS3を読み、SQLの結果を返します。結果はBIツールにもつなげられます。',
      },
    ],
  },
  {
    id: 'batch',
    name: 'Batch Analytics',
    ja: 'まとめて取り込み、変換する',
    tag: 'バッチ',
    time: '10 min',
    description: '業務DBのデータを定期的に取り込み、分析向けの形に変換してDWHへ届けます。',
    why: 'DMSが移行・複製、S3が中間保存、Glueが変換、Redshiftが継続分析を担当します。処理の責任を分離し、S3から再処理できます。',
    alternative:
      '変換がSQLで完結するならS3からRedshiftへCOPYし、ELTする選択もあります。定期スナップショットだけでよければDMS以外の抽出手段も検討します。',
    exam: '業務DBへの分析負荷を抑え、夜間に集計したい → DBから抽出し、分析をRedshiftへ分離します。',
    keywords: ['batch ETL', 'COPY', 'data warehouse'],
    nodes: [
      {
        id: 'db',
        service: 'rds',
        subtitle: '業務データ',
        x: 25,
        y: 140,
        role: 'トランザクションを処理するソースDB。分析基盤へデータを提供します。',
      },
      {
        id: 'ingest',
        service: 'dms',
        subtitle: 'データを抽出',
        x: 225,
        y: 140,
        role: 'フルロードや継続複製でDBから取り込みます。対応するエンドポイントを確認します。',
      },
      {
        id: 'raw',
        service: 's3',
        subtitle: 'Rawデータを保存',
        x: 425,
        y: 140,
        role: '取り込んだデータを残し、障害時の再処理を可能にします。',
      },
      {
        id: 'etl',
        service: 'glue',
        subtitle: '分析用に変換',
        x: 625,
        y: 140,
        role: '型の統一、結合、重複排除などの変換を行います。Redshift出力にはS3ステージングとCOPYが使われます。',
      },
      {
        id: 'dwh',
        service: 'redshift',
        subtitle: 'SQLで継続分析',
        x: 825,
        y: 140,
        role: '統合した分析データに対してBIクエリを実行します。',
      },
    ],
    edges: [
      { from: 'db', to: 'ingest', label: '抽出', kind: 'data' },
      { from: 'ingest', to: 'raw', label: '保存', kind: 'data' },
      { from: 'raw', to: 'etl', label: '読み取り', kind: 'data' },
      { from: 'etl', to: 'dwh', label: 'S3 / COPY', kind: 'data' },
    ],
    steps: [
      {
        node: 'db',
        title: '分析負荷を分離する',
        text: 'RDSは業務処理を担い、分析は別の基盤で実行します。',
      },
      {
        node: 'ingest',
        title: 'ソースから取り込む',
        text: 'DMSで初期データや変更データを取り込みます。',
      },
      {
        node: 'raw',
        title: '再処理の基点を残す',
        text: 'S3上のRawデータがあれば、変換ロジックを修正して再実行できます。',
      },
      {
        node: 'etl',
        title: '分析用の形へ整える',
        text: 'Glueで必要な変換を行い、Redshiftへロードします。',
      },
      {
        node: 'dwh',
        title: '業務の指標を集計する',
        text: 'Redshiftで定型の集計や複雑なJOINを実行します。',
      },
    ],
  },
  {
    id: 'streaming',
    name: 'Streaming Analytics',
    ja: 'イベントを、その場で処理',
    tag: 'ストリーミング',
    time: '9 min',
    description: 'アプリから届くイベントを保持し、Lambdaで処理して履歴と最新状態を保存します。',
    why: 'Kinesisがイベントを保持して再読を可能にし、Lambdaが短い変換を担当。S3には履歴、DynamoDBにはキーで取り出す最新状態を保存します。',
    alternative:
      '時間窓の集計や複雑な状態管理が必要ならFlink。保存先へ配信するだけならFirehoseで構成を簡略化できます。',
    exam: '複数コンシューマー、再読、低遅延の処理 → Kinesis。単なる作業キューのSQSとは要件が異なります。',
    keywords: ['real-time', 'replay', 'idempotency'],
    nodes: [
      {
        id: 'app',
        label: 'Application',
        subtitle: 'イベントを送信',
        x: 30,
        y: 145,
        role: 'クリックや注文などのイベントを生成します。適切なパーティションキーを付けます。',
      },
      {
        id: 'stream',
        service: 'kinesis',
        subtitle: '保持・再読',
        x: 265,
        y: 145,
        role: 'コンシューマーから独立してイベントを保持します。順序はキーとシャードの設計を踏まえて扱います。',
      },
      {
        id: 'process',
        service: 'lambda',
        subtitle: '短い処理を実行',
        x: 505,
        y: 145,
        role: 'イベントソースマッピング経由でレコードを処理。重複到着への冪等性、バッチ失敗の扱いを設計します。',
      },
      {
        id: 'history',
        service: 's3',
        subtitle: '履歴を保存',
        x: 795,
        y: 50,
        role: 'あとから分析・再処理できるよう履歴データを保存します。小さすぎるファイルを大量に作らない工夫が必要です。',
      },
      {
        id: 'state',
        service: 'dynamodb',
        subtitle: '最新状態を保存',
        x: 795,
        y: 245,
        role: 'キーに基づく低遅延の状態取得に使います。イベントIDや条件付き書き込みで冪等性を担保します。',
      },
    ],
    edges: [
      { from: 'app', to: 'stream', label: 'イベント', kind: 'data' },
      { from: 'stream', to: 'process', label: 'バッチ読取', kind: 'data' },
      { from: 'process', to: 'history', label: '履歴', kind: 'data' },
      { from: 'process', to: 'state', label: '状態更新', kind: 'data' },
    ],
    steps: [
      {
        node: 'app',
        title: 'イベントを発生させる',
        text: 'アプリは発生したイベントをストリームへ送ります。',
      },
      {
        node: 'stream',
        title: '保持と処理を分ける',
        text: 'Kinesis上のイベントは保持期間内で再読できます。',
      },
      { node: 'process', title: 'イベントを処理する', text: 'Lambdaが短い変換・検証を行います。' },
      {
        node: 'history',
        title: '履歴と状態を分けて保存',
        text: 'S3で履歴を残し、DynamoDBで最新状態をすばやく取得します。',
      },
    ],
  },
  {
    id: 'streaming-lake',
    name: 'Streaming Data Lake',
    ja: 'ログを継続的にレイクへ',
    tag: 'ストリーミング',
    time: '8 min',
    description: '管理の手間を抑えてログをS3へ配信し、定期的な変換後にSQLで分析します。',
    why: 'Firehoseがバッファリング・配信を管理。GlueはS3に到着したデータを加工し、Athenaが加工済みデータを読みます。',
    alternative:
      '独自コンシューマーや再読が必要なら前段にKinesisを追加します。変換が不要ならRawデータをAthenaで直接分析できます。',
    exam: 'ログを継続的にS3へ配信、運用最小、厳密な即時性は不要 → Firehoseが有力です。',
    keywords: ['managed delivery', 'near real-time', 'Parquet'],
    nodes: [
      {
        id: 'app',
        label: 'Application',
        subtitle: 'ログを送信',
        x: 20,
        y: 120,
        role: 'アプリケーションがFirehoseへデータを送信します。',
      },
      {
        id: 'delivery',
        service: 'firehose',
        subtitle: 'バッファ・配信',
        x: 215,
        y: 120,
        role: 'データをまとめてS3へ配信します。配信遅延・変換・失敗レコードの扱いを設定します。',
      },
      {
        id: 'raw',
        service: 's3',
        subtitle: 'Rawログ',
        x: 410,
        y: 120,
        role: '受信したデータの保存先。後続ETLの入力になります。',
      },
      {
        id: 'etl',
        service: 'glue',
        subtitle: '整形・Parquet化',
        x: 605,
        y: 120,
        role: 'データを変換して別のS3プレフィックスへ出力し、Catalog定義も整えます。',
      },
      {
        id: 'curated',
        service: 's3',
        subtitle: 'Curatedデータ',
        x: 605,
        y: 290,
        role: '変換済みデータの保存先です。Athenaはこの実データを読みます。',
      },
      {
        id: 'query',
        service: 'athena',
        subtitle: 'SQLで分析',
        x: 820,
        y: 290,
        role: 'Catalogに定義されたCuratedデータを分析します。ここではCatalogの登録経路は省略しています。',
      },
    ],
    edges: [
      { from: 'app', to: 'delivery', label: 'ログ', kind: 'data' },
      { from: 'delivery', to: 'raw', label: '配信', kind: 'data' },
      { from: 'raw', to: 'etl', label: '読取', kind: 'data' },
      { from: 'etl', to: 'curated', label: '書込', kind: 'data' },
      { from: 'curated', to: 'query', label: 'SQL読取', kind: 'data' },
    ],
    steps: [
      {
        node: 'delivery',
        title: '配信を任せる',
        text: 'Firehoseがデータをバッファし、S3へ配信します。',
      },
      { node: 'raw', title: 'ログを蓄積する', text: 'S3にデータを残し、配信と分析を分離します。' },
      {
        node: 'etl',
        title: 'データを整形する',
        text: 'Glueが定期的にRaw層からCurated層へ変換します。',
      },
      {
        node: 'query',
        title: '蓄積済みデータを分析',
        text: 'AthenaがCurated層を読みます。ストリームそのものへの即時クエリではありません。',
      },
    ],
  },
  {
    id: 'warehouse',
    name: 'Data Warehouse',
    ja: 'データを統合し、BIへ届ける',
    tag: '分析基盤',
    time: '9 min',
    description:
      '複数ソースのデータを統合してRedshiftへロードし、統一された指標をダッシュボードで共有します。',
    why: 'Glueでデータの型・キーを揃え、Redshiftに分析モデルを構築。BIは利用者向けの可視化を担当します。',
    alternative:
      '変換がSQL中心ならRedshift内でELT。履歴をS3に残してSpectrumで結合する構成もあります。',
    exam: '多数の継続的なBIクエリ、複雑なJOIN、データ統合 → Redshiftを検討します。',
    keywords: ['BI', 'complex joins', 'dimensional model'],
    nodes: [
      {
        id: 'files',
        service: 's3',
        subtitle: 'ファイルデータ',
        x: 30,
        y: 60,
        role: 'ログやファイル形式のソースデータを保持します。',
      },
      {
        id: 'db',
        service: 'rds',
        subtitle: '業務データ',
        x: 30,
        y: 245,
        role: 'GlueがJDBCなどで抽出します。業務DBへの負荷と接続設定に注意します。',
      },
      {
        id: 'etl',
        service: 'glue',
        subtitle: 'データを統合',
        x: 300,
        y: 150,
        role: '異なるソースの型・キー・粒度を揃えてDWHへロードします。',
      },
      {
        id: 'dwh',
        service: 'redshift',
        subtitle: '分析モデル',
        x: 570,
        y: 150,
        role: '統合テーブルで集計・JOINを実行し、BIクエリに応答します。',
      },
      {
        id: 'bi',
        service: 'quicksight',
        subtitle: '指標を共有',
        x: 825,
        y: 150,
        role: '集計結果をダッシュボード化。SPICE取り込み時には更新頻度とデータ鮮度を合わせます。',
      },
    ],
    edges: [
      { from: 'files', to: 'etl', label: 'ログ', kind: 'data' },
      { from: 'db', to: 'etl', label: 'JDBC抽出', kind: 'data' },
      { from: 'etl', to: 'dwh', label: 'S3 / COPY', kind: 'data' },
      { from: 'dwh', to: 'bi', label: '分析結果', kind: 'data' },
    ],
    steps: [
      {
        node: 'files',
        title: '複数のソースを用意する',
        text: 'S3のログとRDSの業務データを統合します。',
      },
      { node: 'etl', title: '分析の粒度を揃える', text: 'Glueで型やキーを統一します。' },
      {
        node: 'dwh',
        title: '継続分析のために整理',
        text: 'Redshift上で分析向けのデータモデルを構築します。',
      },
      { node: 'bi', title: '利用者へ届ける', text: 'ダッシュボードで共通の指標を確認できます。' },
    ],
  },
  {
    id: 'cdc',
    name: 'Change Data Capture',
    ja: 'DBの変更だけを取り込む',
    tag: 'CDC',
    time: '10 min',
    description:
      '稼働中DBの変更ログから、追加・更新・削除を分析基盤へ継続配信します。図のターゲットは要件に応じた選択肢です。',
    why: 'DMS CDCならDB全体を毎回読み直さずに変更を複製できます。初期ロードと組み合わせて開始します。',
    alternative:
      'ファイルの差分転送ならDataSync。抽出済みデータの複雑な変換にはGlueなどを後段に配置します。',
    exam: '既存DBを動かしたまま更新を継続的に分析基盤へ反映 → DMS CDCを検討。ソースログ設定と対応ターゲットを確認します。',
    keywords: ['CDC', 'transaction log', 'replication'],
    nodes: [
      {
        id: 'db',
        service: 'rds',
        subtitle: '稼働中のDB',
        x: 50,
        y: 165,
        role: 'DMSが読み取れる変更ログと保持期間を設定します。',
      },
      {
        id: 'replication',
        service: 'dms',
        subtitle: '変更をキャプチャ',
        x: 330,
        y: 165,
        role: '初期フルロード後の変更を継続複製します。各ターゲットへの複製はタスク構成を分けて設計します。',
      },
      {
        id: 'stream',
        service: 'kinesis',
        subtitle: 'イベントとして処理',
        x: 760,
        y: 20,
        role: '変更をイベントとして下流コンシューマーが処理します。',
      },
      {
        id: 'lake',
        service: 's3',
        subtitle: '変更履歴を保存',
        x: 760,
        y: 165,
        role: '変更イベントを蓄積。後段で更新・削除を分析テーブルへ適用する設計が必要です。',
      },
      {
        id: 'dwh',
        service: 'redshift',
        subtitle: '分析DBに反映',
        x: 760,
        y: 310,
        role: 'DMSはS3ステージングを介してRedshiftへロードします。この図では中間S3を省略しています。',
      },
    ],
    edges: [
      { from: 'db', to: 'replication', label: '変更ログ', kind: 'data' },
      { from: 'replication', to: 'stream', label: '選択肢 A', kind: 'data' },
      { from: 'replication', to: 'lake', label: '選択肢 B', kind: 'data' },
      { from: 'replication', to: 'dwh', label: '選択肢 C / S3経由', kind: 'data' },
    ],
    steps: [
      { node: 'db', title: 'ログを準備する', text: 'CDCに必要なログ設定と権限を確認します。' },
      {
        node: 'replication',
        title: '初期ロードから継続複製へ',
        text: 'DBの変更をDMSで読み取ります。',
      },
      {
        node: 'lake',
        title: '目的に合うターゲットへ',
        text: 'ストリーム処理、履歴保存、DWH反映でターゲットを選びます。',
      },
    ],
  },
  {
    id: 'bigdata',
    name: 'Big Data Processing',
    ja: 'Sparkで、大規模に処理',
    tag: '分散処理',
    time: '7 min',
    description: 'S3に保存したデータをEMRのSparkなどで分散処理し、成果物をS3へ戻します。',
    why: '永続保存と計算を分離し、OSSフレームワークや独自ライブラリを使えます。必要な実行環境と運用負荷に応じて実行形態を選択します。',
    alternative: '標準的なサーバーレスETLはGlue。単純なSQL分析ならAthenaで十分な場合があります。',
    exam: '既存Spark資産を移行したい、実行環境を細かく制御したい → EMRが候補です。',
    keywords: ['Spark', 'custom libraries', 'distributed compute'],
    nodes: [
      {
        id: 'raw',
        service: 's3',
        subtitle: '入力データ',
        x: 100,
        y: 160,
        role: '大規模データセットを永続保存します。',
      },
      {
        id: 'compute',
        service: 'emr',
        subtitle: '分散処理',
        x: 425,
        y: 160,
        role: 'Sparkなどで計算します。偏りやシャッフルを考慮して最適化し、必要なライブラリを構成します。',
      },
      {
        id: 'result',
        service: 's3',
        subtitle: '処理結果',
        x: 750,
        y: 160,
        role: '結果をS3へ永続化し、クラスタの終了後も利用できるようにします。',
      },
    ],
    edges: [
      { from: 'raw', to: 'compute', label: 'データを読み取り', kind: 'data' },
      { from: 'compute', to: 'result', label: '成果物を書き込み', kind: 'data' },
    ],
    steps: [
      {
        node: 'raw',
        title: '入力をS3に保存',
        text: '処理環境の寿命に依存しない場所へデータを置きます。',
      },
      {
        node: 'compute',
        title: '並列に計算する',
        text: 'EMRでSparkなどのフレームワークを実行します。',
      },
      {
        node: 'result',
        title: '結果を永続化する',
        text: '計算が終了する前に成果物をS3へ書き戻します。',
      },
    ],
  },
  {
    id: 'event',
    name: 'Event Driven Pipeline',
    ja: '到着をきっかけに、処理を開始',
    tag: 'イベント駆動',
    time: '8 min',
    description: 'S3へのファイル到着をイベントで検知し、入力検証後にワークフローを開始します。',
    why: '通知にはオブジェクトの参照を渡し、Step Functionsが変換・品質検証・通知の依存関係や再試行を管理します。',
    alternative:
      '独自の入力検証が不要ならEventBridgeから直接Step Functionsへ。既存AirflowのDAGが必要ならMWAAも候補です。',
    exam: 'ファイル到着時に複数の処理を順番に実行、分岐と失敗時の再試行が必要 → EventBridge + Step Functions。',
    keywords: ['event-driven', 'state machine', 'retry'],
    nodes: [
      {
        id: 'file',
        service: 's3',
        subtitle: 'ファイル到着',
        x: 20,
        y: 130,
        role: 'EventBridgeへのイベント通知を有効にします。オブジェクト本体はS3に残ります。',
      },
      {
        id: 'event',
        service: 'eventbridge',
        subtitle: 'イベントを振り分け',
        x: 220,
        y: 130,
        role: 'バケット名やキーなどのイベント属性を使ってルールに一致する処理を起動します。',
      },
      {
        id: 'validate',
        service: 'lambda',
        subtitle: '独自の入力検証',
        x: 420,
        y: 130,
        role: 'ファイル情報の検証など、独自ロジックが必要な場合の任意のステップです。不要なら省略できます。',
      },
      {
        id: 'workflow',
        service: 'stepfunctions',
        subtitle: '実行を制御',
        x: 620,
        y: 130,
        role: '状態遷移・分岐・再試行を管理し、サービス統合でGlueジョブなどを呼び出します。',
      },
      {
        id: 'etl',
        service: 'glue',
        subtitle: 'データ変換',
        x: 820,
        y: 290,
        role: 'S3上のデータ本体を読み取り、変換します。制御イベントを受けることとデータを転送することは別です。',
      },
    ],
    edges: [
      { from: 'file', to: 'event', label: '到着通知', kind: 'event' },
      { from: 'event', to: 'validate', label: '起動', kind: 'event' },
      { from: 'validate', to: 'workflow', label: '開始', kind: 'event' },
      { from: 'workflow', to: 'etl', label: 'ジョブ起動', kind: 'event' },
      { from: 'file', to: 'etl', label: 'S3の実データを読み取り', kind: 'data', bend: 45 },
    ],
    steps: [
      {
        node: 'file',
        title: '到着を通知する',
        text: 'ファイルの本体をS3に保持し、参照を含むイベントを送ります。',
      },
      {
        node: 'event',
        title: 'イベントを選別する',
        text: 'EventBridgeルールで必要なイベントだけを振り分けます。',
      },
      { node: 'validate', title: '入力を検証する', text: '独自検証が必要ならLambdaを挟みます。' },
      {
        node: 'workflow',
        title: '処理全体を管理する',
        text: 'Step FunctionsがGlueなどのタスクと失敗時の処理を制御します。',
      },
      {
        node: 'etl',
        title: '実データを変換する',
        text: 'GlueがS3からデータを読みます。イベント経路にデータ本体は流れません。',
      },
    ],
  },
];
