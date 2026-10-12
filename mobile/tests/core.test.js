const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadUI} = require('./helpers/load-ui.js');

const mobileRoot = path.resolve(__dirname, '..');
const corePath = path.join(mobileRoot, 'core.js');

test('each training area has its own usable exercise list', () => {
  const { bodyParts, exercises } = loadUI().run('({bodyParts,exercises})');
  const ids = [];

  for (const part of bodyParts) {
    const list = exercises[part.id];
    assert.ok(Array.isArray(list) && list.length >= 4, `${part.name} needs its own exercise list`);
    for (const exercise of list) {
      assert.ok(exercise.name && exercise.current && exercise.pr);
      ids.push(exercise.id);
    }
  }
  assert.equal(new Set(ids).size, ids.length, 'exercise ids must be unique');
  assert.ok(exercises.cardio.every((exercise) => exercise.minutes > 0 && exercise.distance > 0));
});

test('every exercise has a complete illustrative muscle distribution', () => {
  const { bodyParts, exercises, muscleShares } = loadUI().run('({bodyParts,exercises,muscleShares})');
  const muscleIds = new Set(bodyParts.filter((part) => part.id !== 'cardio').map((part) => part.id));

  for (const exercise of Object.values(exercises).flat()) {
    const shares = muscleShares[exercise.id];
    assert.ok(Array.isArray(shares) && shares.length >= 2, `${exercise.id} needs multiple muscle shares`);
    assert.equal(shares.reduce((sum, [, percent]) => sum + percent, 0), 100, `${exercise.id} must total 100%`);
    assert.ok(shares.every(([id, percent]) => muscleIds.has(id) && percent > 0), `${exercise.id} has an invalid muscle share`);
  }
});

test('every body part has a dedicated visual icon', () => {
  const appSource = fs.readFileSync(path.join(mobileRoot, 'app.js'), 'utf8');
  const iconIds = ['chest', 'back', 'shoulders', 'legs', 'arms', 'abs', 'cardio'];

  for (const iconId of iconIds) {
    assert.match(appSource, new RegExp(`icon: '${iconId}'`));
  }
  assert.match(appSource, /bodyIcon\(part\.icon\)/);
});

test('the product exposes exactly four primary navigation items', () => {
  const html = fs.readFileSync(path.join(mobileRoot, 'index.html'), 'utf8');
  const primaryNav = html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  const navItems = primaryNav.match(/class="nav-item/g) || [];

  assert.equal(navItems.length, 4);
  assert.doesNotMatch(primaryNav, /data-page="workout"/);
});

test('workout state starts with exactly one set', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define the workout state model');
  const { createInitialState } = require(corePath);
  const state = createInitialState();

  assert.equal(state.workout.sets.length, 1);
});

test('adding a set copies the previous set exactly', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define workout actions');
  const { createInitialState, addSet } = require(corePath);
  const state = createInitialState();
  state.workout.sets[0].weight = 72.5;
  state.workout.sets[0].reps = 6;

  addSet(state);

  assert.deepEqual(
    { weight: state.workout.sets[1].weight, reps: state.workout.sets[1].reps },
    { weight: 72.5, reps: 6 }
  );
  assert.notEqual(state.workout.sets[0].id, state.workout.sets[1].id);
});

test('editing a copied set does not mutate earlier sets', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define workout actions');
  const { createInitialState, addSet, updateSet } = require(corePath);
  const state = createInitialState();
  addSet(state);

  updateSet(state, state.workout.sets[1].id, 'weight', 77.5);

  assert.equal(state.workout.sets[0].weight, 70);
  assert.equal(state.workout.sets[1].weight, 77.5);
});

test('completing sets updates daily strain and it survives navigation', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define workout actions');
  const { createInitialState, toggleSet, navigate } = require(corePath);
  const state = createInitialState();

  toggleSet(state, state.workout.sets[0].id);
  const strainAfterSet = state.dailyStrain;
  navigate(state, 'exercise', { bodyPart: 'chest' });

  assert.ok(strainAfterSet > 0);
  assert.equal(state.dailyStrain, strainAfterSet);
});

test('saving an exercise marks it complete and returns to its unified exercise list', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define workout actions');
  const { createInitialState, saveExercise } = require(corePath);
  const state = createInitialState();

  saveExercise(state);

  assert.equal(state.page, 'exercise');
  assert.equal(state.selectedBodyPart, 'chest');
  assert.ok(state.completedExercises.includes('bench-press'));
});

test('saved sets become a dated muscle history entry', () => {
  const { createInitialState, saveExercise } = require(corePath);
  const state = createInitialState();
  state.workout.sets[0].weight = 75;
  state.workout.sets[0].reps = 6;

  saveExercise(state, '2026-09-30T12:00:00.000Z');

  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].bodyPart, 'chest');
  assert.equal(state.history[0].exerciseId, 'bench-press');
  assert.deepEqual(state.history[0].sets, [{ weight: 75, reps: 6 }]);
  assert.equal(state.history[0].date, '2026-09-30T12:00:00.000Z');
});

test('history filters apply body part, date, reps and weight to individual sets', () => {
  const { filterHistory, summarizeHistory } = require(corePath);
  const history = [
    { id: 'recent', bodyPart: 'chest', exerciseId: 'bench-press', date: '2026-09-25T12:00:00.000Z', sets: [{ weight: 75, reps: 6 }, { weight: 85, reps: 3 }] },
    { id: 'old', bodyPart: 'chest', exerciseId: 'bench-press', date: '2026-07-01T12:00:00.000Z', sets: [{ weight: 70, reps: 8 }] },
    { id: 'other', bodyPart: 'legs', exerciseId: 'barbell-squat', date: '2026-09-25T12:00:00.000Z', sets: [{ weight: 80, reps: 6 }] }
  ];

  const result = filterHistory(history, { bodyPart: 'chest', period: '30', reps: '6-8', minWeight: 70, maxWeight: 80 }, '2026-09-30T12:00:00.000Z');

  assert.equal(result.length, 1);
  assert.deepEqual(result[0].sets, [{ weight: 75, reps: 6 }]);
  assert.deepEqual(summarizeHistory(result), { sessions: 1, sets: 1, volume: 450, bestWeight: 75 });
});

test('comparison prototype starts in the free experience', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define subscription state');
  const { createInitialState } = require(corePath);
  const state = createInitialState();

  assert.equal(state.plan, 'free');
});

test('switching to Track Pro preserves workout progress', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define subscription actions');
  const { createInitialState, setPlan } = require(corePath);
  const state = createInitialState();
  state.dailyStrain = 64;
  state.completedExercises.push('bench-press');

  setPlan(state, 'pro');

  assert.equal(state.plan, 'pro');
  assert.equal(state.dailyStrain, 64);
  assert.deepEqual(state.completedExercises, ['bench-press']);
});

test('invalid subscription modes are ignored', () => {
  assert.ok(fs.existsSync(corePath), 'core.js must define subscription actions');
  const { createInitialState, setPlan } = require(corePath);
  const state = createInitialState();

  setPlan(state, 'enterprise');

  assert.equal(state.plan, 'free');
});
