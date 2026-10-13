const { createInitialState, navigate, addSet, updateSet, toggleSet, saveExercise, setPlan, filterHistory, summarizeHistory, localDateKey, getTrainingCalendar } = window.TrackCore;
const {getLevelAppearance,getExperienceProgress,rankBadgeSVG,SAMPLE_LEVEL_SUMMARY} = window.TrackLevelPresentation;
let localeStorage = null;
try { localeStorage = window.localStorage; } catch { /* Browser storage may be blocked. */ }
const i18n = window.TrackI18n.createI18n({messages:window.TrackMessages, config:window.TrackReleaseConfig,
  storage:localeStorage, browserLocales:navigator.languages || [], search:location.search});
const t = (key, params) => i18n.t(key, params);
const h = (key, params) => i18n.html(key, params);
const e = window.TrackI18n.escapeHTML;
const n = (value, options) => i18n.formatNumber(value, options);
function bodyPartName(id) { return t(`body.${id}.name`); }
function exerciseName(id) { return t(`exercise.${id}.name`); }
function formatExerciseMetric(metric) {
  return metric.kind === 'reps' ? t('metric.reps',{count:metric.value}) : t(`metric.${metric.kind}`,{value:metric.value});
}
function metricWeight(metric) { return ['weight','bodyweight'].includes(metric.kind) ? metric.value : 0; }

const state = createInitialState();
state.calendarMonth = localDateKey(new Date()).slice(0, 7);
state.selectedTitle = 'momentum-builder';
state.recentSearches = ['push day', 'marathon', '@alexchen.fit', 'home workout'];

const bodyParts = [
  { id: 'chest', nameKey: 'body.chest.name', icon: 'chest', mark: 'CH', level: 24, score: 78, recommended: true, noteKey: 'body.chest.note' },
  { id: 'back', nameKey: 'body.back.name', icon: 'back', mark: 'BK', level: 27, score: 72, noteKey: 'body.back.note' },
  { id: 'shoulders', nameKey: 'body.shoulders.name', icon: 'shoulders', mark: 'SH', level: 23, score: 68, noteKey: 'body.shoulders.note' },
  { id: 'legs', nameKey: 'body.legs.name', icon: 'legs', mark: 'LG', level: 25, score: 62, noteKey: 'body.legs.note' },
  { id: 'arms', nameKey: 'body.arms.name', icon: 'arms', mark: 'AR', level: 22, score: 55, noteKey: 'body.arms.note' },
  { id: 'abs', nameKey: 'body.abs.name', icon: 'abs', mark: 'CO', level: 20, score: 70, noteKey: 'body.abs.note' },
  { id: 'cardio', nameKey: 'body.cardio.name', icon: 'cardio', mark: 'CD', level: 18, score: 46, noteKey: 'body.cardio.note' }
];

const exercises = {
  chest: [
    { id: 'bench-press', nameKey: 'exercise.bench-press.name', mark: 'BP', level: 28, current: {kind: 'weight', value: 70}, pr: {kind: 'weight', value: 100}, recommendedKey: 'common.recommended' },
    { id: 'incline-dumbbell', nameKey: 'exercise.incline-dumbbell.name', mark: 'ID', level: 24, current: {kind: 'weight', value: 32.5}, pr: {kind: 'weight', value: 40}, recommendedKey: 'common.forYou' },
    { id: 'chest-press', nameKey: 'exercise.chest-press.name', mark: 'CP', level: 22, current: {kind: 'weight', value: 92}, pr: {kind: 'weight', value: 120} },
    { id: 'cable-fly', nameKey: 'exercise.cable-fly.name', mark: 'CF', level: 20, current: {kind: 'weight', value: 28}, pr: {kind: 'weight', value: 35}, recommendedKey: 'common.recommended' },
    { id: 'decline-bench', nameKey: 'exercise.decline-bench.name', mark: 'DB', level: 19, current: {kind: 'weight', value: 60}, pr: {kind: 'weight', value: 80} },
    { id: 'push-up', nameKey: 'exercise.push-up.name', mark: 'PU', level: 21, current: {kind: 'reps', value: 20}, pr: {kind: 'reps', value: 38} },
    { id: 'dips', nameKey: 'exercise.dips.name', mark: 'DP', level: 18, current: {kind: 'bodyweight', value: 5}, pr: {kind: 'bodyweight', value: 20} },
    { id: 'pec-deck', nameKey: 'exercise.pec-deck.name', mark: 'PF', level: 17, current: {kind: 'weight', value: 55}, pr: {kind: 'weight', value: 72} }
  ],
  back: [
    { id: 'lat-pulldown', nameKey: 'exercise.lat-pulldown.name', mark: 'LP', level: 28, current: {kind: 'weight', value: 70}, pr: {kind: 'weight', value: 100}, recommendedKey: 'common.recommended' },
    { id: 'seated-row', nameKey: 'exercise.seated-row.name', mark: 'SR', level: 26, current: {kind: 'weight', value: 68}, pr: {kind: 'weight', value: 92} },
    { id: 'barbell-row', nameKey: 'exercise.barbell-row.name', mark: 'BR', level: 25, current: {kind: 'weight', value: 72.5}, pr: {kind: 'weight', value: 95} },
    { id: 'pull-up', nameKey: 'exercise.pull-up.name', mark: 'PU', level: 24, current: {kind: 'bodyweight', value: 10}, pr: {kind: 'bodyweight', value: 30} },
    { id: 'straight-arm', nameKey: 'exercise.straight-arm.name', mark: 'SA', level: 19, current: {kind: 'weight', value: 30}, pr: {kind: 'weight', value: 42} }
  ],
  shoulders: [
    { id: 'overhead-press', nameKey: 'exercise.overhead-press.name', mark: 'OP', level: 25, current: {kind: 'weight', value: 40}, pr: {kind: 'weight', value: 55}, recommendedKey: 'common.recommended' },
    { id: 'dumbbell-press', nameKey: 'exercise.dumbbell-press.name', mark: 'DP', level: 23, current: {kind: 'weight', value: 20}, pr: {kind: 'weight', value: 28} },
    { id: 'lateral-raise', nameKey: 'exercise.lateral-raise.name', mark: 'LR', level: 22, current: {kind: 'weight', value: 10}, pr: {kind: 'weight', value: 16}, recommendedKey: 'common.forYou' },
    { id: 'reverse-fly', nameKey: 'exercise.reverse-fly.name', mark: 'RF', level: 20, current: {kind: 'weight', value: 24}, pr: {kind: 'weight', value: 36} },
    { id: 'face-pull', nameKey: 'exercise.face-pull.name', mark: 'FP', level: 19, current: {kind: 'weight', value: 22}, pr: {kind: 'weight', value: 32} }
  ],
  legs: [
    { id: 'barbell-squat', nameKey: 'exercise.barbell-squat.name', mark: 'SQ', level: 27, current: {kind: 'weight', value: 80}, pr: {kind: 'weight', value: 110}, recommendedKey: 'common.recommended' },
    { id: 'romanian-deadlift', nameKey: 'exercise.romanian-deadlift.name', mark: 'RD', level: 25, current: {kind: 'weight', value: 70}, pr: {kind: 'weight', value: 95} },
    { id: 'leg-press', nameKey: 'exercise.leg-press.name', mark: 'LP', level: 24, current: {kind: 'weight', value: 160}, pr: {kind: 'weight', value: 220} },
    { id: 'leg-extension', nameKey: 'exercise.leg-extension.name', mark: 'LE', level: 21, current: {kind: 'weight', value: 45}, pr: {kind: 'weight', value: 65} },
    { id: 'leg-curl', nameKey: 'exercise.leg-curl.name', mark: 'LC', level: 20, current: {kind: 'weight', value: 40}, pr: {kind: 'weight', value: 58} },
    { id: 'calf-raise', nameKey: 'exercise.calf-raise.name', mark: 'CR', level: 19, current: {kind: 'weight', value: 60}, pr: {kind: 'weight', value: 85} }
  ],
  arms: [
    { id: 'barbell-curl', nameKey: 'exercise.barbell-curl.name', mark: 'BC', level: 24, current: {kind: 'weight', value: 30}, pr: {kind: 'weight', value: 42.5}, recommendedKey: 'common.recommended' },
    { id: 'hammer-curl', nameKey: 'exercise.hammer-curl.name', mark: 'HC', level: 22, current: {kind: 'weight', value: 14}, pr: {kind: 'weight', value: 20} },
    { id: 'triceps-pushdown', nameKey: 'exercise.triceps-pushdown.name', mark: 'TP', level: 23, current: {kind: 'weight', value: 35}, pr: {kind: 'weight', value: 50} },
    { id: 'overhead-extension', nameKey: 'exercise.overhead-extension.name', mark: 'OE', level: 20, current: {kind: 'weight', value: 22}, pr: {kind: 'weight', value: 32} },
    { id: 'preacher-curl', nameKey: 'exercise.preacher-curl.name', mark: 'PC', level: 19, current: {kind: 'weight', value: 20}, pr: {kind: 'weight', value: 30} }
  ],
  abs: [
    { id: 'cable-crunch', nameKey: 'exercise.cable-crunch.name', mark: 'CC', level: 23, current: {kind: 'weight', value: 35}, pr: {kind: 'weight', value: 50}, recommendedKey: 'common.recommended' },
    { id: 'ab-crunch-machine', nameKey: 'exercise.ab-crunch-machine.name', mark: 'AC', level: 21, current: {kind: 'weight', value: 45}, pr: {kind: 'weight', value: 65} },
    { id: 'pallof-press', nameKey: 'exercise.pallof-press.name', mark: 'PP', level: 20, current: {kind: 'weight', value: 18}, pr: {kind: 'weight', value: 28} },
    { id: 'weighted-twist', nameKey: 'exercise.weighted-twist.name', mark: 'WT', level: 19, current: {kind: 'weight', value: 10}, pr: {kind: 'weight', value: 18} },
    { id: 'kettlebell-side-bend', nameKey: 'exercise.kettlebell-side-bend.name', mark: 'SB', level: 18, current: {kind: 'weight', value: 16}, pr: {kind: 'weight', value: 24} }
  ],
  cardio: [
    { id: 'treadmill-run', nameKey: 'exercise.treadmill-run.name', mark: 'RN', level: 22, current: {kind: 'duration', value: 30}, pr: {kind: 'duration', value: 45}, minutes: 30, distance: 5, recommendedKey: 'common.recommended' },
    { id: 'indoor-cycle', nameKey: 'exercise.indoor-cycle.name', mark: 'CY', level: 21, current: {kind: 'duration', value: 25}, pr: {kind: 'duration', value: 40}, minutes: 25, distance: 10 },
    { id: 'rowing-machine', nameKey: 'exercise.rowing-machine.name', mark: 'RW', level: 20, current: {kind: 'duration', value: 20}, pr: {kind: 'duration', value: 35}, minutes: 20, distance: 4 },
    { id: 'elliptical', nameKey: 'exercise.elliptical.name', mark: 'EL', level: 19, current: {kind: 'duration', value: 30}, pr: {kind: 'duration', value: 45}, minutes: 30, distance: 5 },
    { id: 'incline-walk', nameKey: 'exercise.incline-walk.name', mark: 'IW', level: 18, current: {kind: 'duration', value: 25}, pr: {kind: 'duration', value: 40}, minutes: 25, distance: 2.5 }
  ]
};

