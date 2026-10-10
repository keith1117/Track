const { createInitialState, navigate, addSet, updateSet, toggleSet, saveExercise, setPlan, filterHistory, summarizeHistory } = window.TrackCore;

const state = createInitialState();
state.selectedTitle = 'momentum-builder';
state.recentSearches = ['push day', 'marathon', '@alexchen.fit', 'home workout'];

const bodyParts = [
  { id: 'chest', name: '胸部', icon: 'chest', mark: 'CH', level: 24, score: 78, recommended: true, note: '48 小时前训练' },
  { id: 'back', name: '背部', icon: 'back', mark: 'BK', level: 27, score: 72, note: '状态良好' },
  { id: 'shoulders', name: '肩部', icon: 'shoulders', mark: 'SH', level: 23, score: 68, note: '3 天前训练' },
  { id: 'legs', name: '腿部', icon: 'legs', mark: 'LG', level: 25, score: 62, note: '昨天训练' },
  { id: 'arms', name: '手臂', icon: 'arms', mark: 'AR', level: 22, score: 55, note: '状态良好' },
  { id: 'abs', name: '核心', icon: 'abs', mark: 'CO', level: 20, score: 70, note: '4 天前训练' },
  { id: 'cardio', name: '有氧', icon: 'cardio', mark: 'CD', level: 18, score: 46, note: '本周 1 次' }
];

const exercises = {
  chest: [
    { id: 'bench-press', name: '杠铃卧推', mark: 'BP', level: 28, current: '70 kg', pr: '100 kg', recommended: '推荐' },
    { id: 'incline-dumbbell', name: '上斜哑铃卧推', mark: 'ID', level: 24, current: '32.5 kg', pr: '40 kg', recommended: '适合你' },
    { id: 'chest-press', name: '器械推胸', mark: 'CP', level: 22, current: '92 kg', pr: '120 kg' },
    { id: 'cable-fly', name: '绳索夹胸', mark: 'CF', level: 20, current: '28 kg', pr: '35 kg', recommended: '推荐' },
    { id: 'decline-bench', name: '下斜卧推', mark: 'DB', level: 19, current: '60 kg', pr: '80 kg' },
    { id: 'push-up', name: '俯卧撑', mark: 'PU', level: 21, current: '20 次', pr: '38 次' },
    { id: 'dips', name: '双杠臂屈伸', mark: 'DP', level: 18, current: 'BW + 5', pr: 'BW + 20' },
    { id: 'pec-deck', name: '蝴蝶机夹胸', mark: 'PF', level: 17, current: '55 kg', pr: '72 kg' }
  ],
  back: [
    { id: 'lat-pulldown', name: '高位下拉', mark: 'LP', level: 28, current: '70 kg', pr: '100 kg', recommended: '推荐' },
    { id: 'seated-row', name: '坐姿划船', mark: 'SR', level: 26, current: '68 kg', pr: '92 kg' },
    { id: 'barbell-row', name: '杠铃划船', mark: 'BR', level: 25, current: '72.5 kg', pr: '95 kg' },
    { id: 'pull-up', name: '引体向上', mark: 'PU', level: 24, current: 'BW + 10', pr: 'BW + 30' },
    { id: 'straight-arm', name: '直臂下压', mark: 'SA', level: 19, current: '30 kg', pr: '42 kg' }
  ],
  shoulders: [
    { id: 'overhead-press', name: '杠铃肩推', mark: 'OP', level: 25, current: '40 kg', pr: '55 kg', recommended: '推荐' },
    { id: 'dumbbell-press', name: '哑铃肩推', mark: 'DP', level: 23, current: '20 kg', pr: '28 kg' },
    { id: 'lateral-raise', name: '哑铃侧平举', mark: 'LR', level: 22, current: '10 kg', pr: '16 kg', recommended: '适合你' },
    { id: 'reverse-fly', name: '反向飞鸟', mark: 'RF', level: 20, current: '24 kg', pr: '36 kg' },
    { id: 'face-pull', name: '绳索面拉', mark: 'FP', level: 19, current: '22 kg', pr: '32 kg' }
  ],
  legs: [
    { id: 'barbell-squat', name: '杠铃深蹲', mark: 'SQ', level: 27, current: '80 kg', pr: '110 kg', recommended: '推荐' },
    { id: 'romanian-deadlift', name: '罗马尼亚硬拉', mark: 'RD', level: 25, current: '70 kg', pr: '95 kg' },
    { id: 'leg-press', name: '腿举', mark: 'LP', level: 24, current: '160 kg', pr: '220 kg' },
    { id: 'leg-extension', name: '腿屈伸', mark: 'LE', level: 21, current: '45 kg', pr: '65 kg' },
    { id: 'leg-curl', name: '腿弯举', mark: 'LC', level: 20, current: '40 kg', pr: '58 kg' },
    { id: 'calf-raise', name: '站姿提踵', mark: 'CR', level: 19, current: '60 kg', pr: '85 kg' }
  ],
  arms: [
    { id: 'barbell-curl', name: '杠铃弯举', mark: 'BC', level: 24, current: '30 kg', pr: '42.5 kg', recommended: '推荐' },
    { id: 'hammer-curl', name: '锤式弯举', mark: 'HC', level: 22, current: '14 kg', pr: '20 kg' },
    { id: 'triceps-pushdown', name: '绳索下压', mark: 'TP', level: 23, current: '35 kg', pr: '50 kg' },
    { id: 'overhead-extension', name: '过顶臂屈伸', mark: 'OE', level: 20, current: '22 kg', pr: '32 kg' },
    { id: 'preacher-curl', name: '牧师凳弯举', mark: 'PC', level: 19, current: '20 kg', pr: '30 kg' }
  ],
  abs: [
    { id: 'cable-crunch', name: '绳索卷腹', mark: 'CC', level: 23, current: '35 kg', pr: '50 kg', recommended: '推荐' },
    { id: 'ab-crunch-machine', name: '器械卷腹', mark: 'AC', level: 21, current: '45 kg', pr: '65 kg' },
    { id: 'pallof-press', name: '抗旋转推举', mark: 'PP', level: 20, current: '18 kg', pr: '28 kg' },
    { id: 'weighted-twist', name: '负重俄罗斯转体', mark: 'WT', level: 19, current: '10 kg', pr: '18 kg' },
    { id: 'kettlebell-side-bend', name: '壶铃侧屈', mark: 'SB', level: 18, current: '16 kg', pr: '24 kg' }
  ],
  cardio: [
    { id: 'treadmill-run', name: '跑步机跑步', mark: 'RN', level: 22, current: '30 分钟', pr: '45 分钟', minutes: 30, distance: 5, recommended: '推荐' },
    { id: 'indoor-cycle', name: '动感单车', mark: 'CY', level: 21, current: '25 分钟', pr: '40 分钟', minutes: 25, distance: 10 },
    { id: 'rowing-machine', name: '划船机', mark: 'RW', level: 20, current: '20 分钟', pr: '35 分钟', minutes: 20, distance: 4 },
    { id: 'elliptical', name: '椭圆机', mark: 'EL', level: 19, current: '30 分钟', pr: '45 分钟', minutes: 30, distance: 5 },
    { id: 'incline-walk', name: '坡度快走', mark: 'IW', level: 18, current: '25 分钟', pr: '40 分钟', minutes: 25, distance: 2.5 }
  ]
};

