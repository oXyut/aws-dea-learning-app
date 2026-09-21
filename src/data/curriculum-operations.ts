import type { Lesson } from './curriculum';
const source = (title: string, path: string) => ({
  title,
  url: `https://docs.aws.amazon.com/${path}`,
});
export const operationsLessons: Lesson[] = [
  {
    id: 'llm-processing',
    domain: 1,
    tasks: ['1.2'],
    title: 'LLMを変換工程に組み込む',
    summary: '自由文の分類や抽出で、モデルの出力を検証してから利用します。',
    objectives: [
      'LLMに向く変換と決定的な処理を区別できる',
      'モデル出力の検証・版管理・費用管理を説明できる',
    ],
    sections: [
      {
        title: '自然言語の曖昧さを処理する',
        text: '問い合わせを分類する、文章から商品名を抽出するなど、自由文の意味を扱う工程はLLMの候補になります。CSVの日付変換や売上の合計など、厳密な規則で処理できる部分は通常のコードやSQLで表現します。Amazon Bedrockは対応する基盤モデルをAPIから利用する選択肢です。変換の種類、精度、遅延、機密性、費用を評価して採用します。',
      },
      {
        title: '生成された値は未検証の入力として扱う',
        text: '分類ラベルを列挙し、出力JSONの型・必須項目・値域を検証します。存在しない商品ID、空欄、余計な説明文などは隔離や再確認へ回します。モデルが示す自信の値だけで品質を保証しません。固定した評価データで正解率・誤分類を測り、モデルID・プロンプトの版・入力ID・検証結果を記録します。元文書に含まれる指示を、そのまま処理権限として扱わないことも必要です。',
      },
      {
        title: '再試行と運用の境界',
        text: '呼出し制限にはバックオフし、バッチ化や同時実行上限で費用とスループットを制御します。同じ入力を再処理して結果が変わり得るため、採用した出力を版付きで保存します。PIIは必要性を確認して最小化・マスキングし、失敗ログへ原文を無制限に出さないようにします。プロンプトの変更もデータ変換ロジックの変更としてテストします。',
      },
    ],
    example: {
      title: '問い合わせの分類',
      input: '「届いた商品の電源が入りません」。許可ラベル: defect / shipping / other。',
      output:
        '{"category":"defect"} → JSON検証 → ラベル検証 → 元入力IDとモデル・プロンプト版を記録して保存。',
      explanation:
        '「defective」など定義外の値が出た場合は、成功したAPI応答でもそのままCuratedへ公開しません。再試行、ルールによる修正、人の確認などの方針を決めます。',
    },
    pitfalls: [
      'APIが200を返したことと、生成結果が業務上正しいことは別です。',
      '自然言語の出力をそのままSQLやコマンドとして実行する構成にしません。',
    ],
    checks: [
      {
        id: 'validation',
        prompt: 'LLMが指定スキーマと異なるJSONを返しました。正しい対処は？',
        options: [
          {
            id: 'a',
            text: 'HTTP応答が成功なので、そのまま分析用テーブルへ保存する',
            correct: false,
            reason: '通信の成功とデータ契約への適合は別です。下流を壊す可能性があります。',
          },
          {
            id: 'b',
            text: '検証不合格として隔離し、再処理方針と失敗率を記録する',
            correct: true,
            reason: '品質の境界を設け、モデル変更時にも比較できます。',
          },
          {
            id: 'c',
            text: 'モデルの自己申告の自信だけで採否を決める',
            correct: false,
            reason: '期待する型・値や実際の正解データに基づく検証の代わりになりません。',
          },
        ],
      },
    ],
    services: ['lambda', 'stepfunctions', 'quality'],
    sources: [
      source('Bedrockモデルの呼び出し', 'bedrock/latest/userguide/inference.html'),
      source('Bedrockモデル評価', 'bedrock/latest/userguide/evaluation.html'),
    ],
  },
  {
    id: 'automation',
    domain: 3,
    tasks: ['3.1'],
    title: '自動処理とデータAPIの運用',
    summary: '定期実行だけでなく、再実行・失敗通知・公開後の維持まで考えます。',
    objectives: [
      'SDK・API・スケジューラの役割を説明できる',
      'Airflowの論理日付・依存・再実行を理解できる',
    ],
    sections: [
      {
        title: 'SDKはAWSを呼ぶためのライブラリ',
        text: 'Pythonのboto3等のSDKは認証情報の取得、API要求、応答の受取を扱います。ページングされる一覧はpaginator等を使い、1回の応答で全件と思い込まないようにします。データAPIを利用者へ公開する場合はAPI Gateway＋Lambda等で認証、入力検証、制限、エラー形式、APIの版を設計します。APIキーだけを利用者認証の代わりとしないことも重要です。',
      },
      {
        title: '時間を引数にして再現する',
        text: '毎日「今」のデータを読むだけでは、過去日付の再実行で違う範囲を読んでしまいます。対象の業務日・開始時刻・終了時刻を引数にします。AirflowではDAGの依存、data interval、retry、catchup/backfillを確認します。DAGが動かない場合は構文の読み込み、スケジュール、依存状態、worker容量、接続設定を順に調べます。',
      },
      {
        title: '前処理も追跡可能にする',
        text: 'DataBrewのレシピはデータの整形手順を再利用するものです。SageMaker Unified Studioやnotebookの探索で見つけた変換は、再現できるジョブや版付きコードへ移します。手作業で欠損を直して終わりにせず、入力、適用ルール、出力件数、失敗件数を記録します。公開後もAPIの遅延・エラー率と下流の鮮度を監視します。',
      },
    ],
    example: {
      title: '月曜の失敗分を水曜にやり直す',
      input: 'target_date=2026-09-14。実行した現在時刻は2026-09-16。',
      output: '09-14の入力だけを読み、batch_id=2026-09-14の出力を検証して確定。',
      explanation:
        '現在日付をコード内で計算すると09-16のデータを処理しかねません。対象期間を明示し、同じ期間の再実行が重複を生まない出力方針を持ちます。',
    },
    pitfalls: [
      'SDKの自動リトライがあっても、仕事全体の冪等性は自動では保証されません。',
      'notebookのセルを順不同に実行した状態を本番処理の唯一の仕様にしません。',
    ],
    checks: [
      {
        id: 'date',
        prompt: '失敗した3日前のバッチを再実行します。正しい入力の決め方は？',
        options: [
          {
            id: 'a',
            text: '実行時の現在日付を必ず使う',
            correct: false,
            reason: '失敗した日のデータとは違う期間を処理します。',
          },
          {
            id: 'b',
            text: '処理対象期間を引数で渡し、同じ期間の入力を再読する',
            correct: true,
            reason: '実行時刻とデータの対象期間を分けて再現性を保ちます。',
          },
          {
            id: 'c',
            text: 'すべての出力を削除してから考える',
            correct: false,
            reason: '無関係な正常データを失います。対象範囲と再処理方式を決めます。',
          },
        ],
      },
    ],
    services: ['scheduler', 'mwaa', 'lambda', 'stepfunctions'],
    sources: [
      source('MWAAのトラブルシューティング', 'mwaa/latest/userguide/troubleshooting.html'),
      source(
        'API GatewayのAPIキー',
        'apigateway/latest/developerguide/api-gateway-api-usage-plans.html',
      ),
    ],
  },
  {
    id: 'sql',
    domain: 3,
    tasks: ['3.2', '1.4'],
    title: 'SQLを結果まで読む',
    summary: 'JOIN・NULL・集約・窓関数を、小さな表の結果から理解します。',
    objectives: [
      'WHEREとHAVING、GROUP BYと窓関数を区別できる',
      'LEFT JOIN・COUNT・NULLの挙動と集計粒度を説明できる',
    ],
    sections: [
      {
        title: '行を減らす場所と、集約する場所',
        text: 'WHEREは集約前の行を絞り、GROUP BYはキーごとに行をまとめ、HAVINGは集約結果を絞ります。COUNT(*)は行数、COUNT(column)はその列がNULLでない行数です。NULLは不明や欠損を表す値で、= NULLではなくIS NULLを使います。COALESCEで既定値にできますが、金額不明を0円へ置き換えてよいかは業務定義で決めます。',
      },
      {
        title: 'JOINの行数を先に予測する',
        text: "INNER JOINは両側で一致する行を、LEFT JOINは左側を残し一致しない右側をNULLにします。右表のキーが重複すると行が増えます。LEFT JOIN後にWHERE right.status = 'active'などを置くとNULLの行は落ちます。未一致の左行を残したいなら条件をONへ置く等、目的に応じて設計します。viewはSQLの定義、materialized viewは結果の保持という違いも押さえます。",
      },
      {
        title: '窓関数は元の行を残す',
        text: 'SUM/AVG OVERは行ごとに累計や移動平均を付け、ROW_NUMBERはグループ内の順番を付けます。PARTITION BYは計算グループ、ORDER BYは順序、ROWSは対象行の幅です。日別に1行へ集約してからROWS 2 PRECEDINGを使うと最大3行の移動平均になりますが、日付が欠ければ「3日間」とは限りません。pivotはカテゴリ値を列へ展開する操作です。Athena Spark notebooks等の探索でも同じ粒度と欠損に注意します。',
      },
    ],
    example: {
      title: '日別売上と累計',
      input: 'daily_sales: (09-01,10), (09-02,20), (09-03,30)。各日は1行、NULLなし。',
      code: 'SELECT day, revenue,\n  SUM(revenue) OVER (\n    ORDER BY day\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total,\n  AVG(revenue) OVER (\n    ORDER BY day\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS moving_avg\nFROM daily_sales\nORDER BY day;',
      output:
        'day    revenue  running_total  moving_avg\n09-01  10       10             10\n09-02  20       30             15\n09-03  30       60             20',
      explanation:
        'GROUP BYで3行を1行に潰さず、各日に計算結果を付けます。順序が同じ行が複数あるなら一意な順序キーを追加するか先に日別集約します。この例はAthena/Redshiftで使える窓構文です。結果は手計算でも確認できます。',
    },
    pitfalls: [
      'JOIN後の行数を確認せずに合計すると、正しく動くSQLでも誤った数字になります。',
      'ROWSは行数です。欠けた日付を自動で補って移動平均を計算する指定ではありません。',
    ],
    checks: [
      {
        id: 'count',
        prompt: '3行のamountは10, NULL, 20です。COUNT(*)とCOUNT(amount)は？',
        options: [
          { id: 'a', text: '3と3', correct: false, reason: 'COUNT(amount)はNULLを数えません。' },
          {
            id: 'b',
            text: '3と2',
            correct: true,
            reason: '行数は3、amountが存在する行数は2です。',
          },
          { id: 'c', text: '2と2', correct: false, reason: 'COUNT(*)はNULLを含む行も数えます。' },
        ],
      },
      {
        id: 'window',
        prompt: '日別の売上は10, 20, 30。3行目でROWS BETWEEN 1 PRECEDING AND CURRENT ROWのAVGは？',
        options: [
          {
            id: 'a',
            text: '20',
            correct: false,
            reason: 'これは全3行の平均です。指定は直前1行と現在行です。',
          },
          {
            id: 'b',
            text: '25',
            correct: true,
            reason: '(20+30)/2=25です。窓の範囲を具体的な行へ当てはめます。',
          },
          {
            id: 'c',
            text: '60',
            correct: false,
            reason: 'これは全3行の合計です。AVGとSUMも区別します。',
          },
        ],
      },
    ],
    services: ['athena', 'redshift'],
    sources: [
      source('Redshiftの窓関数', 'redshift/latest/dg/c_Window_functions.html'),
      source('COUNT', 'redshift/latest/dg/r_COUNT.html'),
      source('JOIN例', 'redshift/latest/dg/r_Join_examples.html'),
    ],
  },
  {
    id: 'monitoring',
    domain: 3,
    tasks: ['3.3'],
    title: '症状から原因を切り分ける',
    summary: '遅い・来ない・失敗するを、観測値と次の行動に結びつけます。',
    objectives: [
      '運用メトリクスとデータの鮮度を監視できる',
      'Athena・Glue・Redshift・ストリームの主要な詰まりを切り分けられる',
    ],
    sections: [
      {
        title: 'ジョブ成功だけでは健康状態がわからない',
        text: 'CloudWatchではメトリクス、ログ、アラームを組み合わせます。件数0で成功したジョブでも業務データが届いていないことがあります。処理時間、エラー率、遅延、入力/出力件数、最新の業務時刻、品質不合格率を観測します。相関IDをソースから出力まで引き継ぐと、複数サービスをまたいで1バッチを追えます。',
      },
      {
        title: 'エンジンごとに観測する',
        text: 'Athenaは走査バイトと実行計画を見て、パーティション絞込・列選択・ファイル数を確認します。Redshiftは待ち行列、実行計画、分散の偏り、統計、ロックを確認し、WLMやテーブル設計を調整します。Glue/EMRはSpark UI、executorのメモリ、spill、shuffle、タスクの偏りを見ます。1つのworkerだけ遅いのか全体がCPU不足なのかで、容量追加の効果が違います。',
      },
      {
        title: '通知から復旧までを具体化',
        text: 'ストリームの遅延は入力の急増、読取制限、処理失敗、下流の遅延を分けます。アラームには担当とrunbookを対応させ、必要なログの場所、確認手順、再処理方法を決めます。CloudWatch Logs Insightsで時間帯やエラーコードを絞り、長期ログはS3＋Athenaや検索用途のOpenSearchで分析する選択肢があります。CloudTrailはAWS API操作の追跡に使い、業務ログと同一視しません。',
      },
    ],
    example: {
      title: 'いつものジョブが2倍遅い',
      input: 'Glueの大半のworkerは空きが多い。1タスクだけshuffle spillが大きい。入力件数は平常。',
      output: '対象キーの分布と結合を調べる。事前集約、偏り分散、broadcast可否を評価して再測定。',
      explanation:
        '全体のDPUを倍にする前に、使われない容量が増えるだけではないか確認します。改善は同じ条件のデータで実行時間・費用・結果件数を比較します。',
    },
    pitfalls: [
      'CloudWatchのアラームは対処手順や復旧の成功まで自動で保証しません。',
      '平均値だけでは特定の顧客キーや一部時間帯の問題を隠すことがあります。',
    ],
    checks: [
      {
        id: 'freshness',
        prompt: '日次ジョブは成功扱いですが出力は0件です。まず追加する検知は？',
        options: [
          {
            id: 'a',
            text: '入力・出力件数と最終データ時刻に基づく監視',
            correct: true,
            reason:
              '実行状態だけでは見つからない欠損や鮮度低下を検知できます。正常な0件日があるかも定義します。',
          },
          {
            id: 'b',
            text: '成功ログだけを保存し続ける',
            correct: false,
            reason: '業務データがない状態を検知できません。',
          },
          {
            id: 'c',
            text: 'CPUを必ず最大にする',
            correct: false,
            reason: '入力欠損や抽出条件の誤りには効きません。',
          },
        ],
      },
    ],
    services: ['cloudwatch', 'glue', 'emr', 'redshift', 'kinesis'],
    sources: [
      source('Glue Observability', 'glue/latest/dg/monitor-observability.html'),
      source('CloudWatch Logs Insights', 'AmazonCloudWatch/latest/logs/AnalyzingLogData.html'),
    ],
  },
  {
    id: 'quality',
    domain: 3,
    tasks: ['3.4'],
    title: 'データ品質を公開の条件にする',
    summary: '件数が合うだけでなく、欠損・一意性・整合性・鮮度を確認します。',
    objectives: [
      '品質ルールと違反時の処理を定義できる',
      'サンプリングと全件検証の限界を区別できる',
    ],
    sections: [
      {
        title: '何をもって正しいとするか',
        text: 'completenessは必須値の充足、uniquenessは一意性、validityは形式や値域への適合、consistencyは他の表や規則との整合性、freshnessは鮮度です。例えばorder_idはNULL不可かつ一意、amountは許容範囲内、customer_idは顧客表に存在、入力は業務締切までに到着、と定義します。形式が正しくても取引自体が誤っている可能性は残ります。',
      },
      {
        title: 'ルールを実行し、不合格を分岐させる',
        text: 'Glue Data QualityではDQDLでルールを定義できます。DataBrewのprofileや検証も、分布と品質の確認に使えます。必須IDの欠損は隔離、件数の急変は通知して保留など、重要度ごとに対応を決めます。評価の結果を記録し、パイプラインがルール不合格でも公開へ進まないよう明示的に制御します。ルールを作っただけで自動的にすべての書込が止まるとは限りません。',
      },
      {
        title: '標本の選び方で見える問題が変わる',
        text: '無作為抽出は全体の傾向を知る入口、層化抽出は地域・顧客種別などの小さな群も確認する方法です。先頭100行だけでは時刻や並び順の偏りを受けます。まれな不正値は標本に出ないことがあるため、一意性や必須項目など強い制約は必要に応じて全件確認します。分布の偏りは品質の問題か自然な業務特性かを判断し、性能上のskew対策では意味を変えないことを確認します。',
      },
    ],
    example: {
      title: '注文データを公開する前の検証',
      input: 'order_id: A, B, B, NULL。4行とも日付は正しい。',
      code: 'Rules = [\n  RowCount > 0,\n  IsComplete "order_id",\n  IsUnique "order_id"\n]',
      output: 'RowCountは合格。IDの完全性と一意性は不合格。公開を保留し、欠損と重複を調査。',
      explanation:
        'これはGlue Data QualityのDQDL例です。件数が正でも品質は保証されません。修正時は元入力と理由を保持し、同じ品質ルールで再検証します。',
    },
    pitfalls: [
      'NULLをすべて0にすると、欠損と実際の0を区別できなくなります。',
      'サンプルで不正が見つからなかったことは、全件が正しい証拠ではありません。',
    ],
    checks: [
      {
        id: 'sample',
        prompt: '先頭100行に問題がありませんでした。全件のorder_idの一意性について言えることは？',
        options: [
          {
            id: 'a',
            text: '全件が一意だと保証できる',
            correct: false,
            reason: '後続の重複や先頭との重複は検出していません。',
          },
          {
            id: 'b',
            text: '確認した範囲に限る。必要な保証には全件で一意性を検証する',
            correct: true,
            reason: '標本の限界を踏まえ、保証したい制約に合った検証を選びます。',
          },
          {
            id: 'c',
            text: '処理時間が短ければ一意だと判断できる',
            correct: false,
            reason: '性能とデータの一意性には、そのような保証関係はありません。',
          },
        ],
      },
    ],
    services: ['quality', 'glue', 'athena'],
    sources: [
      source('DQDL', 'glue/latest/dg/dqdl.html'),
      source('DQDLルール一覧', 'glue/latest/dg/dqdl-rule-types.html'),
    ],
  },
];
