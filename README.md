# 週報ジェネレーター

GitHub Projectsを使用したタスク管理から週報を自動生成するツールです。

## セットアップ

### 1. 必要な情報を準備

- GitHub Personal Access Token (PAT)
- リポジトリ名
- プロジェクト番号

### 2. 環境変数を設定

`.env` ファイルを作成して以下を設定：

```
GITHUB_TOKEN=your_personal_access_token
GITHUB_REPO=your_username/your_repository_name
PROJECT_NUMBER=123
```

### 3. 依存パッケージをインストール

```bash
npm install
```

## 使用方法

### タスクを取得

```bash
npm run fetch-tasks
```

### 週報を生成

```bash
# 今週の週報を生成
npm run generate-report:week

# 今日の日報を生成
npm run generate-report:today

# 特定の日付で生成
npm run generate-report -- --date 2026-05-03
```

## 毎週自動生成

GitHub Actionsで毎週定期的に週報を自動生成できます。
このリポジトリには `.github/workflows/weekly-report.yml` が追加されており、
デフォルトで**月曜日 09:00 JST**に実行されます。

### 手動実行

```bash
npm run generate-weekly-report
```

### 変更方法

スケジュールを変更したい場合は、`.github/workflows/weekly-report.yml` の `cron` 式を編集してください。

例: 月曜日 18:00 JST の場合は `cron: '0 9 * * 1'` に変更します。

## ディレクトリ構造

```
.
├── src/
│   ├── fetchTasks.js      # GitHub Projects APIからタスクを取得
│   ├── generateReport.js  # 週報/日報を生成
│   ├── config.js          # 設定管理
│   └── utils.js           # ユーティリティ関数
├── data/
│   ├── tasks.json         # 取得したタスク情報
│   └── reports/           # 生成された週報
├── .env                   # 環境変数（リポジトリには含めない）
└── README.md
```

## GitHub Projects API統合

このツールは以下の情報を自動取得します：

- タスクのタイトル
- 説明
- 完了日時
- アサイン情報
- ステータス（完了/進行中/未実施）

## 機能

- **自動取得**: GitHub Projects からタスク情報を定期的に取得
- **週単位の集計**: 該当週に完了したタスクを自動集計
- **Markdown形式**: 見やすいMarkdown形式で週報を生成
- **カスタマイズ可能**: 出力形式やカテゴリ分類をカスタマイズ可能

## トラブルシューティング

### 認証エラーが出た場合

- `GITHUB_TOKEN` が正しく設定されているか確認
- トークンにプロジェクト読み取り権限があるか確認

### タスクが取得できない場合

- `PROJECT_NUMBER` が正しいか確認
- リポジトリ設定でプロジェクトが公開されているか確認
