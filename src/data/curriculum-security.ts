import type { Lesson } from './curriculum';
const source = (title: string, path: string) => ({
  title,
  url: `https://docs.aws.amazon.com/${path}`,
});
export const securityLessons: Lesson[] = [
  {
    id: 'authentication',
    domain: 4,
    tasks: ['4.1'],
    title: '認証・ネットワーク・認証情報',
    summary: '誰が接続するか、接続できるか、何をできるかを分けて考えます。',
    objectives: [
      '認証と認可、信頼ポリシーと権限ポリシーを区別できる',
      'SG・VPC endpoint・Secrets Managerの役割を説明できる',
    ],
    sections: [
      {
        title: '誰として実行するのか',
        text: '認証は主体の確認、認可はその主体に許す操作の判断です。AWSサービスの処理にはIAM roleを割り当て、一時認証情報を使います。roleの信頼ポリシーは誰が引き受けられるか、権限ポリシーは引き受けた後に何ができるかを定義します。LambdaやGlueへroleを渡す操作のiam:PassRoleと、実行中のS3読取権限は別です。IAM groupはユーザーへの権限のまとめ方で、サービスが引き受けるroleではありません。',
      },
      {
        title: '到達できることと、操作できること',
        text: 'Security Groupはリソースへの通信を制御するstatefulな仕組みです。NACLはサブネットのstatelessな制御で、戻り通信も考慮します。VPCのルート、DNS、必要なportを調べます。S3/DynamoDBのgateway endpointや、PrivateLinkを利用するinterface endpointで対応サービスへプライベート接続を構成できます。endpoint policyは追加の制限で、データへの権限を無条件に与えるものではありません。',
      },
      {
        title: '認証情報をコードに埋め込まない',
        text: 'DBのパスワードを管理・更新するならSecrets Managerの対応するrotation方式を利用します。Parameter Storeは設定値やSecureStringの保管に向き、保存するだけで接続先DBのパスワードを同期更新するわけではありません。対応するDBではIAM DB認証も候補ですが、利用条件と接続方式を確認します。マネージドサービスでも利用者はIAM、ネットワーク、データの権限を設定します。',
      },
    ],
    example: {
      title: 'DBへの接続がタイムアウトする',
      input: 'Glue roleにはSecrets Manager読取を許可済み。DBのportへの接続がタイムアウト。',
      output: 'DBのSecurity Group、送信元、ルート、DNS、サブネット構成を確認する。',
      explanation:
        'パスワードを取得する権限があってもDBにネットワークで到達できるとは限りません。認証失敗と通信タイムアウトの症状を分けます。',
    },
    pitfalls: [
      'roleの信頼ポリシーにS3読取を記述しても、実行権限を与える代わりにはなりません。',
      'VPC endpointを作っただけでDBやS3の認可を省略できるわけではありません。',
    ],
    checks: [
      {
        id: 'trust',
        prompt: 'Lambdaがroleを引き受けられません。まず確認するのは？',
        options: [
          {
            id: 'a',
            text: 'roleの信頼ポリシーにLambdaのサービス主体を許可しているか',
            correct: true,
            reason: '引受けの許可を調べます。引受け後のS3等の操作は権限ポリシーで別に確認します。',
          },
          {
            id: 'b',
            text: 'S3オブジェクトの圧縮形式',
            correct: false,
            reason: 'roleを引き受ける認証・信頼の問題とは無関係です。',
          },
          {
            id: 'c',
            text: 'DynamoDBのsort keyだけ',
            correct: false,
            reason: 'データ設計を変えてもroleを引き受ける許可は変わりません。',
          },
        ],
      },
    ],
    services: ['iam', 'secrets', 'parameterstore', 'lambda'],
    sources: [
      source('IAM roleの概念', 'IAM/latest/UserGuide/id_roles.html'),
      source('VPC endpoint policy', 'vpc/latest/privatelink/vpc-endpoints-access.html'),
    ],
  },
  {
    id: 'authorization',
    domain: 4,
    tasks: ['4.2'],
    title: 'IAM・Lake Formation・DB権限の境界',
    summary: 'AccessDeniedを「全部許可」で解決せず、拒否している層を特定します。',
    objectives: [
      '明示的Denyと最小権限の評価を説明できる',
      'IAM・S3/KMS・Lake Formation・DB権限を切り分けられる',
    ],
    sections: [
      {
        title: '許可を足す前に拒否を探す',
        text: 'IAMでは適用される明示的DenyがAllowより優先します。identity policy、resource policy、permissions boundary、SCP等は評価方法や適用範囲が異なります。SCPやboundaryは上限を定め、それ自体で権限を付与しません。まずprincipal、action、resource、conditionと、適用される各ポリシーを確認します。クロスアカウントでは相手側のリソース許可も必要になるため、片側のAllowだけで完了とは限りません。',
      },
      {
        title: '具体的な操作とリソースへ絞る',
        text: 's3:GetObjectはオブジェクトARN、s3:ListBucketはバケットARNを対象にします。役割で許可するRBAC、タグ属性の一致条件等で許可するABACを使い分けます。Lake FormationのLF-Tagによる権限はカタログ資産の分類を利用します。管理ポリシーが広すぎる場合は必要な操作・対象・条件を持つカスタムポリシーを作ります。',
      },
      {
        title: 'データ基盤には複数の認可がある',
        text: 'Athenaから読む場合、クエリを実行するIAM許可、Catalogの参照、S3入出力、暗号化されていればKMSなどを確認します。Lake Formation管理下の対象にはSELECTや行・列フィルターなどの権限も必要です。RedshiftはDB内のユーザー・role・GRANTによるアクセス制御も持ちます。Catalogを見る権限とデータ本文を読む権限を混同せず、直接S3を読んで制御を迂回できる権限が残らないかも検証します。',
      },
    ],
    example: {
      title: '特定prefixの読取許可',
      input: 'roleがexample-bucketのcurated/以下の本文だけを読む。バケット一覧取得は別要件。',
      code: '{\n  "Effect": "Allow",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::example-bucket/curated/*"\n}',
      output:
        '対象prefixへのGetObjectを許可するポリシー文。バケット全体のListやKMS復号を含まない。',
      explanation:
        'これは最小限のポリシー文の例で、完全な認可構成ではありません。実際には明示的Deny、バケットポリシー、必要なKMS鍵の許可等も評価します。',
    },
    pitfalls: [
      '明示的Denyがあるとき、同じ操作のAllowを追加しても打ち消せません。',
      'LF-Tag、IAMリソースタグ、S3オブジェクトタグは同一の仕組みではありません。',
    ],
    checks: [
      {
        id: 'deny',
        prompt: 'S3読取にAllowがありますが、適用対象のSCPに明示的Denyがあります。結果は？',
        options: [
          {
            id: 'a',
            text: 'Allowを2つに増やせば許可される',
            correct: false,
            reason: 'ポリシーは多数決ではありません。',
          },
          {
            id: 'b',
            text: '明示的Denyが優先される',
            correct: true,
            reason: '対象のDenyを特定し、組織の意図と必要な操作を照合する必要があります。',
          },
          {
            id: 'c',
            text: 'バケットをParquet形式にすれば許可される',
            correct: false,
            reason: '形式の変更は認可評価と無関係です。',
          },
        ],
      },
    ],
    services: ['iam', 'lakeformation', 'kms', 'athena', 'redshift'],
    sources: [
      source('IAM評価ロジック', 'IAM/latest/UserGuide/reference_policies_evaluation-logic.html'),
      source('Lake Formationの権限', 'lake-formation/latest/dg/lf-permissions-reference.html'),
    ],
  },
  {
    id: 'encryption',
    domain: 4,
    tasks: ['4.3'],
    title: '暗号化・マスキング・クロスアカウント',
    summary: '保存中、通信中、利用時の保護を分けて学びます。',
    objectives: [
      'SSE-KMS・TLS・マスキングの目的を区別できる',
      'クロスアカウントのS3/KMS許可を説明できる',
    ],
    sections: [
      {
        title: 'どの場面で守るか',
        text: '保存時の暗号化はストレージ上のデータを保護し、TLSは通信中の経路を保護します。SSE-S3はS3が鍵を管理し、SSE-KMSはKMS keyによる管理・監査・アクセス制御を使います。KMSのエンベロープ暗号化では、データを暗号化するデータキーと、そのキーを保護するKMS keyを分けます。暗号化されたオブジェクトでも、読取と復号を許可された主体には平文が返ります。',
      },
      {
        title: 'クロスアカウントは両方の権限を確認',
        text: '別アカウントのSSE-KMSオブジェクトを読むには、S3側のアクセスに加えて利用可能なKMS keyへの復号権限が必要です。customer managed keyのkey policyで相手アカウント等へ許可し、相手側IAMにも必要な許可を設定します。AWS managed keyをそのまま他アカウントと共有する設計にしません。読取側にs3:GetObjectを付けるだけではKMSで拒否され得ます。',
      },
      {
        title: '見せる情報を減らす',
        text: 'マスキングは氏名の一部を伏せるなど、利用者へ出す情報を制限します。トークン化は識別子を別の値へ置換して対応を管理し、匿名化は再識別のリスクを考慮して個人との関連を減らします。単純なハッシュは値の推測や突合ができる場合があり、匿名化の保証ではありません。送信前の不要PII除去と、保存時の暗号化を組み合わせます。実際の保護要件はデータの分類と組織方針で定義します。',
      },
    ],
    example: {
      title: 'S3の許可はあるのに復号できない',
      input: 'アカウントBのroleが、A所有のcustomer managed KMS keyで暗号化されたCSVを読む。',
      output:
        'S3のバケット/主体の許可に加え、Aのkey policyとBのIAM側で必要なkms:Decrypt許可を確認する。',
      explanation:
        'データのアクセスと鍵の利用は別の認可です。分析結果の出力先にも暗号化と必要な書込権限を設計します。',
    },
    pitfalls: [
      'SSE-KMSを有効にしても正規利用者の画面にPIIが表示されることは防げません。',
      'Redshiftの古いクライアント側暗号化の手順を、現在のCOPY/UNLOADへ無条件に適用しません。',
    ],
    checks: [
      {
        id: 'mask',
        prompt:
          '分析者には注文額を見せ、メールアドレスは見せたくありません。SSE-KMSだけで十分ですか？',
        options: [
          {
            id: 'a',
            text: '十分。暗号化した列は正規利用者にも見えない',
            correct: false,
            reason: '正規の読取・復号権限がある利用者には平文が提供されます。',
          },
          {
            id: 'b',
            text: '不十分。列アクセス制御やマスキングも設計する',
            correct: true,
            reason: '利用時に何を見せるかの制御が必要です。保存時暗号化とは目的が違います。',
          },
          {
            id: 'c',
            text: 'TLSを無効にすればメールだけ消せる',
            correct: false,
            reason: '通信の暗号化と列の表示は無関係で、保護を弱めます。',
          },
        ],
      },
    ],
    services: ['kms', 's3', 'lakeformation', 'redshift'],
    sources: [
      source(
        'クロスアカウントKMS',
        'kms/latest/developerguide/key-policy-modifying-external-accounts.html',
      ),
      source('S3 SSE-KMS', 'AmazonS3/latest/userguide/UsingKMSEncryption.html'),
    ],
  },
  {
    id: 'audit',
    domain: 4,
    tasks: ['4.4', '3.3'],
    title: '監査ログを取得して調査できる状態にする',
    summary: '誰が何をしたか、設定がどう変わったか、アプリが何を処理したかを追います。',
    objectives: [
      'CloudTrail・CloudWatch Logs・Configを使い分けられる',
      '管理イベント・データイベントと保持を説明できる',
    ],
    sections: [
      {
        title: '問いに応じて記録を選ぶ',
        text: 'CloudTrailはAWS API操作の主体・時刻・対象等を追います。CloudWatch Logsはアプリやジョブのログを保存します。AWS Configは対応リソースの設定状態と変更履歴を記録します。「誰がバケット設定を変えたか」「変わった設定は何か」「処理がどこで失敗したか」では必要な記録が異なります。いずれもデータを取得する設定と保持期間を確認します。',
      },
      {
        title: '必要なデータイベントを有効にする',
        text: 'CloudTrailの管理イベントと、S3オブジェクトへのアクセスなどのデータイベントは別です。通常のイベント履歴だけで、すべてのGetObjectが記録されると思い込まないようにします。監査対象を定義し、Trailや対応するイベントデータストアで必要なイベントを選択します。記録量と費用も見積もります。CloudTrail Lakeはイベントを集約してSQLで調べる選択肢として試験ガイドに記載されています。',
      },
      {
        title: '取得・保存・検索・保護',
        text: '長期ログをS3へ集約してAthenaで検索する、CloudWatch Logs Insightsで実行時のエラーを探す、OpenSearchで継続的に検索するなど、量と利用方法で選びます。ログにもPIIやシークレットを出さないようにします。監査証跡の変更・削除を制限し、保持と必要な整合性検証を設定します。複数アカウントやリージョンでは記録漏れと保管先も確認します。',
      },
    ],
    example: {
      title: '機密ファイルを誰が読んだか',
      input: '調査対象はS3のGetObject。保存されているのはバケット作成等の管理イベントのみ。',
      output:
        '対象時点のデータイベント等の記録がなければ、管理イベントから読取主体を復元することはできない。',
      explanation:
        '必要な監査を事前に定義し、対象prefixの読取データイベントを収集して試験的な読取が記録されるか検証します。後から設定しても過去の未収集イベントは補えません。',
    },
    pitfalls: [
      'CloudTrailを使っているというだけでは全S3オブジェクトアクセスを監査できるとは限りません。',
      'アプリログを大量に残しても、認証情報を出力していれば別の問題を作ります。',
      'CloudTrail Lakeは2026年5月31日から新規顧客の受付を終了しています。試験ガイド上の知識と、新規構築で利用できるサービスを区別し、CloudWatch等の現行の選択肢を確認します。既存顧客は継続利用できます。',
    ],
    checks: [
      {
        id: 'events',
        prompt:
          'CloudTrailの管理イベントだけを記録しています。過去のS3 GetObjectを漏れなく調査できますか？',
        options: [
          {
            id: 'a',
            text: 'できる。管理イベントに全オブジェクト操作が含まれる',
            correct: false,
            reason: 'オブジェクト操作はデータイベントとして別に設定が必要です。',
          },
          {
            id: 'b',
            text: 'できるとは限らない。対象時点のデータイベント等の取得状況を確認する',
            correct: true,
            reason: '必要な記録が保存されているかが調査可能性を決めます。',
          },
          {
            id: 'c',
            text: '今から有効にすれば過去分も自動取得される',
            correct: false,
            reason: '未収集の過去イベントを遡って生成することはできません。',
          },
        ],
      },
    ],
    services: ['cloudtrail', 'cloudwatch', 's3', 'athena'],
    sources: [
      source(
        'CloudTrailデータイベント',
        'awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html',
      ),
      source('AWS Config', 'config/latest/developerguide/WhatIsConfig.html'),
      source(
        'CloudTrail Lakeの提供条件変更',
        'awscloudtrail/latest/userguide/cloudtrail-lake-service-availability-change.html',
      ),
    ],
  },
  {
    id: 'governance',
    domain: 4,
    tasks: ['4.1', '4.5'],
    title: 'データ共有・所有者・所在を管理する',
    summary: '発見から利用申請、権限の撤回、データ削除までをつなげます。',
    objectives: [
      'domain・domain unit・projectと購読承認を説明できる',
      'PII検出・権限制御・データ所在地の責任を分けられる',
    ],
    sections: [
      {
        title: '組織・チーム・資産の単位をそろえる',
        text: 'SageMaker Unified Studioのdomainは組織的な管理の枠組み、domain unitはその中の階層的な業務単位、projectは利用者が共同でデータや計算資源を扱う単位です。SageMaker Catalogへ所有者・説明・業務用語・来歴を持つ資産を公開し、利用者のprojectから購読を申請します。domainへの参加だけで組織の全データを読み書きできる設計ではありません。',
      },
      {
        title: '発見 → 申請 → 承認 → 付与 → 撤回',
        text: '検索で発見できるメタデータとデータ本文の権限を分け、所有者が目的に応じて利用を承認します。対応する管理対象では承認に伴いLake Formation等の権限が付与されますが、資産・接続方式によって付与手順は異なるため実際の読取を確認します。Redshiftのデータ共有はデータを複製せずproducerの対象をconsumerから利用する方式で、共有対象と利用側の権限を設計します。契約終了時には購読と実際の権限の撤回を検証します。',
      },
      {
        title: '検出・分類・保護・所在',
        text: 'MacieはS3の機密情報発見を支援しますが、検出しただけでマスキングや権限変更が完了するわけではありません。分類結果からLake Formation等の制御や隔離へつなげます。データ主権や組織の所在地要件では、元データだけでなくバックアップ・複製・ログのリージョンを確認します。SCP等によるリージョン制限は例外や対象サービスを検討し、既存コピーが自動削除されるとは考えません。',
      },
    ],
    example: {
      title: '分析projectへ売上を公開',
      input: '営業部が売上テーブルを所有。分析projectは個人情報を除いた列だけ必要。',
      output:
        '業務説明を公開 → 分析projectが申請 → 所有者承認 → 必要な列の読取を付与 → 実行roleで検証 → 利用終了時に撤回。',
      explanation:
        '利用目的、所有者、品質、権限、保持期間を資産に結びつけると、誰が何のために利用しているかを追えます。公開や承認を行っただけで権限が正しいと判断せず、許される操作と拒否すべき操作を両方確認します。',
    },
    pitfalls: [
      'Macieのfindingを受け取ることと、データの匿名化や隔離が完了することは別です。',
      'リージョン制限を後から設定しても、許可外の場所にある過去のコピーは自動では消えません。',
    ],
    checks: [
      {
        id: 'subscription',
        prompt: 'Catalogで資産を発見しました。読取が拒否されます。適切な対応は？',
        options: [
          {
            id: 'a',
            text: '資産が検索できるなら全権限があるはずなので公開バケットにする',
            correct: false,
            reason:
              'メタデータの発見とデータへの認可は別です。公開で迂回するとアクセス方針を破ります。',
          },
          {
            id: 'b',
            text: '購読の承認と実行主体へのデータアクセス権限を確認する',
            correct: true,
            reason: '資産の管理方式に応じ、承認・権限付与・実際のアクセスを確認します。',
          },
          {
            id: 'c',
            text: 'domain名を変更するとすべてのデータが読める',
            correct: false,
            reason: '名前はデータの認可を与えません。',
          },
        ],
      },
    ],
    services: ['lakeformation', 'macie', 'redshift', 'iam'],
    sources: [
      source('Unified Studioの概念', 'sagemaker-unified-studio/latest/userguide/concepts.html'),
      source(
        '購読とアクセス申請（IAM-based domain）',
        'sagemaker-unified-studio/latest/userguide/catalog-iam-request-access.html',
      ),
      source('Macie', 'macie/latest/user/what-is-macie.html'),
    ],
  },
];
