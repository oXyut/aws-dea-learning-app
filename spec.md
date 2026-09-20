AWS Certified Data Engineer - Associate（DEA-C01）の学習用Webアプリを作成してください。

## 背景

私はAWS Certified Cloud Practitioner（CLF）には合格済みで、AWSの基本的な概念や主要サービスについてはある程度理解しています。

一方で、AWSのすべてのサービスを網羅的に理解しているわけではなく、特にData Engineer - Associateで問われる、

- データの収集
- データの保存
- ETL / ELT
- データ変換
- データ分析
- ストリーミング処理
- データウェアハウス
- データレイク
- オーケストレーション
- データ品質
- セキュリティ
- モニタリング

などについて、サービス同士の役割や使い分けを体系的に学習したいです。

単純な問題集ではなく、

**「AWS上でデータ基盤を構築するとき、どのサービスを、なぜ、どのようにつなげるのか」**

を視覚的に理解できる教材を作ることが目的です。

---

# 作成するもの

ローカル環境で起動してブラウザから閲覧できる、AWS DEA-C01学習用Webアプリを作成してください。

単なるAWSサービス一覧ではなく、

**サービス単体の理解 → サービス比較 → データフロー → 実務アーキテクチャ → 試験問題での判断**

という流れで理解できるサイトにしてください。

---

# 1. サービス解説

DEA-C01で重要なAWSサービスを中心に解説してください。

最低限、以下を扱ってください。

### Storage / Data Lake

- Amazon S3
- S3 Glacier
- AWS Lake Formation

### ETL / Data Integration

- AWS Glue
- Glue Data Catalog
- Glue Crawler
- Glue ETL
- Glue Data Quality
- AWS Database Migration Service（DMS）
- AWS DataSync

### Query / Analytics

- Amazon Athena
- Amazon Redshift
- Redshift Spectrum
- Amazon EMR
- Amazon OpenSearch Service

### Streaming / Messaging

- Amazon Kinesis Data Streams
- Amazon Kinesis Data Firehose
- Amazon MSK
- Amazon SQS
- Amazon SNS
- Amazon EventBridge

### Database

- Amazon RDS
- Amazon Aurora
- Amazon DynamoDB

### Orchestration / Processing

- AWS Lambda
- AWS Step Functions
- Amazon MWAA

### Monitoring / Security

- Amazon CloudWatch
- AWS CloudTrail
- AWS IAM
- AWS KMS
- AWS Secrets Manager
- AWS Macie

必要に応じてDEA-C01で重要なサービスを追加してください。

---

# 2. 各サービスで説明する内容

サービスごとに、単なる定義ではなく以下を整理してください。

### What

そのサービスが何なのか。

### Can

何ができるのか。

### Cannot / Not suitable

何ができないのか、何には向いていないのか。

これは特に重要です。

例：

- Athenaは何ができるか
- AthenaとRedshiftはどう違うか
- Athenaを選ぶべきでないケースは何か

まで説明してください。

### Best use cases

どのようなユースケースに向いているか。

### Common integrations

どのAWSサービスと組み合わせて使われることが多いか。

例：

S3 → Glue Crawler → Glue Data Catalog → Athena

### Alternatives

似たAWSサービスとの違い。

例：

- Athena vs Redshift
- Glue vs EMR
- Kinesis Data Streams vs Firehose
- SQS vs Kinesis
- RDS vs DynamoDB
- Step Functions vs MWAA

### DEA Exam Points

DEA-C01の問題では、

**どのような条件やキーワードが出てきたらそのサービスを選択する可能性が高いか**

を説明してください。

単なる暗記ではなく、

「なぜそのサービスを選ぶのか」

という判断基準を説明してください。

---

# 3. データフローを視覚化する

このWebアプリで最も重視したい部分です。

AWSサービスのアイコンまたは分かりやすいサービスカードをノードとして配置し、

**データがAWSサービス間をどのように流れるのか**

を図示してください。

例えば、

Application  
↓  
Kinesis Data Streams  
↓  
Kinesis Data Firehose  
↓  
S3  
↓  
Glue Crawler  
↓  
Glue Data Catalog  
↓  
Athena  
↓  
QuickSight

のような構成です。

矢印だけではなく、可能であればアニメーションを使って、

**データが左から右、または上から下に移動している**

ことが直感的に分かるようにしてください。

過度に派手な演出は不要です。

教育用途として、

- データがどこから来るか
- どこに保存されるか
- どこで変換されるか
- どこで分析されるか

が瞬時に理解できることを優先してください。

---

# 4. アーキテクチャパターン

DEA-C01で頻出しそうな構成を、複数の「Architecture Pattern」としてまとめてください。

最低限、以下を用意してください。

### Batch Analytics

例：

RDS  
→ DMS  
→ S3  
→ Glue  
→ Redshift

### Serverless Data Lake

S3  
→ Glue Crawler  
→ Glue Data Catalog  
→ Athena

### Streaming Analytics

Application  
→ Kinesis Data Streams  
→ Lambda  
→ S3 / DynamoDB

### Streaming Data Lake

Application  
→ Kinesis Data Firehose  
→ S3  
→ Glue  
→ Athena

### Data Warehouse

S3 / RDS  
→ Glue  
→ Redshift  
→ BI

### CDC

RDS  
→ DMS CDC  
→ Kinesis / S3 / Redshift