for (const part of bodyParts) Object.defineProperties(part, {
  name:{get:()=>t(part.nameKey)}, note:{get:()=>t(part.noteKey)}
});
for (const exercise of Object.values(exercises).flat()) Object.defineProperties(exercise, {
  name:{get:()=>t(exercise.nameKey)}, recommended:{get:()=>exercise.recommendedKey ? t(exercise.recommendedKey) : null}
});

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
      && typeof entry.date === 'string'
      && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(entry.date)
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
    const base = exercise.current.kind === 'bodyweight' ? 20 : exercise.current.value || 20;
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
  { id: 'momentum-builder', icon: 'MB', name: 'Momentum Builder', state: 'earned', requirementKey: 'titles.requirement.momentum-builder', progress: 100, earnedDate: '2026-09-14T12:00:00Z' },
  { id: 'rising-titan', icon: 'RT', name: 'Rising Titan', state: 'locked', requirementKey: 'titles.requirement.rising-titan', progress: 87 },
  { id: 'iron-back', icon: 'IB', name: 'Iron Back', state: 'locked', requirementKey: 'titles.requirement.iron-back', progress: 90 },
  { id: 'chest-warrior', icon: 'CW', name: 'Chest Warrior', state: 'locked', requirementKey: 'titles.requirement.chest-warrior', progress: 80 },
  { id: 'consistency-pro', icon: 'CP', name: 'Consistency Pro', state: 'locked', requirementKey: 'titles.requirement.consistency-pro', progress: 53 },
  { id: 'all-rounder', icon: 'AR', name: 'All-Rounder', state: 'locked', requirementKey: 'titles.requirement.all-rounder', progress: 72 }
];
for (const title of titles) Object.defineProperty(title,'requirement',{get:()=>t(title.requirementKey)});

const app = document.querySelector('#app-content');
const bottomNav = document.querySelector('.bottom-nav');
const toast = document.querySelector('#toast');
const frame = document.querySelector('.phone-frame');

function syncLocaleChrome() {
  document.documentElement.lang = i18n.getLocale();
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content',t('meta.description'));
  for (const [selector,key] of [['.app-shell','meta.app'],['.status-icons','meta.status'],['#app-content','meta.page'],['.bottom-nav','meta.nav']]) document.querySelector(selector)?.setAttribute('aria-label',t(key));
  document.querySelectorAll('.nav-item').forEach(button => {
    const label = t(`nav.${button.dataset.page}`);
    button.querySelector('span:last-child').textContent = label;
    button.setAttribute('aria-label',label);
  });
}
function renderLocaleSwitcher() {
  const locales = i18n.getAvailableLocales();
  if (locales.length < 2) return '';
  return `<div class="locale-switcher" aria-label="${h(window.TrackReleaseConfig.allowLocalePreview ? 'locale.preview':'locale.label')}"><span>${h('locale.label')}</span>${locales.map(locale=>`<button data-locale="${locale}" aria-pressed="${i18n.getLocale()===locale}">${locale==='en'?'English':'简体中文'}</button>`).join('')}</div>`;
}
function setAppLocale(locale) {
  if (!i18n.setLocale(locale)) return false;
  syncLocaleChrome();
  if (showToast.key) toast.textContent = t(showToast.key);
  render(true); return true;
}

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
  return bodyPartName(id);
}

function muscleShareCard(exercise) {
  const shares = muscleShares[exercise.id];
  return `<section class="muscle-share" aria-label="${h('muscles.aria',{exercise:exercise.name})}"><div class="muscle-share-heading"><b>${h('muscles.heading')}</b><small>${h('muscles.illustrative')}</small></div><div class="muscle-share-track" aria-hidden="true">${shares.map(([, percent], index) => `<span class="share-tone-${index}" style="width:${percent}%"></span>`).join('')}</div><div class="muscle-share-legend">${shares.map(([id, percent], index) => `<span><i class="share-tone-${index}"></i>${e(muscleName(id))} <b>${n(percent)}%</b></span>`).join('')}</div><p>${h('muscles.disclaimer')}</p></section>`;
}

function pageHeader(title, back, action) {
  return `<header class="page-header">${back ? `<button class="icon-button" data-page="${back}" aria-label="${h('common.back')}">${uiIcon('back')}</button>` : '<div class="wordmark">Track<span class="brand-dot">.</span></div>'}${back ? `<h1>${e(title)}</h1>` : `<div class="header-context">${e(title)}</div>`}${action || `<button class="icon-button" data-action="notifications" aria-label="${h('common.notifications')}"><span class="notification-dot"></span>${uiIcon('bell')}</button>`}</header>`;
}

