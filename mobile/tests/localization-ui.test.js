const test = require('node:test');
const assert = require('node:assert/strict');
const {loadUI} = require('./helpers/load-ui.js');
test('language switching preserves the entire unsaved training state', () => {
  const ui = loadUI({allowLocalePreview:true});
  ui.run("state.plan='pro';state.page='log';state.workout.sets[0].weight=75.5;state.workout.sets[0].completed=true;state.cardioLog={minutes:31,distance:5.2};state.historyFilters.minWeight='70'");
  const before = ui.run('JSON.stringify(state)');
  assert.equal(ui.run("typeof setAppLocale"),'function','locale switching is not connected');
  ui.dispatchClick({locale:'zh-CN'});
  assert.equal(ui.run('JSON.stringify(state)'),before);
  assert.equal(ui.run("exerciseName('bench-press')"),'杠铃卧推');
  assert.equal(ui.context.document.documentElement.lang,'zh-CN');
  assert.equal(ui.nav[0].label.textContent,'首页');
  assert.ok(ui.storageWrites.every(write=>write.key!=='track.training-history.v1'));
});
test('public pages reject Chinese and keep metadata English', () => {
  const ui=loadUI({locale:'zh-CN',storedLocale:'zh-CN',browserLocales:['zh-CN']});
  assert.equal(ui.run("typeof setAppLocale"),'function');
  assert.equal(ui.run("setAppLocale('zh-CN')"),false);
  assert.equal(ui.context.document.documentElement.lang,'en');
  assert.deepEqual(ui.nav.map(button=>button.label.textContent),['Home','Level','Community','Profile']);
  assert.doesNotMatch(ui.run('renderLocaleSwitcher()'),/data-locale/);
});
test('structured metrics fill previous weights without parsing translated strings', () => {
  const ui=loadUI();
  ui.dispatchClick({exercise:'incline-dumbbell'});
  assert.equal(ui.run('state.workout.sets[0].weight'),32.5);
  ui.dispatchClick({exercise:'bench-press'});
  assert.equal(ui.run('state.workout.sets[0].weight'),70);
  ui.run('state.workout.sets[0].weight=1');ui.dispatchClick({action:'use-last'});
  assert.equal(ui.run('state.workout.sets[0].weight'),70);
});
test('training screens render localized text for all 39 exercises and both plans', () => {
  for (const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});
    for(const plan of ['free','pro']) for(const part of ['chest','back','shoulders','legs','arms','abs','cardio']) {
      ui.run(`state.plan='${plan}';state.selectedBodyPart='${part}'`);
      const ids=ui.run(`exercises['${part}'].map(item=>item.id)`);
      for(const id of ids) {
        ui.run(`state.selectedExercise='${id}'`);
        const html=ui.run('renderExercise()+renderLog()+renderComplete()');
        assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/,`${id}/${locale}/${plan}`);
        if(locale==='en')assert.doesNotMatch(html,/[\u3400-\u9fff]/,`${id}/${plan}`);
        assert.match(html,/data-action="save-exercise"/);
      }
    }
    assert.equal(ui.run('i18n.getMissingKeys().length'),0);
  }
});
test('corrupt or blocked storage is not deleted during initialization or switching', () => {
  for(const options of [{history:'{broken json'},{storageThrows:true}]) {
    const ui=loadUI({allowLocalePreview:true,...options});
    assert.equal(ui.run('state.history.length'),0);
    assert.equal(ui.run("typeof setAppLocale"),'function');
    assert.equal(ui.run("setAppLocale('zh-CN')"),true);
    assert.ok(ui.storageWrites.every(write=>write.key!=='track.training-history.v1'));
  }
});
test('existing saved history keeps its numeric schema after localized logging', () => {
  const entry={id:'prior',bodyPart:'chest',exerciseId:'bench-press',date:'2026-03-08T12:00:00Z',sets:[{weight:65,reps:8}]};
  const ui=loadUI({history:[entry],locale:'zh-CN',allowLocalePreview:true});
  assert.equal(ui.run('JSON.stringify(state.history[0])'),JSON.stringify(entry));
  ui.dispatchClick({action:'save-exercise'});
  const written=ui.storageWrites.find(write=>write.key==='track.training-history.v1');
  assert.ok(written); const history=JSON.parse(written.value);
  assert.deepEqual(history[0],entry); assert.equal(history[1].exerciseId,'bench-press');
  assert.equal(history[1].sets[0].weight,70); assert.equal(history[1].sets[0].reps,8);
});
