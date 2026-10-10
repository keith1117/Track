const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
function loadUI() {
  const node = () => ({ innerHTML: '', textContent: '', scrollTop: 0, dataset: {}, classList: { toggle() {}, add() {}, remove() {} }, setAttribute() {}, removeAttribute() {}, contains: () => false, querySelector: () => null });
  const app = node();
  const nav = ['home', 'level', 'social', 'profile'].map((page) => ({ ...node(), dataset: { page } }));
  const nodes = { '#app-content': app, '.bottom-nav': node(), '#toast': node(), '#clock': node(), '.phone-frame': node() };
  const handlers = {};
  const context = vm.createContext({ window: { TrackCore: require('../core.js') }, document: { activeElement: null, createElement: node, querySelector: (s) => nodes[s], querySelectorAll: (s) => s === '.nav-item' ? nav : [], addEventListener(type, handler) { (handlers[type] ||= []).push(handler); } }, localStorage: { getItem: () => null, setItem() {} }, setInterval() {}, setTimeout() {}, clearTimeout() {}, Intl, Date });
  vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
  return { context, app, nodes, handlers };
}

test('all existing screens render in both Free and Pro states', () => {
  const { context } = loadUI();
  const pages = vm.runInContext('Object.keys(views)', context);
  assert.equal(pages.length, 18);
  for (const plan of ['free', 'pro']) {
    for (const page of pages) {
      const html = vm.runInContext(`state.plan = '${plan}'; state.page = '${page}'; views[state.page]()`, context);
      assert.ok(html.length > 100, `${page} (${plan}) has content`);
      assert.doesNotMatch(html, /undefined|NaN/);
    }
  }
});

test('plan and workout completion controls expose their selected state', () => {
  const { context } = loadUI();
  assert.match(vm.runInContext('prototypeSwitcher()', context), /data-plan="free" aria-pressed="true"/);
  vm.runInContext('toggleSet(state, 1)', context);
  assert.match(vm.runInContext('renderLog()', context), /data-set="1" aria-pressed="true"/);
});

test('every training area renders its logger and detail states without missing data', () => {
  const { context } = loadUI();
  for (const part of ['chest', 'back', 'shoulders', 'legs', 'arms', 'abs', 'cardio']) {
    for (const plan of ['free', 'pro']) {
      vm.runInContext(`state.plan = '${plan}'; state.selectedBodyPart = '${part}'; state.selectedExercise = exercises['${part}'][0].id`, context);
      const logger = vm.runInContext('renderLog()', context);
      assert.doesNotMatch(logger, /undefined|NaN/);
      assert.match(logger, /保存动作/);
      if (part === 'cardio') assert.match(logger, /运动时长/);
      else {
        for (const tab of ['current', 'history', 'records']) {
          assert.doesNotMatch(vm.runInContext(`state.activeMuscleTab = '${tab}'; renderMuscle()`, context), /undefined|NaN/);
        }
      }
    }
  }
});

test('rerendering a set keeps the screen position and marks the active page', () => {
  const { context, app } = loadUI();
  app.scrollTop = 240;
  vm.runInContext("state.page = 'log'; render(true)", context);
  assert.equal(app.scrollTop, 240);
  assert.equal(app.dataset.view, 'log');
});

test('mobile shell remains zoomable and responds to the software keyboard', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /interactive-widget=resizes-content/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /input, textarea, select \{ font-size: 16px/);
  assert.doesNotMatch(css, /animation: page-in|transition: width|transition: all/);
  assert.ok([...css.matchAll(/font-size:\s*(\d+)px/g)].every((m) => Number(m[1]) >= 11));
});

test('typing a weight range refreshes results without replacing the filter or focus', () => {
  const { context, app, handlers } = loadUI();
  vm.runInContext("state.page = 'muscle'; state.activeMuscleTab = 'history'; render()", context);
  const previousHTML = app.innerHTML;
  const replaced = [];
  app.querySelector = (selector) => ({ replaceWith() { replaced.push(selector); } });
  const input = { dataset: { historyWeight: 'minWeight' }, value: '70' };
  handlers.input[0]({ target: { closest: (s) => s === '[data-history-weight]' ? input : null } });
  assert.equal(app.innerHTML, previousHTML);
  assert.deepEqual(replaced, ['.history-stats', '.history-trend', '.history-entries']);
  assert.equal(vm.runInContext('state.historyFilters.minWeight', context), '70');
});

test('training-area clicks reach the exercise list rather than matching the page container', () => {
  const { context, app, handlers } = loadUI();
  const button = { dataset: { bodyPart: 'back' } };
  handlers.click[0]({ target: { closest: (s) => s === '[data-body-part]' ? button : null } });
  assert.equal(app.dataset.view, 'exercise');
  assert.equal(vm.runInContext('state.selectedBodyPart', context), 'back');
  assert.equal(app.dataset.page, undefined);
});

test('the four reference cards reuse the exact approved image with real training buttons', () => {
  const { context, handlers } = loadUI();
  const html = vm.runInContext('renderHome()', context);
  assert.match(html, /class="body-reference"/);
  assert.match(html, /src="assets\/body-parts-reference.png" width="1438" height="1093" alt="" aria-hidden="true"/);
  const originalPanel = html.match(/<section class="body-reference">([\s\S]*?)<\/section>/)[1];
  assert.equal((originalPanel.match(/class="body-card reference-card/g) || []).length, 4);
  for (const part of ['chest', 'back', 'shoulders', 'legs']) {
    assert.match(html, new RegExp(`data-body-part="${part}" aria-label="训练`));
    const button = { dataset: { bodyPart: part } };
    handlers.click[0]({ target: { closest: (s) => s === '[data-body-part]' ? button : null } });
    assert.equal(vm.runInContext('state.selectedBodyPart', context), part);
    assert.equal(vm.runInContext('state.page', context), 'exercise');
  }
  const asset = fs.readFileSync(path.join(root, 'assets', 'body-parts-reference.png'));
  assert.equal(createHash('sha256').update(asset).digest('hex'), '5e8dada91105f352db3301c43ec9f1804be56090b031923fa65adb711b4a1488');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /\.body-reference > img \{[^}]*width: 100%[^}]*height: auto/);
  assert.match(css, /\.body-reference \.reference-card \{[^}]*position: absolute[^}]*background: transparent/);
});

