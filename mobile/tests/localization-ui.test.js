const test = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {loadUI} = require('./helpers/load-ui.js');
const pages=['home','exercise','log','complete','coach','level','muscle','titles','title-detail','social','search','explore','public-profile','profile','stats','achievements','settings','subscription'];
test('six body cards use text-free cropped art and independently localized real controls', () => {
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});
    assert.equal(ui.run('typeof renderBodyPartCard'),'function','body art has not been separated from labels');
    for(const id of ['chest','back','shoulders','legs','arms','abs']) {
      const card=ui.run(`renderBodyPartCard(bodyParts.find(part=>part.id==='${id}'))`);
      assert.match(card,new RegExp(`data-body-part="${id}"`));
      assert.match(card,/body-part-illustration/);assert.match(card,/class="body-copy"/);
      assert.match(card,/body-parts-clean-/);
      if(locale==='en')assert.doesNotMatch(card,/[\u3400-\u9fff]/);
      ui.dispatchClick({bodyPart:id});assert.equal(ui.run('state.selectedBodyPart'),id);
    }
  }
});
for(const page of pages) test(`${page} renders complete bilingual copy in Free and Pro`, () => {
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});
    assert.equal(ui.run('Object.keys(views).length'),18);
    for(const plan of ['free','pro']) {
      ui.run(`state.plan='${plan}';state.page='${page}'`);
      const html=ui.run('views[state.page]()');
      assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/);
      if(locale==='en')assert.doesNotMatch(html,/[\u3400-\u9fff]/,`${page}/${plan}`);
    }
    assert.equal(ui.run('i18n.getMissingKeys().length'),0,ui.run('JSON.stringify(i18n.getMissingKeys())'));
  }
});
test('region pricing is independent of locale and has no invented dollar amount', () => {
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});
    const html=ui.run('renderSubscription()');
    assert.match(html,locale==='en'?/Pricing coming soon/:/定价尚未确定/);
    assert.doesNotMatch(html,/¥298|\$298|USD/);
  }
  const ui=loadUI({allowLocalePreview:true,regionProfile:'cn-prototype'});
  const before=ui.run('JSON.stringify(TrackReleaseConfig.regions)');
  for(const locale of ['en','zh-CN']) {
    ui.run(`setAppLocale('${locale}')`);
    assert.match(ui.run('renderSubscription()'),/298/);
    assert.match(ui.run('renderSubscription()'),locale==='en'?/Prototype price/:/原型示例价格/);
  }
  assert.equal(ui.run('JSON.stringify(TrackReleaseConfig.regions)'),before);
});
test('user search terms stay untranslated and cannot become HTML or aria markup', () => {
  const ui=loadUI();
  ui.run(`state.recentSearches=[${JSON.stringify('<img src=x onerror=1>&"中文')}];`);
  const html=ui.run('renderSearch()');
  assert.doesNotMatch(html,/<img src=x|aria-label="[^"]*"中文/);
  assert.match(html,/&lt;img src=x onerror=1&gt;&amp;&quot;中文/);
});
test('localized history and titles cover non-default states without missing messages', () => {
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});
    for(const part of ['chest','back','shoulders','legs','arms','abs']) {
      ui.dispatchClick({bodyLevel:part});
      for(const muscleTab of ['current','history','records']) {
        ui.dispatchClick({muscleTab});
        const html=ui.app.innerHTML.replace(/简体中文/g,'');
        if(locale==='en')assert.doesNotMatch(html,/[\u3400-\u9fff]/);
        assert.doesNotMatch(html,/undefined|NaN|\[object Object\]/);
      }
    }
    for(const id of ui.run('titles.map(item=>item.id)')) {
      ui.dispatchClick({title:id});assert.doesNotMatch(ui.app.innerHTML,/undefined|NaN/);
    }
    ui.run("state.historyFilters.minWeight='999999';state.activeMuscleTab='history'");
    const empty=ui.run('renderMuscle()');
    assert.match(empty,/history-empty/);if(locale==='en')assert.doesNotMatch(empty,/[\u3400-\u9fff]/);
    assert.equal(ui.run('i18n.getMissingKeys().length'),0);
  }
});
test('every informational action uses a localized toast', () => {
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});
    for(const action of ['notifications','comments','share','set-title','coach-answer','upgrade']) {
      ui.dispatchClick({action});const text=ui.nodes['#toast'].textContent;
      assert.ok(text.length>0);if(locale==='en')assert.doesNotMatch(text,/[\u3400-\u9fff]/);
    }
    assert.equal(ui.run('i18n.getMissingKeys().length'),0);
  }
});
test('an existing toast follows a language change without resetting training', () => {
  const ui=loadUI({allowLocalePreview:true});
  ui.dispatchClick({action:'notifications'});
  assert.equal(ui.nodes['#toast'].textContent,'No new training reminders');
  const before=ui.run('JSON.stringify(state)');
  ui.dispatchClick({locale:'zh-CN'});
  assert.equal(ui.nodes['#toast'].textContent,'没有新的训练提醒');
  assert.equal(ui.run('JSON.stringify(state)'),before);
});
test('history entry summaries use singular English for one saved set', () => {
  const entry={id:'one-set',bodyPart:'chest',exerciseId:'bench-press',date:'2026-03-08T12:00:00Z',sets:[{weight:70,reps:8}]};
  const ui=loadUI({history:[entry]});
  ui.run("state.historyFilters.period='all'");
  const html=ui.run('renderHistory(bodyParts[0],exercises.chest)');
  assert.match(html,/· 1 set</);assert.doesNotMatch(html,/· 1 sets</);assert.match(html,/· 3 sets</);
});
test('date-only chart buckets do not shift to the previous day in western timezones', () => {
  const helper=require.resolve('./helpers/load-ui.js');
  const result=spawnSync(process.execPath,['-e',`const {loadUI}=require(${JSON.stringify(helper)});const assert=require('node:assert/strict');assert.equal(loadUI().run("historyDate('2026-03-08')"),'Mar 8');`],{encoding:'utf8',env:{...process.env,TZ:'America/New_York'}});
  assert.equal(result.status,0,result.stderr);
});
test('all 39 illustrated exercise buttons navigate to their stable logging IDs', () => {
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});let count=0;
    for(const bodyPart of ['chest','back','shoulders','legs','arms','abs','cardio']) {
      ui.dispatchClick({bodyPart});
      for(const exercise of ui.run(`exercises['${bodyPart}'].map(item=>item.id)`)) {
        ui.dispatchClick({exercise});count++;
        assert.equal(ui.run('state.page'),'log');assert.equal(ui.run('state.selectedExercise'),exercise);
        assert.match(ui.app.innerHTML,new RegExp(`data-exercise-art="${exercise}"`));
      }
    }
    assert.equal(count,39);assert.equal(ui.run('i18n.getMissingKeys().length'),0);
  }
});
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
