/**
 * 指定された日付が属する週の開始日と終了日を取得
 * デフォルト: 月曜日から日曜日
 */
export function getWeekDateRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  
  // 月曜日を週の開始とする（day === 0 の時が日曜日）
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  
  const startDate = new Date(d.setDate(diff));
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * 指定された日付が属する週の開始日と終了日を取得
 */
export function getDateRange(date) {
  return getWeekDateRange(date);
}

/**
 * タスクをカテゴリ（ラベル）ごとにグループ化
 */
export function groupTasksByCategory(tasks) {
  const grouped = {};
  
  tasks.forEach(task => {
    // ラベルがある場合はラベルでグループ化、ない場合は「その他」
    const labels = task.labels.length > 0 ? task.labels : ['その他'];
    
    labels.forEach(label => {
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(task);
    });
  });
  
  // キーをソート
  const sorted = {};
  Object.keys(grouped).sort().forEach(key => {
    sorted[key] = grouped[key];
  });
  
  return sorted;
}

/**
 * 日付をフォーマット
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  
  return date.toLocaleDateString('ja-JP');
}

/**
 * タスクをソート（新しい順）
 */
export function sortTasks(tasks, key = 'closedAt') {
  return [...tasks].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (!aVal || !bVal) return 0;
    return new Date(bVal) - new Date(aVal);
  });
}
