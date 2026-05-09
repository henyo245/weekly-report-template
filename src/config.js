import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ override: false });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const repoFull = process.env.GITHUB_REPO || '';
const [owner, repo] = repoFull.split('/');

const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
    owner,
    repo,
    projectNumber: parseInt(process.env.PROJECT_NUMBER) || 1,
  },
  paths: {
    tasksDataDir: process.env.TASKS_DATA_DIR || path.join(__dirname, '../data'),
    reportsDir: process.env.REPORT_OUTPUT_DIR || path.join(__dirname, '../data/reports'),
    tasksFile: path.join(
      process.env.TASKS_DATA_DIR || path.join(__dirname, '../data'),
      'tasks.json'
    ),
  },
  report: {
    weekStartDay: 1,
    includeStatus: ['DONE'],
  },
};

// バリデーション
export function validateConfig() {
  const required = ['GITHUB_TOKEN', 'GITHUB_REPO'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('必要な環境変数が設定されていません:', missing.join(', '));
    console.error('環境変数（.env または GitHub Actions）を確認してください');
    process.exit(1);
  }

  if (!owner || !repo) {
    console.error('GITHUB_REPO の形式が不正です。 "owner/repo" の形式で指定してください');
    console.error(`現在の値: ${process.env.GITHUB_REPO}`);
    process.exit(1);
  }

  return config;
}

export default config;