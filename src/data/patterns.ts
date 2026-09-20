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
  sources?: { title: string; url: string }[];
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
  {
    id: 'scheduled-ingestion',
    name: 'Scheduled API Ingestion',
    ja: '決まった時刻に、APIから収集',
    tag: '定期実行',
    time: '7 min',
    description:
      'cronで動かしていた短いPython処理を、SchedulerとLambdaで定期実行し、取得結果をS3に保存します。',
    why: '時刻の管理はScheduler、API呼び出しと保存はLambdaが担当します。サーバーを常時稼働させずに定期収集を実行できます。',
    alternative:
      '長時間処理ならコンテナやバッチも候補。複数ステップの依存関係があるならStep Functionsで管理します。CloudShellは定期本番ジョブの実行基盤ではありません。',
    exam: '定時にAPIを呼び、15分以内のPython処理でS3へ保存 → Scheduler + Lambda。ファイル到着イベントを待つ構成とは起動条件が違います。',
    keywords: ['cron', 'rate', 'scheduled Lambda', 'Python'],
    sources: [
      {
        title: 'SchedulerからLambdaを起動',
        url: 'https://docs.aws.amazon.com/lambda/latest/dg/with-eventbridge-scheduler.html',
      },
    ],
    nodes: [
      {
        id: 'clock',
        service: 'scheduler',
        subtitle: '時刻・間隔で起動',
        x: 60,
        y: 40,
        role: '実行時刻・タイムゾーンを設定し、実行ロールでLambdaの呼び出しを許可します。Schedulerの再試行とDLQは呼び出しの配信失敗を扱います。Lambdaで受理後に起きる実行エラーは別に扱います。',
      },
      {
        id: 'api',
        label: 'External API',
        subtitle: '取得先のAPI',
        x: 60,
        y: 240,
        role: 'Lambdaからのリクエストに対してデータを返します。図の実線は応答データの向きを示し、HTTPリクエストの往路は省略しています。',
      },
      {
        id: 'collect',
        service: 'lambda',
        subtitle: 'Pythonで収集・整形',
        x: 420,
        y: 150,
        role: 'Schedulerの非同期呼び出しで起動し、APIを呼び出してS3へ書き込みます。API認証、通信経路、再試行時の重複防止を設計します。',
      },
      {
        id: 'store',
        service: 's3',
        subtitle: '収集結果を保存',
        x: 780,
        y: 150,
        role: '日付や処理対象をキーにして収集結果を保存。Lambda実行ロールへ必要なプレフィックスのPutObjectを許可します。',
      },
    ],
    edges: [
      { from: 'clock', to: 'collect', label: '時刻で起動', kind: 'event' },
      { from: 'api', to: 'collect', label: 'API応答', kind: 'data' },
      { from: 'collect', to: 'store', label: '取得結果', kind: 'data' },
    ],
    steps: [
      {
        node: 'clock',
        title: '時間を起動条件にする',
        text: 'Schedulerがcron・rate式や一回限りの予定を管理します。起動を許可するロールを設定し、配信失敗にはSchedulerの再試行とDLQを用意します。Lambdaの実行エラーにはLambda側の失敗時送信先などを設定します。',
      },
      {
        node: 'collect',
        title: 'Pythonの処理を実行する',
        text: 'LambdaがAPIを呼び出し、応答を必要な形へ整えます。SchedulerからAPIの実データが届くわけではありません。',
      },
      {
        node: 'store',
        title: '再実行しても安全に保存する',
        text: '対象期間とキー設計をそろえ、重複実行でデータが二重登録されないようにします。',
      },
    ],
  },
  {
    id: 'firehose-conversion',
    name: 'Firehose Format Conversion',
    ja: '配信しながら、Parquetへ変換',
    tag: 'マネージド変換',
    time: '7 min',
    description:
      '継続ログをFirehoseで受信し、JSONからParquet / ORCへ変換してS3へ届けます。図の2つのFirehoseは同一ストリーム内の処理段階です。',
    why: '入力の整形は必要に応じてLambda、列指向形式への変換はFirehoseの標準機能が担当します。Catalogはスキーマだけを提供します。',
    alternative:
      '入力が対応するJSONならLambdaを省略できます。複雑な結合や履歴全体の再処理には、S3保存後のGlue ETLなどを検討します。',
    exam: '継続ログを低運用負荷でParquet化 → Firehoseの形式変換。LambdaがParquetへ変換することを必須条件にせず、JSON整形と形式変換を区別します。',
    keywords: ['JSON', 'Parquet', 'ORC', 'record format conversion'],
    sources: [
      {
        title: 'Firehoseの形式変換',
        url: 'https://docs.aws.amazon.com/firehose/latest/dev/record-format-conversion.html',
      },
    ],
    nodes: [
      {
        id: 'receive',
        service: 'firehose',
        subtitle: '同一ストリーム：受信',
        x: 40,
        y: 210,
        role: 'アプリなどからログを受信。変換を有効にした場合はLambdaを呼び出します。図では送信元と変換結果の戻りを省略し、処理順で表しています。',
      },
      {
        id: 'normalize',
        service: 'lambda',
        subtitle: '任意：JSONへ整形',
        x: 280,
        y: 210,
        role: 'CSVや独自形式などをJSONへ整え、Firehoseへ結果を返します。既に対応するJSONならこの処理は不要です。',
      },
      {
        id: 'schema',
        service: 'catalog',
        subtitle: '入力と一致する定義',
        x: 520,
        y: 30,
        role: '入力JSONの列・型をFirehoseに提供します。Catalogからログ本体は流れず、Crawlerによる自動登録もこの構成の必須条件ではありません。',
      },
      {
        id: 'convert',
        service: 'firehose',
        subtitle: '同一ストリーム：変換',
        x: 520,
        y: 210,
        role: 'Catalogの定義でJSONを解釈し、標準の形式変換機能でParquetまたはORCへ変換します。図の受信ノードと同じFirehoseストリームです。',
      },
      {
        id: 'store',
        service: 's3',
        subtitle: '列指向形式で保存',
        x: 780,
        y: 210,
        role: 'Firehoseがバッファリングしたデータを保存します。配信遅延と変換失敗の出力先を確認します。',
      },
    ],
    edges: [
      { from: 'receive', to: 'normalize', label: '変換対象', kind: 'data' },
      { from: 'normalize', to: 'convert', label: 'JSONを返却', kind: 'data' },
      { from: 'schema', to: 'convert', label: 'スキーマ', kind: 'metadata' },
      { from: 'convert', to: 'store', label: 'Parquet / ORC', kind: 'data' },
    ],
    steps: [
      {
        node: 'receive',
        title: '配信ストリームに送る',
        text: 'Firehoseがログを受信し、バッファと配信を管理します。2つのノードを別々のストリームとして作成する意味ではありません。',
      },
      {
        node: 'normalize',
        title: '必要な場合だけJSONへ整える',
        text: 'Lambda変換の出力はJSONです。ここでParquet化を自作することを前提にしません。',
      },
      {
        node: 'schema',
        title: '入力の構造を定義する',
        text: 'Catalogの列と型をJSONに合わせます。入力にあっても定義されていない属性は変換結果に含まれません。',
      },
      {
        node: 'convert',
        title: 'Firehose自身が形式を変換',
        text: '標準機能でParquet / ORCへ変換し、S3へ配信します。実データとスキーマの経路を区別します。',
      },
    ],
  },
  {
    id: 'pii-remediation',
    name: 'Sensitive Data Remediation',
    ja: '機密情報の検出から、対処へ',
    tag: '検出と制御',
    time: '8 min',
    description:
      'Macieの検出結果をEventBridgeで選別し、既存のマスキング処理を起動します。検出イベントとS3の実データは別の経路です。',
    why: 'MacieはPIIなどの機密情報を検出し、EventBridgeはfindingに応じて処理を起動。マスキングの実装はアプリが担当します。',
    alternative:
      'S3の新規アップロード通知は到着を示すだけで、PII検出済みを意味しません。定期ポーリングの代わりにfindingイベントを処理します。',
    exam: '機密情報が見つかったときにだけ既存処理を呼びたい → Macie finding → EventBridgeルール。Macie自体はファイルをマスキングしません。',
    keywords: ['PII', 'Macie Finding', 'default event bus', 'masking'],
    sources: [
      {
        title: 'Macie findingをEventBridgeで処理',
        url: 'https://docs.aws.amazon.com/macie/latest/user/findings-monitor-events-eventbridge.html',
      },
    ],
    nodes: [
      {
        id: 'raw',
        service: 's3',
        subtitle: '検査対象のデータ',
        x: 20,
        y: 180,
        role: '対象オブジェクトの実データを保持します。Macieの検出設定・対象と、処理アプリが読み取る権限をそれぞれ設定します。',
      },
      {
        id: 'detect',
        service: 'macie',
        subtitle: '機密データを検出',
        x: 220,
        y: 30,
        role: 'S3の対象データを分析してfindingを生成します。アップロードのたびに即時検出されると決めつけず、検出方法と対象を確認します。',
      },
      {
        id: 'route',
        service: 'eventbridge',
        subtitle: 'デフォルトバス',
        x: 420,
        y: 30,
        role: 'Macie Findingイベントを受け、種別や重要度などの条件で対象を絞ります。イベントには検出情報とオブジェクトの参照が含まれ、元ファイル本体を転送しません。',
      },
      {
        id: 'mask',
        label: 'Masking App',
        subtitle: '既存処理を呼び出す',
        x: 620,
        y: 180,
        role: '対応ターゲットやLambdaなどのアダプターで既存処理を起動します。S3の元データを取得し、必要な項目をマスキング。重複イベントにも対処します。',
      },
      {
        id: 'safe',
        service: 's3',
        subtitle: '処理済みの保存先',
        x: 820,
        y: 180,
        role: 'マスキング済みの結果を別プレフィックスなどに保存し、処理前後のアクセス権を分けます。',
      },
    ],
    edges: [
      { from: 'raw', to: 'detect', label: '対象を分析', kind: 'data' },
      { from: 'detect', to: 'route', label: 'finding', kind: 'event' },
      { from: 'route', to: 'mask', label: '処理を起動', kind: 'event' },
      { from: 'raw', to: 'mask', label: '元データを取得', kind: 'data', bend: 95 },
      { from: 'mask', to: 'safe', label: '処理結果', kind: 'data' },
    ],
    steps: [
      {
        node: 'detect',
        title: '検出結果を作る',
        text: 'Macieが機密情報を検出します。到着通知と検出結果は異なります。',
      },
      {
        node: 'route',
        title: '対象のfindingを選別する',
        text: 'デフォルトイベントバスでルールを設定し、必要なfindingだけを処理へ渡します。',
      },
      {
        node: 'mask',
        title: '参照から元データを取得',
        text: 'イベントに含まれる対象情報を使ってS3を読み、既存のマスキングロジックを実行します。',
      },
      {
        node: 'safe',
        title: '結果を安全な領域へ保存',
        text: '処理済み出力を保存します。イベントの通知を受けるだけでは元データは変更されません。',
      },
    ],
  },
  {
    id: 'shared-files',
    name: 'Shared Files with Lambda',
    ja: '複数のLambdaで、ファイルを共有',
    tag: '共有ストレージ',
    time: '6 min',
    description:
      '複数のLambda実行環境がEFSをマウントし、同じファイルを利用します。図では片方が書き込み、もう片方が読み取る例を示します。',
    why: 'EFSは共有NFSファイルシステムです。各実行環境に閉じた/tmpとは異なり、複数のLambdaから同じ永続ファイルへアクセスできます。',
    alternative:
      'ファイル操作の互換性が不要なオブジェクト保管ならS3。共有不要の一時ファイルなら/tmpを使い、LambdaへEBSを直接アタッチする構成は選びません。',
    exam: '複数Lambdaから共有NFSをマウント → EFS。ローカルの一時領域を増やしても、実行環境間の共有にはなりません。',
    keywords: ['NFS', 'access point', 'VPC', '/mnt', '/tmp'],
    sources: [
      {
        title: 'LambdaのEFSアクセス設定',
        url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-filesystem-efs.html',
      },
    ],
    nodes: [
      {
        id: 'writer',
        service: 'lambda',
        subtitle: '実行環境A：書き込み',
        x: 70,
        y: 160,
        role: 'アクセスポイント経由でEFSを/mnt配下へマウントしてファイルを作ります。VPC接続とEFSに対する必要な権限を用意します。',
      },
      {
        id: 'files',
        service: 'efs',
        subtitle: '共有・永続ファイル',
        x: 420,
        y: 160,
        role: '複数の実行環境に同じファイルシステムを提供します。マウントターゲットへのNFS通信（TCP 2049）とファイル権限を確認します。',
      },
      {
        id: 'reader',
        service: 'lambda',
        subtitle: '実行環境B：読み取り',
        x: 770,
        y: 160,
        role: '同じEFSをマウントして共有ファイルを読みます。同一関数の別実行環境でも別関数でも、アクセス権を与えて利用できます。',
      },
    ],
    edges: [
      { from: 'writer', to: 'files', label: 'NFS書き込み', kind: 'data' },
      { from: 'files', to: 'reader', label: 'NFS読み取り', kind: 'data' },
    ],
    steps: [
      {
        node: 'files',
        title: '共有ファイルシステムを用意',
        text: 'EFSのアクセスポイントとマウントターゲットを設定し、Lambdaから届くネットワーク経路を確保します。',
      },
      {
        node: 'writer',
        title: '各Lambdaにマウントする',
        text: 'VPC・セキュリティグループ・IAMとファイルの権限を確認し、/mnt配下のローカルパスに接続します。',
      },
      {
        node: 'reader',
        title: '同じファイルを利用する',
        text: '同時更新があるならアプリで整合性やロックを設計します。共有ストレージの採用だけで更新競合がなくなるわけではありません。',
      },
    ],
  },
  {
    id: 'saas-warehouse',
    name: 'SaaS to Data Warehouse',
    ja: 'SaaSのデータを、DWHへ連携',
    tag: 'SaaS連携',
    time: '7 min',
    description:
      '対応SaaSのデータをAppFlowで取得し、S3の中間保存を経由してRedshiftへロードします。',
    why: '対応コネクタで認証・項目マッピング・転送を構成し、SaaS APIの連携処理を一から実装する負荷を抑えます。',
    alternative:
      '未対応のAPIや独自ロジックにはLambdaなどで自作。AppFlowの対応ソース、送信先、実行方式と転送制約を事前に確認します。',
    exam: '対応SaaSからRedshiftへ少ないコードで取り込む → AppFlow。Redshift接続では中間S3とIAM権限も必要です。',
    keywords: ['SaaS', 'managed connector', 'staging', 'AppFlow'],
    sources: [
      {
        title: 'AppFlowのRedshiftコネクタ',
        url: 'https://docs.aws.amazon.com/appflow/latest/userguide/redshift.html',
      },
    ],
    nodes: [
      {
        id: 'saas',
        label: 'SaaS',
        subtitle: '対応するデータソース',
        x: 30,
        y: 160,
        role: 'SaaSコネクタの対応状況と必要な認証を確認します。利用できるスケジュール・イベント起動などはソースによって異なります。',
      },
      {
        id: 'flow',
        service: 'appflow',
        subtitle: '取得・マッピング',
        x: 280,
        y: 160,
        role: '接続・項目のマッピング・フィルターなどを設定して転送します。対応する方式で実行し、S3を中間保存先に使います。',
      },
      {
        id: 'stage',
        service: 's3',
        subtitle: '中間ステージング',
        x: 530,
        y: 160,
        role: 'AppFlowが一時的な転送先としてデータを書き込みます。Redshiftにはこのバケットを読み取り、必要なら復号する権限を与えます。',
      },
      {
        id: 'warehouse',
        service: 'redshift',
        subtitle: '分析テーブルへロード',
        x: 780,
        y: 160,
        role: '中間S3からデータを取得して分析に利用します。接続方式・DB権限・IAMロールを設定。AppFlowの転送はinsertをサポートし、update / upsertとは区別します。',
      },
    ],
    edges: [
      { from: 'saas', to: 'flow', label: 'コネクタ', kind: 'data' },
      { from: 'flow', to: 'stage', label: '中間出力', kind: 'data' },
      { from: 'stage', to: 'warehouse', label: 'ロード', kind: 'data' },
    ],
    steps: [
      {
        node: 'saas',
        title: '対応状況と認証を確認',
        text: '使いたいSaaS、対象オブジェクトと起動方式がコネクタで利用できるかを確認します。',
      },
      {
        node: 'flow',
        title: 'フローを設定する',
        text: '取得する項目とRedshiftの接続を設定します。標準連携で済む部分をマネージド機能へ任せます。',
      },
      {
        node: 'stage',
        title: '中間S3の権限を付ける',
        text: 'AppFlowの出力先バケットと、Redshiftがそのデータを読み取るロールを設定します。',
      },
      {
        node: 'warehouse',
        title: 'ロード後の利用を設計する',
        text: '挿入と更新を区別し、重複や再実行の扱いを確認して分析テーブルへ反映します。',
      },
    ],
  },
  {
    id: 'warehouse-sharing',
    name: 'Redshift Data Sharing',
    ja: 'データを複製せず、計算を分ける',
    tag: 'データ共有',
    time: '8 min',
    description:
      '本番Redshiftの共有対象をdatashareで公開し、利用側のServerlessで分析します。図の実線は共有データの参照で、別DBへのコピー処理ではありません。',
    why: 'データ提供側と利用側の計算を分離し、同じライブデータにアクセスできます。断続的な分析には利用側のServerlessが候補です。',
    alternative:
      '独立した時点コピーが必要ならスナップショット。UNLOAD / COPYはデータを移動する方式であり、ライブデータ共有とは役割が異なります。',
    exam: '最新データを複製せずに別の計算容量で分析 → Redshift data sharing。Serverlessを使っても権限・利用量・費用の管理は必要です。',
    keywords: ['datashare', 'producer', 'consumer', 'Redshift Serverless'],
    sources: [
      {
        title: 'Redshiftの標準datashare',
        url: 'https://docs.aws.amazon.com/redshift/latest/dg/standard_datashare.html',
      },
      {
        title: '共有オブジェクトと権限',
        url: 'https://docs.aws.amazon.com/redshift/latest/dg/datashare-creation.html',
      },
    ],
    nodes: [
      {
        id: 'producer',
        service: 'redshift',
        subtitle: '提供側：Producer',
        x: 80,
        y: 160,
        role: 'データを持つ提供側。共有対象のスキーマ・テーブルなどをdatashareへ追加し、利用側に必要な権限を与えます。',
      },
      {
        id: 'share',
        label: 'Datashare',
        subtitle: '共有対象とアクセス権',
        x: 420,
        y: 30,
        role: '共有するDBオブジェクト・権限・利用先を定義する論理的な入れ物です。S3ステージングや複製先のDBではありません。',
      },
      {
        id: 'consumer',
        service: 'redshift',
        subtitle: '利用側：Serverless',
        x: 770,
        y: 160,
        role: '共有から作成したデータベースを、利用側のServerlessワークグループでクエリします。この図は読み取り共有の例で、COPYによる別テーブルへの複製を行いません。',
      },
    ],
    edges: [
      { from: 'producer', to: 'share', label: '共有対象を定義', kind: 'metadata' },
      { from: 'share', to: 'consumer', label: '利用を許可', kind: 'metadata' },
      {
        from: 'producer',
        to: 'consumer',
        label: 'ライブデータを参照（COPYによる複製なし）',
        kind: 'data',
        bend: 110,
      },
    ],
    steps: [
      {
        node: 'producer',
        title: '共有する範囲を選ぶ',
        text: 'Producerがdatashareに必要なオブジェクトを追加します。DB全体を無条件に公開するわけではありません。',
      },
      {
        node: 'share',
        title: '利用側を許可する',
        text: '共有対象とConsumerの権限を設定します。アカウントをまたぐ場合は共有の承認などの要件も確認します。',
      },
      {
        node: 'consumer',
        title: '別の計算容量で読む',
        text: 'Consumerが共有を参照するDBを作り、Serverlessでクエリします。UNLOAD → S3 → COPYの転送パイプラインは不要です。',
      },
    ],
  },
];