function dailyStrain() {
  const percent = Math.min(100, Math.round(state.dailyStrain / state.dailyStrainTarget * 100));
  const remaining = Math.max(0, state.dailyStrainTarget - state.dailyStrain);
  return `<section class="strain" aria-label="${h('strain.label')}"><div class="strain-heading"><div><span>${h('strain.kicker')}</span><b>${h('strain.title')}</b></div><strong>${n(state.dailyStrain)}<small>/ ${n(state.dailyStrainTarget)}</small></strong></div><div class="progress-line"><span style="transform:scaleX(${percent / 100})"></span></div><p>${remaining ? h('strain.remaining',{remaining}) : h('strain.complete')}</p></section>`;
}

function prototypeSwitcher() {
  return `<div class="prototype-switcher" aria-label="${h('prototype.label')}">
    <span>${h('prototype.mode')}</span>
    <button class="${state.plan === 'free' ? 'active' : ''}" data-plan="free" aria-pressed="${state.plan === 'free'}">Free</button>
    <button class="${state.plan === 'pro' ? 'active pro' : ''}" data-plan="pro" aria-pressed="${state.plan === 'pro'}">Track Pro</button>
  </div>`;
}

function coachHomeCard() {
  if (state.plan === 'pro') {
    return `<button class="coach-card active" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>${h('coach.label')}</small><b>${h('coach.homeHeading')}</b><em>${h('coach.homeAdvice')}</em></span><i>${h('coach.viewPlan')}</i></button>`;
  }
  return `<button class="coach-card locked" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>${h('coach.label')}</small><b>${h('coach.lockedHeading')}</b><em>${h('coach.lockedAdvice')}</em></span><i>${h('coach.learnPro')}</i></button>`;
}

function coachLogCard(exercise) {
  if (state.plan === 'pro') {
    const suggestion = state.selectedBodyPart === 'cardio'
      ? h('coach.lastCardio',{metric:formatExerciseMetric(exercise.current)})
      : h('coach.lastStrength',{metric:formatExerciseMetric(exercise.current)});
    return `<section class="coach-inline"><div><span class="coach-monogram small">AI</span><b>${h('coach.advice')}</b><small>${h('coach.basedOn',{exercise:exercise.name})}</small></div><p>${suggestion}</p></section>`;
  }
  return `<button class="coach-inline locked" data-action="open-coach"><div><span class="coach-monogram small">AI</span><b>${h('coach.unlockAdvice')}</b><small>Track Pro</small></div><p>${h(state.selectedBodyPart === 'cardio' ? 'coach.cardioAdvice' : 'coach.strengthAdvice')}</p></button>`;
}

function coachCompletionCard() {
  if (state.plan === 'pro') {
    return `<button class="coach-feedback" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>${h('coach.feedback')}</small><b>${h('coach.recorded')}</b><em>${h('coach.adjustNext')}</em></span><i>${h('coach.analysis')}</i></button>`;
  }
  return `<button class="coach-feedback locked" data-action="open-coach"><span class="coach-monogram">AI</span><span><small>${h('coach.feedbackReady')}</small><b>${h('coach.unlockAnalysis')}</b><em>${h('coach.analysisIncludes')}</em></span><i>${h('coach.unlock')}</i></button>`;
}

function userIdentity(user, options = {}) {
  return `<button class="identity ${options.compact ? 'compact' : ''}" data-user="${options.clickable === false ? '' : 'alex'}"><span class="avatar">${user.initials}</span><span class="identity-copy"><b>${e(user.name)}</b><small>${e(user.handle)}</small><em>Lv.${user.level} <i></i> ${e(user.title)}</em></span>${options.follow ? `<span class="follow">${h('common.follow')}</span>` : ''}</button>`;
}

const bodyIllustrationCrops = window.TrackLevelArt.BODY_CROPS;
function bodyPartIllustration(id) {
  const crop = bodyIllustrationCrops[id];
  return `<span class="body-part-illustration" aria-hidden="true" style="aspect-ratio:${crop.width}/${crop.height}"><img src="${crop.source}" width="${crop.imageWidth}" height="${crop.imageHeight}" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" style="width:${crop.imageWidth/crop.width*100}%;left:${-crop.left/crop.width*100}%;top:${-crop.top/crop.height*100}%"></span>`;
}
function renderBodyPartCard(part) {
  return `<button class="body-card anatomy-card${part.recommended ? ' recommended' : ''}" data-body-part="${part.id}" aria-label="${h('body.train',{part:part.name})}" aria-describedby="body-note-${part.id}">${part.recommended ? `<span class="recommend-badge">${h('common.recommended')}</span>` : ''}${bodyPartIllustration(part.id)}<span class="body-copy"><b>${e(part.name)}</b><small id="body-note-${part.id}">${e(part.note)}</small></span><span class="chevron" aria-hidden="true">›</span></button>`;
}

function renderHome() {
  return `${pageHeader(t('common.today'))}<div class="home-intro"><div><span>${h('home.streak')}</span><h1>${h('home.heading')}</h1></div><div class="streak-mark"><b>16</b><small>${h('common.day')}</small></div></div>${dailyStrain()}${coachHomeCard()}<div class="section-title"><h2>${h('home.quest')}</h2><span>${h('home.completed',{count:state.completedExercises.length})}</span></div><h3 class="visually-hidden">${h('body.choose')}</h3><div class="body-grid">${bodyParts.slice(0,6).map(renderBodyPartCard).join('')}${bodyParts.slice(6).map((part) => `<button class="body-card " data-body-part="${part.id}" aria-label="${h('body.train',{part:part.name})}">${cardioTile()}<span class="body-copy"><b>${e(part.name)}</b><small>${e(part.note)}</small></span><span class="chevron" aria-hidden="true">›</span></button>`).join('')}</div>`;
}

function renderExercise() {
  const part = bodyParts.find((item) => item.id === state.selectedBodyPart) || bodyParts[0];
  const list = exercises[part.id];
  return `${pageHeader(part.name, state.exerciseReturnPage, '<span class="header-count">'+h('workout.count',{count:list.length})+'</span>')}${dailyStrain()}<div class="section-title"><div><h2>${h('workout.heading',{part:part.name})}</h2><p>${h('workout.illustrative')}</p></div></div><div class="exercise-grid">${list.map((item) => { const [primaryId, percent] = muscleShares[item.id][0]; return `<button class="exercise-card ${item.recommended ? 'has-recommendation ' : ''}${state.completedExercises.includes(item.id) ? 'is-complete' : ''}" data-exercise="${item.id}">${item.recommended ? `<span class="recommend-badge">${e(item.recommended)}</span>` : ''}${exerciseIllustration(item)}<span class="exercise-copy"><b>${e(item.name)}</b><small>${h('workout.last',{metric:formatExerciseMetric(item.current)})}</small><em>${h('workout.primary',{part:muscleName(primaryId)})} <strong>${n(percent)}%</strong></em></span><span class="exercise-state">${state.completedExercises.includes(item.id) ? h('common.done') : '›'}</span></button>`; }).join('')}</div>${state.completedExercises.length ? '<button class="finish-day" data-action="finish-day">'+h('workout.finish')+'</button>' : ''}`;
}