// Illustrative movement profiles for the prototype, not measured muscle activation data.
const muscleShares = {
  'bench-press': [['chest', 65], ['arms', 20], ['shoulders', 15]],
  'incline-dumbbell': [['chest', 55], ['shoulders', 30], ['arms', 15]],
  'chest-press': [['chest', 70], ['arms', 20], ['shoulders', 10]],
  'cable-fly': [['chest', 80], ['shoulders', 15], ['arms', 5]],
  'decline-bench': [['chest', 70], ['arms', 20], ['shoulders', 10]],
  'push-up': [['chest', 55], ['arms', 25], ['shoulders', 20]],
  'dips': [['chest', 45], ['arms', 40], ['shoulders', 15]],
  'pec-deck': [['chest', 85], ['shoulders', 10], ['arms', 5]],
  'lat-pulldown': [['back', 65], ['arms', 30], ['shoulders', 5]],
  'seated-row': [['back', 60], ['arms', 25], ['shoulders', 15]],
  'barbell-row': [['back', 60], ['arms', 25], ['abs', 15]],
  'pull-up': [['back', 60], ['arms', 30], ['abs', 10]],
  'straight-arm': [['back', 75], ['shoulders', 15], ['arms', 10]],
  'overhead-press': [['shoulders', 60], ['arms', 25], ['abs', 15]],
  'dumbbell-press': [['shoulders', 65], ['arms', 25], ['abs', 10]],
  'lateral-raise': [['shoulders', 85], ['arms', 10], ['back', 5]],
  'reverse-fly': [['shoulders', 65], ['back', 30], ['arms', 5]],
  'face-pull': [['shoulders', 55], ['back', 35], ['arms', 10]],
  'barbell-squat': [['legs', 70], ['abs', 20], ['back', 10]],
  'romanian-deadlift': [['legs', 55], ['back', 30], ['abs', 15]],
  'leg-press': [['legs', 85], ['abs', 10], ['back', 5]],
  'leg-extension': [['legs', 95], ['abs', 5]],
  'leg-curl': [['legs', 90], ['abs', 10]],
  'calf-raise': [['legs', 90], ['abs', 10]],
  'barbell-curl': [['arms', 85], ['shoulders', 10], ['abs', 5]],
  'hammer-curl': [['arms', 85], ['shoulders', 10], ['abs', 5]],
  'triceps-pushdown': [['arms', 90], ['shoulders', 10]],
  'overhead-extension': [['arms', 85], ['shoulders', 10], ['abs', 5]],
  'preacher-curl': [['arms', 95], ['shoulders', 5]],
  'cable-crunch': [['abs', 85], ['arms', 10], ['back', 5]],
  'ab-crunch-machine': [['abs', 90], ['back', 10]],
  'pallof-press': [['abs', 75], ['shoulders', 15], ['arms', 10]],
  'weighted-twist': [['abs', 75], ['arms', 15], ['back', 10]],
  'kettlebell-side-bend': [['abs', 80], ['arms', 10], ['legs', 10]],
  'treadmill-run': [['legs', 70], ['abs', 20], ['arms', 10]],
  'indoor-cycle': [['legs', 80], ['abs', 15], ['back', 5]],
  'rowing-machine': [['back', 45], ['legs', 35], ['arms', 20]],
  'elliptical': [['legs', 60], ['arms', 25], ['abs', 15]],
  'incline-walk': [['legs', 75], ['abs', 20], ['back', 5]]
};

const levelBodyParts = ['chest', 'back', 'arms', 'abs', 'legs', 'shoulders']
  .map((id) => bodyParts.find((part) => part.id === id));
const historyStorageKey = 'track.training-history.v1';

function readSavedHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((entry) => entry && exercises[entry.bodyPart]?.some((item) => item.id === entry.exerciseId)
      && Number.isFinite(new Date(entry.date).getTime()) && Array.isArray(entry.sets)
      && entry.sets.every((set) => Number.isFinite(set?.weight) && Number.isFinite(set?.reps)));
  } catch { return []; }
}

function persistHistory() {
  try { localStorage.setItem(historyStorageKey, JSON.stringify(state.history)); } catch { /* Preview still works when storage is unavailable. */ }
}

function demoHistory() {
  const daysAgo = [72, 42, 18, 5];
  return levelBodyParts.flatMap((part) => exercises[part.id].slice(0, 3).flatMap((exercise, exerciseIndex) => {
    const base = parseFloat(exercise.current) || 20;
    return daysAgo.map((days, index) => {
      const date = new Date(Date.now() - (days + exerciseIndex) * 86400000).toISOString();
      const weight = Math.max(2.5, base - (3 - index) * 2.5);
      return {
        id: `sample-${part.id}-${exercise.id}-${index}`,
        bodyPart: part.id,
        exerciseId: exercise.id,
        date,
        source: 'sample',
        sets: [{ weight, reps: 6 }, { weight, reps: 8 }, { weight: Math.max(2.5, weight - 2.5), reps: 10 }]
      };
    });
  }));
}

const users = {
  alex: { initials: 'AC', name: 'Alex Chen', handle: '@alexchen.fit', level: 24, title: 'Momentum Builder' },
  sophie: { initials: 'SL', name: 'Sophie Lee', handle: '@sophielifts', level: 19, title: 'Consistency Pro' },
  marcus: { initials: 'ML', name: 'Marcus Lee', handle: '@marcus.moves', level: 28, title: 'Iron Back' }
};

state.history = readSavedHistory();
const sampleHistory = demoHistory();

const titles = [
  { id: 'momentum-builder', icon: 'MB', name: 'Momentum Builder', state: 'earned', requirement: '完成 50 次训练', progress: 100, earnedDate: '2026 年 9 月 14 日' },
  { id: 'rising-titan', icon: 'RT', name: 'Rising Titan', state: 'locked', requirement: '身体等级达到 30', progress: 87 },
  { id: 'iron-back', icon: 'IB', name: 'Iron Back', state: 'locked', requirement: '背部等级达到 30', progress: 90 },
  { id: 'chest-warrior', icon: 'CW', name: 'Chest Warrior', state: 'locked', requirement: '胸部等级达到 30', progress: 80 },
  { id: 'consistency-pro', icon: 'CP', name: 'Consistency Pro', state: 'locked', requirement: '连续训练 30 天', progress: 53 },
  { id: 'all-rounder', icon: 'AR', name: 'All-Rounder', state: 'locked', requirement: '所有部位达到等级 25', progress: 72 }
];

const app = document.querySelector('#app-content');
const bottomNav = document.querySelector('.bottom-nav');
const toast = document.querySelector('#toast');
const frame = document.querySelector('.phone-frame');

const icons = {
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  chart: '<path d="M4 20V10m8 10V4m8 16v-7"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 2 4v2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  bell: '<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/>'
};
function uiIcon(name) {
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
}
document.querySelectorAll('[data-icon]').forEach((node) => { node.innerHTML = uiIcon(node.dataset.icon); });
let keyboardInput = false;
document.addEventListener('pointerdown', () => { keyboardInput = false; frame.dataset.input = 'pointer'; });

function bodyIcon(name) {
  const paths = {
    chest: '<path class="icon-fill" d="M11 18c3-5 8-7 13-3 5-4 10-2 13 3v17H11z"/><path d="M24 15v22M11 20c4 0 7 2 13 6 6-4 9-6 13-6M14 12l-5 6 2 17M34 12l5 6-2 17"/>',
    back: '<path class="icon-fill" d="M12 17c4-4 8-5 12-2 4-3 8-2 12 2l-3 20H15z"/><path d="M24 14v24M12 18c5 1 8 4 12 8 4-4 7-7 12-8M16 13l-6 6 5 18M32 13l6 6-5 18M20 20h8"/>',
    shoulders: '<circle cx="24" cy="12" r="5"/><path class="icon-fill" d="M8 31c1-8 7-12 16-12s15 4 16 12l-5 4H13z"/><path d="M8 32c1-9 7-13 16-13s15 4 16 13M14 35v-6M34 35v-6"/>',
    legs: '<path class="icon-fill" d="M15 9h18l-2 14 4 17h-8l-3-13-3 13h-8l4-17z"/><path d="M15 9h18l-2 14 4 17h-8l-3-13-3 13h-8l4-17zM24 11v16M17 23h14"/>',
    arms: '<path class="icon-fill" d="M10 31c5-2 6-8 9-13l6 4 4-10 6 3-3 12c4 2 6 5 6 9H17z"/><path d="M9 34c7-2 7-10 10-16l7 5 3-11 7 3-4 13c4 1 7 4 7 8H17c-4 0-6-1-8-2zM25 23c-3 5-2 9 2 12"/>',
    abs: '<path class="icon-fill" d="M15 10h18l3 10-4 20H16l-4-20z"/><path d="M15 10h18l3 10-4 20H16l-4-20zM24 15v23M17 21h14M17 29h14"/>',
    cardio: '<path class="icon-fill" d="M24 39S8 30 8 19c0-9 11-11 16-4 5-7 16-5 16 4 0 11-16 20-16 20z"/><path d="M24 39S8 30 8 19c0-9 11-11 16-4 5-7 16-5 16 4 0 11-16 20-16 20zM11 25h8l3-7 4 13 3-6h8"/>'
  };
  return `<svg class="body-icon" viewBox="0 0 48 48" aria-hidden="true">${paths[name] || paths.chest}</svg>`;
}

