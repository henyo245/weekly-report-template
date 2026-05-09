import { Octokit } from '@octokit/rest';
import config, { validateConfig } from './config.js';
import fs from 'fs';
import path from 'path';

validateConfig();

const octokit = new Octokit({
  auth: config.github.token,
});

/**
 * GitHub Projects v2 API からプロジェクトを取得
 */
async function getProject() {
  try {
    console.log(`プロジェクト取得中: ${config.github.owner}/${config.github.repo} (No.${config.github.projectNumber})`);
    
    // GitHub GraphQL を使用してプロジェクト情報を取得
    // REST API のみでは v2 プロジェクトの全情報取得が難しいため、
    // ここではプロジェクトが存在することを確認
    const response = await octokit.repos.get({
      owner: config.github.owner,
      repo: config.github.repo,
    });
    
    console.log('✓ リポジトリ確認完了:', response.data.full_name);
    return response.data;
  } catch (error) {
    console.error('✗ プロジェクト取得に失敗:', error.message);
    process.exit(1);
  }
}

/**
 * GitHub Issues からタスクを取得
 * (プロジェクトと紐付けられたissue)
 */
async function getTasks() {
  try {
    console.log('タスク取得中...');
    
    // Issues を取得
    const issues = await octokit.paginate('GET /repos/{owner}/{repo}/issues', {
      owner: config.github.owner,
      repo: config.github.repo,
      state: 'all',
      per_page: 100,
    });
    
    console.log(`✓ ${issues.length} 件のタスク取得完了`);
    
    const tasks = issues.map(issue => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      description: issue.body || '',
      url: issue.html_url,
      status: issue.state, // 'open' or 'closed'
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
      closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
      labels: issue.labels.map(l => l.name),
      assignees: issue.assignees.map(a => a.login),
    }));
    
    return tasks;
  } catch (error) {
    console.error('✗ タスク取得に失敗:', error.message);
    process.exit(1);
  }
}

/**
 * タスクをファイルに保存
 */
async function saveTasksToFile(tasks) {
  try {
    // ディレクトリが存在することを確認
    if (!fs.existsSync(config.paths.tasksDataDir)) {
      fs.mkdirSync(config.paths.tasksDataDir, { recursive: true });
    }
    
    const data = {
      fetchedAt: new Date().toISOString(),
      taskCount: tasks.length,
      tasks: tasks,
    };
    
    fs.writeFileSync(
      config.paths.tasksFile,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    console.log(`✓ タスク情報を保存: ${config.paths.tasksFile}`);
  } catch (error) {
    console.error('✗ ファイル保存に失敗:', error.message);
    process.exit(1);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('='.repeat(50));
  console.log('GitHub Projects タスク取得ツール');
  console.log('='.repeat(50));
  console.log();
  
  await getProject();
  const tasks = await getTasks();
  await saveTasksToFile(tasks);
  
  console.log();
  console.log('✓ タスク取得完了');
}

main().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