function renderLog() {
  const list = exercises[state.selectedBodyPart] || [];
  const exercise = list.find((item) => item.id === state.selectedExercise) || list[0];
  if (!exercise) return pageHeader(t('workout.notFound'), 'home');
  const isCardio = state.selectedBodyPart === 'cardio';
  const summary = `<section class="exercise-summary">${exerciseIllustration(exercise)}<div><span>${h('workout.previous')}</span><b>${e(formatExerciseMetric(exercise.current))}</b></div><div><span>${h('workout.pr')}</span><b>${e(formatExerciseMetric(exercise.pr))}</b></div><button data-action="use-last">${h('workout.useLast')}</button></section>`;
  const logger = isCardio
    ? `<div class="cardio-log"><label><span>${h('workout.duration')}</span><input type="number" min="0" step="1" inputmode="numeric" data-cardio-input="minutes" value="${state.cardioLog?.minutes ?? exercise.minutes}" aria-label="${h('workout.durationAria')}"></label><label><span>${h('workout.distance')}</span><input type="number" min="0" step="0.1" inputmode="decimal" data-cardio-input="distance" value="${state.cardioLog?.distance ?? exercise.distance}" aria-label="${h('workout.distanceAria')}"></label></div>`
    : `<div class="set-table"><div class="set-header"><span>${h('workout.set')}</span><span>${h('workout.weight')}</span><span>${h('workout.reps')}</span><span>${h('workout.complete')}</span></div>${state.workout.sets.map((set, index) => `<div class="set-row ${set.completed ? 'done' : ''}"><b>${n(index+1)}</b><input value="${set.weight}" inputmode="decimal" enterkeyhint="done" data-set-input="${set.id}" data-field="weight" aria-label="${h('workout.weightAria',{index:index+1})}"><input value="${set.reps}" inputmode="numeric" enterkeyhint="done" data-set-input="${set.id}" data-field="reps" aria-label="${h('workout.repsAria',{index:index+1})}"><button class="set-check" data-set="${set.id}" aria-pressed="${set.completed}" aria-label="${h('workout.completeAria',{index:index+1})}">${set.completed ? '✓' : ''}</button></div>`).join('')}</div><button class="add-set" data-action="add-set"><span>＋</span> ${h('workout.add')} <small>${h('workout.copy')}</small></button>`;
  return `${pageHeader(exercise.name, 'exercise', '<button class="text-button" data-action="more">'+h('common.more')+'</button>')}${dailyStrain()}${summary}${muscleShareCard(exercise)}${coachLogCard(exercise)}${logger}<div class="sticky-action"><button class="primary-button" data-action="save-exercise">${h('workout.save')}</button></div>`;
}

function renderComplete() {
  const exercise = exercises[state.selectedBodyPart]?.find((item) => item.id === state.selectedExercise);
  return `<div class="completion-screen"><div class="completion-symbol"><span>✓</span></div><p class="completion-kicker">${h('complete.kicker')}</p><h1>${h('complete.heading')}</h1><p>${h('complete.message')}</p><div class="reward-grid"><div><b>+320</b><span>XP</span></div><div><b>16</b><span>${h('complete.streak')}</span></div><div><b>100</b><span>${h('strain.kicker')}</span></div></div><section class="pr-reveal"><span>${h('complete.session')}</span><div><b>${e(exercise?.name || t('complete.recorded'))}</b><strong>${state.selectedBodyPart === 'cardio' ? h('metric.duration',{value:state.cardioLog?.minutes || 0}) : h('common.done')}</strong></div></section>${coachCompletionCard()}<div class="completion-actions"><button class="primary-button" data-action="continue-home">${h('common.continue')}</button><button class="secondary-button" data-action="share">${h('common.share')}</button></div></div>`;
}

function renderLevelAreaCard(part) {
  const appearance=getLevelAppearance(part.level);
  const label=appearance.level===null?t('level.notAssessed'):t('common.level',{level:n(appearance.level)});
  const value=appearance.level===null?e(label):`<small>${h('level.unit')}</small><span>${n(appearance.level)}</span>`;
  const art=part.id==='cardio'?cardioTile():`<span class="level-art" data-level-art="${part.id}" data-tone="${appearance.tone}" aria-hidden="true"></span>`;
  return `<button class="level-area${part.id==='cardio'?' level-cardio':''}" data-body-level="${part.id}" aria-label="${h('level.areaAria',{part:part.name,level:label})}">${art}<span class="level-area-copy"><span>${e(part.name)}</span><b class="${appearance.level===null?'unassessed':''}">${value}</b></span><span class="chevron" aria-hidden="true">›</span></button>`;
}

function renderLevel() {
  const {strengthRank,experience}=SAMPLE_LEVEL_SUMMARY;
  const progress=getExperienceProgress(experience.currentXP,experience.nextXP);
  return `${pageHeader(t('nav.level'))}<div class="level-overview"><div class="level-summaries"><section class="level-summary rank-summary" aria-label="${h('level.strengthRank')}"><h1>${h('level.strengthRank')}</h1><button class="rank-entry" data-page="rank" aria-label="${h('rank.viewAria',{rank:t(strengthRank.nameKey)})}">${rankBadgeSVG(strengthRank.badge)}<strong>${h(strengthRank.nameKey)}</strong><small class="level-sample">${h('level.sampleData')}</small><span>${h('rank.view')} <i aria-hidden="true">›</i></span></button></section><section class="level-summary experience-summary" aria-label="${h('level.experienceLevel')}"><h2>${h('level.experienceLevel')}</h2><strong><small>Lv.</small>${n(experience.level)}</strong><div class="progress-line" role="progressbar" aria-label="${h('level.experienceLevel')}" aria-valuemin="0" aria-valuemax="${experience.nextXP}" aria-valuenow="${experience.currentXP}"><span style="transform:scaleX(${progress.fraction})"></span></div><span class="level-xp">${n(experience.currentXP)} / ${n(experience.nextXP)} XP</span><button class="review-progress" data-page="progress">${h('level.reviewProgress')}<span aria-hidden="true">›</span></button></section></div><div class="level-area-grid">${bodyParts.map(renderLevelAreaCard).join('')}</div>${renderTrainingCalendar()}</div>`;
}

function renderTrainingCalendar() {
  const today = new Date();
  const calendar = getTrainingCalendar(state.history, state.calendarMonth, today);
  const monthLabel = i18n.formatDate(calendar.first, {year:'numeric', month:'long'});
  const days = calendar.days.map(day => {
    const status = t(day.future ? 'calendar.upcoming' : day.trained ? 'calendar.trained' : 'calendar.noRecord');
    const date = new Date(calendar.first.getFullYear(), calendar.first.getMonth(), day.day);
    const label = t('calendar.dayAria', {date:i18n.formatDate(date, {year:'numeric', month:'long', day:'numeric'}), status});
    return `<span role="listitem" data-training-date="${day.date}" class="calendar-day${day.trained ? ' trained' : ''}${day.today ? ' today' : ''}${day.future ? ' future' : ''}" aria-label="${e(label)}" title="${e(label)}"${day.today ? ' aria-current="date"' : ''}>${n(day.day)}<i aria-hidden="true">${day.trained ? '✓' : ''}</i></span>`;
  }).join('');
  return `<section class="training-calendar" aria-label="${h('calendar.heading')}"><div class="calendar-heading"><h2>${h('calendar.heading')}</h2><span>${h('calendar.count',{count:calendar.trainedDays})}</span></div><div class="calendar-month"><button class="icon-button" data-calendar-month="-1" aria-label="${h('calendar.previous')}">‹</button><strong aria-live="polite">${e(monthLabel)}</strong><button class="icon-button" data-calendar-month="1" aria-label="${h('calendar.next')}"${state.calendarMonth >= localDateKey(today).slice(0,7) ? ' disabled' : ''}>›</button></div><div class="calendar-weekdays" aria-hidden="true">${['mon','tue','wed','thu','fri','sat','sun'].map(day => `<span>${h(`calendar.${day}`)}</span>`).join('')}</div><div class="calendar-grid" role="list" aria-label="${e(monthLabel)}">${'<span aria-hidden="true"></span>'.repeat(calendar.offset)}${days}</div><p class="calendar-note"><i aria-hidden="true">✓</i>${h('calendar.savedCopy')}</p></section>`;
}

