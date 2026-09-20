export interface AdvancedQuiz {
  id: string;
  title: string;
  scenario: string;
  serviceIds: string[];
  pattern?: string;
  multiple: boolean;
  options: { id: string; label: string; correct: boolean; reason: string }[];
  takeaway: string;
  sources: { title: string; url: string }[];
}

/** An answer is correct only when it contains every correct option and no other option. */
export function isAdvancedAnswerCorrect(quiz: AdvancedQuiz, selected: readonly string[]): boolean {
  const unique = new Set(selected);
  const expected = quiz.options.filter((option) => option.correct);
  return (
    unique.size === selected.length &&
    unique.size === expected.length &&
    expected.every((option) => unique.has(option.id))
  );
}

// Original exercises, ordered to match the 20 knowledge areas in the coverage audit.
// These are study scenarios, not reproductions of AWS exam questions.
export const advancedQuizzes: AdvancedQuiz[] = [
  {
    id: 'review-01',
    title: '分析期間を終えた倉庫データの行き先',
    scenario:
      '物流会社は直近90日の配達明細をRedshiftで頻繁に集計します。91日〜1年の明細はS3に移して、問い合わせ時に直近明細とSQLで突合したい。1年より古い明細は通常分析から外し、監査時の復元を待てます。実装する方針として適切なものをすべて選んでください。',
    serviceIds: ['redshift', 'spectrum', 's3', 'glacier'],
    pattern: 'warehouse',
    multiple: true,
    options: [
      {
        id: 'a',
        label: 'UNLOADで対象行をS3へ書き出し、件数・内容の検証後にRedshift側の対象行を削除する',
        correct: true,
        reason:
          'UNLOADは書き出しであり、元の行を自動削除しません。検証と削除を別工程にして、消失・重複を防ぐ境界を決めます。',
      },
      {
        id: 'b',
        label: '91日目の時点で全明細をGlacier Deep Archiveへ移し、そのままSpectrumで分析する',
        correct: false,
        reason:
          'Deep Archiveのオブジェクトは通常の即時読取対象ではありません。復元を待たずに分析する期間は、分析エンジンが直接読めるクラスに置きます。',
      },
      {
        id: 'c',
        label:
          'S3側に外部テーブルを定義してSpectrumで参照し、通常分析の対象を外れた時点でアーカイブへ移す',
        correct: true,
        reason:
          'S3の履歴とRedshiftの直近データを組み合わせられます。保管料だけでなく取出し料金、最低保存期間、復元待ちも含めて移行時期を決めます。',
      },
      {
        id: 'd',
        label: 'S3ライフサイクルのExpirationを設定すれば、RedshiftからS3へ書き出せる',
        correct: false,
        reason:
          'ExpirationはS3オブジェクトの期限切れ処理です。Redshiftの行を抽出したりS3へコピーしたりする処理ではありません。',
      },
    ],
    takeaway:
      '書き出す・検証する・元の行を削除する・外部テーブルで読む・分析終了後にアーカイブする、を別の工程として考える。',
    sources: [
      {
        title: 'Redshift UNLOAD',
        url: 'https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html',
      },
      {
        title: 'S3のアーカイブ復元',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects-retrieval-options.html',
      },
    ],
  },
  {
    id: 'review-02',
    title: '復元を待てる期間、待てない期間',
    scenario:
      '研究装置の出力は作成から45日間は毎日分析し、46日〜180日は月1回程度、復元待ちなしで読みます。その後7年目までは監査用に残し、必要時に48時間程度の復元待ちを許容します。バージョニング無効・Object Lockなしのバケットで、削除期限も管理します。要件に沿う設計は？',
    serviceIds: ['s3', 'glacier', 'athena'],
    multiple: false,
    options: [
      {
        id: 'a',
        label: '46日目にGlacier Flexible Retrievalへ移し、即時読取を保証する',
        correct: false,
        reason:
          'Flexible Retrievalは復元が必要です。Expeditedでも通常1〜5分で、即時読取の要件とは違います。Standardは通常3〜5時間、Bulkは通常5〜12時間です。',
      },
      {
        id: 'b',
        label:
          'StandardからStandard-IAへ、分析終了後はDeep Archiveへ移し、保持終了には別のExpirationを設定する',
        correct: true,
        reason:
          'Standard-IAは低頻度でもミリ秒アクセスができます。Deep ArchiveはStandardで通常12時間、Bulkで通常48時間の復元を考慮します。移行は保管クラス変更、Expirationは期限切れ処理です。',
      },
      {
        id: 'c',
        label: 'Deep Archiveに移すだけで、7年目にオブジェクトも自動削除される',
        correct: false,
        reason:
          'ストレージクラスのTransitionはExpirationの代わりになりません。保持期限の削除は別に設定します。バージョニングありなら非現行バージョンの扱いも追加設計が必要です。',
      },
      {
        id: 'd',
        label: '料金比較では保管GB単価だけを比べ、最低保存期間と取出し料金は無視する',
        correct: false,
        reason:
          'IAやアーカイブ系は取出し料金・最低保存期間などを含めて評価します。通常の復元所要時間は、すべてのケースでの厳密な完了保証ではありません。',
      },
    ],
    takeaway:
      '直接読める必要があるか、何時間待てるか、いつ削除するかを先に決める。TransitionとExpirationを混同しない。',
    sources: [
      {
        title: 'S3のアーカイブ復元方式と時間',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects-retrieval-options.html',
      },
      {
        title: 'S3 Expirationの動作',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html',
      },
      {
        title: 'S3ストレージクラス',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html',
      },
    ],
  },
  {
    id: 'review-03',
    title: 'SQL Serverのパスワードを更新し続ける',
    scenario:
      '夜間の集計アプリがRDS for SQL ServerへDBユーザー名とパスワードで接続しています。認証情報をコードから取り除き、DB側のパスワード変更と保存値の更新を定期的に行いたい。標準機能を中心に運用する選択は？',
    serviceIds: ['secrets', 'parameterstore', 'rds', 'iam'],
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'Parameter StoreのSecureStringへ保存するだけでDBパスワードも自動更新する',
        correct: false,
        reason:
          'SecureStringは暗号化された設定値の保存に使えますが、保存するだけでDB側を含むローテーションは実行されません。追加実装が必要です。',
      },
      {
        id: 'b',
        label: 'STSの一時アクセスキーをSQL ServerのDBパスワードとして渡す',
        correct: false,
        reason:
          'STSはAWS APIを呼ぶための一時的なAWS認証情報を発行します。SQL ServerのDBユーザーのパスワードを自動置換するものではありません。',
      },
      {
        id: 'c',
        label: 'Secrets Managerに保存し、SQL Serverに対応するローテーションを設定する',
        correct: true,
        reason:
          '対応するローテーション処理で、シークレットとDB側の認証情報を更新します。アプリには取得権限を与え、キャッシュ更新や接続再試行も設計します。',
      },
      {
        id: 'd',
        label: 'RDSのIAM DB認証をSQL Serverで有効化し、既存ユーザーをそのまま置換する',
        correct: false,
        reason:
          'RDSのIAM DB認証の対象はMariaDB・MySQL・PostgreSQLです。SQL Serverへ同じ仕組みをそのまま適用できるとは判断できません。',
      },
    ],
    takeaway: '秘密を暗号化して保管する機能と、接続先も含めて認証情報を更新する機能を分けて選ぶ。',
    sources: [
      {
        title: 'Secrets Managerのローテーション',
        url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html',
      },
      {
        title: 'RDSのIAM DB認証対象',
        url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html',
      },
      {
        title: 'Parameter Store',
        url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html',
      },
    ],
  },
  {
    id: 'review-04',
    title: '受信を止めたキューをどう守る？',
    scenario:
      '倉庫の帳票生成コンシューマーを3日間停止します。SQSには新規要求が入り続けます。メッセージ保持期間は1日です。停止前に行う判断として正しいものをすべて選んでください。',
    serviceIds: ['sqs', 'cloudwatch'],
    multiple: true,
    options: [
      {
        id: 'a',
        label: '停止時間と再開後の消化時間を含めて保持期間を延長し、期限前に処理できるか監視する',
        correct: true,
        reason:
          '保持期間を超えたメッセージは期限切れで削除されます。SQSの保持上限は14日なので、それを超える退避・再投入要件は別の保存先も設計します。',
      },
      {
        id: 'b',
        label: 'VisibilityTimeoutだけを長くすれば、未受信メッセージの保持期限を延長できる',
        correct: false,
        reason:
          '可視性タイムアウトは受信後の一時的な非表示期間です。保持期間とは別で、停止中の未受信データを長期保管する設定ではありません。',
      },
      {
        id: 'c',
        label: 'DLQを設定すれば、保持期限を過ぎた未受信メッセージはすべてDLQへ移る',
        correct: false,
        reason:
          'DLQへの移動はredrive policyのmaxReceiveCountに基づきます。保持期限切れそのものがDLQ移動の条件ではなく、DLQだけでは停止中の期限切れを防げません。',
      },
      {
        id: 'd',
        label: 'DelaySecondsは最初に受信できる時刻を遅らせる設定で、長期保存の代わりにならない',
        correct: true,
        reason:
          '配信遅延・可視性タイムアウト・保持期間はそれぞれ目的が異なります。遅延キューの最大遅延15分で、3日間の停止対策を置き換えることもできません。',
      },
    ],
    takeaway:
      '未受信でも保持期限は進む。DLQは処理できなかった受信済みメッセージの切り分けで、期限切れ救済箱ではない。',
    sources: [
      {
        title: 'SQSのDLQと保持期間',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html',
      },
      {
        title: 'SQS SetQueueAttributes',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SetQueueAttributes.html',
      },
      {
        title: 'SQSの遅延キュー',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-delay-queues.html',
      },
    ],
  },
  {
    id: 'review-05',
    title: '1つのプレフィックスだけ本文を読む',
    scenario:
      'Lambdaは既知のキーを使って、同一アカウントのS3バケット study-reports の approved/ 配下だけを読みます。オブジェクトはSSE-S3で暗号化され、一覧取得は不要です。実行ロールには現在 s3:* / Resource:* の許可があります。この過剰権限を解消する変更は？',
    serviceIds: ['iam', 'lambda', 's3'],
    multiple: false,
    options: [
      {
        id: 'a',
        label: '既存のワイルドカード許可を残し、GetObjectの狭いAllowを追加する',
        correct: false,
        reason:
          '許可ポリシーのAllowは組み合わせて評価されます。狭いAllowを追加しても既存の広いAllowは消えず、過剰権限は残ります。',
      },
      {
        id: 'b',
        label:
          '既存の広い許可を置換し、s3:GetObjectを arn:aws:s3:::study-reports/approved/* に限定する',
        correct: true,
        reason:
          '本文読取はGetObjectで、対象はバケット内のオブジェクトARNです。他のポリシーにも広い許可が残っていないか確認します。この条件ではListBucketは不要です。',
      },
      {
        id: 'c',
        label: 's3:GetObjectを arn:aws:s3:::study-reports だけに許可する',
        correct: false,
        reason:
          'このARNはバケット自体です。GetObjectの対象はバケットARNの後ろにキーを含むオブジェクトARNなので、本文読取のリソース指定として合いません。',
      },
      {
        id: 'd',
        label: 's3:GetObjectAttributesだけを許可して、本文の取得も行う',
        correct: false,
        reason:
          'GetObjectAttributesはサイズ・チェックサムなどの属性を取得するAPIです。オブジェクト本文をダウンロードするGetObjectの代替ではありません。',
      },
    ],
    takeaway:
      '操作・リソースARN・既存の許可全体をセットで確認する。SSE-KMSならKMS権限の確認も追加する。',
    sources: [
      {
        title: 'S3 GetObject',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html',
      },
      {
        title: 'S3 GetObjectAttributes',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObjectAttributes.html',
      },
      {
        title: 'IAMポリシー評価',
        url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html',
      },
    ],
  },
  {
    id: 'review-06',
    title: 'コピーせず、別の計算環境で月次分析する',
    scenario:
      '製造部門のRedshiftには承認済みの品質データがあります。監査チームは月末だけ、その最新データを自分たちの計算環境で読みたい。日次コピーの保守と重複保存を避けたい場合、対応構成・権限を確認したうえで選ぶ方法は？',
    serviceIds: ['redshift'],
    pattern: 'warehouse-sharing',
    multiple: false,
    options: [
      {
        id: 'a',
        label: '毎晩UNLOADとCOPYで監査用テーブルを複製する',
        correct: false,
        reason:
          '複製用の処理・保存容量が必要で、最後のコピー以降の変更は反映されません。コピーを避けて最新データを読む要件にはデータ共有を検討します。',
      },
      {
        id: 'b',
        label: '毎月スナップショットを別クラスタへ復元し、それをライブ共有と呼ぶ',
        correct: false,
        reason:
          '復元先はスナップショット時点の別環境です。継続更新される共有元をコピーせず参照する仕組みとは異なります。',
      },
      {
        id: 'c',
        label: '監査チームにも共有元クラスタの同じ計算容量で全クエリを実行させる',
        correct: false,
        reason:
          '同じクラスタの利用だけでは計算環境を分ける条件を満たしません。ワークロードを分離するには共有先のコンピュートを用意できます。',
      },
      {
        id: 'd',
        label: '共有元がdatashareを公開し、監査用Redshift Serverlessを共有先にする',
        correct: true,
        reason:
          'データ共有なら対象データをコピーせず参照し、共有先の計算資源で分析できます。Serverlessは断続的な分析に適しますが、利用量・ストレージなどの料金は別に評価します。',
      },
    ],
    takeaway:
      '共有元はデータを提供し、共有先は自分のコンピュートでクエリする。データ共有とスナップショット複製を区別する。',
    sources: [
      {
        title: 'Redshiftのデータ共有',
        url: 'https://docs.aws.amazon.com/redshift/latest/dg/datashare-overview.html',
      },
      {
        title: 'Redshift Serverless',
        url: 'https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-whatis.html',
      },
    ],
  },
  {
    id: 'review-07',
    title: 'Glueジョブに、どの主体の権限を与える？',
    scenario:
      '売上CSVを読むGlueジョブを作成しました。開発者はS3を読めますが、ジョブはAccessDeniedになります。ジョブはLambdaから起動しています。固定アクセスキーを配布せず、処理中のS3アクセスを正しく許可する方法は？',
    serviceIds: ['glue', 'iam', 's3', 'lambda'],
    pattern: 'batch',
    multiple: false,
    options: [
      {
        id: 'a',
        label:
          'Glueが引き受けるサービスロールに対象S3の必要権限を付け、ジョブの実行ロールに指定する',
        correct: true,
        reason:
          'Glueジョブは指定したIAMロールの権限でS3などへアクセスします。信頼ポリシーでGlueの引受けを許可し、入力読取・出力書込などを対象範囲へ限定します。',
      },
      {
        id: 'b',
        label: '開発者のIAMユーザーへAdministratorAccessを付ける',
        correct: false,
        reason:
          '開発者とGlueの実行主体は別です。人の権限を増やしても、ジョブが使うロールのS3権限不足は解決しません。',
      },
      {
        id: 'c',
        label: '起動元LambdaのロールだけにS3アクセスを許可する',
        correct: false,
        reason:
          'Glueジョブの起動権限と、起動後のGlueによるデータアクセス権限は別です。起動元のS3権限がGlueへ自動継承されるわけではありません。',
      },
      {
        id: 'd',
        label: 'IAMユーザーの長期アクセスキーをETLスクリプト内に埋め込む',
        correct: false,
        reason:
          'ロールによる一時認証情報を使えるため、長期キーをコードへ埋め込む必要はありません。キーの流出・更新管理も増やします。',
      },
    ],
    takeaway:
      '「ジョブを開始できる主体」と「ジョブとしてS3を読む主体」を分けて、後者のサービスロールを設定する。',
    sources: [
      {
        title: 'Glue用IAMロールの作成',
        url: 'https://docs.aws.amazon.com/glue/latest/dg/create-an-iam-role.html',
      },
    ],
  },
  {
    id: 'review-08',
    title: '暗号化したS3ファイルをCOPYする',
    scenario:
      '社内データをカスタマーマネージドKMSキーによるSSE-KMSでS3に保存しました。RedshiftのCOPYに指定したIAMロールはS3読取を許可されていますが、KMS復号で拒否されます。適切な対応は？',
    serviceIds: ['redshift', 's3', 'kms', 'iam'],
    pattern: 'warehouse',
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'S3を読めるならKMSも自動的に使えるので、再試行回数だけ増やす',
        correct: false,
        reason:
          'S3オブジェクトへの権限とKMSキーの利用権限は別です。権限不足のまま再試行しても解決しません。',
      },
      {
        id: 'b',
        label: 'SSE-Cへ変更し、COPYへ任意の復号ヘッダーを渡す',
        correct: false,
        reason:
          'Redshift COPYはSSE-C暗号化ファイルのロードをサポートしません。SSE-KMSの必要権限を整えるのがこの条件に合います。',
      },
      {
        id: 'c',
        label: 'COPY用ロールのkms:Decryptと、キーのキーポリシーによる利用許可を確認する',
        correct: true,
        reason:
          'SSE-KMSはS3とKMS双方の認可が必要です。COPYの権限主体に復号を許可し、キーポリシーも整えれば、平文として別のS3ファイルを保存する必要はありません。',
      },
      {
        id: 'd',
        label: 'クライアント側暗号化へ変更すれば、KMSの認可設計は常に不要になる',
        correct: false,
        reason:
          '暗号方式の変更はこの権限不足の解決ではありません。COPYのクライアント側暗号化サポートは2026年4月30日で終了しており、古い資料の手順を流用しません。',
      },
    ],
    takeaway:
      'SSE-KMSのCOPYは、S3を読む権限に加えてKMSキーを使う権限が必要。対応する暗号方式と資料の日付も確認する。',
    sources: [
      {
        title: 'COPYとクライアント側暗号化のサポート終了告知',
        url: 'https://docs.aws.amazon.com/redshift/latest/dg/r_COPY.html',
      },
      {
        title: 'Redshiftへの暗号化ファイルのロード（旧方式の記載に注意）',
        url: 'https://docs.aws.amazon.com/redshift/latest/dg/c_loading-encrypted-files.html',
      },
      {
        title: 'S3のSSE-KMS',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html',
      },
    ],
  },
  {
    id: 'review-09',
    title: '同じ表を、部署ごとの見え方で共有する',
    scenario:
      'Athenaから顧客対応データを検索します。チームAには担当地域の行だけを見せ、氏名列は隠したい。Lake Formationと統合したクエリエンジンで使う前提で、適切な設計は？',
    serviceIds: ['lakeformation', 'catalog', 'athena', 'iam'],
    pattern: 'serverless-lake',
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'Glue Data Catalogへテーブル定義を登録すれば、自動的に行と列が制限される',
        correct: false,
        reason:
          'Catalogは場所やスキーマを管理します。定義が存在するだけでは、利用者ごとの行条件や列の許可は作成されません。',
      },
      {
        id: 'b',
        label: 'Lake Formationのデータフィルターに行条件と列指定を設定し、対象にSELECTを付与する',
        correct: true,
        reason:
          '行フィルターと列フィルターの組合せでセルレベルのアクセス制御を表現できます。対象エンジンの対応範囲を確認し、S3直接読取などの迂回権限も見直します。',
      },
      {
        id: 'c',
        label: 'IAMでS3オブジェクト全体をGetObject可能にすれば、CSV内の氏名列も自動的に隠れる',
        correct: false,
        reason:
          'S3オブジェクトへのアクセス許可は、オブジェクト内部の行・列をSQLの条件で選別する権限ではありません。',
      },
      {
        id: 'd',
        label: 'Macieの検出ジョブを実行するだけで、Athenaの全クエリに列マスキングが適用される',
        correct: false,
        reason:
          'Macieは機密データの発見に使います。クエリ時のデータフィルターを自動設定するサービスではありません。',
      },
    ],
    takeaway:
      'Catalogはメタデータ、Lake Formationのデータフィルターは参照範囲。行と列を組み合わせるとセルレベルになる。',
    sources: [
      {
        title: 'Lake Formationのデータフィルター',
        url: 'https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html',
      },
    ],
  },
  {
    id: 'review-10',
    title: '機密データを発見してから処理を起動する',
    scenario:
      '既存のLambdaは、指定されたS3オブジェクトのコピーを匿名化できます。今後はMacieが機密データを検出した対象だけに、その処理を実行したい。検出結果を起点にする連携は？',
    serviceIds: ['macie', 'eventbridge', 'lambda', 's3'],
    pattern: 'pii-remediation',
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'S3のObjectCreated通知だけをLambdaへ渡し、Macieの検出結果と同じ意味で扱う',
        correct: false,
        reason:
          'アップロード通知は到着を示すだけです。そのファイルで機密データを検出したかどうかは分からず、検出を起点にする条件と一致しません。',
      },
      {
        id: 'b',
        label: 'Macieを有効にすれば、S3オブジェクトが直接匿名化される',
        correct: false,
        reason:
          'Macieは検出結果を生成します。データの書換えや匿名化は、既存Lambdaなどの処理が別に担当します。',
      },
      {
        id: 'c',
        label: 'Glue Crawlerの成功通知を、機密データ検出の代わりに使う',
        correct: false,
        reason:
          'Crawlerの成功はスキーマ検出などの実行結果です。Macieによる機密情報検出とは別のイベントです。',
      },
      {
        id: 'd',
        label: 'デフォルトイベントバスのMacie findingをEventBridgeルールで選別してLambdaへ送る',
        correct: true,
        reason:
          'findingの種別などをイベントパターンで絞れます。対象オブジェクトを特定し、権限・重複実行・失敗時の扱いを設計したLambdaに匿名化を任せます。',
      },
    ],
    takeaway:
      'Macieは発見、EventBridgeは検出結果の振り分け、Lambdaは対処。到着通知と検出通知は別の起点。',
    sources: [
      {
        title: 'Macie findingをEventBridgeで処理する',
        url: 'https://docs.aws.amazon.com/macie/latest/user/findings-monitor-events-eventbridge.html',
      },
    ],
  },
  {
    id: 'review-11',
    title: '写真そのものではなく、探すための情報を索引へ',
    scenario:
      '建物点検アプリには、S3に保管した大量の現場写真があります。撮影日・施設名で絞り込み、担当者の所見を全文検索して関連度順に返したい。写真本体はS3に置いたままにする場合、適する構成は？',
    serviceIds: ['opensearch', 's3', 'athena', 'redshift'],
    multiple: false,
    options: [
      {
        id: 'a',
        label: '所見・メタデータ・S3参照をOpenSearchへインデックス化する',
        correct: true,
        reason:
          '検索対象のテキストと構造化属性を索引に持たせ、関連度・フィルターで探せます。写真本体へのアクセス認可は別に行い、索引へ無条件の公開URLを入れる必要はありません。',
      },
      {
        id: 'b',
        label: 'S3のListObjectsだけで写真内容と所見の全文検索を実装する',
        correct: false,
        reason:
          'オブジェクト一覧はキーなどの一覧取得で、所見の全文検索や関連度の順位付けをする検索エンジンではありません。',
      },
      {
        id: 'c',
        label: '各検索ごとにAthenaで全ファイルを集計し、全文検索の索引を不要にする',
        correct: false,
        reason:
          'AthenaはS3上のSQL分析に適しますが、この要件は対話的な全文検索・関連度が中心です。検索用に索引を持つOpenSearchが合います。',
      },
      {
        id: 'd',
        label: 'Data Catalogへ写真のテーブル定義を追加するだけで関連度順検索を提供する',
        correct: false,
        reason:
          'メタデータ定義と検索インデックスは別です。Catalogの登録だけで本文検索の実行・順位付けは行われません。',
      },
    ],
    takeaway:
      '保存する本体と、検索に必要なテキスト・属性・参照を分離する。全文検索・関連度の要件にはOpenSearchを検討する。',
    sources: [
      {
        title: 'OpenSearch検索アプリの構成',
        url: 'https://docs.aws.amazon.com/opensearch-service/latest/developerguide/search-example.html',
      },
    ],
  },
  {
    id: 'review-12',
    title: '受信、削除、再表示の境界',
    scenario:
      'SQSの標準キューで帳票作成ワーカーを試験しています。担当者は「受信した瞬間にメッセージが消える」と考えています。受信後の状態や操作について正しい説明をすべて選んでください。',
    serviceIds: ['sqs', 'lambda'],
    multiple: true,
    options: [
      {
        id: 'a',
        label: 'ReceiveMessageが成功すれば、そのメッセージはキューから恒久的に削除される',
        correct: false,
        reason:
          '受信だけでは削除されません。通常は可視性タイムアウト中に処理し、成功したら最新の受信ハンドルでDeleteMessageを呼びます。',
      },
      {
        id: 'b',
        label: '削除せず可視性タイムアウトを過ぎると、再び受信対象になる',
        correct: true,
        reason:
          '失敗したワーカーが削除しなかったメッセージを再処理できます。標準キューでは重複配信も考慮し、処理を冪等にします。',
      },
      {
        id: 'c',
        label:
          'DLQを設定すると、maxReceiveCountに基づいて繰り返し処理できないメッセージを分離できる',
        correct: true,
        reason:
          '受信回数を用いるredrive policyの動作です。保持期間の期限切れとは別の条件であり、DLQ内にも保持期間があります。',
      },
      {
        id: 'd',
        label: 'PurgeQueueは成功した1件だけを安全に削除するためのAPIである',
        correct: false,
        reason:
          'PurgeQueueはキュー内のメッセージを一括削除し、処理中のものも対象です。削除には最大60秒かかり、その間に送信したメッセージも影響を受け得ます。1件の成功通知にはDeleteMessageを使います。',
      },
      {
        id: 'e',
        label: 'DeleteMessageは、処理成功後にその受信のメッセージを削除するために使う',
        correct: true,
        reason:
          'ReceiptHandleを使って明示的に削除します。可視性タイムアウトの調整は削除の代替ではなく、処理中に他の受信者から一時的に隠す操作です。',
      },
    ],
    takeaway:
      '受信 → 一時的に非表示 → 成功なら削除。未削除なら再表示やDLQ移動の対象となり、保持期限切れやパージは別の削除経路。',
    sources: [
      {
        title: 'SQSの可視性タイムアウト',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html',
      },
      {
        title: 'SQS PurgeQueue',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_PurgeQueue.html',
      },
      {
        title: 'SQS DLQ',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html',
      },
    ],
  },
  {
    id: 'review-13',
    title: 'Pod内だけで使う小さな作業ファイル',
    scenario:
      'EKSの画像処理Podが数百MBの中間ファイルを頻繁に読み書きします。Pod間共有もPod削除後の復元も不要です。ノードのメモリには余裕があり、ネットワーク往復を避けて処理したい。適切な保存先は？',
    serviceIds: ['eks', 'efs'],
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'NFS共有を新設して、すべての一時ファイルをネットワーク経由で読む',
        correct: false,
        reason:
          'NFS共有は複数環境から使うファイルには有効ですが、この要件には共有が不要で、ネットワークI/Oも増えます。',
      },
      {
        id: 'b',
        label: 'DynamoDB DAXへPOSIXファイルとして保存する',
        correct: false,
        reason:
          'DAXはDynamoDB読取のキャッシュです。PodのPOSIXファイル作業領域を提供するものではありません。',
      },
      {
        id: 'c',
        label: 'emptyDirのmediumをMemoryにして、メモリ消費と容量上限を管理する',
        correct: true,
        reason:
          'RAMを使うtmpfsの一時ボリュームです。書込データはメモリ使用量に計上されるのでsizeLimitやPodのリソース設定を考慮します。Podが削除されるとデータも失われます。',
      },
      {
        id: 'd',
        label: 'MemoryDBを導入すれば、コード変更なしでローカルファイルと同じ操作になる',
        correct: false,
        reason:
          'MemoryDBはネットワーク越しに利用するデータベースです。ファイルシステムAPIをそのまま置き換えるものではなく、この一時領域の要件には不要です。',
      },
    ],
    takeaway:
      '一時・Podローカル・共有不要ならメモリ上のemptyDirが候補。Pod削除で消えることと、メモリ上限を理解して選ぶ。',
    sources: [
      {
        title: 'Kubernetes emptyDirボリューム',
        url: 'https://kubernetes.io/docs/concepts/storage/volumes/#emptydir',
      },
    ],
  },
  {
    id: 'review-14',
    title: '複数のLambdaが同じNFSファイルを使う',
    scenario:
      '既存のデータ変換ライブラリはNFSファイルシステム上の共有辞書を利用します。複数のLambda実行環境から同じファイルを読み書きし、関数の実行終了後も維持したい。選ぶ構成は？',
    serviceIds: ['efs', 'lambda', 's3'],
    pattern: 'shared-files',
    multiple: false,
    options: [
      {
        id: 'a',
        label: '各Lambdaの/tmpにコピーして、全実行環境で自動的に同じ内容を共有する',
        correct: false,
        reason:
          '/tmpは各実行環境のローカル一時領域です。複数の同時実行環境にまたがる共有NFSファイルシステムにはなりません。',
      },
      {
        id: 'b',
        label: 'EFSアクセスポイントを使ってLambdaにマウントし、VPC接続・NFS通信・権限を設定する',
        correct: true,
        reason:
          'EFSは共有ファイルストレージです。Lambdaからアクセスポイント経由で利用し、マウントターゲットやセキュリティグループ、POSIX権限などを整えます。同時書込の競合はアプリ側も設計します。',
      },
      {
        id: 'c',
        label: 'EBSボリュームをLambdaへ直接アタッチする',
        correct: false,
        reason:
          'EBSをLambda実行環境へ直接アタッチして共有NFSとして使う構成はありません。EFSのファイルシステム連携を選びます。',
      },
      {
        id: 'd',
        label: 'S3へのGetObjectとPutObjectだけで既存のNFSライブラリが無変更で動くとみなす',
        correct: false,
        reason:
          'オブジェクトAPIと既存ライブラリのNFS操作は同じものではありません。ファイル向けの連携機能も存在するため個別評価はできますが、指定された共有NFS要件にはEFSが直接対応します。',
      },
    ],
    takeaway:
      '実行環境ローカルの/tmpと、複数環境がマウントする永続共有ファイルを分ける。EFSは接続・認可・ファイル権限まで設計する。',
    sources: [
      {
        title: 'Lambdaのファイルシステム設定',
        url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-filesystem.html',
      },
      { title: 'Amazon EFSとは', url: 'https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html' },
    ],
  },
  {
    id: 'review-15',
    title: 'サーバーのcronを定期API収集へ置き換える',
    scenario:
      '毎朝6時（日本時間）に公開APIを呼び、JSONをS3へ保存するPython処理があります。1回2分以内で終了し、専用サーバーのパッチ適用をなくしたい。起動時刻、失敗時の再試行も管理する構成は？',
    serviceIds: ['scheduler', 'lambda', 's3'],
    pattern: 'scheduled-ingestion',
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'EventBridge Schedulerのタイムゾーン付きcronからLambdaを起動する',
        correct: true,
        reason:
          'Schedulerは時刻起動、LambdaはPython処理、S3は結果保存を担当します。呼出し用ロール・LambdaのS3権限・再試行を設定し、重複実行でも同じ期間の結果が壊れないようにします。',
      },
      {
        id: 'b',
        label: 'CloudShellのタブを開き、常駐cronとして毎朝の実行を任せる',
        correct: false,
        reason:
          'CloudShellは対話的なシェル環境です。セッションを維持する運用を定時実行の基盤として扱うより、Schedulerで時刻と実行を管理します。',
      },
      {
        id: 'c',
        label: 'S3へのObjectCreatedイベントだけで、ファイルがまだない日のAPI収集を開始する',
        correct: false,
        reason:
          'ファイル到着イベントは定刻の起動ではありません。まだ取得していないデータを毎朝集めるには、時刻を起点にする仕組みが必要です。',
      },
      {
        id: 'd',
        label: '専用EC2を常時起動してcronを移し、サーバー管理がなくなったとする',
        correct: false,
        reason:
          '実装は可能ですが、EC2のOS更新などの運用は残ります。この短い定期処理ではサーバーレス構成が運用削減の条件に合います。',
      },
    ],
    takeaway:
      '時刻で始めるのはScheduler、処理を動かすのはLambda。イベントバスの振り分けや長いワークフローの状態管理とは役割が違う。',
    sources: [
      {
        title: 'EventBridge Scheduler',
        url: 'https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html',
      },
      {
        title: 'Schedulerのスケジュール形式',
        url: 'https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html',
      },
    ],
  },
  {
    id: 'review-16',
    title: 'Glueを増強する前に、待っている原因を調べる',
    scenario:
      '現在のGlue Sparkジョブの実行時間が日によって変動します。ワーカーを倍にする案が出ていますが、入力件数も偏りも変わります。費用と実行時間の両方を改善するために取るべき方針は？',
    serviceIds: ['glue', 'glue-etl', 'cloudwatch'],
    pattern: 'batch',
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'エラー行がログにないなら、DPUを増やせば必ず比例して速くなると判断する',
        correct: false,
        reason:
          '成功したジョブでもI/O待ち、データの偏り、並列度不足があり得ます。DPUの増加だけで比例した短縮になるとは限りません。',
      },
      {
        id: 'b',
        label: 'Glue 0.9/1.0のDPUとexecutor数の公式例を、現行の全ワーカータイプにそのまま適用する',
        correct: false,
        reason:
          '旧容量計画ページには適用対象が0.9/1.0と明記されています。現行のワーカー、Glueバージョン、Auto Scalingで条件が変わるため、同じ式を一般化しません。',
      },
      {
        id: 'c',
        label:
          '実行履歴とジョブメトリクスで利用率・偏り・メモリ・I/Oを調べ、比較可能な入力で容量や処理を調整する',
        correct: true,
        reason:
          'CloudWatchやGlueの観測機能でボトルネックを特定し、ワーカー数・タイプ・パーティションなどを評価します。所要時間と消費資源・費用を比較し、改善が頭打ちなら増強を止めます。',
      },
      {
        id: 'd',
        label: 'CloudTrailのAPI操作履歴だけからSparkの各ステージのCPU利用率を計算する',
        correct: false,
        reason:
          'CloudTrailはAPI操作の監査です。Sparkの処理負荷を分析するジョブメトリクスやプロファイリング情報の代替にはなりません。',
      },
    ],
    takeaway:
      'ログは失敗原因、ジョブメトリクスは負荷と容量判断に使う。入力条件・実行履歴・Glueの世代を揃えて比較する。',
    sources: [
      {
        title: 'Glue Observabilityメトリクス',
        url: 'https://docs.aws.amazon.com/glue/latest/dg/monitor-observability.html',
      },
      {
        title: '旧Glue版のDPU容量計画と適用範囲',
        url: 'https://docs.aws.amazon.com/glue/latest/dg/monitor-debug-capacity.html',
      },
    ],
  },
  {
    id: 'review-17',
    title: '構造が増えていくJSONをRedshiftで分析する',
    scenario:
      '製品テレメトリのJSONには、機種ごとに異なる属性と入れ子の測定値配列があります。Redshiftでリレーショナルな製品表と結合し、ネスト構造を維持したまま属性や配列要素を探索したい。適する組合せは？',
    serviceIds: ['redshift'],
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'すべてのJSONをVARCHARへ保存し、毎回文字列の位置だけで属性を切り出す',
        correct: false,
        reason:
          '文字列保存でも個別処理はできますが、ネスト構造をネイティブに扱いたい条件にはSUPER型が合います。文字位置に依存した抽出は構造変更に弱くなります。',
      },
      {
        id: 'b',
        label: 'JSONをSUPER型へ取り込み、PartiQLで属性や配列を参照する',
        correct: true,
        reason:
          'SUPERは半構造化データを保持でき、PartiQLでネストした属性や配列を扱えます。JSON_PARSEなどで取り込み、通常の列との分析も組み合わせられます。',
      },
      {
        id: 'c',
        label: 'RedshiftではJSONを扱えないため、分析要件に関係なくDynamoDBへ移す',
        correct: false,
        reason:
          'RedshiftにはSUPERとPartiQLがあります。DynamoDBにもPartiQLはありますが、同じ言語名を理由にDWHの結合分析を移す必要はありません。',
      },
      {
        id: 'd',
        label: 'Glue Data CatalogへJSONの場所を登録するだけで、Redshift内の列がSUPER型になる',
        correct: false,
        reason:
          '外部メタデータの登録と、Redshiftテーブルへの型指定・データ取込みは別です。Catalog登録だけで内部テーブルの型は変わりません。',
      },
    ],
    takeaway:
      'Redshiftの半構造化データは「保存の型＝SUPER、ネストを読む言語＝PartiQL」と対応づける。',
    sources: [
      {
        title: 'Redshiftの半構造化データ',
        url: 'https://docs.aws.amazon.com/redshift/latest/dg/super-overview.html',
      },
    ],
  },
  {
    id: 'review-18',
    title: 'IteratorAgeが伸びたとき、何を増やす？',
    scenario:
      'Kinesisを読むLambdaでIteratorAgeが上昇しました。チームは一律の増強ではなく、原因別の対応表を作ります。記載する方針として適切なものをすべて選んでください。各選択肢は独立した状況です。',
    serviceIds: ['kinesis', 'lambda', 'cloudwatch'],
    pattern: 'streaming',
    multiple: true,
    options: [
      {
        id: 'a',
        label: '異なるキーの処理を並列化できるなら、ParallelizationFactorとシャード構成を評価する',
        correct: true,
        reason:
          '並列化係数は1シャードの同時バッチ数を増やします。キー単位の順序は維持されるため、単一のホットキーの直列処理が自由に分割されるわけではありません。シャード増加でもキー分散を確認します。',
      },
      {
        id: 'b',
        label: '他コンシューマーとの読取帯域競合が原因なら、拡張ファンアウトを評価する',
        correct: true,
        reason:
          '拡張ファンアウトは専用の読取スループットを使います。共有読取の競合には有効ですが、関数内部の遅い処理や同時実行数の不足を直接解消するものではありません。',
      },
      {
        id: 'c',
        label: 'Lambdaのスロットリングが原因でも、予約済み同時実行数やクォータは無関係とする',
        correct: false,
        reason:
          '関数が必要な同時バッチ数に対応できなければ、クォータや予約済み同時実行数が制約になることがあります。Throttle指標も確認します。',
      },
      {
        id: 'd',
        label:
          'Lambdaの同時実行不足が確認できたら、必要な同時実行数を確保できる設定・クォータを確認する',
        correct: true,
        reason:
          'スロットリングがボトルネックなら同時実行の制約の見直しが候補です。単に上限を増やしても、共有読取帯域や重い処理が原因なら別の対策が必要です。',
      },
      {
        id: 'e',
        label: '保持期間だけを延ばすと、読取と処理のスループットが自動的に増える',
        correct: false,
        reason:
          '保持期間の延長は再読できる時間を増やすためです。消費速度を増やす設定ではなく、根本の遅延原因を解決しません。',
      },
    ],
    takeaway:
      'IteratorAgeから調査を始め、キー分散・シャード、同時バッチ、読取帯域、Lambdaの実行枠、処理時間を分けて診断する。',
    sources: [
      {
        title: 'LambdaによるKinesis処理と並列化',
        url: 'https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html',
      },
    ],
  },
  {
    id: 'review-19',
    title: 'テキストログからParquetまでの役割分担',
    scenario:
      '機器が送る区切りテキストのログを、数分単位でS3へまとめて配信します。Athena分析用にParquetへ変換したい。独自の長時間稼働コンシューマーは作らず、配信をマネージド化する構成は？',
    serviceIds: ['firehose', 'lambda', 'catalog', 's3', 'athena'],
    pattern: 'firehose-conversion',
    multiple: false,
    options: [
      {
        id: 'a',
        label:
          'LambdaでJSONへ整形し、Glue Data Catalogのスキーマを使うFirehoseの形式変換でParquetを生成する',
        correct: true,
        reason:
          '非JSON入力は必要に応じてLambdaでJSON化します。その後、Firehoseのネイティブな形式変換がParquet/ORC化し、S3へ配信します。スキーマと入力構造を一致させます。',
      },
      {
        id: 'b',
        label: 'Kinesis Data Streamsに送るだけで自動的にParquetとなりS3へ保存される',
        correct: false,
        reason:
          'Data Streamsは保持・消費の基盤です。S3への配信やParquet化を単独で自動完了するわけではなく、追加処理や配信連携が必要です。',
      },
      {
        id: 'c',
        label: 'Glue Crawlerへテキストを渡せば、検出時に元ファイルもParquetへ書き換えられる',
        correct: false,
        reason:
          'Crawlerはスキーマなどを検出してCatalogへ登録します。元データをParquetへ書き換えるETL処理ではありません。',
      },
      {
        id: 'd',
        label: 'Firehoseの形式変換を有効にする場合も、Lambdaが必ずParquetバイナリを返す',
        correct: false,
        reason:
          'ネイティブ形式変換の入力はJSONです。LambdaでJSONへ整形する役割と、Firehoseが列指向形式へ変換する役割を混同しません。',
      },
    ],
    takeaway:
      '必要ならLambdaでJSON化 → Catalogのスキーマ → FirehoseでParquet/ORC化 → S3配信。検出・変換・配信の役割を分ける。',
    sources: [
      {
        title: 'Firehoseの入力形式変換',
        url: 'https://docs.aws.amazon.com/firehose/latest/dev/record-format-conversion.html',
      },
    ],
  },
  {
    id: 'review-20',
    title: '対応SaaSから分析基盤へ定期取り込み',
    scenario:
      '営業チームが利用するSaaSのデータを、毎日Redshiftへ取り込みたい。利用中のSaaS・リージョン・認証方式はAppFlowの対応条件を満たしています。APIページングや接続コードの自作を減らす選択は？',
    serviceIds: ['appflow', 'redshift', 's3'],
    pattern: 'saas-warehouse',
    multiple: false,
    options: [
      {
        id: 'a',
        label: 'DMSへSaaSの画面URLを登録し、任意のSaaS APIを自動複製する',
        correct: false,
        reason:
          'DMSは対応データベースなどの移行・レプリケーション用です。任意のSaaS画面URLをコネクタにするサービスではありません。',
      },
      {
        id: 'b',
        label: 'Glue CrawlerだけでSaaSへの認証・抽出・Redshiftロードを完了する',
        correct: false,
        reason:
          'Crawlerはデータのスキーマ検出などを担当します。SaaSからRedshiftへのデータ連携そのものを定義するフローではありません。',
      },
      {
        id: 'c',
        label: 'AppFlowの接続・フィールド対応・実行スケジュールとRedshiftの宛先設定を行う',
        correct: true,
        reason:
          '対応コネクタでマネージドな転送を構成できます。Redshift宛先では中間S3バケットなどの前提も設定します。イベント起動や増分取得の可否はソースごとに確認します。',
      },
      {
        id: 'd',
        label:
          'AppFlowなら未対応SaaSも設定不要で使え、すべてのソースで同じイベント起動が保証される',
        correct: false,
        reason:
          'コネクタ・取得方式・トリガーには対応条件があります。標準コネクタがない場合はカスタム連携などの追加設計が必要で、すべて同一の機能とは限りません。',
      },
    ],
    takeaway:
      'SaaS連携はまずコネクタの対応条件を確認する。AppFlowは接続・変換・転送の自作を減らせるが、宛先やトリガーの前提は設定する。',
    sources: [
      {
        title: 'AppFlowのRedshiftコネクタ',
        url: 'https://docs.aws.amazon.com/appflow/latest/userguide/redshift.html',
      },
      {
        title: 'AppFlowのフロートリガー',
        url: 'https://docs.aws.amazon.com/appflow/latest/userguide/flow-triggers.html',
      },
    ],
  },
];