function cardioTile() {
  return '<img class="cardio-illustration" src="assets/exercises/cardio-runner.png" width="1280" height="1280" alt="" aria-hidden="true" draggable="false">';
}

// Display only the approved thumbnail regions; UI text stays live and accessible.
const chestIllustrationCrops = {
  'bench-press': { left: 110, top: 118, width: 288, height: 164 },
  'incline-dumbbell': { left: 110, top: 302, width: 288, height: 166 },
  'chest-press': { left: 110, top: 486, width: 288, height: 166 },
  'cable-fly': { left: 110, top: 674, width: 288, height: 161 },
  'decline-bench': { left: 110, top: 863, width: 288, height: 154 },
  'push-up': { left: 110, top: 1044, width: 288, height: 144 },
  dips: { left: 110, top: 1204, width: 288, height: 154 },
  'pec-deck': { left: 110, top: 1383, width: 288, height: 153 }
};

function exerciseIllustration(exercise) {
  const crop = chestIllustrationCrops[exercise.id];
  const image = crop
    ? `<span class="exercise-crop" style="aspect-ratio:${crop.width}/${crop.height}"><img src="assets/exercises/chest-preview.png" width="938" height="1677" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" style="width:${938 / crop.width * 100}%;left:${-crop.left / crop.width * 100}%;top:${-crop.top / crop.height * 100}%"></span>`
    : `<img src="assets/exercises/${exercise.id}.png" width="1280" height="1280" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false">`;
  return `<span class="exercise-illustration" data-exercise-art="${exercise.id}" aria-hidden="true">${image}</span>`;
}

function muscleName(id) {
  return bodyParts.find((part) => part.id === id)?.name || id;
}

function muscleShareCard(exercise) {
  const shares = muscleShares[exercise.id];
  return `<section class="muscle-share" aria-label="${exercise.name}肌群参与示意"><div class="muscle-share-heading"><b>肌群参与</b><small>动作示意占比</small></div><div class="muscle-share-track" aria-hidden="true">${shares.map(([, percent], index) => `<span class="share-tone-${index}" style="width:${percent}%"></span>`).join('')}</div><div class="muscle-share-legend">${shares.map(([id, percent], index) => `<span><i class="share-tone-${index}"></i>${muscleName(id)} <b>${percent}%</b></span>`).join('')}</div><p>示意分配，非肌电或实时测量结果</p></section>`;
}

function pageHeader(title, back, action) {
  return `<header class="page-header">${back ? `<button class="icon-button" data-page="${back}" aria-label="返回">${uiIcon('back')}</button>` : '<div class="wordmark">Track<span class="brand-dot">.</span></div>'}${back ? `<h1>${title}</h1>` : `<div class="header-context">${title}</div>`}${action || `<button class="icon-button" data-action="notifications" aria-label="通知"><span class="notification-dot"></span>${uiIcon('bell')}</button>`}</header>`;
}

function dailyStrain() {
  const percent = Math.min(100, Math.round(state.dailyStrain / state.dailyStrainTarget * 100));
  const remaining = Math.max(0, state.dailyStrainTarget - state.dailyStrain);
  return `<section class="strain" aria-label="今日训练负荷"><div class="strain-heading"><div><span>DAILY STRAIN</span><b>今日负荷</b></div><strong>${state.dailyStrain}<small>/ ${state.dailyStrainTarget}</small></strong></div><div class="progress-line"><span style="transform:scaleX(${percent / 100})"></span></div><p>${remaining ? `再完成 ${remaining} 点即可达成今日目标` : '今日训练目标已完成'}</p></section>`;
}

function prototypeSwitcher() {
  return `<div class="prototype-switcher" aria-label="会员状态对比">
    <span>对比模式</span>
    <button class="${state.plan === 'free' ? 'active' : ''}" data-plan="free" aria-pressed="${state.plan === 'free'}">Free</button>
    <button class="${state.plan === 'pro' ? 'active pro' : ''}" data-plan="pro" aria-pressed="${state.plan === 'pro'}">Track Pro</button>
  </div>`;
}

function coachHomeCard() {
  if (state.plan === 'pro') {
    return `<button class="coach-card active" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>TRACK PRO 私人教练</small><b>今天建议训练胸部</b><em>恢复状态良好，建议中等强度训练 45 分钟。</em></span><i>查看计划 ›</i></button>`;
  }
  return `<button class="coach-card locked" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>TRACK PRO 私人教练</small><b>今天应该怎么练？</b><em>升级后获取每日计划、实时建议和训练反馈。</em></span><i>了解 Pro ›</i></button>`;
}

function coachLogCard(exercise) {
  if (state.plan === 'pro') {
    const suggestion = state.selectedBodyPart === 'cardio'
      ? `上次完成 ${exercise.current}。今天先保持舒适节奏，结束后记录实际时长和距离。`
      : `上次完成 ${exercise.current}。先按上次重量开始，动作稳定后再考虑增加负荷。`;
    return `<section class="coach-inline"><div><span class="coach-monogram small">AI</span><b>教练建议</b><small>基于你的${exercise.name}记录</small></div><p>${suggestion}</p></section>`;
  }
  return `<button class="coach-inline locked" data-action="open-coach"><div><span class="coach-monogram small">AI</span><b>解锁实时动作建议</b><small>Track Pro</small></div><p>${state.selectedBodyPart === 'cardio' ? 'AI 会根据历史表现建议时长、距离和训练强度。' : 'AI 会根据历史表现建议重量、次数和休息时间。'}</p></button>`;
}

function coachCompletionCard() {
  if (state.plan === 'pro') {
    return `<button class="coach-feedback" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>AI 训练反馈</small><b>已记录本次训练</b><em>教练会根据实际完成情况调整下一次计划。</em></span><i>详细分析 ›</i></button>`;
  }
  return `<button class="coach-feedback locked" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>训练反馈已生成</small><b>升级 Track Pro 查看完整分析</b><em>包含训练容量、动作表现和下次调整建议。</em></span><i>解锁 ›</i></button>`;
}

function userIdentity(user, options = {}) {
  return `<button class="identity ${options.compact ? 'compact' : ''}" data-user="${options.clickable === false ? '' : 'alex'}"><span class="avatar">${user.initials}</span><span class="identity-copy"><b>${user.name}</b><small>${user.handle}</small><em>Lv.${user.level} <i></i> ${user.title}</em></span>${options.follow ? '<span class="follow">关注</span>' : ''}</button>`;
}

