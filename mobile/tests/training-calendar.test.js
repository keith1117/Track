const test = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {getTrainingCalendar, localDateKey} = require('../core.js');

test('calendar aligns Monday-first weeks and handles leap years', () => {
  const today = new Date(2026, 9, 13);
  const october = getTrainingCalendar([], '2026-10', today);
  assert.equal(october.offset, 3);
  assert.equal(october.days.length, 31);
  assert.equal(october.days[12].today, true);
  assert.equal(october.days[13].future, true);
  assert.equal(october.days[11].future, false);
  assert.equal(getTrainingCalendar([], '2024-02', today).days.length, 29);
  assert.equal(getTrainingCalendar([], '2025-02', today).days.length, 28);
  assert.equal(getTrainingCalendar([], '2026-02', today).offset, 6);
});

test('calendar counts real saved days once across strength and cardio and excludes samples', () => {
  const record = (day, source='recorded') => ({date:new Date(2026, 9, day, 12).toISOString(), source});
  const history = [record(1),record(1),{...record(2),bodyPart:'cardio',sets:[],minutes:30},record(3,'sample'),record(20),{date:'invalid'}];
  const before = JSON.stringify(history);
  const calendar = getTrainingCalendar(history, '2026-10', new Date(2026, 9, 13));
  assert.equal(calendar.trainedDays, 2);
  assert.deepEqual(calendar.days.filter(day=>day.trained).map(day=>day.date), ['2026-10-01','2026-10-02']);
  assert.equal(JSON.stringify(history), before);
  assert.equal(getTrainingCalendar(history, '2026-09', new Date(2026, 9, 13)).trainedDays, 0);
  assert.equal(localDateKey(new Date(2026, 0, 2)), '2026-01-02');
});

test('training dates use local days around midnight, month boundaries and DST', () => {
  const core = require.resolve('../core.js');
  for (const [timezone, expected] of [
    ['America/New_York',['2026-09-30','2026-03-08','2026-03-08']],
    ['Asia/Shanghai',['2026-10-01','2026-03-08','2026-03-08']]
  ]) {
    const script = `const {localDateKey,getTrainingCalendar}=require(${JSON.stringify(core)});
      const dates=['2026-10-01T01:30:00Z','2026-03-08T06:30:00Z','2026-03-08T07:30:00Z'];
      const keys=dates.map(date=>localDateKey(new Date(date)));
      const calendar=getTrainingCalendar(dates.map(date=>({date})),keys[0].slice(0,7),new Date(2026,9,13));
      console.log(JSON.stringify({keys,trained:calendar.days.filter(day=>day.trained).map(day=>day.date)}));`;
    const result = spawnSync(process.execPath,['-e',script],{encoding:'utf8',env:{...process.env,TZ:timezone}});
    assert.equal(result.status,0,result.stderr);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(output.keys,expected);
    assert.deepEqual(output.trained,[expected[0]]);
  }
});