function renderRank() {
  const {strengthRank} = SAMPLE_LEVEL_SUMMARY;
  const references = ['bench-press','barbell-row','barbell-squat'].map(id => Object.values(exercises).flat().find(item => item.id === id));
  return `${pageHeader(t('level.strengthRank'),'level')}<section class="rank-detail"><span class="level-sample">${h('level.sampleData')}</span>${rankBadgeSVG(strengthRank.badge)}<h1>${h(strengthRank.nameKey)}</h1><p>${h('rank.subtitle')}</p></section><section class="rank-explanation"><h2>${h('rank.why',{rank:t(strengthRank.nameKey)})}</h2><p>${h('rank.sourceCopy',{rank:t(strengthRank.nameKey)})}</p><div class="rank-facts"><div><span>${h('rank.sourceLabel')}</span><b>${h('rank.sourceValue')}</b></div><div><span>${h('rank.assessmentLabel')}</span><b>${h('rank.assessmentValue')}</b></div></div></section><section class="rank-explanation"><h2>${h('rank.referenceHeading')}</h2><p>${h('rank.referenceCopy')}</p><div class="rank-records">${references.map(item => `<div><span>${e(item.name)}</span><b>${e(formatExerciseMetric(item.pr))}</b></div>`).join('')}</div></section><section class="rank-explanation"><h2>${h('rank.updateHeading')}</h2><p>${h('rank.updateCopy')}</p><p class="sample-note">${h('rank.xpCopy')}</p></section>`;
}

function renderProgress() {
  const {strengthRank,experience}=SAMPLE_LEVEL_SUMMARY;
  const progress=getExperienceProgress(experience.currentXP,experience.nextXP);
  const title=titles.find(item=>item.id==='momentum-builder');
  return `${pageHeader(t('progress.heading'),'level')}<section class="progress-detail"><span class="level-sample">${h('level.sampleData')}</span><h1>${h('level.experienceLevel')}</h1><strong class="progress-level">${h('common.level',{level:n(experience.level)})}</strong><div class="progress-line"><span style="transform:scaleX(${progress.fraction})"></span></div><p>${n(experience.currentXP)} / ${n(experience.nextXP)} XP</p><b>${h('progress.remaining',{xp:n(progress.remaining)})}</b></section><section class="progress-explanation"><h2>${h('progress.separateHeading')}</h2><p>${h('progress.separateCopy')}</p><div class="progress-rank">${rankBadgeSVG(strengthRank.badge)}<span><small>${h('level.strengthRank')}</small><b>${h(strengthRank.nameKey)}</b></span></div><p class="sample-note">${h('progress.sampleCopy')}</p></section><button class="current-title" data-page="titles"><span class="title-medal">${e(title.icon)}</span><span><small>${h('level.currentTitle')}</small><b>${e(title.name)}</b><em>${h('progress.titlesCopy')}</em></span><i aria-hidden="true">›</i></button>`;
}

function openExerciseList(bodyPart, origin='home') {
  if(!bodyParts.some(part=>part.id===bodyPart))return false;
  state.exerciseReturnPage=origin==='level'?'level':'home';
  navigate(state,'exercise',{bodyPart});return true;
}

function historyDate(date) {
  return i18n.formatDate(date, {month:'short', day:'numeric', ...(/^\d{4}-\d{2}-\d{2}$/.test(date) ? {timeZone:'UTC'} : {})});
}

function historyChart(entries, metric) {
  if (!entries.length) return `<div class="history-chart-empty">${h('history.emptyTrend')}</div>`;
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
  return `<svg class="history-chart" viewBox="0 0 300 168" role="img" aria-label="${h('history.trendAria',{metric:t(metric==='volume'?'history.totalVolume':'history.maxWeight'),count:points.length})}"><line x1="25" x2="275" y1="32" y2="32"/><line x1="25" x2="275" y1="82" y2="82"/><line x1="25" x2="275" y1="132" y2="132"/>${coordinates.length > 1 ? `<polyline points="${line}"/>` : ''}${coordinates.map(({ x, y, value }, index) => `<circle cx="${x}" cy="${y}" r="4"><title>${h('history.chartPoint',{date:historyDate(points[index][0]),value:Math.round(value)})}</title></circle>`).join('')}<text x="25" y="157">${historyDate(points[0][0])}</text><text x="275" y="157" text-anchor="end">${historyDate(points.at(-1)[0])}</text></svg>`;
}

function renderHistory(part, list) {
  const filters = state.historyFilters;
  const entries = filterHistory([...sampleHistory, ...state.history], { ...filters, bodyPart: part.id });
  const summary = summarizeHistory(entries);
  const selected = (value, current) => value === current ? 'selected' : '';
  return `<section class="history-intro"><b>${h('history.heading')}</b><p>${h('history.intro')}</p></section>
    <section class="history-filters" aria-label="${h('history.filters')}">
      <div class="history-period" aria-label="${h('history.period')}">${[['30',t('history.last30')],['90',t('history.last90')],['all',t('common.all')]].map(([value, label]) => `<button data-history-period="${value}" class="${filters.period === value ? 'active' : ''}" aria-pressed="${filters.period === value}">${label}</button>`).join('')}</div>
      <div class="history-selects"><label>${h('history.exercise')}<select data-history-exercise><option value="all" ${selected('all', filters.exerciseId)}>${h('history.allExercises')}</option>${list.map((item) => `<option value="${item.id}" ${selected(item.id, filters.exerciseId)}>${item.name}</option>`).join('')}</select></label><label>${h('workout.reps')}<select data-history-reps>${[['all',t('history.allReps')],['1-5',t('history.reps1')],['6-8',t('history.reps2')],['9-12',t('history.reps3')],['13+',t('history.reps4')]].map(([value, label]) => `<option value="${value}" ${selected(value, filters.reps)}>${label}</option>`).join('')}</select></label></div>
      <div class="history-weight"><span>${h('history.weightRange')}<small>kg</small></span><label><input type="number" min="0" step="0.5" placeholder="${h('history.min')}" value="${filters.minWeight}" data-history-weight="minWeight" aria-label="${h('history.minAria')}"></label><span>—</span><label><input type="number" min="0" step="0.5" placeholder="${h('history.max')}" value="${filters.maxWeight}" data-history-weight="maxWeight" aria-label="${h('history.maxAria')}"></label><button data-action="history-reset">${h('common.reset')}</button></div>
    </section>
    <div class="history-stats"><div><small>${h('history.sessions')}</small><b>${summary.sessions}</b></div><div><small>${h('history.sets')}</small><b>${summary.sets}</b></div><div><small>${h('history.volume')}</small><b>${n(summary.volume)} <i>kg</i></b></div></div>
    <section class="history-trend"><div class="history-section-head"><div><b>${h('history.trend')}</b><small>${h('history.matching')}</small></div><strong>${filters.metric === 'volume' ? `${n(summary.volume)} kg` : `${summary.bestWeight} kg`}</strong></div><div class="history-metric">${[['weight',t('history.maxWeight')],['volume',t('history.totalVolume')]].map(([value, label]) => `<button data-history-metric="${value}" class="${filters.metric === value ? 'active' : ''}" aria-pressed="${filters.metric === value}">${label}</button>`).join('')}</div>${historyChart(entries, filters.metric)}</section>
    <section class="history-entries"><div class="history-section-head"><div><b>${h('history.entries')}</b><small>${h('history.newest')}</small></div><span>${h('history.sessionCount',{count:entries.length})}</span></div>${entries.length ? entries.map((entry) => { const exercise = list.find((item) => item.id === entry.exerciseId); return `<article class="history-entry"><div class="history-entry-top"><div><b>${exercise?.name || t('history.genericExercise')}</b><small>${h('history.entrySummary',{date:historyDate(entry.date),count:entry.sets.length})}</small></div><span class="${entry.source === 'sample' ? 'sample' : 'recorded'}">${entry.source === 'sample' ? t('history.sample') : t('history.local')}</span></div><div class="history-set-list">${entry.sets.map((set, index) => `<span>${h('history.setLabel',{index:index+1})} <b>${set.weight} kg × ${set.reps}</b></span>`).join('')}</div></article>`; }).join('') : `<div class="history-empty">${h('history.empty')}</div>`}</section>`;
}