function renderHome() {
  // Keep the approved artwork unchanged; real buttons follow its four card bounds.
  const reference = `<section class="body-reference"><h3 class="visually-hidden">选择一个身体部位开始</h3><img src="assets/body-parts-reference.png" width="1438" height="1093" alt="" aria-hidden="true" draggable="false">${bodyParts.slice(0, 4).map((part) => `<button class="body-card reference-card" data-body-part="${part.id}" aria-label="训练${part.name}" aria-describedby="body-note-${part.id}"><span class="visually-hidden">${part.name}${part.recommended ? '，推荐' : ''}</span><span class="visually-hidden" id="body-note-${part.id}">${part.note}</span></button>`).join('')}</section>`;
  const armsCore = `<section class="body-reference body-reference-extra" aria-label="手臂与核心训练"><img src="assets/body-parts-arms-core.png" width="1438" height="1094" alt="" aria-hidden="true" draggable="false">${bodyParts.slice(4, 6).map((part) => `<button class="body-card reference-card" data-body-part="${part.id}" aria-label="训练${part.name}" aria-describedby="body-note-${part.id}"><span class="visually-hidden">${part.name}</span><span class="visually-hidden" id="body-note-${part.id}">${part.note}</span></button>`).join('')}</section>`;
  return `${pageHeader('今天')}<div class="home-intro"><div><span>连续训练 16 天</span><h1>今天练什么？</h1></div><div class="streak-mark"><b>16</b><small>DAY</small></div></div>${dailyStrain()}${coachHomeCard()}<div class="section-title"><h2>今日训练</h2><span>${state.completedExercises.length} 个动作完成</span></div>${reference}${armsCore}<div class="body-grid">${bodyParts.slice(6).map((part) => `<button class="body-card " data-body-part="${part.id}" aria-label="训练${part.name}">${cardioTile()}<span class="body-copy"><b>${part.name}</b><small>${part.note}</small></span><span class="chevron">›</span></button>`).join('')}</div>`;
}

function renderExercise() {
  const part = bodyParts.find((item) => item.id === state.selectedBodyPart) || bodyParts[0];
  const list = exercises[part.id];
  return `${pageHeader(part.name, 'home', '<span class="header-count">' + list.length + ' 个动作</span>')}${dailyStrain()}<div class="section-title"><div><h2>${part.name}动作</h2><p>主要参与比例为原型示意值</p></div></div><div class="exercise-grid">${list.map((item) => { const [primaryId, percent] = muscleShares[item.id][0]; return `<button class="exercise-card ${item.recommended ? 'has-recommendation ' : ''}${state.completedExercises.includes(item.id) ? 'is-complete' : ''}" data-exercise="${item.id}">${item.recommended ? `<span class="recommend-badge">${item.recommended}</span>` : ''}${exerciseIllustration(item)}<span class="exercise-copy"><b>${item.name}</b><small>上次 ${item.current}</small><em>主练 ${muscleName(primaryId)} <strong>${percent}%</strong></em></span><span class="exercise-state">${state.completedExercises.includes(item.id) ? '已完成' : '›'}</span></button>`; }).join('')}</div>${state.completedExercises.length ? '<button class="finish-day" data-action="finish-day">结束今日训练</button>' : ''}`;
}

function renderLog() {
  const list = exercises[state.selectedBodyPart] || [];
  const exercise = list.find((item) => item.id === state.selectedExercise) || list[0];
  if (!exercise) return pageHeader('动作未找到', 'home');
  const isCardio = state.selectedBodyPart === 'cardio';
  const summary = `<section class="exercise-summary">${exerciseIllustration(exercise)}<div><span>上次训练</span><b>${exercise.current}</b></div><div><span>个人记录</span><b>${exercise.pr}</b></div><button data-action="use-last">使用上次数据</button></section>`;
  const logger = isCardio
    ? `<div class="cardio-log"><label><span>时长 (分钟)</span><input type="number" min="0" step="1" inputmode="numeric" data-cardio-input="minutes" value="${state.cardioLog?.minutes ?? exercise.minutes}" aria-label="运动时长"></label><label><span>距离 (公里)</span><input type="number" min="0" step="0.1" inputmode="decimal" data-cardio-input="distance" value="${state.cardioLog?.distance ?? exercise.distance}" aria-label="运动距离"></label></div>`
    : `<div class="set-table"><div class="set-header"><span>组</span><span>重量 (kg)</span><span>次数</span><span>完成</span></div>${state.workout.sets.map((set, index) => `<div class="set-row ${set.completed ? 'done' : ''}"><b>${index + 1}</b><input value="${set.weight}" inputmode="decimal" enterkeyhint="done" data-set-input="${set.id}" data-field="weight" aria-label="第 ${index + 1} 组重量"><input value="${set.reps}" inputmode="numeric" enterkeyhint="done" data-set-input="${set.id}" data-field="reps" aria-label="第 ${index + 1} 组次数"><button class="set-check" data-set="${set.id}" aria-pressed="${set.completed}" aria-label="完成第 ${index + 1} 组">${set.completed ? '✓' : ''}</button></div>`).join('')}</div><button class="add-set" data-action="add-set"><span>＋</span> 添加一组 <small>复制上一组数据</small></button>`;
  return `${pageHeader(exercise.name, 'exercise', '<button class="text-button" data-action="more">更多</button>')}${dailyStrain()}${summary}${muscleShareCard(exercise)}${coachLogCard(exercise)}${logger}<div class="sticky-action"><button class="primary-button" data-action="save-exercise">保存动作</button></div>`;
}

function renderComplete() {
  const exercise = exercises[state.selectedBodyPart]?.find((item) => item.id === state.selectedExercise);
  return `<div class="completion-screen"><div class="completion-symbol"><span>✓</span></div><p class="completion-kicker">TODAY'S QUEST</p><h1>今日训练完成</h1><p>做得很好。你完成了今天的训练目标。</p><div class="reward-grid"><div><b>+320</b><span>XP</span></div><div><b>16</b><span>连续天数</span></div><div><b>100</b><span>DAILY STRAIN</span></div></div><section class="pr-reveal"><span>本次训练</span><div><b>${exercise?.name || '训练已记录'}</b><strong>${state.selectedBodyPart === 'cardio' ? `${state.cardioLog?.minutes || 0} 分钟` : '已完成'}</strong></div></section>${coachCompletionCard()}<div class="completion-actions"><button class="primary-button" data-action="continue-home">继续</button><button class="secondary-button" data-action="share">分享进度</button></div></div>`;
}

function radarChart() {
  const point = (index, radius) => {
    const angle = (-90 + index * 60) * Math.PI / 180;
    return `${(150 + Math.cos(angle) * radius).toFixed(1)},${(126 + Math.sin(angle) * radius).toFixed(1)}`;
  };
  const polygon = (radius) => levelBodyParts.map((_, index) => point(index, radius)).join(' ');
  const ability = levelBodyParts.map((part, index) => point(index, Math.min(86, 86 * part.level / 30))).join(' ');
  return `<svg class="radar" viewBox="0 0 300 254" role="group" aria-label="六个身体部位能力雷达图">${[86,64,42,20].map((radius) => `<polygon points="${polygon(radius)}" fill="none" stroke="currentColor"/>`).join('')}${levelBodyParts.map((_, index) => `<line x1="150" y1="126" x2="${point(index, 86).split(',')[0]}" y2="${point(index, 86).split(',')[1]}" stroke="currentColor"/>`).join('')}<polygon class="radar-fill" points="${ability}"/>${levelBodyParts.map((part, index) => { const [x, y] = point(index, 112).split(','); return `<g class="radar-label" data-body-level="${part.id}" tabindex="0" role="button" aria-label="查看${part.name}等级 ${part.level}"><rect x="${Number(x) - 24}" y="${Number(y) - 15}" width="48" height="40" fill="transparent"/><text x="${x}" y="${Number(y) - 3}" text-anchor="middle">${part.name}</text><text class="radar-value" x="${x}" y="${Number(y) + 12}" text-anchor="middle">${part.level}</text></g>`; }).join('')}</svg>`;
}

