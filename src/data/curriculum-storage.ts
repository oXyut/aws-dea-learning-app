import type { Lesson } from './curriculum';
const source = (title: string, path: string) => ({
  title,
  url: `https://docs.aws.amazon.com/${path}`,
});
export const storageLessons: Lesson[] = [
  {
    id: 'stores',
    domain: 2,
    tasks: ['2.1'],
    title: 'アクセスパターンから保存先を選ぶ',
    summary: '同じ「保存する」でも、1件の更新と10億行の集計では設計が変わります。',
    objectives: [
      'OLTP・OLAP・検索・ファイル共有を区別できる',
      'コピー・外部参照・キャッシュのトレードオフを説明できる',
    ],
    sections: [
      {
        title: 'まず、どのように読むかを書く',
        text: '注文1件を主キーで取得・更新するOLTPにはRDS/AuroraやDynamoDBが候補です。履歴を大量に走査・結合するOLAPにはRedshiftやS3＋Athenaを検討します。全文の関連度検索はOpenSearch、POSIXファイルを複数実行環境で共有するならEFSを考えます。S3はオブジェクトの保存先であり、ファイルシステムと同じ追記・ロックの操作を提供するわけではありません。',
      },
      {
        title: 'ロードするか、置いたまま読むか',
        text: 'RedshiftのCOPYはデータをロードし、UNLOADはS3へ書き出します。SpectrumはS3の外部テーブルを、federated queryは対応する外部DBを参照します。外部参照は複製を抑えますが、ネットワークや接続先の負荷・権限に依存します。マテリアライズドビューは計算結果を保持して繰り返しクエリを速める方法で、鮮度と更新コストを検討します。',
      },
      {
        title: 'レイテンシー・整合性・運用負荷',
        text: 'キャッシュは読取を速めますが古い値を返す可能性があります。DAXはDynamoDB向けキャッシュ、MemoryDBはRedis OSS/Valkey互換のインメモリDBとして検討します。ローカルRAMはネットワーク往復を省けても共有・永続性に制約があります。サーバーレスかプロビジョンドかは、負荷の変動・常時利用・管理工数・費用で比較します。DBの更新が待たされる場合はロックと長いトランザクションを調べ、単に容量を増やす前に競合を切り分けます。',
      },
    ],
    example: {
      title: '取引処理と月次分析を分ける',
      input: '注文APIは1件の更新を即座に確定。経営分析は3年分の明細をJOIN。',
      output: 'APIはAuroraやDynamoDB。変更をDMS等で分析基盤へ送り、RedshiftやS3で分析する。',
      explanation:
        '集計の全表走査で本番の注文DBを圧迫しない設計です。分析側の遅延を許容する代わりに処理を分離します。最新の取引直後の参照に古い分析データを使わないよう、鮮度要件を明記します。',
    },
    pitfalls: [
      '「SQLだからRDS」「サーバーレスだからAthena」の一語で選ばず、負荷とアクセス方法を確認します。',
      'データ共有・レプリケーション・バックアップはそれぞれ目的が違います。',
    ],
    checks: [
      {
        id: 'workload',
        prompt:
          'S3にある過去ログを月に数回だけSQLで探索したい。常設基盤の管理を抑える最初の候補は？',
        options: [
          {
            id: 'a',
            text: 'S3＋Athena',
            correct: true,
            reason:
              'S3上のデータを必要時に分析できます。パーティション・形式・走査量は設計します。',
          },
          {
            id: 'b',
            text: 'SQSへ全ログを入れてSQLを実行',
            correct: false,
            reason: 'SQSは処理する仕事のキューで、分析用SQLエンジンではありません。',
          },
          {
            id: 'c',
            text: 'API用DBへ毎回全ログをロードする',
            correct: false,
            reason: '不要なロード工程と取引DBへの負荷を増やします。',
          },
        ],
      },
    ],
    services: ['s3', 'athena', 'redshift', 'rds', 'dynamodb', 'efs'],
    pattern: 'warehouse',
    sources: [
      source('Redshiftのfederated query', 'redshift/latest/dg/federated-overview.html'),
      source(
        'Redshiftのマテリアライズドビュー',
        'redshift/latest/dg/materialized-view-overview.html',
      ),
    ],
  },
  {
    id: 'dynamodb-design',
    domain: 2,
    tasks: ['2.1', '2.4'],
    title: 'DynamoDBのキーとインデックス',
    summary: 'テーブルを作る前に、必要なQueryを具体的に書きます。',
    objectives: ['QueryとScan、主キーとGSIを区別できる', 'hot partitionと更新の競合に対策を選べる'],
    sections: [
      {
        title: 'キーで読みたい範囲を表現する',
        text: 'partition keyがデータの分散先を決め、sort keyが同じpartition key内での範囲指定に役立ちます。顧客別の注文ならPK=customer_id、SK=日時#注文IDなどが候補です。Queryはpartition keyの等価条件と任意のsort key条件で絞ります。Scanは表やインデックスを広く読みます。FilterExpressionは読取後の絞り込みなので、読み取った量そのものを減らす代わりにはなりません。',
      },
      {
        title: '別の検索軸はインデックスで用意する',
        text: 'Global Secondary Index（GSI）には別のキーを設定でき、ステータス別など主キーとは違うアクセスに使えます。追加インデックスは書込・保管コストがかかります。GSIの読み取りは結果整合性です。Local Secondary Index（LSI）は同じpartition keyと別のsort keyを使い、テーブル作成時に定義します。強い整合性が必要なら利用できる読取対象と設定を確認します。',
      },
      {
        title: '偏りと競合を設計に含める',
        text: 'すべての注文をPK="orders"に集めると負荷が偏ります。アクセスの多いキーには書込シャーディングなどを検討しますが、読む側の集約が増えます。条件付き書込で「まだ存在しない」「versionが前回読んだ値と一致する」を確認すると、重複作成や更新の上書きを防げます。複数項目を一体で確定したい場合はトランザクションを検討し、費用や競合も見ます。',
      },
    ],
    example: {
      title: '顧客C1の9月の注文',
      input: 'PK=C1, SK=2026-09-01#O1 / 2026-09-20#O2。PK=C2, SK=2026-09-03#O3。',
      output: 'PK=C1、SKが"2026-09"で始まるQuery → O1とO2。',
      explanation:
        'C2の注文を読み取ってから捨てる必要がありません。一方「全顧客の未発送注文」はこのキーだけでは効率的に読めず、別のインデックスや集計モデルが必要です。',
    },
    pitfalls: [
      'on-demandを選んでも極端に集中したキーの設計問題が消えるとは限りません。',
      'GSIに強い整合性の読取を要求して解決しようとしません。',
    ],
    checks: [
      {
        id: 'query',
        prompt:
          '顧客別の注文一覧でScan＋FilterExpressionを繰り返しています。読取量を減らす改善は？',
        options: [
          {
            id: 'a',
            text: 'FilterExpressionの条件を長くする',
            correct: false,
            reason:
              'フィルタは読取後に適用され、読取キャパシティを節約するキー条件の代わりになりません。',
          },
          {
            id: 'b',
            text: '顧客IDをキーとする表またはGSIでQueryする',
            correct: true,
            reason:
              '必要なアクセスパターンをキーへ反映して、対象を限定します。GSIなら整合性と追加コストも確認します。',
          },
          {
            id: 'c',
            text: 'TTLを有効にすればすべてのQueryが高速になる',
            correct: false,
            reason: 'TTLは期限切れ項目の削除で、検索キーを作る機能ではありません。',
          },
        ],
      },
    ],
    services: ['dynamodb'],
    sources: [
      source('QueryとScanの設計', 'amazondynamodb/latest/developerguide/bp-query-scan.html'),
      source('GSI', 'amazondynamodb/latest/developerguide/GSI.html'),
    ],
  },
  {
    id: 'catalogs',
    domain: 2,
    tasks: ['2.2'],
    title: '技術カタログと業務カタログ',
    summary: '「データが見つかる」と「データを読める」を区別します。',
    objectives: [
      'Crawler・Catalog・Lake Formationの役割を説明できる',
      'パーティションの同期と業務メタデータの管理を説明できる',
    ],
    sections: [
      {
        title: '技術カタログはエンジンのための定義',
        text: 'Glue Data CatalogやHive metastoreはデータベース、テーブル、列、場所、パーティション等を保持します。Crawlerは接続先やS3を調べて定義を発見・登録します。既知のスキーマはDDLやAPIでも登録でき、Crawlerが必須とは限りません。JDBC接続では接続先・認証情報・ネットワークを設定します。推論した型が全ファイルで正しいとは限らず、スキーマ契約との照合が必要です。',
      },
      {
        title: 'ファイル追加とパーティション登録',
        text: 'S3に新しい日付ディレクトリを置いても、従来型の外部テーブルで必要なパーティション定義が自動的に更新されるとは限りません。Crawler、ALTER TABLE ADD PARTITION、API等で登録します。Athenaのpartition projectionは規則からパーティションを計算し、個別登録を省く方式です。場所の規則が合わないと期待するデータは見えず、存在しない範囲を大量に投影しても効率が落ちます。',
      },
      {
        title: '業務カタログは人のための文脈',
        text: 'SageMaker Catalogでは、所有者・説明・業務用語・品質・データの来歴を通して必要な資産を発見し、利用申請へ進めます。Glueの列定義とは役割が異なります。Lake Formationはデータへのアクセス制御を担います。公開して検索可能になったことと、利用を承認されて読取権限が付いたことは別です。業務上の責任者と技術上の権限を両方管理します。',
      },
    ],
    example: {
      title: '昨日のログだけがSQLに出ない',
      input: 'S3にはevent_date=2026-09-20/が存在。Catalogには09-19まで登録。',
      output:
        'テーブルの場所・partition定義・projection設定を確認し、新しい範囲を認識させて再照合する。',
      explanation:
        'ログが欠損したと決めつけて再取り込みすると、重複を作る場合があります。実データがないのか、定義が古いのか、権限で見えないのかを分けます。',
    },
    pitfalls: [
      'Catalogに列があってもS3やKMSの読取許可がなければクエリできません。',
      'Crawlerで型を推論しても不正な入力を修復したことにはなりません。',
    ],
    checks: [
      {
        id: 'business',
        prompt: '分析者が「売上」の定義・所有者を確認し、利用申請したい。中心になる仕組みは？',
        options: [
          {
            id: 'a',
            text: 'SageMaker Catalogの業務メタデータと購読申請',
            correct: true,
            reason:
              '発見、業務上の意味、利用承認を管理する用途です。読取には適切な権限付与が必要です。',
          },
          {
            id: 'b',
            text: 'S3の保存クラスを変更する',
            correct: false,
            reason: '保管コストとアクセス特性は変わりますが、定義や利用申請を提供しません。',
          },
          {
            id: 'c',
            text: 'Crawlerを回せば全員にSELECT権限が付く',
            correct: false,
            reason: 'スキーマの発見・登録と認可は別です。',
          },
        ],
      },
    ],
    services: ['catalog', 'crawler', 'lakeformation', 'athena'],
    pattern: 'serverless-lake',
    sources: [
      source('Athena partition projection', 'athena/latest/ug/partition-projection.html'),
      source(
        'SageMaker Unified Studioの概念',
        'sagemaker-unified-studio/latest/userguide/concepts.html',
      ),
    ],
  },
  {
    id: 'lifecycle',
    domain: 2,
    tasks: ['2.3'],
    title: '保存期限・削除・復元を設計する',
    summary: '安く残す、期限で消す、障害から戻す。それぞれの条件を確認します。',
    objectives: [
      'Transition・Expiration・非現行版の削除を区別できる',
      'TTL・バックアップ・RPO/RTOの制約を説明できる',
    ],
    sections: [
      {
        title: '保管料と読取条件を合わせて比較',
        text: '頻繁に読むならS3 Standard、低頻度でも即時取得が必要ならStandard-IAやGlacier Instant Retrievalなどを比較します。Flexible Retrieval/Deep Archiveは復元待ちが必要です。料金には保管、取出し、リクエスト、最低保管期間を含めます。LifecycleのTransitionはクラス変更、Expirationは期限切れです。Redshiftの古い行をS3に出すにはUNLOADと検証が必要で、Lifecycleだけでは移動しません。',
      },
      {
        title: '論理的に消えることと物理削除',
        text: 'S3バージョニング有効時の通常削除は削除マーカーを作り、過去バージョンが残る場合があります。非現行版の保持も管理します。Object Lockの保持やlegal holdがあるデータは、その制約と削除要求の整合が必要です。DynamoDB TTLはUnix epoch秒で指定しますが、期限到来と同時の削除は保証されません。期限を過ぎた項目を読ませない場合は読取側の条件でも除外します。',
      },
      {
        title: '復元要件を数値にする',
        text: 'RPOは許容できるデータ損失の時間幅、RTOは復旧までの許容時間です。レプリケーションは可用性に役立ちますが誤削除も反映し得るため、過去時点へ戻すバックアップとは別です。スナップショット・PITRを用意し、実際に復元して件数・権限・接続先を確認します。削除要求ではRaw、Curated、複製、スナップショットなどの保持方針を追跡します。',
      },
    ],
    example: {
      title: 'TTL期限を過ぎた項目がまだ返る',
      input: 'expires_at=12:00。12:01に項目が存在。',
      output:
        'アプリはexpires_atが現在時刻以前の項目を利用対象から外し、物理削除はTTLの非同期処理に任せる。',
      explanation:
        '「12時以降は利用させない」という要件と「物理的に完全削除する」という要件を分けます。厳密な削除時刻が必要ならTTLだけに依存せず、適切な明示削除と結果確認を設計します。',
    },
    pitfalls: [
      'UNLOADしてもRedshiftの元の行は自動削除されません。',
      'バックアップの取得成功だけで復旧時間を達成できると判断しません。',
    ],
    checks: [
      {
        id: 'versions',
        prompt:
          'バージョニング有効なS3で現行オブジェクトを削除しました。何を追加確認すべきですか？',
        options: [
          {
            id: 'a',
            text: 'すべての過去版が消えたとみなす',
            correct: false,
            reason: '削除マーカーで現行版が見えなくなっても非現行版が残る場合があります。',
          },
          {
            id: 'b',
            text: '非現行版、複製、保持制約を含む削除方針と実際の残存状況',
            correct: true,
            reason: '見えなくする操作とすべてのコピーの削除を区別する必要があります。',
          },
          {
            id: 'c',
            text: 'Catalogのテーブル名だけ変更する',
            correct: false,
            reason: '保存済みオブジェクトやバージョンの削除にはなりません。',
          },
        ],
      },
    ],
    services: ['s3', 'glacier', 'dynamodb', 'redshift'],
    sources: [
      source(
        'S3 Lifecycleとバージョン',
        'AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html',
      ),
      source('DynamoDB TTL', 'amazondynamodb/latest/developerguide/TTL.html'),
    ],
  },
  {
    id: 'modeling',
    domain: 2,
    tasks: ['2.4'],
    title: 'データモデルとスキーマ変更',
    summary: '1行の意味を決め、結合による二重計上と履歴の消失を防ぎます。',
    objectives: [
      'fact・dimension・粒度・SCDを具体例で説明できる',
      'スキーマ変更の互換性とデータリネージを考えられる',
    ],
    sections: [
      {
        title: '最初に粒度を宣言する',
        text: 'factは売上などの出来事や測定、dimensionは顧客・商品など分析の切り口です。星型スキーマではfactを中心にdimensionを結合します。1行が注文なのか注文明細なのか、粒度（grain）を先に決めます。注文合計を明細とJOINしてからSUMすると、明細数だけ金額が増える場合があります。正規化は重複を抑え、非正規化は読取を減らしますが更新箇所を増やします。',
      },
      {
        title: '履歴を残すか、上書きするか',
        text: 'Slowly Changing Dimension（SCD）Type 1は値を上書きし、Type 2は別行として有効期間を持たせます。顧客が支店を移ったとき、当時の支店で売上を集計したいならType 2が候補です。業務キーのcustomer_idと、版を識別する代理キーを分けます。有効期間が重なると1件の売上が複数のdimension行にJOINされるので、期間の整合性を検証します。',
      },
      {
        title: '変更は下流と一緒に扱う',
        text: '列追加はNULL許容や既定値で旧データと共存できることがあります。型変更・列削除・単位変更は利用者を壊し得るため、契約の版と移行期間を用意します。Redshiftのsort keyは絞込、distributionはノード間の再配分削減に関係します。圧縮・統計・偏りも確認します。リネージは入力→ジョブ→出力の来歴で、列変更の影響範囲と数字の出所を追うために使います。',
      },
    ],
    example: {
      title: '注文と明細のJOINの落とし穴',
      input: 'orders: O1=1,000円。items: O1に2行。',
      code: 'SELECT SUM(o.total)\nFROM orders o JOIN items i ON o.id = i.order_id;',
      output: '2,000円。JOIN後に注文合計1,000円が2行存在するため。',
      explanation:
        '注文単位ならordersで集計する、明細単位なら明細金額を集計するなど、粒度を合わせます。SUM(DISTINCT total)は同額の別注文まで落とすので一般的な修正ではありません。',
    },
    pitfalls: [
      'テーブル名や列名が同じでも金額の単位が変われば意味の互換性が壊れます。',
      'スキーマ変換ツールを使ってもストアドプロシージャやデータの意味の検証は必要です。',
    ],
    checks: [
      {
        id: 'scd',
        prompt: '顧客の現在の所属と、購入当時の所属を両方残したい。適切なのは？',
        options: [
          {
            id: 'a',
            text: '所属を毎回上書きするSCD Type 1だけを使う',
            correct: false,
            reason: '過去の所属を失い、過去時点の分析ができなくなります。',
          },
          {
            id: 'b',
            text: '所属の各版と有効期間を持つSCD Type 2を使う',
            correct: true,
            reason:
              '購入時刻を有効期間に結びつけて当時の所属を特定できます。期間の重複を防ぎます。',
          },
          {
            id: 'c',
            text: '顧客IDを持たずすべて文字列へ変換する',
            correct: false,
            reason: '型の変更では所属履歴や結合の一意性を表現できません。',
          },
        ],
      },
    ],
    services: ['redshift', 'dynamodb', 'catalog'],
    sources: [
      source('Redshiftテーブル設計', 'redshift/latest/dg/c_designing-tables-best-practices.html'),
      source(
        'SageMaker Catalogのリネージ',
        'sagemaker-unified-studio/latest/userguide/datazone-data-lineage.html',
      ),
    ],
  },
  {
    id: 'iceberg',
    domain: 2,
    tasks: ['2.1', '2.4'],
    title: 'Apache IcebergとS3 Tables',
    summary: 'Parquetというファイルと、テーブルの変更履歴を管理する形式の違いを学びます。',
    objectives: [
      'ファイル形式とテーブル形式を区別できる',
      'compactionとsnapshot expirationの目的を説明できる',
    ],
    sections: [
      {
        title: 'ファイルを束ねて一貫したテーブルにする',
        text: 'Parquetは1ファイル内の保存形式です。Icebergはどのファイルの集合がテーブルのどの版なのかをメタデータで管理するオープンテーブル形式です。snapshotを通じて一貫した読取、行の変更、過去版への参照、スキーマやパーティションの進化を扱います。S3上にParquetを置いただけでは、複数書込の競合制御やテーブルの変更履歴は得られません。',
      },
      {
        title: '更新と保守を一緒に考える',
        text: '頻繁な書込は小さなデータファイルやdelete fileを増やし、読取時の仕事を増やすことがあります。compactionはファイルをまとめる等の処理で、AthenaではOPTIMIZEを利用できます。VACUUMは古いsnapshotや不要ファイルの整理を行います。過去版を削除するとその時点へのtime travelはできなくなるため、必要な履歴と保持設定を先に決めます。',
      },
      {
        title: 'S3 Tablesは保守を管理する選択肢',
        text: 'S3 Tablesは通常の汎用バケットと異なるtable bucketにIcebergテーブルを保存し、compactionやsnapshot管理等の保守を自動化します。クエリには対応するAthenaやSpark等を使います。汎用バケット上で管理するIcebergと、S3 Tablesでは権限や統合の設定が異なります。エンジンの対応する操作・形式の版・Lake Formation連携条件を確認して設計します。',
      },
    ],
    example: {
      title: '訂正前の売上を再現する',
      input: 'snapshot A: O1=1,000円。訂正後snapshot B: O1=900円。',
      output: '現在の読取は900円。保持されているAを指定した過去版の読取は1,000円。',
      explanation:
        'snapshotが参照するデータファイルをS3 Lifecycleで勝手に削除すると過去版や現在版を壊す可能性があります。テーブルが参照するファイルの保守は、テーブル形式を理解する仕組みで管理します。',
    },
    pitfalls: [
      'Icebergを圧縮コーデックやSQLエンジンと考えません。',
      'OPTIMIZEとVACUUMは同じ目的ではありません。整理後に必要な過去版が残るか確認します。',
    ],
    checks: [
      {
        id: 'maintenance',
        prompt: '小さなファイルが増えた一方、30日前の状態も再現する必要があります。適切な判断は？',
        options: [
          {
            id: 'a',
            text: '小ファイルをまとめ、snapshotの保持は30日要件と整合させる',
            correct: true,
            reason: '読取効率の改善と履歴保持を別々に設計します。',
          },
          {
            id: 'b',
            text: 'すべての古いsnapshotを直ちに削除する',
            correct: false,
            reason: '再現に必要な過去版を失う可能性があります。',
          },
          {
            id: 'c',
            text: 'S3上の古いParquetを無条件に削除する',
            correct: false,
            reason: '現在または過去のsnapshotが参照中のファイルを壊す可能性があります。',
          },
        ],
      },
    ],
    services: ['s3', 'athena', 'glue'],
    sources: [
      source('AthenaとIceberg', 'athena/latest/ug/querying-iceberg.html'),
      source('Icebergの保守', 'athena/latest/ug/querying-iceberg-data-optimization.html'),
      source('S3 Tables', 'AmazonS3/latest/userguide/s3-tables.html'),
    ],
  },
  {
    id: 'vectors',
    domain: 2,
    tasks: ['2.1', '2.4'],
    title: 'ベクトル化・HNSW・IVF・RAG',
    summary: '意味の近さを検索するための取り込みと、検索精度の測り方を学びます。',
    objectives: [
      'embedding・chunk・ベクトルインデックスの役割を説明できる',
      'HNSWとIVFの速度・メモリ・再現率の違いを比較できる',
    ],
    sections: [
      {
        title: '文章を数値の並びにする',
        text: 'embeddingは文書や質問を意味の特徴を表すベクトルへ変換する処理です。同じ空間にあるベクトルの距離などから類似度を求めます。文書を適切なchunkに分割し、原文ID・位置・権限等のメタデータを一緒に保持します。chunkが小さすぎると文脈を失い、大きすぎると検索結果に不要な情報が混ざります。モデルや次元を変える場合は既存のベクトルとの互換性を確認し、必要なら再埋め込みします。',
      },
      {
        title: '近似検索は速さと見逃しの交換',
        text: '全ベクトルとの厳密比較は基準になりますが、データ量が増えると重くなります。HNSWは階層的な近傍グラフをたどる近似探索で、メモリや構築時間と検索精度を調整します。IVFはベクトルを領域へ分け、近い領域だけを探す方式です。IVFFlatでは分割の学習に代表的なデータが必要で、検索する領域数を増やすと探索量と再現率が変わります。どちらも常に真の最近傍が見つかる保証ではありません。',
      },
      {
        title: 'RAGの前半はデータエンジニアリング',
        text: 'RAGは関連資料を検索して生成モデルへ渡す方式です。Bedrock Knowledge Basesは文書取り込み・chunking・embedding・ベクトルストアへの登録を支援します。Aurora PostgreSQLのpgvectorやOpenSearchなどが検索基盤の候補です。検索結果の権限フィルタ、文書更新・削除の反映、検索のrecall（必要な候補を拾えた割合）と生成回答の根拠を別々に検証します。',
      },
    ],
    example: {
      title: '似た質問を探す',
      input: '文書「商品の返品手順」と質問「買った品を返すには？」。キーワードは完全一致しない。',
      output:
        '両方を同じembedding空間へ変換 → 類似候補を検索 → 閲覧権限で絞る → 根拠文書をモデルへ渡す。',
      explanation:
        'ベクトルが近いことは記述が正しいことの証明ではありません。正解文書のセットを用意してrecall@kと遅延を測り、インデックスの設定を比較します。元文書を消した際は古いchunkも検索対象から外します。',
    },
    pitfalls: [
      'embeddingは暗号化や匿名化ではありません。機密データとしての管理が必要な場合があります。',
      'モデルの変更後に新旧のベクトルを無条件に混在させません。',
    ],
    checks: [
      {
        id: 'ann',
        prompt: 'HNSWの検索を導入しました。正しい運用判断は？',
        options: [
          {
            id: 'a',
            text: '常に厳密な最近傍が返るので精度評価は不要',
            correct: false,
            reason: '近似検索には見逃しがあり、設定やデータで結果が変わります。',
          },
          {
            id: 'b',
            text: '正解集合でrecallと遅延を測り、メモリ・検索設定を調整する',
            correct: true,
            reason: '検索品質と費用のトレードオフを観測して選択します。',
          },
          {
            id: 'c',
            text: '元文書の権限はベクトル検索では不要',
            correct: false,
            reason:
              '検索や生成を通じて権限外の情報を返さないよう、メタデータとアクセス制御を維持します。',
          },
        ],
      },
    ],
    services: ['aurora', 'opensearch'],
    sources: [
      source('Bedrockのchunking', 'bedrock/latest/userguide/kb-chunking.html'),
      source('Knowledge Basesへの取り込み', 'bedrock/latest/userguide/kb-how-data.html'),
      {
        title: 'pgvectorのHNSWとIVFFlat（実装元）',
        url: 'https://github.com/pgvector/pgvector#hnsw',
      },
    ],
  },
];
