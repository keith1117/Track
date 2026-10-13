const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const {loadUI: loadLocalizedUI} = require('./helpers/load-ui.js');
const loadUI = () => loadLocalizedUI({locale:'zh-CN',allowLocalePreview:true});

test('all existing screens render in both Free and Pro states', () => {
  const { context } = loadUI();
  const pages = vm.runInContext('Object.keys(views)', context);
  assert.equal(pages.length, 20);
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

test('body cards preserve the original artwork files and real training routes', () => {
  const ui = loadLocalizedUI();
  const html = ui.run('renderHome()');
  for (const part of ['chest','back','shoulders','legs','arms','abs']) {
    assert.match(html,new RegExp(`data-body-part="${part}" aria-label="Train`));
    ui.dispatchClick({bodyPart:part});
    assert.equal(ui.run('state.selectedBodyPart'),part);assert.equal(ui.run('state.page'),'exercise');
  }
  for(const [file,hash] of [['body-parts-reference.png','5e8dada91105f352db3301c43ec9f1804be56090b031923fa65adb711b4a1488'],['body-parts-arms-core.png','7c1fe9a720f40fb784299f8512f94462ec4f1734cb8929ca608061cdfde0d550']]) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,'assets',file))).digest('hex'),hash);
  }
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

test('all six body crops fit the real edited image dimensions with one card format', () => {
  const ui = loadLocalizedUI();
  assert.equal(ui.run('typeof bodyIllustrationCrops'),'object');
  const crops=JSON.parse(ui.run('JSON.stringify(bodyIllustrationCrops)'));
  assert.equal(Object.keys(crops).length,6);
  for(const [part,crop]of Object.entries(crops)) {
    const png=fs.readFileSync(path.join(root,crop.source));
    assert.equal(crop.imageWidth,png.readUInt32BE(16));assert.equal(crop.imageHeight,png.readUInt32BE(20));
    assert.ok(crop.left>=0&&crop.top>=0&&crop.left+crop.width<=crop.imageWidth&&crop.top+crop.height<=crop.imageHeight);
    const card=ui.run(`renderBodyPartCard(bodyParts.find(p=>p.id==='${part}'))`);
    assert.match(card,/body-part-illustration/);assert.match(card,/class="body-copy"/);
  }
});