function renderMuscleRecords(list) {
  return `<section class="history-intro"><b>${h('common.records')}</b><p>${h('history.prIntro')}</p></section><div class="strength-list">${list.map((item) => `<article class="strength-row">${exerciseIllustration(item)}<div class="strength-copy"><b>${item.name}</b><span>${h('common.currentLevel',{level:item.level})}</span></div><div class="strength-values"><small>${h('common.records')}</small><b>${e(formatExerciseMetric(item.pr))}</b></div></article>`).join('')}</div>`;
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
  const current = `<div class="strength-list">${list.slice(0, 5).map((item) => `<article class="strength-row">${exerciseIllustration(item)}<div class="strength-copy"><b>${item.name}</b><span>Lv.${item.level}</span><div class="thin-progress"><i style="width:${Math.min(100, 42 + item.level * 1.6)}%"></i></div></div><div class="strength-values"><small>${h('common.current')}</small><b>${e(formatExerciseMetric(item.current))}</b><small>PR ${e(formatExerciseMetric(item.pr))}</small></div></article>`).join('')}</div>`;
  const content = state.activeMuscleTab === 'history' ? renderHistory(part, list) : state.activeMuscleTab === 'records' ? renderMuscleRecords(list) : current;
  return `${pageHeader(t('muscle.level',{part:part.name}), 'level')}<section class="muscle-heading"><div class="anatomy-mark">${bodyIcon(part.icon)}</div><div><span>${h('muscle.ability')}</span><strong><small>Lv.</small>${part.level}</strong><p>${h('muscle.source')}</p></div></section><div class="segmented" role="tablist" aria-label="${h('muscle.details',{part:part.name})}">${[['current',t('common.current')],['history',t('common.history')],['records',t('common.records')]].map(([value, label]) => `<button role="tab" data-muscle-tab="${value}" class="${state.activeMuscleTab === value ? 'active' : ''}" aria-selected="${state.activeMuscleTab === value}">${label}</button>`).join('')}</div><div role="tabpanel">${content}</div>`;
}

function renderTitles() {
  return `${pageHeader(t('common.titles'), 'level')}<section class="titles-heading"><p>${h('titles.kicker')}</p><h1>${h('titles.headline')}</h1></section><div class="segmented"><button class="active">${h('common.all')}</button><button>${h('common.earned')}</button><button>${h('common.locked')}</button></div><div class="titles-grid">${titles.map((item) => `<button class="title-card ${item.state}" data-title="${item.id}"><span>${item.icon}</span><b>${item.name}</b><small>${item.state === 'earned' ? t('common.earned') : item.requirement}</small><div class="thin-progress"><i style="width:${item.progress}%"></i></div></button>`).join('')}</div>`;
}

function renderTitleDetail() {
  const item = titles.find((title) => title.id === state.selectedTitle) || titles[0];
  return `${pageHeader(t('titles.detail'), 'titles')}<section class="title-detail"><div class="title-seal">${item.icon}</div><span>${item.state === 'earned' ? t('common.earned') : t('common.locked')}</span><h1>${item.name}</h1><p>${h('titles.description')}</p><div class="requirement"><small>${h('titles.unlockCondition')}</small><b>${item.requirement}</b><div class="progress-line"><span style="transform:scaleX(${item.progress / 100})"></span></div><em>${item.state === 'earned' ? h('titles.earnedDate',{date:i18n.formatDate(item.earnedDate)}) : h('titles.progress',{value:item.progress})}</em></div>${item.state === 'earned' ? `<button class="primary-button" data-action="set-title">${h('titles.setCurrent')}</button>` : ''}</section>`;
}

function postCard(user, id, copy, metric) {
  const liked = state.likedPosts.includes(id);
  return `<article class="post-card">${userIdentity(user)}<p class="post-copy">${e(copy)}</p><div class="post-media"><span>${h('social.mediaKicker')}</span><strong>${e(metric)}</strong><small>${h('social.workoutSummary')}</small></div><div class="post-actions"><button data-like="${id}" aria-label="${h('social.like')}" aria-pressed="${liked}" class="${liked ? 'active' : ''}">${liked ? '♥' : '♡'} ${liked ? 129 : 128}</button><button data-action="comments">○ 12</button><button data-action="share">${h('common.shareAction')}</button></div></article>`;
}

function renderSocial() {
  return `${pageHeader(t('common.posts'))}<button class="social-search" data-page="search">⌕ <span>${h('social.search')}</span></button><div class="feed-tabs"><button class="active">${h('social.recommended')}</button><button>${h('common.follow')}</button><button>${h('social.nearby')}</button></div>${postCard(users.alex, 1, t('social.alexCopy'), '240 lbs × 6')}${postCard(users.sophie, 2, t('social.sophieCopy'), 'SQUAT PR　80 kg')}`;
}

function renderSearch() {
  return `${pageHeader(t('search.heading'), 'social')}<label class="search-field">⌕<input value="" placeholder="${h('social.search')}" aria-label="${h('social.search')}" enterkeyhint="search"></label><div class="section-title"><div><h2>${h('search.recent')}</h2></div><button class="text-button" data-action="clear-search">${h('search.clear')}</button></div><div class="recent-list">${state.recentSearches.length ? state.recentSearches.map((term, index) => `<div class="recent-item"><button data-action="open-explore">${e(term)}</button><button data-remove-search="${index}" aria-label="${h('search.remove',{term})}">×</button></div>`).join('') : `<p class="empty-note">${h('search.empty')}</p>`}</div><div class="section-title"><div><h2>${h('search.trending')}</h2><p>${h('search.discussed')}</p></div></div><div class="topic-list">${['#PushDay','#Transformation','#Running','#HomeWorkout','#Nutrition','#Mobility'].map((topic, index) => `<button data-action="open-explore"><b>${topic}</b><span>${h('social.postCount',{count:[12.4,8.7,21.1,9.3,6.8,4.4][index]})}</span><i>›</i></button>`).join('')}</div>`;
}

function renderExplore() {
  return `${pageHeader(t('explore.heading'), 'search')}<label class="search-field">⌕<input value="Push Day" aria-label="${h('search.results')}" enterkeyhint="search"></label><div class="segmented"><button class="active">${h('common.posts')}</button><button>${h('common.users')}</button><button>${h('common.topics')}</button><button>${h('common.training')}</button></div><div class="explore-grid">${[users.alex,users.sophie,users.marcus,users.alex].map((user,index) => `<article><button class="explore-media" data-user="alex"><span>${['240 lbs × 6','LEG DAY','5K 22:18','PUSH PR'][index]}</span></button>${userIdentity(user,{compact:true})}<p>${[t('explore.copy0'),t('explore.copy1'),t('explore.copy2'),t('explore.copy3')][index]}</p><small>♥ ${[128,301,214,276][index]}</small></article>`).join('')}</div>`;
}

function renderPublicProfile() {
  return `${pageHeader(t('profile.public'), 'social', `<button class="text-button">${h('common.shareAction')}</button>`)}<section class="public-profile"><div class="cover-text">${h('profile.cover')}</div><div class="public-profile-row"><span class="avatar large-avatar">AC</span><div><h1>Alex Chen</h1><p>@alexchen.fit</p><span>Lv.24 <i></i> Momentum Builder</span></div><button class="follow solid">${h('common.follow')}</button></div><p class="bio">${h('profile.bio')}</p></section><div class="public-stats"><div><b>156</b><span>${h('common.posts')}</span></div><div><b>12.4K</b><span>${h('profile.followers')}</span></div><div><b>438</b><span>${h('profile.following')}</span></div><div><b>28</b><span>PR</span></div></div><div class="fitness-highlights"><div><span>${h('level.body')}</span><b>26</b></div><div><span>${h('level.experience')}</span><b>27</b></div><div><span>${h('profile.streak')}</span><b>${h('profile.streakValue')}</b></div></div><div class="section-title"><div><h2>${h('profile.highlights')}</h2></div></div><div class="pr-list"><div><span>${h('profile.bench')}</span><b>100 kg</b></div><div><span>${h('profile.squat')}</span><b>140 kg</b></div><div><span>${h('profile.deadlift')}</span><b>180 kg</b></div></div><div class="feed-tabs"><button class="active">${h('common.posts')}</button><button>${h('common.training')}</button><button>${h('profile.tagged')}</button></div>`;
}

