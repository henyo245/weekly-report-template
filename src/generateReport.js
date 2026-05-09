import fs from 'fs';
import config, { validateConfig } from './config.js';
import { getWeekDateRange, getDateRange, groupTasksByCategory } from './utils.js';

validateConfig();

/**
 * タスクファイルから完了したタスクを読み込む
 */
function loadTasks() {
  if (!fs.existsSync(config.paths.tasksFile)) {
    console.error('✗ タスク情報ファイルが見つかりません');
    console.error('先に `npm run fetch-tasks` を実行してください');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(config.paths.tasksFile, 'utf-8'));
  return data.tasks.map(task => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    closedAt: task.closedAt ? new Date(task.closedAt) : null,
  }));
}

/**
 * 完了したタスクをフィルタリング
 */
function getCompletedTasks(tasks, startDate, endDate) {
  return tasks.filter(task => {
    if (task.status !== 'closed' || !task.closedAt) {
      return false;
    }
    
    return task.closedAt >= startDate && task.closedAt <= endDate;
  });
}

/**
 * Markdown形式の週報を生成
 */
function generateMarkdownReport(completedTasks, startDate, endDate, periodName) {
  const reportDate = new Date().toISOString().split('T')[0];
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  let markdown = `# ${periodName}報 (${startDateStr} - ${endDateStr})\n\n`;
  markdown += `*作成日時: ${new Date().toLocaleString('ja-JP')}*\n\n`;
  
  if (completedTasks.length === 0) {
    markdown += 'この期間に完了したタスクはありません。\n';
    return markdown;
  }
  
  // ラベルごとにタスクをグループ化
  const grouped = groupTasksByCategory(completedTasks);
  
  markdown += `## 完了タスク (${completedTasks.length}件)\n\n`;
  
  // グループごとにセクションを作成
  for (const [category, tasks] of Object.entries(grouped)) {
    markdown += `### ${category} (${tasks.length}件)\n\n`;
    
    tasks.forEach(task => {
      const closedDateStr = task.closedAt.toISOString().split('T')[0];
      markdown += `- [${task.title}](${task.url})\n`;
      markdown += `  - 完了日: ${closedDateStr}\n`;
      if (task.assignees.length > 0) {
        markdown += `  - 担当: ${task.assignees.join(', ')}\n`;
      }
      if (task.description) {
        const desc = task.description.split('\n')[0].substring(0, 50);
        markdown += `  - 説明: ${desc}...\n`;
      }
    });
    
    markdown += '\n';
  }
  
  // サマリー
  markdown += '## サマリー\n\n';
  markdown += `- **完了タスク数**: ${completedTasks.length}件\n`;
  markdown += `- **期間**: ${startDateStr} から ${endDateStr}\n`;
  
  return markdown;
}

/**
 * JSON形式の週報を生成
 */
function generateJsonReport(completedTasks, startDate, endDate, periodName) {
  return {
    period: periodName,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    generatedAt: new Date().toISOString(),
    summary: {
      totalTasks: completedTasks.length,
      byCategory: groupTasksByCategory(completedTasks),
    },
    tasks: completedTasks.map(task => ({
      title: task.title,
      url: task.url,
      closedAt: task.closedAt.toISOString(),
      labels: task.labels,
      assignees: task.assignees,
    })),
  };
}

/**
 * レポートをファイルに保存
 */
function saveReport(filename, content, isJson = false) {
  if (!fs.existsSync(config.paths.reportsDir)) {
    fs.mkdirSync(config.paths.reportsDir, { recursive: true });
  }
  
  const filepath = `${config.paths.reportsDir}/${filename}`;
  const fileContent = isJson ? JSON.stringify(content, null, 2) : content;
  
  fs.writeFileSync(filepath, fileContent, 'utf-8');
  console.log(`✓ レポート保存: ${filepath}`);
  
  return filepath;
}

/**
 * メイン処理
 */
async function main() {
  console.log('='.repeat(50));
  console.log('週報生成ツール');
  console.log('='.repeat(50));
  console.log();
  
  const args = process.argv.slice(2);
  let dateOption = 'week'; // デフォルト: 週単位
  
  // コマンドラインオプションをパース
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) {
      dateOption = args[i + 1];
      i++;
    }
  }
  
  let startDate, endDate, periodName, filePrefix;
  
  if (dateOption === 'today') {
    const today = new Date();
    startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    periodName = '日';
    filePrefix = `日報_${today.toISOString().split('T')[0]}`;
  } else if (dateOption === 'week') {
    ({ startDate, endDate } = getWeekDateRange());
    periodName = '週';
    filePrefix = `週報_week${Math.ceil(new Date().getDate() / 7)}`;
  } else {
    // 特定の日付
    const specificDate = new Date(dateOption);
    if (isNaN(specificDate.getTime())) {
      console.error('✗ 無効な日付形式です');
      process.exit(1);
    }
    ({ startDate, endDate } = getDateRange(specificDate));
    periodName = '週';
    filePrefix = `週報_${dateOption}`;
  }
  
  console.log(`対象期間: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`);
  console.log();
  
  // タスクを読み込み
  const allTasks = loadTasks();
  const completedTasks = getCompletedTasks(allTasks, startDate, endDate);
  
  console.log(`完了タスク: ${completedTasks.length}件`);
  console.log();
  
  // Markdown形式で生成
  const markdownReport = generateMarkdownReport(completedTasks, startDate, endDate, periodName);
  const mdFile = saveReport(`${filePrefix}.md`, markdownReport);
  
  // JSON形式でも生成
  const jsonReport = generateJsonReport(completedTasks, startDate, endDate, periodName);
  const jsonFile = saveReport(`${filePrefix}.json`, jsonReport, true);
  
  console.log();
  console.log('✓ 週報生成完了');
  console.log();
  console.log('生成されたファイル:');
  console.log(`  - Markdown: ${mdFile}`);
  console.log(`  - JSON: ${jsonFile}`);
}

main().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
