const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const scriptPath = path.resolve(__dirname, '../scripts/build-locales.js');
const messagesPath = path.resolve(__dirname, '../locales/messages.js');

test('catalogs have matching keys and parameters', () => {
  assert.ok(fs.existsSync(scriptPath), 'locale compiler is not implemented');
  const {loadCatalogs, validateCatalogs} = require(scriptPath);
  const catalogs = loadCatalogs();
  assert.deepEqual(validateCatalogs(catalogs), []);
  assert.deepEqual(['home', 'level', 'social', 'profile'].map(id => catalogs.en[`nav.${id}`]),
    ['Home', 'Level', 'Community', 'Profile']);
  assert.equal(catalogs.en['exercise.bench-press.name'], 'Bench Press');
  assert.equal(catalogs['zh-CN']['exercise.bench-press.name'], '杠铃卧推');
  for (const id of ['chest','back','shoulders','legs','arms','abs','cardio']) assert.ok(catalogs.en[`body.${id}.name`]);
  assert.equal(Object.keys(catalogs.en).filter(key => /^exercise\..+\.name$/.test(key)).length, 39);
  for (const mutate of [
    c => delete c['zh-CN']['workout.save'],
    c => c['zh-CN']['workout.setCount'] = {one:'{sets} 组', other:'{sets} 组'},
    c => c.en['workout.save'] = '',
    c => delete c.en['workout.setCount'].other
  ]) {
    const bad = structuredClone(catalogs); mutate(bad);
    assert.ok(validateCatalogs(bad).length > 0);
  }
});

test('generation is deterministic and detects stale output', () => {
  assert.ok(fs.existsSync(scriptPath), 'locale compiler is not implemented');
  const {loadCatalogs, serializeMessages} = require(scriptPath);
  const catalogs = loadCatalogs();
  assert.equal(serializeMessages(catalogs), serializeMessages(catalogs));
  assert.deepEqual(require(messagesPath), catalogs);
  const browser = {};
  vm.runInNewContext(serializeMessages(catalogs), browser);
  assert.equal(browser.TrackMessages.en['nav.home'], 'Home');
  const before = fs.readFileSync(messagesPath, 'utf8');
  const result = spawnSync(process.execPath, [scriptPath, '--check'], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(messagesPath, 'utf8'), before);
  assert.notEqual(serializeMessages({...catalogs, en:{...catalogs.en, 'nav.home':'Changed'}}), before.replace(/\r\n/g,'\n'));
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'track-locale-test-'));
  try {
    fs.mkdirSync(path.join(fixture, 'scripts'));
    fs.mkdirSync(path.join(fixture, 'locales'));
    fs.copyFileSync(scriptPath, path.join(fixture, 'scripts/build-locales.js'));
    for (const locale of ['en','zh-CN']) fs.writeFileSync(path.join(fixture, `locales/${locale}.json`), JSON.stringify(catalogs[locale]));
    const stale = '// stale output';
    fs.writeFileSync(path.join(fixture, 'locales/messages.js'), stale);
    const check = spawnSync(process.execPath, [path.join(fixture, 'scripts/build-locales.js'), '--check'], {encoding:'utf8'});
    assert.equal(check.status, 1);
    assert.match(check.stderr, /stale/);
    assert.equal(fs.readFileSync(path.join(fixture, 'locales/messages.js'), 'utf8'), stale);
  } finally { fs.rmSync(fixture, {recursive:true, force:true}); }
});