test('the cardio card uses a decorative monochrome runner without target highlighting', () => {
  const { context } = loadUI();
  const html = vm.runInContext('renderHome()', context);
  assert.equal((html.match(/class="body-card /g) || []).length, 7);
  const art = vm.runInContext('cardioTile()', context);
  assert.match(art, /src="assets\/exercises\/cardio-runner.png"/);
  assert.match(art, /alt="" aria-hidden="true"/);
  assert.doesNotMatch(art, /is-target|anatomy-patch|<svg/);
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /\.cardio-illustration \{[^}]*pointer-events: none/);
  assert.match(css, /\.cardio-illustration \{[^}]*filter: grayscale\(1\)/);
});

test('all 39 exercises use illustration assets instead of letter placeholders', () => {
  const { context, handlers } = loadUI();
  const catalog = JSON.parse(vm.runInContext('JSON.stringify(exercises)', context));
  let total = 0;
  for (const [part, list] of Object.entries(catalog)) {
    vm.runInContext(`state.selectedBodyPart = '${part}'`, context);
    const html = vm.runInContext('renderExercise()', context);
    assert.doesNotMatch(html, /class="exercise-mark"/);
    assert.equal((html.match(/data-exercise-art=/g) || []).length, list.length);
    for (const item of list) {
      total++;
      const graphic = vm.runInContext(`exerciseIllustration(exercises['${part}'].find((item) => item.id === '${item.id}'))`, context);
      assert.match(graphic, new RegExp(`data-exercise-art="${item.id}"`));
      assert.match(graphic, /alt="" aria-hidden="true"/);
      const source = graphic.match(/src="([^"]+)"/)[1];
      assert.ok(fs.existsSync(path.join(root, source)), `${item.name}: ${source} exists`);
      const button = { dataset: { exercise: item.id } };
      handlers.click[0]({ target: { closest: (s) => s === '[data-exercise]' ? button : null } });
      assert.equal(vm.runInContext('state.selectedExercise', context), item.id);
      assert.equal(vm.runInContext('state.page', context), 'log');
      assert.match(vm.runInContext('renderLog()', context), new RegExp(`data-exercise-art="${item.id}"`));
    }
  }
  assert.equal(total, 39);
});

test('chest illustrations reuse approved artwork with eight distinct crop regions', () => {
  const { context } = loadUI();
  const crops = JSON.parse(vm.runInContext('JSON.stringify(chestIllustrationCrops)', context));
  assert.equal(Object.keys(crops).length, 8);
  assert.equal(new Set(Object.values(crops).map((crop) => crop.top)).size, 8);
  for (const crop of Object.values(crops)) {
    assert.ok(crop.left >= 0 && crop.left + crop.width <= 938);
    assert.ok(crop.top >= 0 && crop.top + crop.height <= 1677);
  }
  for (const tab of ['current', 'records']) {
    vm.runInContext(`state.selectedBodyPart = 'chest'; state.activeMuscleTab = '${tab}'`, context);
    assert.match(vm.runInContext('renderMuscle()', context), /data-exercise-art="bench-press"/);
    assert.doesNotMatch(vm.runInContext('renderMuscle()', context), /class="exercise-mark"/);
  }
});

test('arms and core use matching reference cards and retain separate training routes', () => {
  const { context, handlers } = loadUI();
  const html = vm.runInContext('renderHome()', context);
  const extraPanel = html.match(/<section class="body-reference body-reference-extra"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(extraPanel, 'the new cards share the reference-panel format');
  assert.match(extraPanel[1], /src="assets\/body-parts-arms-core.png" width="1438" height="1094"/);
  assert.equal((extraPanel[1].match(/class="body-card reference-card/g) || []).length, 2);
  assert.doesNotMatch(extraPanel[1], /anatomy-tile|body-copy/);
  for (const [part, name] of [['arms', '手臂'], ['abs', '核心']]) {
    assert.match(extraPanel[1], new RegExp(`data-body-part="${part}" aria-label="训练${name}" aria-describedby="body-note-${part}"`));
    const button = { dataset: { bodyPart: part } };
    handlers.click[0]({ target: { closest: (s) => s === '[data-body-part]' ? button : null } });
    assert.equal(vm.runInContext('state.selectedBodyPart', context), part);
    assert.equal(vm.runInContext('state.page', context), 'exercise');
  }
  const asset = fs.readFileSync(path.join(root, 'assets', 'body-parts-arms-core.png'));
  assert.equal(asset.readUInt32BE(16), 1438);
  assert.equal(asset.readUInt32BE(20), 1094);
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /\.body-reference-extra \{[^}]*aspect-ratio: 1438 \/ 449/);
  assert.match(css, /\.body-reference-extra > img \{[^}]*top: -135\.8575%/);
  assert.match(css, /\.reference-card\[data-body-part="arms"\] \{[^}]*left: 4\.5202%[^}]*top: 0/);
  assert.match(css, /\.reference-card\[data-body-part="abs"\] \{[^}]*left: 50\.9736%[^}]*top: 0/);
});
