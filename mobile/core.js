(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TrackCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function createInitialState() {
    return {
      plan: 'free',
      page: 'home',
      previousPage: null,
      exerciseReturnPage: 'home',
      selectedBodyPart: 'chest',
      selectedExercise: 'bench-press',
      dailyStrain: 32,
      dailyStrainTarget: 100,
      completedExercises: [],
      activeLevelTab: 'overview',
      activeMuscleTab: 'current',
      historyFilters: { period: '90', exerciseId: 'all', reps: 'all', minWeight: '', maxWeight: '', metric: 'weight' },
      history: [],
      activeSocialTab: 'for-you',
      likedPosts: [],
      workout: {
        sets: [{ id: 1, weight: 70, reps: 8, completed: false }]
      }
    };
  }

  function navigate(state, page, detail) {
    state.previousPage = state.page;
    state.page = page;
    if (detail?.bodyPart) state.selectedBodyPart = detail.bodyPart;
    if (detail?.exerciseId) state.selectedExercise = detail.exerciseId;
    return state;
  }

  function addSet(state) {
    const previous = state.workout.sets[state.workout.sets.length - 1];
    const nextId = Math.max(0, ...state.workout.sets.map((set) => set.id)) + 1;
    state.workout.sets.push({
      id: nextId,
      weight: previous?.weight ?? 0,
      reps: previous?.reps ?? 0,
      completed: false
    });
    return state;
  }

  function updateSet(state, id, field, value) {
    const set = state.workout.sets.find((item) => item.id === id);
    if (!set || !['weight', 'reps'].includes(field)) return state;
    set[field] = Number(value);
    return state;
  }

  function toggleSet(state, id) {
    const set = state.workout.sets.find((item) => item.id === id);
    if (!set) return state;
    set.completed = !set.completed;
    state.dailyStrain = Math.max(
      0,
      Math.min(state.dailyStrainTarget, state.dailyStrain + (set.completed ? 8 : -8))
    );
    return state;
  }

  function saveExercise(state, timestamp = new Date().toISOString()) {
    const cardio = state.selectedBodyPart === 'cardio';
    state.history.push({
      id: `${state.selectedExercise}-${timestamp}-${state.history.length}`,
      bodyPart: state.selectedBodyPart,
      exerciseId: state.selectedExercise,
      date: timestamp,
      source: 'recorded',
      ...(cardio
        ? { minutes: Number(state.cardioLog?.minutes) || 0, distance: Number(state.cardioLog?.distance) || 0, sets: [] }
        : { sets: state.workout.sets.map(({ weight, reps }) => ({ weight: Number(weight) || 0, reps: Number(reps) || 0 })) })
    });
    if (!state.completedExercises.includes(state.selectedExercise)) {
      state.completedExercises.push(state.selectedExercise);
      state.dailyStrain = Math.min(state.dailyStrainTarget, state.dailyStrain + 12);
    }
    state.page = state.dailyStrain >= state.dailyStrainTarget ? 'complete' : 'exercise';
    return state;
  }

  function setPlan(state, plan) {
    if (!['free', 'pro'].includes(plan)) return state;
    state.plan = plan;
    return state;
  }

  function filterHistory(history, filters, now = new Date().toISOString()) {
    const periodDays = Number(filters.period);
    const cutoff = Number.isFinite(periodDays) && periodDays > 0
      ? new Date(now).getTime() - periodDays * 86400000
      : -Infinity;
    const minWeight = filters.minWeight === '' ? -Infinity : Number(filters.minWeight);
    const maxWeight = filters.maxWeight === '' ? Infinity : Number(filters.maxWeight);
    const repRanges = { '1-5': [1, 5], '6-8': [6, 8], '9-12': [9, 12], '13+': [13, Infinity] };
    const [minReps, maxReps] = repRanges[filters.reps] || [0, Infinity];

    return history.filter((entry) => entry.bodyPart === filters.bodyPart
      && (!filters.exerciseId || filters.exerciseId === 'all' || entry.exerciseId === filters.exerciseId)
      && new Date(entry.date).getTime() >= cutoff)
      .map((entry) => ({
        ...entry,
        sets: entry.sets.filter(({ weight, reps }) => weight >= minWeight && weight <= maxWeight && reps >= minReps && reps <= maxReps)
      }))
      .filter((entry) => entry.sets.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function summarizeHistory(history) {
    const sets = history.flatMap((entry) => entry.sets);
    return {
      sessions: history.length,
      sets: sets.length,
      volume: Math.round(sets.reduce((total, set) => total + set.weight * set.reps, 0)),
      bestWeight: Math.max(0, ...sets.map((set) => set.weight))
    };
  }

  return { createInitialState, navigate, addSet, updateSet, toggleSet, saveExercise, setPlan, filterHistory, summarizeHistory };
});