function renderLevel() {
  return `${pageHeader('能力概览')}<div class="dual-levels"><section class="level-panel body-level"><span>BODY LEVEL</span><p>身体等级</p><strong><small>Lv.</small>26</strong><em>根据身体部位能力计算</em></section><section class="level-panel xp-level"><span>EXPERIENCE</span><p>经验等级</p><strong><small>Lv.</small>27</strong><div class="progress-line"><span style="transform:scaleX(.69)"></span></div><em>12,450 / 18,000 XP</em></section></div><button class="current-title" data-page="titles"><span class="title-medal">MB</span><span><small>当前称号</small><b>Momentum Builder</b><em>完成 50 次训练</em></span><i>›</i></button><section class="radar-panel"><div class="section-title"><div><h2>身体能力</h2><p>点击部位查看力量详情</p></div></div>${radarChart()}</section><div class="level-parts">${levelBodyParts.map((part) => `<button data-body-level="${part.id}"><span>${part.name}</span><b>${part.level}</b></button>`).join('')}</div>`;
}

function historyDate(date) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(date));
}

function historyChart(entries, metric) {
  if (!entries.length) return '<div class="history-chart-empty">当前筛选下暂无趋势数据</div>';
  const byDate = new Map();
  for (const entry of [...entries].reverse()) {
    const day = entry.date.slice(0, 10);
    const value = metric === 'volume'
      ? entry.sets.reduce((total, set) => total + set.weight * set.reps, 0)
      : Math.max(...entry.sets.map((set) => set.weight));
    byDate.set(day, metric === 'volume' ? (byDate.get(day) || 0) + value : Math.max(byDate.get(day) || 0, value));
  }
  const points = [...byDate].sort(([a], [b]) => a.localeCompare(b));
  const values = points.map(([, value]) => value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const coordinates = points.map(([, value], index) => ({
    x: points.length === 1 ? 150 : 25 + index * 250 / (points.length - 1),
    y: max === min ? 82 : 132 - (value - min) * 100 / (max - min),
    value
  }));
  const line = coordinates.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return `<svg class="history-chart" viewBox="0 0 300 168" role="img" aria-label="${metric === 'volume' ? '总训练量' : '最大重量'}历史趋势，${points.length} 个日期"><line x1="25" x2="275" y1="32" y2="32"/><line x1="25" x2="275" y1="82" y2="82"/><line x1="25" x2="275" y1="132" y2="132"/>${coordinates.length > 1 ? `<polyline points="${line}"/>` : ''}${coordinates.map(({ x, y, value }, index) => `<circle cx="${x}" cy="${y}" r="4"><title>${historyDate(points[index][0])}：${Math.round(value)} kg</title></circle>`).join('')}<text x="25" y="157">${historyDate(points[0][0])}</text><text x="275" y="157" text-anchor="end">${historyDate(points.at(-1)[0])}</text></svg>`;
}

function renderHistory(part, list) {
  const filters = state.historyFilters;
  const entries = filterHistory([...sampleHistory, ...state.history], { ...filters, bodyPart: part.id });
  const summary = summarizeHistory(entries);
  const selected = (value, current) => value === current ? 'selected' : '';
  return `<section class="history-intro"><b>训练历史</b><p>示例记录用于体验筛选；新保存的动作会标为「本机记录」，并保存在此设备。</p></section>
    <section class="history-filters" aria-label="历史筛选">
      <div class="history-period" aria-label="时间范围">${[['30','近 30 天'],['90','近 90 天'],['all','全部']].map(([value, label]) => `<button data-history-period="${value}" class="${filters.period === value ? 'active' : ''}" aria-pressed="${filters.period === value}">${label}</button>`).join('')}</div>
      <div class="history-selects"><label>动作<select data-history-exercise><option value="all" ${selected('all', filters.exerciseId)}>全部动作</option>${list.map((item) => `<option value="${item.id}" ${selected(item.id, filters.exerciseId)}>${item.name}</option>`).join('')}</select></label><label>次数<select data-history-reps>${[['all','全部次数'],['1-5','1–5 次'],['6-8','6–8 次'],['9-12','9–12 次'],['13+','13 次以上']].map(([value, label]) => `<option value="${value}" ${selected(value, filters.reps)}>${label}</option>`).join('')}</select></label></div>
      <div class="history-weight"><span>重量范围 <small>kg</small></span><label><input type="number" min="0" step="0.5" placeholder="最低" value="${filters.minWeight}" data-history-weight="minWeight" aria-label="最低重量"></label><span>—</span><label><input type="number" min="0" step="0.5" placeholder="最高" value="${filters.maxWeight}" data-history-weight="maxWeight" aria-label="最高重量"></label><button data-action="history-reset">重置</button></div>
    </section>
    <div class="history-stats"><div><small>训练次数</small><b>${summary.sessions}</b></div><div><small>有效组数</small><b>${summary.sets}</b></div><div><small>训练量</small><b>${summary.volume.toLocaleString()} <i>kg</i></b></div></div>
    <section class="history-trend"><div class="history-section-head"><div><b>表现趋势</b><small>仅统计符合筛选的训练组</small></div><strong>${filters.metric === 'volume' ? `${summary.volume.toLocaleString()} kg` : `${summary.bestWeight} kg`}</strong></div><div class="history-metric">${[['weight','最大重量'],['volume','总训练量']].map(([value, label]) => `<button data-history-metric="${value}" class="${filters.metric === value ? 'active' : ''}" aria-pressed="${filters.metric === value}">${label}</button>`).join('')}</div>${historyChart(entries, filters.metric)}</section>
    <section class="history-entries"><div class="history-section-head"><div><b>训练记录</b><small>按日期由近到远</small></div><span>${entries.length} 次</span></div>${entries.length ? entries.map((entry) => { const exercise = list.find((item) => item.id === entry.exerciseId); return `<article class="history-entry"><div class="history-entry-top"><div><b>${exercise?.name || '训练动作'}</b><small>${historyDate(entry.date)} · ${entry.sets.length} 组</small></div><span class="${entry.source === 'sample' ? 'sample' : 'recorded'}">${entry.source === 'sample' ? '示例记录' : '本机记录'}</span></div><div class="history-set-list">${entry.sets.map((set, index) => `<span>第 ${index + 1} 组 <b>${set.weight} kg × ${set.reps}</b></span>`).join('')}</div></article>`; }).join('') : '<div class="history-empty">没有符合条件的训练组。试试放宽次数、重量或时间范围。</div>'}</section>`;
}

function renderMuscleRecords(list) {
  return `<section class="history-intro"><b>个人记录</b><p>各动作的最高表现。下方为原型预设 PR；新训练的重量可在历史中查看。</p></section><div class="strength-list">${list.map((item) => `<article class="strength-row">${exerciseIllustration(item)}<div class="strength-copy"><b>${item.name}</b><span>当前 Lv.${item.level}</span></div><div class="strength-values"><small>个人记录</small><b>${item.pr}</b></div></article>`).join('')}</div>`;
}

// Refresh only the results so typing never replaces the focused filter input.
function refreshHistoryResults() {
  const part = bodyParts.find((item) => item.id === state.selectedBodyPart);
  const content = document.createElement('div');
  content.innerHTML = renderHistory(part, exercises[part.id]);
  for (const selector of ['.history-stats', '.history-trend', '.history-entries']) {
    app.querySelector(selector)?.replaceWith(content.querySelector(selector));
  }
}

function renderMuscle() {
  const part = bodyParts.find((item) => item.id === state.selectedBodyPart) || bodyParts[0];
  const list = exercises[part.id];
  const current = `<div class="strength-list">${list.slice(0, 5).map((item) => `<article class="strength-row">${exerciseIllustration(item)}<div class="strength-copy"><b>${item.name}</b><span>Lv.${item.level}</span><div class="thin-progress"><i style="width:${Math.min(100, 42 + item.level * 1.6)}%"></i></div></div><div class="strength-values"><small>当前</small><b>${item.current}</b><small>PR ${item.pr}</small></div></article>`).join('')}</div>`;
  const content = state.activeMuscleTab === 'history' ? renderHistory(part, list) : state.activeMuscleTab === 'records' ? renderMuscleRecords(list) : current;
  return `${pageHeader(part.name + '等级', 'level')}<section class="muscle-heading"><div class="anatomy-mark">${bodyIcon(part.icon)}</div><div><span>当前能力</span><strong><small>Lv.</small>${part.level}</strong><p>根据可测量的力量表现计算</p></div></section><div class="segmented" role="tablist" aria-label="${part.name}详情">${[['current','当前'],['history','历史'],['records','个人记录']].map(([value, label]) => `<button role="tab" data-muscle-tab="${value}" class="${state.activeMuscleTab === value ? 'active' : ''}" aria-selected="${state.activeMuscleTab === value}">${label}</button>`).join('')}</div><div role="tabpanel">${content}</div>`;
}

function renderTitles() {
  return `${pageHeader('称号', 'level')}<section class="titles-heading"><p>Every Rep Tells a Story</p><h1>每一步，都值得被记住。</h1></section><div class="segmented"><button class="active">全部</button><button>已获得</button><button>未解锁</button></div><div class="titles-grid">${titles.map((item) => `<button class="title-card ${item.state}" data-title="${item.id}"><span>${item.icon}</span><b>${item.name}</b><small>${item.state === 'earned' ? '已获得' : item.requirement}</small><div class="thin-progress"><i style="width:${item.progress}%"></i></div></button>`).join('')}</div>`;
}

function renderTitleDetail() {
  const item = titles.find((title) => title.id === state.selectedTitle) || titles[0];
  return `${pageHeader('称号详情', 'titles')}<section class="title-detail"><div class="title-seal">${item.icon}</div><span>${item.state === 'earned' ? '已获得' : '未解锁'}</span><h1>${item.name}</h1><p>稳定积累训练成果，让每一次完成都推动你继续向前。</p><div class="requirement"><small>解锁条件</small><b>${item.requirement}</b><div class="progress-line"><span style="transform:scaleX(${item.progress / 100})"></span></div><em>${item.state === 'earned' ? `获得于 ${item.earnedDate}` : `当前进度 ${item.progress}%`}</em></div>${item.state === 'earned' ? '<button class="primary-button" data-action="set-title">设为当前称号</button>' : ''}</section>`;
}

function postCard(user, id, copy, metric) {
  const liked = state.likedPosts.includes(id);
  return `<article class="post-card">${userIdentity(user)}<p class="post-copy">${copy}</p><div class="post-media"><span>TRAINING RESULT</span><strong>${metric}</strong><small>Push Workout　1h 12m　8 exercises</small></div><div class="post-actions"><button data-like="${id}" aria-label="点赞" aria-pressed="${liked}" class="${liked ? 'active' : ''}">${liked ? '♥' : '♡'} ${liked ? 129 : 128}</button><button data-action="comments">○ 12</button><button data-action="share">↗ 分享</button></div></article>`;
}

function renderSocial() {
  return `${pageHeader('动态')}<button class="social-search" data-page="search">⌕ <span>搜索训练、用户或话题</span></button><div class="feed-tabs"><button class="active">推荐</button><button>关注</button><button>附近</button></div>${postCard(users.alex, 1, '晨间训练完成。稳定的节奏，比偶尔的极限更重要。', '240 lbs × 6')}${postCard(users.sophie, 2, '第一次完成 80 kg 深蹲。下一个目标已经设好。', 'SQUAT PR　80 kg')}`;
}

function renderSearch() {
  return `${pageHeader('搜索', 'social')}<label class="search-field">⌕<input value="" placeholder="搜索训练、用户或话题" aria-label="搜索训练、用户或话题" enterkeyhint="search"></label><div class="section-title"><div><h2>最近搜索</h2></div><button class="text-button" data-action="clear-search">清除全部</button></div><div class="recent-list">${state.recentSearches.length ? state.recentSearches.map((term, index) => `<div class="recent-item"><button data-action="open-explore">${term}</button><button data-remove-search="${index}" aria-label="移除搜索 ${term}">×</button></div>`).join('') : '<p class="empty-note">暂无搜索记录</p>'}</div><div class="section-title"><div><h2>热门话题</h2><p>社区正在讨论</p></div></div><div class="topic-list">${['#PushDay','#Transformation','#Running','#HomeWorkout','#Nutrition','#Mobility'].map((topic, index) => `<button data-action="open-explore"><b>${topic}</b><span>${[12.4,8.7,21.1,9.3,6.8,4.4][index]}K 动态</span><i>›</i></button>`).join('')}</div>`;
}

function renderExplore() {
  return `${pageHeader('发现', 'search')}<label class="search-field">⌕<input value="Push Day" aria-label="搜索结果" enterkeyhint="search"></label><div class="segmented"><button class="active">动态</button><button>用户</button><button>话题</button><button>训练</button></div><div class="explore-grid">${[users.alex,users.sophie,users.marcus,users.alex].map((user,index) => `<article><button class="explore-media" data-user="alex"><span>${['240 lbs × 6','LEG DAY','5K 22:18','PUSH PR'][index]}</span></button>${userIdentity(user,{compact:true})}<p>${['稳定完成，比冲动开始更难得。','新一周，从腿部训练开始。','今天比上周快了 38 秒。','卧推重量再次刷新。'][index]}</p><small>♥ ${[128,301,214,276][index]}</small></article>`).join('')}</div>`;
}

function renderPublicProfile() {
  return `${pageHeader('公开主页', 'social', '<button class="text-button">分享</button>')}<section class="public-profile"><div class="cover-text">PROGRESS OVER PROMISES</div><div class="public-profile-row"><span class="avatar large-avatar">AC</span><div><h1>Alex Chen</h1><p>@alexchen.fit</p><span>Lv.24 <i></i> Momentum Builder</span></div><button class="follow solid">关注</button></div><p class="bio">打造更强壮、更健康的自己。训练，记录，继续向前。</p></section><div class="public-stats"><div><b>156</b><span>动态</span></div><div><b>12.4K</b><span>粉丝</span></div><div><b>438</b><span>关注</span></div><div><b>28</b><span>PR</span></div></div><div class="fitness-highlights"><div><span>身体等级</span><b>26</b></div><div><span>经验等级</span><b>27</b></div><div><span>连续训练</span><b>16 天</b></div></div><div class="section-title"><div><h2>代表成绩</h2></div></div><div class="pr-list"><div><span>卧推</span><b>100 kg</b></div><div><span>深蹲</span><b>140 kg</b></div><div><span>硬拉</span><b>180 kg</b></div></div><div class="feed-tabs"><button class="active">动态</button><button>训练</button><button>被标记</button></div>`;
}

function renderProfile() {
  return `${pageHeader('我的', null, '<button class="icon-button" data-page="settings" aria-label="设置">⚙</button>')}<section class="self-profile"><div class="self-profile-row"><span class="avatar large-avatar">AC</span><div><h1>Alex Chen</h1><p>@alexchen.fit</p><span>Momentum Builder</span></div><button class="edit-button">编辑资料</button></div><p>训练是长期选择。记录让每一步都看得见。</p></section><div class="dual-levels compact-levels"><button class="level-panel body-level" data-page="level"><span>BODY LEVEL</span><p>身体等级</p><strong><small>Lv.</small>26</strong></button><button class="level-panel xp-level" data-page="level"><span>EXPERIENCE</span><p>经验等级</p><strong><small>Lv.</small>27</strong></button></div><button class="streak-card"><span>连续训练</span><b>42 <small>天</small></b><i>本周 5 / 5</i></button><div class="lifetime-stats"><div><span>总训练</span><b>156</b><small>次</small></div><div><span>总时长</span><b>124</b><small>小时</small></div><div><span>总训练量</span><b>12.4</b><small>吨</small></div></div><div class="section-title"><div><h2>快速入口</h2></div></div><div class="quick-actions"><button data-page="achievements"><span>PR</span><b>个人记录</b></button><button data-page="achievements"><span>AW</span><b>成就</b></button><button data-page="stats"><span>ST</span><b>训练统计</b></button><button data-action="open-coach" class="${state.plan === 'pro' ? 'coach-action' : ''}"><span>AI</span><b>${state.plan === 'pro' ? 'AI 私人教练' : '解锁 AI 私教'}</b></button></div>`;
}

function renderStats() {
  const heights = [28,45,66,88,54,72,35];
  return `${pageHeader('训练统计', 'profile')}<div class="segmented"><button class="active">总览</button><button>历史</button><button>分析</button></div><button class="period-filter">本周 <span>⌄</span></button><div class="metric-grid"><div><span>训练次数</span><b>5</b><small>比上周 +25%</small></div><div><span>总训练量</span><b>8,420 <i>kg</i></b><small>比上周 +12%</small></div><div><span>总时长</span><b>6h 32m</b><small>比上周 +18%</small></div></div><section class="chart-section"><div class="section-title"><div><h2>训练容量</h2></div><b>8,420 kg</b></div><div class="bar-chart">${heights.map((height,index) => `<div><span style="height:${height}%"></span><small>${['一','二','三','四','五','六','日'][index]}</small></div>`).join('')}</div></section><section class="distribution"><div class="section-title"><div><h2>身体部位分布</h2></div></div><div class="donut"><b>27<small>组</small></b></div><div class="legend">${[['胸部','22%'],['背部','20%'],['腿部','18%'],['肩部','16%'],['手臂','14%'],['核心','10%']].map((item,index) => `<p><i class="tone-${index}"></i><span>${item[0]}</span><b>${item[1]}</b></p>`).join('')}</div></section>`;
}

function renderAchievements() {
  return `${pageHeader('成就与记录', 'profile')}<div class="segmented"><button class="active">成就</button><button data-page="titles">称号</button><button>个人记录</button></div><div class="achievement-list">${[['FW','第一次训练','2026.03.08','earned'],['7D','连续训练 7 天','2026.04.21','earned'],['100','完成 100 次训练','2026.08.17','earned'],['10K','单次训练量 10K','完成度 84%','locked']].map((item) => `<article class="${item[3]}"><span>${item[0]}</span><div><b>${item[1]}</b><small>${item[2]}</small></div><i>${item[3] === 'earned' ? '✓' : '锁定'}</i></article>`).join('')}</div>`;
}

function renderSettings() {
  const group = (title, items) => `<section class="settings-group"><h2>${title}</h2>${items.map((item) => `<button><span>${item[0]}</span><small>${item[1] || ''}</small><i>›</i></button>`).join('')}</section>`;
  return `${pageHeader('设置', 'profile')}${group('账户', [['编辑资料'],['邮箱','alexchen24@gmail.com'],['密码']])}${group('偏好设置', [['通知'],['隐私'],['已连接设备','2 台'],['目标'],['单位与测量','kg, km']])}${group('支持', [['帮助与支持'],['关于 Track'],['退出登录']])}<button class="pro-strip" data-action="open-coach"><span>${state.plan === 'pro' ? 'AI' : 'PRO'}</span><div><b>${state.plan === 'pro' ? 'AI 私人教练' : 'Track Pro'}</b><small>${state.plan === 'pro' ? '管理目标、计划和教练偏好' : '用 AI 私教指导每一次训练'}</small></div><i>›</i></button>`;
}

function renderSubscription() {
  return `${pageHeader('Track Pro', 'profile')}<section class="subscription-hero"><span>YOUR AI COACH</span><h1>每一次训练，都有教练在场。</h1><p>Track Pro 的核心只有一个：根据你的真实表现，持续调整训练。</p></section><div class="coach-proof"><span class="coach-monogram large">AI</span><div><small>明天的建议</small><b>降低肩推强度，胸部训练容量增加 6%</b></div></div><div class="benefit-list">${[['01','每天生成训练','根据目标、恢复和时间安排今日计划'],['02','训练中实时建议','推荐重量、次数、组数与休息时间'],['03','完成后自动反馈','分析表现并调整下一次训练'],['04','随时询问教练','理解动作、疼痛风险和计划变化']].map((item) => `<article><span>${item[0]}</span><div><b>${item[1]}</b><p>${item[2]}</p></div></article>`).join('')}</div><div class="plan-card"><span>TRACK PRO 年度方案</span><b>¥298 <small>/ 年</small></b><p>你的 AI 私人教练，相当于每月 ¥24.8</p><button class="primary-button" data-action="upgrade">在原型中体验 Track Pro</button></div>`;
}

function renderCoach() {
  return `${pageHeader('AI 私人教练', 'home', '<span class="pro-status">PRO ACTIVE</span>')}
    <section class="coach-welcome"><span class="coach-monogram large">AI</span><div><small>早上好，Alex</small><h1>今天状态不错，继续推进。</h1><p>根据最近 7 天训练和恢复情况生成。</p></div></section>
    <div class="segmented coach-tabs"><button class="active">今天</button><button>本周计划</button><button>反馈</button><button>问教练</button></div>
    <section class="coach-readiness"><div><span>今日准备度</span><b>82</b></div><div><span>建议强度</span><b>中等</b></div><div><span>预计时长</span><b>45 分</b></div></section>
    <div class="section-title"><div><h2>今日训练计划</h2><p>胸部和肱三头肌</p></div><button class="text-button">调整计划</button></div>
    <div class="coach-plan">${[['01','杠铃卧推','72.5 kg','3 × 6'],['02','上斜哑铃卧推','32.5 kg','3 × 8'],['03','绳索夹胸','28 kg','3 × 12']].map((item) => `<article><span>${item[0]}</span><div><b>${item[1]}</b><small>${item[2]}</small></div><strong>${item[3]}</strong></article>`).join('')}</div>
    <section class="coach-note"><span>教练说明</span><p>你过去两次卧推都完成了目标次数，今天小幅增加重量。肩部恢复一般，所以不安排肩推。</p></section>
    <button class="primary-button" data-body-part="chest">开始教练计划</button>
    <section class="ask-coach"><div><span class="coach-monogram small">AI</span><b>问教练</b></div><div class="coach-prompts"><button data-action="coach-answer">为什么今天加重量？</button><button data-action="coach-answer">肩膀不舒服怎么办？</button></div><label><input placeholder="输入你的问题" aria-label="向教练提问" enterkeyhint="send"><button data-action="coach-answer">发送</button></label></section>`;
}

const views = { home: renderHome, exercise: renderExercise, log: renderLog, complete: renderComplete, coach: renderCoach, level: renderLevel, muscle: renderMuscle, titles: renderTitles, 'title-detail': renderTitleDetail, social: renderSocial, search: renderSearch, explore: renderExplore, 'public-profile': renderPublicProfile, profile: renderProfile, stats: renderStats, achievements: renderAchievements, settings: renderSettings, subscription: renderSubscription };
const rootPages = { home: 'home', exercise: 'home', log: 'home', complete: 'home', coach: 'home', level: 'level', muscle: 'level', titles: 'level', 'title-detail': 'level', social: 'social', search: 'social', explore: 'social', 'public-profile': 'social', profile: 'profile', stats: 'profile', achievements: 'profile', settings: 'profile', subscription: 'profile' };
const hideNavPages = new Set(['log', 'complete', 'coach', 'title-detail', 'subscription']);

function render(preserveScroll = false) {
  const previousScroll = app.scrollTop;
  const previousPage = app.dataset.view;
  const focused = document.activeElement;
  const focusAttribute = app.contains(focused) && ['data-set-input', 'data-set', 'data-plan', 'data-muscle-tab', 'data-history-period', 'data-history-metric', 'data-history-exercise', 'data-history-reps', 'data-history-weight', 'data-like', 'data-action'].find((name) => focused.hasAttribute(name));
  const focusSelector = focusAttribute ? `[${focusAttribute}="${focused.getAttribute(focusAttribute)}"]${focused.dataset.field ? `[data-field="${focused.dataset.field}"]` : ''}` : null;
  app.innerHTML = prototypeSwitcher() + (views[state.page] || renderHome)();
  app.dataset.view = state.page;
  app.scrollTop = preserveScroll ? previousScroll : 0;
  const activeRoot = rootPages[state.page];
  document.querySelectorAll('.nav-item').forEach((button) => {
    const active = button.dataset.page === activeRoot;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const hideNav = hideNavPages.has(state.page);
  bottomNav.hidden = hideNav;
  app.classList.toggle('full-height', hideNav);
  if (previousPage === state.page && focusSelector) app.querySelector(focusSelector)?.focus({ preventScroll: true });
  else if (keyboardInput) {
    const heading = app.querySelector('h1, .header-context');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }
}

function showToast(message) {
  toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.addEventListener('input', (event) => {
  const input = event.target.closest('[data-set-input]');
  if (input) updateSet(state, Number(input.dataset.setInput), input.dataset.field, input.value);
  const cardioInput = event.target.closest('[data-cardio-input]');
  if (cardioInput) state.cardioLog[cardioInput.dataset.cardioInput] = Math.max(0, Number(cardioInput.value) || 0);
  const historyWeight = event.target.closest('[data-history-weight]');
  if (historyWeight) {
    state.historyFilters[historyWeight.dataset.historyWeight] = historyWeight.value;
    refreshHistoryResults();
  }
});

document.addEventListener('change', (event) => {
  const exercise = event.target.closest('[data-history-exercise]');
  const reps = event.target.closest('[data-history-reps]');
  const weight = event.target.closest('[data-history-weight]');
  if (exercise) state.historyFilters.exerciseId = exercise.value;
  if (reps) state.historyFilters.reps = reps.value;
  if (weight) state.historyFilters[weight.dataset.historyWeight] = weight.value === '' ? '' : String(Math.max(0, Number(weight.value) || 0));
  if (weight) refreshHistoryResults();
  else if (exercise || reps) render(true);
});

document.addEventListener('keydown', (event) => {
  keyboardInput = true;
  frame.dataset.input = 'keyboard';
  const label = event.target.closest('.radar-label[data-body-level]');
  if (label && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
});

document.addEventListener('click', (event) => {
  const planTarget = event.target.closest('[data-plan]');
  if (planTarget) {
    setPlan(state, planTarget.dataset.plan);
    if (state.plan === 'free' && state.page === 'coach') navigate(state, 'home');
    render(app.dataset.view === state.page);
    showToast(state.plan === 'pro' ? '正在预览 Track Pro 体验' : '正在预览免费版体验');
    return;
  }
  const pageTarget = event.target.closest('[data-page]');
  if (pageTarget) { navigate(state, pageTarget.dataset.page); render(); return; }
  const bodyPart = event.target.closest('[data-body-part]');
  if (bodyPart) { navigate(state, 'exercise', { bodyPart: bodyPart.dataset.bodyPart }); render(); return; }
  const bodyLevel = event.target.closest('[data-body-level]');
  if (bodyLevel) {
    state.activeMuscleTab = 'current';
    state.historyFilters.exerciseId = 'all';
    state.historyFilters.reps = 'all';
    state.historyFilters.minWeight = '';
    state.historyFilters.maxWeight = '';
    navigate(state, 'muscle', { bodyPart: bodyLevel.dataset.bodyLevel }); render(); return;
  }
  const muscleTab = event.target.closest('[data-muscle-tab]');
  if (muscleTab) { state.activeMuscleTab = muscleTab.dataset.muscleTab; render(true); return; }
  const historyPeriod = event.target.closest('[data-history-period]');
  if (historyPeriod) { state.historyFilters.period = historyPeriod.dataset.historyPeriod; render(true); return; }
  const historyMetric = event.target.closest('[data-history-metric]');
  if (historyMetric) { state.historyFilters.metric = historyMetric.dataset.historyMetric; render(true); return; }
  const exercise = event.target.closest('[data-exercise]');
  if (exercise) {
    const selected = exercises[state.selectedBodyPart]?.find((item) => item.id === exercise.dataset.exercise);
    if (!selected) return;
    if (state.selectedExercise !== selected.id) {
      if (state.selectedBodyPart === 'cardio') state.cardioLog = { minutes: selected.minutes, distance: selected.distance };
      else state.workout.sets = [{ id: 1, weight: Number(selected.current) || 0, reps: 8, completed: false }];
    }
    navigate(state, 'log', { exerciseId: selected.id }); render(); return;
  }
  const setButton = event.target.closest('[data-set]');
  if (setButton) { toggleSet(state, Number(setButton.dataset.set)); render(true); return; }
  const like = event.target.closest('[data-like]');
  if (like) { const id = Number(like.dataset.like); state.likedPosts = state.likedPosts.includes(id) ? state.likedPosts.filter((item) => item !== id) : [...state.likedPosts, id]; render(true); return; }
  const title = event.target.closest('[data-title]');
  if (title) { state.selectedTitle = title.dataset.title; navigate(state, 'title-detail'); render(); return; }
  const user = event.target.closest('[data-user]');
  if (user?.dataset.user) { navigate(state, 'public-profile'); render(); return; }
  const removeSearch = event.target.closest('[data-remove-search]');
  if (removeSearch) { event.stopPropagation(); state.recentSearches.splice(Number(removeSearch.dataset.removeSearch), 1); render(); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'add-set') { addSet(state); render(true); }
  if (action === 'use-last') {
    const selected = exercises[state.selectedBodyPart]?.find((item) => item.id === state.selectedExercise);
    if (!selected) return;
    if (state.selectedBodyPart === 'cardio') state.cardioLog = { minutes: selected.minutes, distance: selected.distance };
    else { state.workout.sets[0].weight = Number(selected.current) || 0; state.workout.sets[0].reps = 8; }
    render(true); showToast('已填入上次训练数据');
  }
  if (action === 'save-exercise') { saveExercise(state); persistHistory(); render(); showToast('动作已保存，历史记录已更新'); }
  if (action === 'history-reset') { Object.assign(state.historyFilters, { period: '90', exerciseId: 'all', reps: 'all', minWeight: '', maxWeight: '', metric: 'weight' }); render(true); }
  if (action === 'finish-day') { state.dailyStrain = 100; navigate(state, 'complete'); render(); }
  if (action === 'continue-home') { state.dailyStrain = 32; state.completedExercises = []; state.workout.sets = [{ id: 1, weight: 70, reps: 8, completed: false }]; state.cardioLog = null; state.selectedExercise = 'bench-press'; navigate(state, 'home'); render(); }
  if (action === 'open-explore') { navigate(state, 'explore'); render(); }
  if (action === 'open-coach') { navigate(state, state.plan === 'pro' ? 'coach' : 'subscription'); render(); }
  if (action === 'clear-search') { state.recentSearches = []; render(); }
  if (action === 'notifications') showToast('没有新的训练提醒');
  if (action === 'comments') showToast('评论将在下一阶段接入');
  if (action === 'share') showToast('分享卡片已准备好');
  if (action === 'set-title') showToast('已设为当前称号');
  if (action === 'coach-answer') showToast('AI 教练正在结合你的训练记录回答');
  if (action === 'upgrade') { setPlan(state, 'pro'); navigate(state, 'coach'); render(); showToast('已切换到 Track Pro 原型'); }
});

function updateClock() {
  const now = new Date();
  document.querySelector('#clock').textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}
updateClock();
setInterval(updateClock, 30000);
render();