### Big Data Processing

S3  
→ EMR  
→ S3

### Event Driven Pipeline

S3  
→ EventBridge  
→ Lambda  
→ Step Functions

各パターンについて、

- 目的
- データの流れ
- 各サービスの役割
- なぜそのサービスを使うのか
- 他の構成ではダメなのか
- DEA-C01でどのように問われそうか

を説明してください。

---

# 5. 「試験問題ではどう見えるか」を説明する

実際のAWS試験問題を転載する必要はありません。

代わりに、

**試験でありがちなシナリオ**

を作ってください。

例えば：

> 数TBのログデータがS3に保存されている。  
> SQLを使って月に数回分析したい。  
> インフラ管理は最小限にしたい。

この場合、

Athena

を候補にする理由を説明します。

さらに、

「なぜRedshiftではないのか」

も説明してください。

このように、

**正解となるサービスだけでなく、他の候補が不適切になる理由**

まで理解できる教材にしてください。

---

# 6. サービス比較

似たサービスについては比較ページまたは比較カードを用意してください。

特に以下を重視してください。

- Athena vs Redshift
- Redshift vs EMR
- Glue vs EMR
- Kinesis Data Streams vs Firehose
- Kinesis vs MSK
- SQS vs Kinesis
- Step Functions vs MWAA
- RDS vs DynamoDB
- DMS vs DataSync
- Glue Data Catalog vs Lake Formation

比較項目として、

- 主な用途
- データ量
- リアルタイム性
- サーバーレスか
- 運用負荷
- SQL利用
- スケーラビリティ
- コスト特性
- 向いているケース
- 向いていないケース

などを表示してください。

---

# 7. UI / UX

AWS公式ドキュメントのように情報量が多すぎる画面ではなく、

**DEA-C01の学習に最適化した視覚的なUI**

にしてください。

イメージとしては、

AWS Architecture Diagram  
＋  
インタラクティブな学習教材

の中間です。

トップページには、

- Data Ingestion
- Storage
- Processing
- Catalog
- Analytics
- Orchestration
- Security
- Monitoring

などのカテゴリを表示してください。

サービスカードをクリックすると詳細を確認できる構成にしてください。

---

# 8. 視覚デザイン

AWSを想起できるデザインにしてください。

ただしAWS公式サイトを完全にコピーする必要はありません。

以下を意識してください。

- ダークテーマまたは落ち着いたAWS風UI
- サービスごとのカテゴリが視覚的に分かる
- データフローを最優先
- 情報密度は高いが読みやすい
- PCでの閲覧を優先
- レスポンシブ対応

サービス間の接続線には、

- アニメーション
- flowing dots
- moving gradient
- moving arrows

などを使い、

データの流れが分かるようにしてください。

---

# 9. 学習補助機能

可能であれば以下も実装してください。

### Exam Tips

試験で重要なポイントを強調表示。

### Common Trap

間違えやすいサービス選択を表示。

例：

「S3をSQLで直接分析する」という条件だけでRedshiftを選ばない。

### Keywords

問題文に出てきたときに注目すべきキーワード。

例：

- serverless
- minimum operational overhead
- near real-time
- CDC
- schema discovery
- petabyte scale
- ad-hoc SQL

### Architecture Quiz

アーキテクチャを見て、

「この空欄にはどのサービスが入るか」

程度の簡単な確認問題を追加しても構いません。

ただし問題演習サイトにするのではなく、理解を深める補助機能として扱ってください。

---

# 10. 技術要件

ローカルで簡単に起動できるWebアプリにしてください。

技術スタックは適切なものを選択してください。

例：

- React
- Next.js
- TypeScript
- Tailwind CSS

など。

アーキテクチャ図については、

- React Flow
- SVG
- CSS animation
- Framer Motion

などから適切なものを選択してください。

バックエンドやデータベースは、必要がなければ使用しなくて構いません。

基本的には静的データで構いません。

---

# 11. コンテンツ設計上の重要事項

このサイトでは、

「サービスの説明」

よりも、

**サービス間の関係性**

を重視してください。

例えば、

S3

について数百文字説明するだけではなく、

S3  
↓  
Glue  
↓  
Athena

や、

S3  
↓  
Glue  
↓  
Redshift

などの構成を見せ、

「なぜこの構成になるのか」

を理解できるようにしてください。

---

# 12. 最終的な学習目標

このWebアプリを一通り閲覧したあと、

DEA-C01の問題を読んだときに、

「この要件ならAthenaだな」

「リアルタイム処理だからKinesis Data Streamsが候補になる」

「これは単なるファイル転送だからDMSではなくDataSync」

「CDCという条件があるのでDMSが候補」

「オーケストレーションが必要だがAirflowまでは不要なのでStep Functions」

のように、

**問題文の要件から適切なAWSサービスを判断できる状態**

を目指してください。

---

まずプロジェクト全体の構成を設計したうえで実装してください。

完成度の低い多数のページを作るより、

**主要サービスの理解・比較・データフローの可視化が非常に分かりやすい完成度の高い教材**

を優先してください。

最初の実装では特に、

1. S3
2. Glue
3. Athena
4. Redshift
5. Kinesis
6. DMS
7. EMR
8. Lambda
9. Step Functions

を中心に作り込み、その後ほかのサービスへ拡張できる構造にしてください。