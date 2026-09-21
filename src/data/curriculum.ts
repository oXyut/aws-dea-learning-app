import { storageLessons } from './curriculum-storage';
import { operationsLessons } from './curriculum-operations';
import { securityLessons } from './curriculum-security';

export const reviewedAt = '2026-09-21';
export const guideUrl =
  'https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/';
export const domains = [
  { id: 0, title: '学習の土台', weight: 0 },
  { id: 1, title: '取り込みと変換', weight: 34 },
  { id: 2, title: 'データストア管理', weight: 26 },
  { id: 3, title: '運用とサポート', weight: 22 },
  { id: 4, title: 'セキュリティとガバナンス', weight: 18 },
] as const;
export const examTasks = [
  ['1.1', 'データの取り込み'],
  ['1.2', '変換と処理'],
  ['1.3', 'パイプラインの実行制御'],
  ['1.4', 'プログラミング'],
  ['2.1', 'ストアの選択'],
  ['2.2', 'カタログ'],
  ['2.3', 'ライフサイクル'],
  ['2.4', 'モデルとスキーマ進化'],
  ['3.1', '処理の自動化'],
  ['3.2', '分析'],
  ['3.3', '監視と保守'],
  ['3.4', 'データ品質'],
  ['4.1', '認証'],
  ['4.2', '認可'],
  ['4.3', '暗号化とマスキング'],
  ['4.4', '監査ログ'],
  ['4.5', 'プライバシーとガバナンス'],
] as const;
export type TaskId = (typeof examTasks)[number][0];
export interface Checkpoint {
  id: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; reason: string }[];
}
export interface Lesson {
  id: string;
  domain: number;
  tasks: TaskId[];
  title: string;
  summary: string;
  objectives: string[];
  sections: { title: string; text: string }[];
  example: { title: string; input: string; code?: string; output: string; explanation: string };
  pitfalls: string[];
  checks: Checkpoint[];
  services: string[];
  pattern?: string;
  sources: { title: string; url: string }[];
}
const source = (title: string, path: string) => ({
  title,
  url: `https://docs.aws.amazon.com/${path}`,
});
// Independent explanations and toy data. These are not AWS exam questions.
export const lessons: Lesson[] = [
  {
    id: 'foundations',
    domain: 0,
    tasks: [],
    title: '最初に覚える、データ基盤の言葉',
    summary: 'データが到着してから利用者に届くまでを、ひとつの注文データで追います。',
    objectives: [
      '実データ・メタデータ・制御イベントを区別できる',
      'ETLとELT、バッチとストリームの違いを説明できる',
    ],
    sections: [
      {
        title: 'データと、その説明書は別にある',
        text: 'レコードは1件の注文などの単位、スキーマは列名・型・必須項目の約束です。CSVのような表は構造化データ、項目が変わるJSONは半構造化データ、音声や自由文は非構造化データとして考えます。S3は実際のファイル、Glue Data Catalogは場所と構造を保存します。ファイルが届いたという通知は制御イベントであり、ファイル本体ではありません。',
      },
      {
        title: '集める → 整える → 保存する → 使う',
        text: 'ETLはExtract（抽出）→ Transform（変換）→ Load（ロード）の順です。Glueで日付や金額を整えてからDWHに入れる例が該当します。ELTは先にロードし、Redshift内のSQLで整えます。データレイクは多様な元データを保存する土台、DWHは分析用の構造を設計した倉庫です。どちらでも入力の検証と利用権限は必要です。',
      },
      {
        title: '速さ・量・種類・正しさを先に決める',
        text: 'バッチは一定のまとまりを処理し、ストリームは継続して到着するイベントを処理します。1日遅れでよい月次売上と、数秒で必要な不正検知では選択が変わります。volumeは量、velocityは到着速度、varietyは種類です。さらに重複・遅延・欠損をどう扱うかを決めます。「サーバーレス」はサーバー管理を減らす性質で、処理時間ゼロや無料という意味ではありません。',
      },
    ],
    example: {
      title: '注文1件の旅',
      input: 'order_id=O-7, amount="1200", created_at="2026-09-01T09:00:00Z"',
      output:
        'S3 Raw（原文）→ Glue（金額を数値へ）→ S3 Curated（Parquet）→ Athena（日別売上）。Catalogは列と場所を保持。',
      explanation:
        'Rawを残すと変換の不具合を修正して再処理できます。Curatedは利用しやすく整えたデータです。Parquetは列ごとに値をまとめ、分析時に必要な列を読みやすくするファイル形式です。',
    },
    pitfalls: [
      'Crawlerを実行しても金額の文字列は自動で正しい数値へ書き換わりません。',
      'サイトの進捗はこの教材の確認状況です。合格率や公式範囲の習得率ではありません。',
    ],
    checks: [
      {
        id: 'roles',
        prompt: 'S3のCSVをAthenaで集計します。Catalogに保存するものは？',
        options: [
          {
            id: 'a',
            text: 'CSV全件を複製した実データ',
            correct: false,
            reason:
              '実データはS3にあり、Athenaが読み取ります。Catalogは保管先の代わりにはなりません。',
          },
          {
            id: 'b',
            text: '列の型、S3の場所、パーティションなどの定義',
            correct: true,
            reason: 'Athenaがファイルをテーブルとして解釈するためのメタデータです。',
          },
          {
            id: 'c',
            text: 'Lambdaを起動するイベントだけ',
            correct: false,
            reason: '実行のきっかけを渡す通知と、テーブルの定義は別の役割です。',
          },
        ],
      },
    ],
    services: ['s3', 'catalog', 'glue', 'athena'],
    pattern: 'serverless-lake',
    sources: [source('AthenaとData Catalog', 'athena/latest/ug/data-sources-glue.html')],
  },
  {
    id: 'ingestion',
    domain: 1,
    tasks: ['1.1'],
    title: '取り込み方式と、取りこぼさない再実行',
    summary: 'DB・ファイル・APIから取り込み、途中で止まっても再開できる境界を設計します。',
    objectives: [
      'DMS・DataSync・AppFlow・独自API処理を要件で選べる',
      'ページング・チェックポイント・冪等性の関係を説明できる',
    ],
    sections: [
      {
        title: 'ソースの性質から方式を選ぶ',
        text: '既存DBの全件と変更履歴はDMSのフルロード＋CDC、ファイルのオンライン転送はDataSync、SFTP等での受け渡し窓口はTransfer Family、対応SaaSの定型連携はAppFlowを検討します。CDC（Change Data Capture）はDBの変更ログを追う方式です。DMSの対応DB・ログ保持・権限・ネットワーク経路を確認し、DDLの変換が必要ならDMS Schema Conversion等も別工程にします。',
      },
      {
        title: 'バッチとAPIを安全に区切る',
        text: 'APIは1回で全件返すとは限りません。next tokenをたどり、429や一時障害は待ち時間を延ばす指数バックオフとランダムなゆらぎ（jitter）を使って再試行します。成功したページや日時をチェックポイントとして保存します。更新日時を境界にする場合は同じ時刻のレコードや遅れて見える更新を取りこぼさないよう重なり期間を取り、キーで重複を除きます。接続失敗では送信元IPの許可リストと名前解決も確認します。',
      },
      {
        title: '「届いた」と「確定した」を分ける',
        text: '冪等（べきとう）とは同じ入力を再処理しても最終結果を変えないことです。注文IDと変更版番号でupsertする、同じバッチIDの出力を置き換える、といった方法があります。処理済み位置だけを先に進めると未保存のデータを失います。Glue job bookmarksも入力処理の状態であり、出力の重複排除ではありません。チェックポイントと出力の確定が別なら、その間の障害を想定します。',
      },
    ],
    example: {
      title: 'ページ2を保存した直後に停止',
      input: 'API: page1=[O-1,O-2], page2=[O-3,O-4]。保存後、チェックポイント更新前に停止。',
      output:
        '再開後にpage2を再取得しても、order_idとversionでupsertすればO-3/O-4は二重計上されない。',
      explanation:
        '追記だけなら4件が6件になる可能性があります。全件を再取得することと、安全に再実行できることは違います。保存と完了記録を一体化できない場合ほど、出力側の冪等性が重要です。',
    },
    pitfalls: [
      'CDCの遅延が増えるならソースのログ保持期間内に追いつけるか確認します。',
      'Bookmarkを巻き戻しても過去の出力は消えません。再処理先を分けるか出力を置換します。',
    ],
    checks: [
      {
        id: 'replay',
        prompt:
          '保存後のタイムアウトで同じページが再配信されます。二重計上を防ぐ対策をすべて選んでください。',
        options: [
          {
            id: 'a',
            text: '注文IDと版番号を使って出力を冪等にする',
            correct: true,
            reason: '同じ変更を再保存しても結果が増えないようにします。',
          },
          {
            id: 'b',
            text: '処理済み位置は出力の確定を確認してから進める',
            correct: true,
            reason: '未保存のページを飛ばすデータ消失を防ぎます。重複対策と組み合わせます。',
          },
          {
            id: 'c',
            text: 'タイムアウトしたページは成功とみなして飛ばす',
            correct: false,
            reason:
              '保存されていなかった場合に取りこぼします。結果が不明な失敗こそ安全に再試行できる設計が必要です。',
          },
        ],
      },
    ],
    services: ['dms', 'datasync', 'appflow', 'glue'],
    pattern: 'cdc',
    sources: [
      source('DMS CDC', 'dms/latest/userguide/CHAP_Task.CDC.html'),
      source('Glue bookmarks', 'glue/latest/dg/monitor-continuations.html'),
    ],
  },
  {
    id: 'streams',
    domain: 1,
    tasks: ['1.1', '1.4'],
    title: 'ストリームの順序・状態・遅延',
    summary: 'シャードを増やす前に、どこで詰まっているかを判断します。',
    objectives: [
      'fan-in / fan-outと再読可能なログを説明できる',
      '帯域・キー偏り・同時実行・毒レコードを切り分けられる',
    ],
    sections: [
      {
        title: 'ログ・配送・キューを使い分ける',
        text: 'Kinesis Data StreamsとKafka/MSKは保持期間内のイベントを再読するログです。複数の独立コンシューマーがそれぞれ読めます。Firehoseは宛先へのバッファ配送を管理します。SQSは仕事を取り出して処理後に削除するキューです。複数の入力を集めるfan-inと、入力を複数処理へ配るfan-outを区別します。DynamoDB Streamsはテーブル変更の取り込みにも使えますが、無期限のイベント保管庫ではありません。',
      },
      {
        title: '順序を守る範囲が並列性を決める',
        text: 'Kinesisではpartition keyでレコードをシャードへ振り分けます。全レコードで同じキーを使うと偏りが生じます。Lambda連携のParallelizationFactorでシャード当たりの同時バッチを増やしても、同じキーの順序を保つ制約があります。Enhanced fan-outはコンシューマーの専用読取帯域を提供する仕組みで、関数のCPUや同時実行枠を増やす機能ではありません。',
      },
      {
        title: '状態と時間の扱いを決める',
        text: '各レコードを単独変換するのはstateless、顧客ごとの累計や5分窓の件数を保持するのはstatefulです。イベント発生時刻と処理時刻はずれるため、遅着をどこまで受け入れるか決めます。障害復旧では状態と読取位置のチェックポイントが必要です。Lambda IteratorAgeやKinesisのGetRecords.IteratorAgeMillisecondsを遅延の指標とし、Throttles、実行時間、帯域制限、失敗バッチを突き合わせます。',
      },
    ],
    example: {
      title: '関数を増やしても追いつかない',
      input: '注文キーはすべて"shop"。1バッチに不正JSONがあり繰り返し失敗。IteratorAgeが上昇。',
      output:
        '失敗レコードを特定し、部分バッチ応答・再試行上限・失敗送信先を設計。要件が許せば注文単位などへキーを分散。',
      explanation:
        '部分バッチ失敗の報告はイベントソース側の設定も必要です。失敗位置から再試行され、成功済みレコードも再処理され得るため冪等性を保ちます。すべてのキーを一つにしておきながらシャード数だけ増やしても均等分散しません。',
    },
    pitfalls: [
      'SQSのReceiveMessageは削除ではありません。可視性タイムアウト後に再受信され得ます。',
      'DLQは失敗を隔離する場所です。期限切れデータが自動で救済される仕組みではありません。',
    ],
    checks: [
      {
        id: 'bottleneck',
        prompt:
          '読取帯域に余裕がある一方、LambdaのThrottlesが増加。同時実行枠を使い切っています。まず検討するのは？',
        options: [
          {
            id: 'a',
            text: 'Enhanced fan-outだけを有効化する',
            correct: false,
            reason: '専用読取帯域が増えてもLambdaの同時実行制限は解消しません。',
          },
          {
            id: 'b',
            text: '関数の同時実行配分と処理時間を調べ、必要な枠を確保する',
            correct: true,
            reason: '観測されている制約に直接働きかけます。下流への負荷も確認します。',
          },
          {
            id: 'c',
            text: '保持期間を短縮する',
            correct: false,
            reason: '処理能力は増えず、追いつく前にデータを失う危険が増えます。',
          },
        ],
      },
    ],
    services: ['kinesis', 'lambda', 'msk', 'firehose', 'sqs'],
    pattern: 'streaming',
    sources: [
      source('LambdaとKinesis', 'lambda/latest/dg/with-kinesis.html'),
      source('部分バッチ失敗', 'lambda/latest/dg/services-kinesis-batchfailurereporting.html'),
    ],
  },
  {
    id: 'transforms',
    domain: 1,
    tasks: ['1.2'],
    title: '変換・ファイル形式・分散処理',
    summary: 'CSVをParquetにする意味から、Sparkのshuffleと偏りまで学びます。',
    objectives: [
      '形式・圧縮・パーティションで読取量を減らせる',
      'Sparkのメモリ不足とデータ偏りに別の対策を選べる',
    ],
    sections: [
      {
        title: '必要な列と行だけを読む',
        text: 'CSVは行の値をテキストで並べる形式、JSONは入れ子を表現できる形式です。Parquet/ORCは列指向で、必要な列だけを読む分析に向きます。Avroはスキーマを持つ行指向形式で、レコードの交換にも使われます。圧縮は転送・保管・走査量を減らしますが、CPU負荷やファイルの分割読取可否も考慮します。日付パーティションはWHEREで日付を絞るときに効果があり、細かすぎる分割は小さなファイルを大量に作ります。',
      },
      {
        title: '変換エンジンを要件で選ぶ',
        text: '短時間のイベント変換はLambda、大きな結合・集計を分散実行するETLはGlueやEMR、DWHへロードした後の集計はRedshiftのSQLが候補です。既存のコンテナやライブラリが必要ならECS/EKSでCPU・メモリ・一時領域・永続ボリュームを設計します。JDBC/ODBCはDBに接続するためのインターフェースです。並列読取を増やすとソースDBにも負荷をかけるため、抽出条件や接続数を制限します。',
      },
      {
        title: 'shuffleを減らす',
        text: 'Sparkはデータを分割してexecutorで処理します。JOINやGROUP BYで同じキーを集め直すshuffleはネットワークとディスクを使います。先に不要な列・行を落とし、小さな表ならbroadcast joinを検討します。ただし全executorに載らない表をbroadcastするとメモリ不足になります。偏ったキーには事前集約、キーの分散（salting）や適応的クエリ実行を検討し、spill・タスク時間を観測します。',
      },
    ],
    example: {
      title: '月全体のログから1日の2列を集計',
      input: '30日分のCSV。50列中、event_dateとamountだけが必要。',
      code: 'curated = raw.select("event_date", "amount")\ncurated.write.partitionBy("event_date").parquet(output_path)',
      output: '日付別Parquetを作り、分析時は対象日のパーティションと必要な列へ絞る。',
      explanation:
        'これはPySparkの概念例です。型変換・不正値隔離・重複排除・再実行時の書込方針は別途必要です。小ファイルが多い場合は適切なサイズへまとめます。固定の分割数が全環境で最適になるわけではありません。',
    },
    pitfalls: [
      'DPUを増やすだけでは単一キーへの偏りを解決できません。',
      'FirehoseのLambda変換でJSONへ整える処理と、標準機能のParquet/ORC形式変換を混同しません。',
    ],
    checks: [
      {
        id: 'skew',
        prompt:
          'Sparkの大半のタスクは終了し、顧客Xのキーを持つ1タスクだけ長時間実行しています。適切な調査は？',
        options: [
          {
            id: 'a',
            text: 'キー別の分布とshuffle量を調べ、偏りの分散や事前集約を検討する',
            correct: true,
            reason:
              '一部タスクだけ遅い症状はskewを疑う根拠になります。結果の意味を変えない分散方法を選びます。',
          },
          {
            id: 'b',
            text: 'すべての表をbroadcastする',
            correct: false,
            reason: '大きな表ではメモリ不足になり、偏りを解消する一般的な対策にもなりません。',
          },
          {
            id: 'c',
            text: 'Catalogの説明欄を書き換える',
            correct: false,
            reason: '実データの配置や処理の分散は変わりません。',
          },
        ],
      },
    ],
    services: ['glue', 'emr', 'lambda', 'eks', 'firehose'],
    pattern: 'batch',
    sources: [
      source(
        'Glue Spark性能調整',
        'prescriptive-guidance/latest/tuning-aws-glue-for-apache-spark/introduction.html',
      ),
      source('Firehose形式変換', 'firehose/latest/dev/record-format-conversion.html'),
    ],
  },
  {
    id: 'orchestration',
    domain: 1,
    tasks: ['1.3', '3.1'],
    title: 'ワークフローと障害からの復帰',
    summary: '起動のきっかけ、処理の依存関係、再試行を分けて設計します。',
    objectives: [
      'EventBridge・Step Functions・MWAA・Glue Workflowを使い分けられる',
      '一時障害と恒久障害で処理を変えられる',
    ],
    sections: [
      {
        title: '時刻・イベント・依存関係',
        text: 'Schedulerは時刻を決めた呼び出し、EventBridgeのルールはイベント条件による振り分けを担います。Step Functionsは状態と分岐を管理し、Glueの完了待ちなどをサービス統合で表現できます。既存のAirflow DAGや多様な接続先、日付単位の再実行を重視する場合はMWAA、GlueジョブとCrawler中心ならGlue Workflowを検討します。DAGは処理の依存を示す、循環しない有向グラフです。',
      },
      {
        title: 'Retryは再挑戦、Catchは失敗後の行き先',
        text: 'APIの一時的な制限には回数・間隔・タイムアウトを決めてRetryします。形式不正や権限不足は繰り返しても直らないことが多く、Catch等で隔離・通知へ分岐させます。SNSは通知、SQSは後で処理する仕事のバッファとして使えます。成功した処理まで最初から無制限に繰り返す設計は、費用と重複を増やします。',
      },
      {
        title: '並列化には上限を持たせる',
        text: '1000個のファイルをMapで並列処理できても、接続先DBが1000接続を受けられるとは限りません。最大並列数、キュー、バックプレッシャーで下流を保護します。長時間処理をLambdaの中で待ち続けるより、ジョブ完了をワークフローで待つ方が適します。AWSサービスが管理する実行基盤でも、リトライ可能性や処理の冪等性は利用者が設計します。',
      },
    ],
    example: {
      title: '取り込みに成功、検証に失敗',
      input: 'Extract成功 → Transform成功 → 品質チェックで必須IDの欠損を検出。',
      output: '公開工程へ進まず隔離領域に保持し、SNSで通知。修正後に同じbatch_idの検証から再開。',
      explanation:
        'ワークフロー上で成功していてもデータ品質が不合格なら公開しません。再開点と、同じバッチを公開済みか判定する記録を持たせます。',
    },
    pitfalls: [
      'Schedulerの配信DLQと、起動後のLambda実行エラーの処理は別です。',
      'すべてのTaskが自動的にexactly-onceになると考えず、実行方式と下流の副作用を確認します。',
    ],
    checks: [
      {
        id: 'retry',
        prompt: '毎回同じ必須列がないため変換が失敗します。最も適切なのは？',
        options: [
          {
            id: 'a',
            text: '無制限に短い間隔で再試行する',
            correct: false,
            reason: '入力は変わらず、計算費用と通知だけが増えます。',
          },
          {
            id: 'b',
            text: '失敗入力を隔離して通知し、修正後に再処理する',
            correct: true,
            reason: '恒久的な入力不正への対処です。正常データへの混入を止めます。',
          },
          {
            id: 'c',
            text: '検証を削除して後続へ進める',
            correct: false,
            reason: '処理の成功率は上がってもデータの正しさを失います。',
          },
        ],
      },
    ],
    services: ['stepfunctions', 'mwaa', 'eventbridge', 'scheduler', 'sns'],
    pattern: 'event',
    sources: [
      source('Step Functionsのエラー処理', 'step-functions/latest/dg/concepts-error-handling.html'),
    ],
  },
  {
    id: 'programming',
    domain: 1,
    tasks: ['1.4'],
    title: 'コード・テスト・IaCで再現性を作る',
    summary: 'コードの計算量と、同じパイプラインを安全に配布する方法を学びます。',
    objectives: [
      '集合・辞書・グラフの用途と分散処理の限界を説明できる',
      '単体テスト・結合テスト・IaC・CI/CDの役割を分けられる',
    ],
    sections: [
      {
        title: 'アルゴリズムの選択で処理量を減らす',
        text: 'リストを毎回先頭から探索するより、キーで検索する辞書や集合を使うと重複チェックを効率化できます。一般にハッシュ集合の探索は平均O(1)、リスト探索はO(n)です。ただし集合はメモリを消費します。木は階層や順序付き探索、グラフは依存関係の表現に向きます。全件を1プロセスのメモリに集める実装は、大規模データでは破綻するため分割処理や外部ストアを使います。',
      },
      {
        title: 'コードが動く条件を固定する',
        text: 'Pythonは変換とSDK操作、SQLは集合処理、Scala/JavaはSparkや既存ライブラリ、Rは統計処理、Bash/PowerShellは運用自動化などで利用します。言語名より既存資産と実行環境への適合を見ます。依存バージョン、入力スキーマ、タイムゾーン、丸め規則を固定し、ログにはbatch_idや処理件数を含めます。Lambdaの/tmpは実行環境の一時領域で、共有・永続状態はEFSや外部ストアへ置きます。',
      },
      {
        title: '変更を小さく検証して配布する',
        text: 'Gitでコードとスキーマを管理し、単体テストではNULL・型不正・境界時刻・同じイベントの再実行を確認します。結合テストではIAMや実際の入出力を確認します。CloudFormation/CDKはインフラをコードで再現し、SAMはLambda等のサーバーレス構成の定義や配布を助けます。CIで検証し、CDで段階的に配布します。変換コードを戻しても書き換え済みデータは戻らないため、再処理元と出力バージョンを残します。',
      },
    ],
    example: {
      title: '小さな入力で重複除去を確認',
      input: 'rows = [{"id":"A"}, {"id":"A"}, {"id":"B"}]',
      code: 'seen = set()\nunique = []\nfor row in rows:\n    if row["id"] not in seen:\n        seen.add(row["id"])\n        unique.append(row)',
      output: '[{"id":"A"}, {"id":"B"}]',
      explanation:
        '入力内の同じIDは除けますが、プロセス再起動後や別workerのseenとは共有しません。本番のイベント重複対策ならDynamoDBの条件付き書込など、再起動を越えて判定できる状態を検討します。',
    },
    pitfalls: [
      'グローバル変数に処理済みIDを入れても複数Lambda間の一意性は保証されません。',
      'テスト成功は本番データの安全な巻き戻しまで保証しません。',
    ],
    checks: [
      {
        id: 'state',
        prompt: 'Lambdaの再起動後にも重複を判定したい。適切な設計は？',
        options: [
          {
            id: 'a',
            text: '関数内のsetだけにIDを保存する',
            correct: false,
            reason: 'メモリは実行環境に閉じ、失われたり別環境に存在しなかったりします。',
          },
          {
            id: 'b',
            text: '永続ストアの条件付き書込と、出力の冪等性を組み合わせる',
            correct: true,
            reason:
              '同時処理と再起動を考慮できます。処理中・完了・期限の管理や途中障害からの復帰も設計します。',
          },
          {
            id: 'c',
            text: 'メモリ容量を増やすだけにする',
            correct: false,
            reason: '容量は永続性や他の実行環境との共有を提供しません。',
          },
        ],
      },
    ],
    services: ['lambda', 'dynamodb', 'efs'],
    sources: [
      source('Lambdaのベストプラクティス', 'lambda/latest/dg/best-practices.html'),
      source('AWS SAM', 'serverless-application-model/latest/developerguide/what-is-sam.html'),
    ],
  },
  ...operationsLessons.filter((lesson) => lesson.domain === 1),
  ...storageLessons,
  ...operationsLessons.filter((lesson) => lesson.domain === 3),
  ...securityLessons,
];