function renderProfile() {
  return `${pageHeader(t('profile.heading'), null, `<button class="icon-button" data-page="settings" aria-label="${h('common.settings')}">⚙</button>`)}<section class="self-profile"><div class="self-profile-row"><span class="avatar large-avatar">AC</span><div><h1>Alex Chen</h1><p>@alexchen.fit</p><span>Momentum Builder</span></div><button class="edit-button">${h('common.editProfile')}</button></div><p>${h('profile.ownBio')}</p></section><div class="dual-levels compact-levels"><button class="level-panel body-level" data-page="level"><span>${h('level.bodyKicker')}</span><p>${h('level.body')}</p><strong><small>Lv.</small>26</strong></button><button class="level-panel xp-level" data-page="level"><span>${h('level.experienceKicker')}</span><p>${h('level.experience')}</p><strong><small>Lv.</small>27</strong></button></div><button class="streak-card"><span>${h('profile.streak')}</span><b>42 <small>${h('common.days')}</small></b><i>${h('profile.week')}</i></button><div class="lifetime-stats"><div><span>${h('profile.totalWorkouts')}</span><b>156</b><small>${h('common.sessions')}</small></div><div><span>${h('profile.duration')}</span><b>124</b><small>${h('common.hours')}</small></div><div><span>${h('history.totalVolume')}</span><b>12.4</b><small>${h('common.tonnes')}</small></div></div><div class="section-title"><div><h2>${h('profile.quick')}</h2></div></div><div class="quick-actions"><button data-page="achievements"><span>PR</span><b>${h('common.records')}</b></button><button data-page="achievements"><span>AW</span><b>${h('common.achievements')}</b></button><button data-page="stats"><span>ST</span><b>${h('profile.stats')}</b></button><button data-action="open-coach" class="${state.plan === 'pro' ? 'coach-action' : ''}"><span>AI</span><b>${state.plan === 'pro' ? t('profile.ai') : t('profile.unlockAI')}</b></button></div>`;
}

function renderStats() {
  const heights = [28,45,66,88,54,72,35];
  return `${pageHeader(t('profile.stats'), 'profile')}<div class="segmented"><button class="active">${h('common.overview')}</button><button>${h('common.history')}</button><button>${h('common.analysis')}</button></div><button class="period-filter">${h('stats.week')}<span>⌄</span></button><div class="metric-grid"><div><span>${h('history.sessions')}</span><b>5</b><small>${h('stats.change25')}</small></div><div><span>${h('history.totalVolume')}</span><b>8,420 <i>kg</i></b><small>${h('stats.change12')}</small></div><div><span>${h('profile.duration')}</span><b>6h 32m</b><small>${h('stats.change18')}</small></div></div><section class="chart-section"><div class="section-title"><div><h2>${h('stats.volume')}</h2></div><b>8,420 kg</b></div><div class="bar-chart">${heights.map((height,index) => `<div><span style="height:${height}%"></span><small>${[t('stats.mon'),t('stats.tue'),t('stats.wed'),t('stats.thu'),t('stats.fri'),t('stats.sat'),t('stats.sun')][index]}</small></div>`).join('')}</div></section><section class="distribution"><div class="section-title"><div><h2>${h('stats.distribution')}</h2></div></div><div class="donut"><b>27<small>${h('stats.sets')}</small></b></div><div class="legend">${[[t('body.chest.name'),'22%'],[t('body.back.name'),'20%'],[t('body.legs.name'),'18%'],[t('body.shoulders.name'),'16%'],[t('body.arms.name'),'14%'],[t('body.abs.name'),'10%']].map((item,index) => `<p><i class="tone-${index}"></i><span>${item[0]}</span><b>${item[1]}</b></p>`).join('')}</div></section>`;
}

function renderAchievements() {
  return `${pageHeader(t('achievements.heading'), 'profile')}<div class="segmented"><button class="active">${h('common.achievements')}</button><button data-page="titles">${h('common.titles')}</button><button>${h('common.records')}</button></div><div class="achievement-list">${[['FW',t('achievements.first'),'2026-03-08T12:00:00Z','earned'],['7D',t('achievements.streak'),'2026-04-21T12:00:00Z','earned'],['100',t('achievements.hundred'),'2026-08-17T12:00:00Z','earned'],['10K',t('achievements.volume'),t('achievements.progress'),'locked']].map((item) => `<article class="${item[3]}"><span>${item[0]}</span><div><b>${e(item[1])}</b><small>${item[3] === 'earned' ? e(i18n.formatDate(item[2])) : e(item[2])}</small></div><i>${item[3] === 'earned' ? '✓' : t('achievements.lock')}</i></article>`).join('')}</div>`;
}

function renderSettings() {
  const group = (title, items) => `<section class="settings-group"><h2>${title}</h2>${items.map((item) => `<button><span>${item[0]}</span><small>${item[1] || ''}</small><i>›</i></button>`).join('')}</section>`;
  return `${pageHeader(t('common.settings'), 'profile')}${group(t('settings.account'), [[t('common.editProfile')],[t('settings.email'),'alexchen24@gmail.com'],[t('settings.password')]])}${group(t('settings.preferences'), [[t('settings.notifications')],[t('settings.privacy')],[t('settings.devices'),t('settings.twoDevices')],[t('settings.goals')],[t('settings.units'),'kg, km']])}${group(t('settings.support'), [[t('settings.help')],[t('settings.about')],[t('settings.logout')]])}<button class="pro-strip" data-action="open-coach"><span>${state.plan === 'pro' ? 'AI' : 'PRO'}</span><div><b>${state.plan === 'pro' ? t('profile.ai') : 'Track Pro'}</b><small>${state.plan === 'pro' ? t('settings.coachPreferences') : t('settings.coachPitch')}</small></div><i>›</i></button>`;
}

function renderSubscription() {
  const region = window.TrackReleaseConfig.regions[window.TrackReleaseConfig.regionProfile];
  const price = region.annualPrice;
  return `${pageHeader('Track Pro', 'profile')}<section class="subscription-hero"><span>${h('subscription.kicker')}</span><h1>${h('subscription.heading')}</h1><p>${h('subscription.description')}</p></section><div class="coach-proof"><span class="coach-monogram large">AI</span><div><small>${h('subscription.tomorrow')}</small><b>${h('subscription.suggestion')}</b></div></div><div class="benefit-list">${[['01',t('subscription.benefit1'),t('subscription.detail1')],['02',t('subscription.benefit2'),t('subscription.detail2')],['03',t('subscription.benefit3'),t('subscription.detail3')],['04',t('subscription.benefit4'),t('subscription.detail4')]].map((item) => `<article><span>${item[0]}</span><div><b>${item[1]}</b><p>${item[2]}</p></div></article>`).join('')}</div><div class="plan-card"><span>${h('subscription.annual')}</span><b>${price ? h('subscription.prototypePrice',{price:i18n.formatPrice(price)}) : h('subscription.pending')}</b><p>${h('subscription.priceNote')}</p><button class="primary-button" data-action="upgrade">${h('subscription.experience')}</button></div>`;
}

