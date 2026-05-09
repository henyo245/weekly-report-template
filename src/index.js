#!/usr/bin/env node

/**
 * メインエントリーポイント
 * このファイルは使用例を示します
 */

import { validateConfig } from './config.js';

console.log('');
console.log('='.repeat(50));
console.log('GitHub Projects 週報ジェネレーター');
console.log('='.repeat(50));
console.log('');
console.log('使用可能なコマンド:');
console.log('');
console.log('  npm run fetch-tasks');
console.log('    GitHub Projects からタスクを取得します');
console.log('');
console.log('  npm run generate-report:week');
console.log('    今週の週報を生成します');
console.log('');
console.log('  npm run generate-report:today');
console.log('    今日の日報を生成します');
console.log('');
console.log('  npm run generate-report -- --date YYYY-MM-DD');
console.log('    指定日付が属する週の週報を生成します');
console.log('');
console.log('='.repeat(50));
console.log('');

// 設定をチェック
try {
  validateConfig();
  console.log('✓ 環境変数の設定確認完了');
  console.log('');
} catch (error) {
  console.error('✗ エラー:', error.message);
  process.exit(1);
}
