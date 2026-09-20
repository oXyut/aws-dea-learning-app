export interface Quiz {
  id: string;
  title: string;
  scenario: string;
  keywords: string[];
  answer: string;
  options: { service: string; reason: string }[];
  pattern: string;
  blank?: string;
}
const scenarios: Quiz[] = [
  {
    id: 'q-athena',
    title: '月に数回、S3ログを調査したい',
    scenario:
      '数TBのアクセスログがS3に保存されています。月に数回、SQLで特定期間の集計を行います。常時稼働する分析基盤の運用を避けたいとき、まず検討するサービスは？',
    keywords: ['S3に保存済み', '月に数回', 'SQL', '運用最小'],
    answer: 'athena',
    pattern: 'serverless-lake',
    blank: 'query',
    options: [
      {
        service: 'athena',
        reason:
          'S3のデータを直接SQL分析でき、断続的な利用に適します。Parquetやパーティションでスキャン量を減らします。',
      },
      {
        service: 'redshift',
        reason:
          'Serverlessもありますが、この要件だけでは継続的なDWHを構成する優先度は低めです。複雑な定型BIや高い同時実行要件があれば再検討します。',
      },
      {
        service: 'emr',
        reason: '独自Spark処理や環境制御が要求されておらず、単純なSQL調査には構成が過剰です。',
      },
      {
        service: 'rds',
        reason:
          '業務トランザクション向けです。S3ログを分析するためだけにDBへロードする利点は小さいです。',
      },
    ],
  },
  {
    id: 'q-catalog',
    title: '図の空欄には何が入る？',
    scenario:
      'CrawlerがS3のスキーマを検出しました。その定義をAthenaとGlueで共有したいとき、空欄に入るサービスは？ 実データはS3に残します。',
    keywords: ['メタデータ', '共有する定義', '実データは移さない'],
    answer: 'catalog',
    pattern: 'serverless-lake',
    blank: 'meta',
    options: [
      {
        service: 'catalog',
        reason:
          'データの場所・列名・型などのメタデータを共有できます。Athenaはここを参照してS3を読みます。',
      },
      {
        service: 'lakeformation',
        reason:
          '主な役割はデータへのアクセス制御です。テーブル定義のリポジトリそのものはData Catalogです。',
      },
      {
        service: 'glue-etl',
        reason: 'データを変換するジョブです。定義を共有する保存場所とは異なります。',
      },
      {
        service: 'dynamodb',
        reason:
          'アプリのキー・バリューデータ保存に適しますが、AthenaとGlueの共通メタストアではありません。',
      },
    ],
  },
  {
    id: 'q-cdc',
    title: '稼働中のDBから、変更だけを取り込む',
    scenario:
      '既存RDSの初期データをS3へ移し、その後の追加・更新・削除を継続的に取得したい。DBは稼働を続けます。ログ設定を変更できる場合、選ぶサービスは？',
    keywords: ['DB', '変更ログ', 'フルロード + CDC'],
    answer: 'dms',
    pattern: 'cdc',
    blank: 'replication',
    options: [
      {
        service: 'dms',
        reason:
          'フルロードとCDCを組み合わせられます。変更ログの設定と対応エンドポイントを確認し、S3に出力した変更の適用方法も設計します。',
      },
      {
        service: 'datasync',
        reason:
          'ファイル・オブジェクトの転送を担います。DBトランザクションログのCDCではありません。',
      },
      {
        service: 'crawler',
        reason: 'スキーマの検出機能であり、DBの更新レコードを継続複製しません。',
      },
      {
        service: 'sqs',
        reason: '作業キューです。自らRDSの変更ログをキャプチャする機能ではありません。',
      },
    ],
  },
  {
    id: 'q-firehose',
    title: 'ログを手間なくS3へ届けたい',
    scenario:
      'アプリのログを継続的にS3へ配信します。バッファリングによる遅延は許容でき、独自のコンシューマーやイベントの再読み取りは不要です。運用負荷を抑えるサービスは？',
    keywords: ['S3へ配信', 'バッファ許容', '再読不要'],
    answer: 'firehose',
    pattern: 'streaming-lake',
    blank: 'delivery',
    options: [
      {
        service: 'firehose',
        reason:
          '配信・バッファリングをマネージドで処理できます。失敗レコードの扱いと配信先の設定を行います。',
      },
      {
        service: 'kinesis',
        reason:
          '保持・再読・独自コンシューマー向けですが、S3への配信は追加で実装または連携が必要です。',
      },
      {
        service: 'msk',
        reason: 'Kafka互換が不要なので、Kafkaの概念やクライアント管理を追加する理由がありません。',
      },
      {
        service: 'lambda',
        reason:
          '個別イベントを処理できますが、配信・バッファ管理を自作するよりFirehoseが要件に合います。',
      },
    ],
  },
  {
    id: 'q-replay',
    title: '同じイベントを、独立して再処理する',
    scenario:
      'クリックイベントを不正検知と集計の2つのアプリが独立して読みます。障害後に保持期間内のイベントを再読し、パーティションキー単位の順序を扱いたい。Kafka互換は不要です。',
    keywords: ['複数コンシューマー', '再読', 'キー単位の順序'],
    answer: 'kinesis',
    pattern: 'streaming',
    blank: 'stream',
    options: [
      {
        service: 'kinesis',
        reason:
          '複数コンシューマーが独立して読み進め、保持期間内のイベントを再処理できます。キー分散と重複対策も設計します。',
      },
      {
        service: 'sqs',
        reason:
          '処理後に削除するキューです。削除済みイベントを任意に再読するモデルとは異なります。',
      },
      {
        service: 'firehose',
        reason: '保存先への配信が役割で、任意の独立コンシューマー向けの再読ログではありません。',
      },
      {
        service: 'eventbridge',
        reason:
          'イベントの振り分けが中心です。継続ストリームの消費モデルやキー単位の順序の要件にはKinesisが適します。',
      },
    ],
  },
  {
    id: 'q-workflow',
    title: '変換、品質確認、通知を順番に',
    scenario:
      'S3ファイルの到着後、Glueジョブを実行し、結果によって処理を分岐します。一時的な失敗は再試行したい。既存のAirflow資産はありません。全体の実行制御に適するのは？',
    keywords: ['状態管理', '分岐', '再試行', 'AWS連携'],
    answer: 'stepfunctions',
    pattern: 'event',
    blank: 'workflow',
    options: [
      {
        service: 'stepfunctions',
        reason:
          '状態機械でサービス呼び出し、分岐、Retry / Catchを管理できます。大きなデータ本体はS3に置き、参照を渡します。',
      },
      {
        service: 'mwaa',
        reason:
          'Airflow DAGの資産や複雑なスケジュールが必要なら有力ですが、この条件では環境管理の追加が不要なStep Functionsを優先できます。',
      },
      {
        service: 'lambda',
        reason:
          '個別の処理を実行します。長い待機・状態・複雑な再試行を関数だけで自作するのは管理負荷が増えます。',
      },
      {
        service: 'eventbridge',
        reason:
          '開始イベントをルーティングできますが、多段処理の状態機械を担当するのはStep Functionsです。',
      },
    ],
  },
  {
    id: 'q-emr',
    title: '既存のSpark資産を活用する',
    scenario:
      '大量のS3データを処理する既存Sparkジョブがあります。独自ライブラリに加え、EC2インスタンスやOS設定を細かく制御する要件があります。結果はS3へ戻します。',
    keywords: ['Spark', '環境の制御', '既存資産'],
    answer: 'emr',
    pattern: 'bigdata',
    blank: 'compute',
    options: [
      {
        service: 'emr',
        reason:
          'EMR on EC2でクラスタ構成や実行環境の制御を行いながらSpark資産を活用できます。成果物はS3に保存します。',
      },
      {
        service: 'glue',
        reason:
          'Spark ETLには適しますが、この問題ではインスタンス・OS設定の制御が明示されているためEMR on EC2が合います。',
      },
      {
        service: 'athena',
        reason: 'SQL分析が中心で、要件にあるSparkの独自実行環境を提供するものではありません。',
      },
      {
        service: 'lambda',
        reason: '短いイベント処理向けです。大規模Sparkジョブの分散実行環境ではありません。',
      },
    ],
  },
  {
    id: 'q-datasync',
    title: '社内のファイル共有をレイクへ',
    scenario:
      '社内のNFSファイルサーバーに保存されたCSVをS3へ転送したい。以降は変更されたファイルを定期転送し、転送時の整合性も検証したい場合は？',
    keywords: ['NFS', 'ファイルの差分', '転送検証'],
    answer: 'datasync',
    pattern: 'serverless-lake',
    options: [
      {
        service: 'datasync',
        reason:
          'NFS / SMBなどからS3への転送、差分転送、整合性検証を扱えます。必要なエージェントとネットワークを構成します。',
      },
      {
        service: 'dms',
        reason: 'ソースはDBではなくファイル共有なので、トランザクションログのCDCは適用しません。',
      },
      {
        service: 'glue',
        reason:
          '取り込んだCSVを変換する役割には適しますが、ファイル転送・検証の主目的はDataSyncが担います。',
      },
      {
        service: 'macie',
        reason: 'S3内の機密データの検出に使います。NFSからの転送サービスではありません。',
      },
    ],
  },
  {
    id: 'q-warehouse',
    title: '繰り返す複雑なBIクエリ',
    scenario:
      '複数の業務DBとログを統合し、分析用モデルを構築します。毎日多数のBIクエリが複雑なJOINと集計を行います。分析専用のSQL基盤としてまず評価するのは？',
    keywords: ['継続的なBI', '複雑なJOIN', 'データ統合'],
    answer: 'redshift',
    pattern: 'warehouse',
    blank: 'dwh',
    options: [
      {
        service: 'redshift',
        reason:
          '継続的なBIと統合DWH向けの並列SQLエンジンです。モデル、クエリ設計、必要容量を実測して調整します。',
      },
      {
        service: 'athena',
        reason:
          'アドホックなS3分析に有力ですが、今回は統合DWHで反復する複雑なBIが主目的なので、まずRedshiftを評価します。',
      },
      {
        service: 'dynamodb',
        reason:
          'キーでアクセスするアプリ向けです。任意のJOINを繰り返すBIの主エンジンには適しません。',
      },
      {
        service: 'opensearch',
        reason: '全文検索やログ検索が中心で、統合DWHの複雑なリレーショナル分析とは役割が違います。',
      },
    ],
  },
  {
    id: 'q-glue',
    title: '管理を抑えてJSONをParquetへ',
    scenario:
      'S3の大量のJSONを毎日読み、型の統一・結合・集計を行ってParquetに変換します。Sparkが適しており、クラスタやOSの管理は避けたい。Catalogと統合したETLに適するのは？',
    keywords: ['サーバーレスETL', 'Spark', 'Catalog連携'],
    answer: 'glue',
    pattern: 'batch',
    blank: 'etl',
    options: [
      {
        service: 'glue',
        reason:
          'Catalogと統合したサーバーレスETLを実行できます。パーティションの絞り込みやジョブブックマークも検討します。',
      },
      {
        service: 'crawler',
        reason: 'スキーマを発見して定義を登録する機能であり、実データの形式変換は行いません。',
      },
      {
        service: 'lambda',
        reason: '短時間のイベント処理向けで、大量データのSpark ETLには適しません。',
      },
      {
        service: 'emr',
        reason:
          'EMR Serverlessも候補になり得ますが、明示されたCatalog中心の標準ETLにはGlueが直接適合します。環境の自由度が必要ならEMRを再評価します。',
      },
    ],
  },
];

// Keep authored explanations stable while varying the position of the correct choice.
export const quizzes: Quiz[] = scenarios.map((quiz, index) => {
  const offset = (index * 3 + 1) % quiz.options.length;
  return { ...quiz, options: [...quiz.options.slice(offset), ...quiz.options.slice(0, offset)] };
});