function renderCoach() {
  return `${pageHeader(t('profile.ai'), 'home', '<span class="pro-status">'+h('coach.status')+'</span>')}
    <section class="coach-welcome"><span class="coach-monogram large">AI</span><div><small>${h('coach.greeting')}</small><h1>${h('coach.welcome')}</h1><p>${h('coach.source')}</p></div></section>
    <div class="segmented coach-tabs"><button class="active">${h('common.today')}</button><button>${h('coach.week')}</button><button>${h('coach.feedbackTab')}</button><button>${h('coach.ask')}</button></div>
    <section class="coach-readiness"><div><span>${h('coach.readiness')}</span><b>82</b></div><div><span>${h('coach.intensity')}</span><b>${h('coach.moderate')}</b></div><div><span>${h('coach.duration')}</span><b>${h('coach.durationValue')}</b></div></section>
    <div class="section-title"><div><h2>${h('coach.todayPlan')}</h2><p>${h('coach.focus')}</p></div><button class="text-button">${h('coach.adjust')}</button></div>
    <div class="coach-plan">${[['01',t('exercise.bench-press.name'),'72.5 kg','3 × 6'],['02',t('exercise.incline-dumbbell.name'),'32.5 kg','3 × 8'],['03',t('exercise.cable-fly.name'),'28 kg','3 × 12']].map((item) => `<article><span>${item[0]}</span><div><b>${item[1]}</b><small>${item[2]}</small></div><strong>${item[3]}</strong></article>`).join('')}</div>
    <section class="coach-note"><span>${h('coach.note')}</span><p>${h('coach.noteCopy')}</p></section>
    <button class="primary-button" data-body-part="chest">${h('coach.start')}</button>
    <section class="ask-coach"><div><span class="coach-monogram small">AI</span><b>${h('coach.ask')}</b></div><div class="coach-prompts"><button data-action="coach-answer">${h('coach.weightQuestion')}</button><button data-action="coach-answer">${h('coach.painQuestion')}</button></div><label><input placeholder="${h('coach.input')}" aria-label="${h('coach.inputAria')}" enterkeyhint="send"><button data-action="coach-answer">${h('coach.send')}</button></label></section>`;
}

const views = { home: renderHome, exercise: renderExercise, log: renderLog, complete: renderComplete, coach: renderCoach, level: renderLevel, rank: renderRank, progress: renderProgress, muscle: renderMuscle, titles: renderTitles, 'title-detail': renderTitleDetail, social: renderSocial, search: renderSearch, explore: renderExplore, 'public-profile': renderPublicProfile, profile: renderProfile, stats: renderStats, achievements: renderAchievements, settings: renderSettings, subscription: renderSubscription };
const rootPages = { home: 'home', exercise: 'home', log: 'home', complete: 'home', coach: 'home', level: 'level', rank:'level', progress:'level', muscle: 'level', titles: 'level', 'title-detail': 'level', social: 'social', search: 'social', explore: 'social', 'public-profile': 'social', profile: 'profile', stats: 'profile', achievements: 'profile', settings: 'profile', subscription: 'profile' };
const hideNavPages = new Set(['log', 'complete', 'coach', 'title-detail', 'subscription']);

function render(preserveScroll = false) {
  const previousScroll = app.scrollTop;
  const previousPage = app.dataset.view;
  const focused = document.activeElement;
  const focusAttribute = app.contains(focused) && ['data-set-input', 'data-cardio-input', 'data-locale', 'data-set', 'data-plan', 'data-calendar-month', 'data-muscle-tab', 'data-history-period', 'data-history-metric', 'data-history-exercise', 'data-history-reps', 'data-history-weight', 'data-like', 'data-action'].find((name) => focused.hasAttribute(name));
  const focusSelector = focusAttribute ? `[${focusAttribute}="${focused.getAttribute(focusAttribute)}"]${focused.dataset.field ? `[data-field="${focused.dataset.field}"]` : ''}` : null;
  app.innerHTML = renderLocaleSwitcher() + prototypeSwitcher() + (views[state.page] || renderHome)();
  app.dataset.view = state.page;
  app.scrollTop = preserveScroll ? previousScroll : 0;
  const activeRoot = state.page==='exercise'&&state.selectedBodyPart==='cardio'&&state.exerciseReturnPage==='level'?'level':rootPages[state.page];
  document.querySelectorAll('.nav-item').forEach((button) => {
    const active = button.dataset.page === activeRoot;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const hideNav = hideNavPages.has(state.page);
  bottomNav.hidden = hideNav;
  app.classList.toggle('full-height', hideNav);
  if(state.page==='level')void window.TrackLevelArt.hydrateLevelArt(app);
  if (previousPage === state.page && focusSelector) app.querySelector(focusSelector)?.focus({ preventScroll: true });
  else if (keyboardInput) {
    const heading = app.querySelector('h1, .header-context');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }
}

function showToast(key) {
  showToast.key = key;
  toast.textContent = t(key); toast.classList.add('show'); clearTimeout(showToast.timer);
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
});

document.addEventListener('click', (event) => {
  const localeTarget = event.target.closest('[data-locale]');
  if (localeTarget) { setAppLocale(localeTarget.dataset.locale); return; }
  const planTarget = event.target.closest('[data-plan]');
  if (planTarget) {
    setPlan(state, planTarget.dataset.plan);
    if (state.plan === 'free' && state.page === 'coach') navigate(state, 'home');
    render(app.dataset.view === state.page);
    showToast(state.plan === 'pro' ? 'toast.pro' : 'toast.free');
    return;
  }
  const pageTarget = event.target.closest('[data-page]');
  if (pageTarget) { navigate(state, pageTarget.dataset.page); render(); return; }
  const calendarMonth = event.target.closest('[data-calendar-month]');
  if (calendarMonth) {
    const offset = Number(calendarMonth.dataset.calendarMonth);
    if (![-1,1].includes(offset)) return;
    const [year, month] = state.calendarMonth.split('-').map(Number);
    const next = localDateKey(new Date(year, month - 1 + offset, 1)).slice(0,7);
    if (next > localDateKey(new Date()).slice(0,7)) return;
    state.calendarMonth = next; render(true); return;
  }
  const bodyPart = event.target.closest('[data-body-part]');
  if (bodyPart) { if(openExerciseList(bodyPart.dataset.bodyPart))render(); return; }
  const bodyLevel = event.target.closest('[data-body-level]');
  if (bodyLevel) {
    const id=bodyLevel.dataset.bodyLevel;
    if(!bodyParts.some(part=>part.id===id))return;
    if(id==='cardio'){openExerciseList(id,'level');render();return;}
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
      else state.workout.sets = [{ id: 1, weight: metricWeight(selected.current), reps: 8, completed: false }];
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
    else { state.workout.sets[0].weight = metricWeight(selected.current); state.workout.sets[0].reps = 8; }
    render(true); showToast('toast.useLast');
  }
  if (action === 'save-exercise') { saveExercise(state); persistHistory(); render(); showToast('toast.saved'); }
  if (action === 'history-reset') { Object.assign(state.historyFilters, { period: '90', exerciseId: 'all', reps: 'all', minWeight: '', maxWeight: '', metric: 'weight' }); render(true); }
  if (action === 'finish-day') { state.dailyStrain = 100; navigate(state, 'complete'); render(); }
  if (action === 'continue-home') { state.dailyStrain = 32; state.completedExercises = []; state.workout.sets = [{ id: 1, weight: 70, reps: 8, completed: false }]; state.cardioLog = null; state.selectedExercise = 'bench-press'; navigate(state, 'home'); render(); }
  if (action === 'open-explore') { navigate(state, 'explore'); render(); }
  if (action === 'open-coach') { navigate(state, state.plan === 'pro' ? 'coach' : 'subscription'); render(); }
  if (action === 'clear-search') { state.recentSearches = []; render(); }
  if (action === 'notifications') showToast('toast.notifications');
  if (action === 'comments') showToast('toast.comments');
  if (action === 'share') showToast('toast.share');
  if (action === 'set-title') showToast('toast.title');
  if (action === 'coach-answer') showToast('toast.coach');
  if (action === 'upgrade') { setPlan(state, 'pro'); navigate(state, 'coach'); render(); showToast('toast.upgrade'); }
});

function updateClock() {
  const now = new Date();
  document.querySelector('#clock').textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}
syncLocaleChrome();
updateClock();
setInterval(updateClock, 30000);
render();
