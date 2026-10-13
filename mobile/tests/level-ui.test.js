const test=require('node:test');
const assert=require('node:assert/strict');
const {loadUI}=require('./helpers/load-ui.js');

test('Level shows one overall rank, prominent numeric experience and seven numeric areas in Home order',()=>{
  for(const locale of ['en','zh-CN'])for(const plan of ['free','pro']) {
    const ui=loadUI({locale,allowLocalePreview:true});ui.run(`state.plan='${plan}'`);
    const html=ui.run('renderLevel()');
    assert.deepEqual([...html.matchAll(/data-body-level="([^"]+)"/g)].map(m=>m[1]),['chest','back','shoulders','legs','arms','abs','cardio']);
    const rank=html.match(/<section class="level-summary rank-summary"[\s\S]*?<\/section>/)?.[0];
    const experience=html.match(/<section class="level-summary experience-summary"[\s\S]*?<\/section>/)?.[0];
    assert.ok(rank);assert.match(rank,/rank-badge-gold/);assert.doesNotMatch(rank,/Lv\./);
    assert.ok(experience);assert.match(experience,/27/);assert.match(experience,/12,450/);assert.match(experience,/18,000/);
    assert.match(experience,/data-page="progress"/);assert.equal((html.match(/data-tone="purple"/g)||[]).length,6);
    assert.doesNotMatch(html,/class="radar|class="current-title/);
    const cardio=ui.run("renderLevelAreaCard(bodyParts.find(p=>p.id==='cardio'))");
    assert.match(cardio,/cardio-runner.png/);assert.match(cardio,/18/);assert.doesNotMatch(cardio,/data-tone|data-level-art/);
    assert.equal(ui.run('i18n.getMissingKeys().length'),0);
  }
});

test('unassessed body areas keep localized labels instead of fake numeric levels',()=>{
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true});ui.run('bodyParts[0].level=null');
    const html=ui.run('renderLevelAreaCard(bodyParts[0])');
    assert.match(html,locale==='en'?/Not assessed/:/未评估/);assert.match(html,/data-tone="neutral"/);
    assert.doesNotMatch(html,/Lv\.0|NaN|undefined/);
    ui.run('bodyParts[0].level=24');
  }
});

test('numeric area values separate their compact unit from the prominent number',()=>{
  const ui=loadUI();const html=ui.run('renderLevelAreaCard(bodyParts[0])');
  assert.match(html,/<small>Lv\.<\/small><span>24<\/span>/);
  assert.match(html,/aria-label="View Chest · Lv\.24"/);
});

test('Progress is a read-only Level route with the same XP numbers and preserved title access',()=>{
  const ui=loadUI();ui.dispatchClick({page:'level'});ui.dispatchClick({page:'progress'});
  assert.equal(ui.run('state.page'),'progress');assert.match(ui.app.innerHTML,/5,550/);
  assert.match(ui.app.innerHTML,/12,450/);assert.match(ui.app.innerHTML,/18,000/);
  assert.match(ui.app.innerHTML,/data-page="level"/);assert.match(ui.app.innerHTML,/data-page="titles"/);
  assert.equal(ui.nav[1].getAttribute('aria-current'),'page');
  ui.dispatchClick({page:'titles'});assert.equal(ui.run('state.page'),'titles');
  ui.dispatchClick({page:'level'});assert.equal(ui.run('state.page'),'level');
});

test('six strength areas keep their existing numeric Muscle details',()=>{
  const ui=loadUI();
  for(const id of ['chest','back','shoulders','legs','arms','abs']) {
    ui.dispatchClick({bodyLevel:id});assert.equal(ui.run('state.page'),'muscle');
    assert.equal(ui.run('state.selectedBodyPart'),id);assert.match(ui.app.innerHTML,/Lv\./);
    assert.match(ui.app.innerHTML,/data-page="level"/);
  }
});

test('Cardio returns to its opening Level or Home source even after logging navigation',()=>{
  const ui=loadUI();ui.dispatchClick({page:'level'});ui.dispatchClick({bodyLevel:'cardio'});
  assert.equal(ui.run('state.page'),'exercise');assert.equal(ui.run('state.exerciseReturnPage'),'level');
  assert.match(ui.app.innerHTML,/data-page="level"/);assert.equal(ui.nav[1].getAttribute('aria-current'),'page');
  ui.dispatchClick({exercise:'treadmill-run'});assert.equal(ui.run('state.page'),'log');ui.dispatchClick({page:'exercise'});
  assert.match(ui.run('renderExercise()'),/data-page="level"/);
  ui.dispatchClick({page:'home'});ui.dispatchClick({bodyPart:'chest'});
  assert.equal(ui.run('state.exerciseReturnPage'),'home');assert.match(ui.run('renderExercise()'),/data-page="home"/);
  assert.equal(ui.nav[0].getAttribute('aria-current'),'page');
});

test('read-only Level and Progress browsing plus language switching preserve unsaved training and filters',()=>{
  const ui=loadUI({allowLocalePreview:true});
  ui.run("state.workout.sets[0].weight=75.5;state.workout.sets[0].reps=11;state.cardioLog={minutes:31,distance:5.2};state.historyFilters.minWeight='70';state.historyFilters.exerciseId='bench-press'");
  const snapshot=()=>ui.run('JSON.stringify({workout:state.workout,cardio:state.cardioLog,filters:state.historyFilters,history:state.history})');
  const before=snapshot();
  ui.dispatchClick({page:'level'});ui.dispatchClick({page:'progress'});ui.dispatchClick({locale:'zh-CN'});ui.dispatchClick({page:'level'});
  assert.equal(snapshot(),before);assert.ok(ui.storageWrites.every(write=>write.key!=='track.training-history.v1'));
});

test('saving a workout cannot silently change the sample Rank, XP or area levels',()=>{
  const ui=loadUI();const summary=ui.run('JSON.stringify(TrackLevelPresentation.SAMPLE_LEVEL_SUMMARY)');
  const levels=ui.run('JSON.stringify(bodyParts.map(p=>p.level))');const markup=ui.run('renderLevel()');
  ui.dispatchClick({action:'save-exercise'});
  assert.equal(ui.run('state.history.length'),1);assert.equal(ui.run('renderLevel()'),markup);
  assert.equal(ui.run('JSON.stringify(bodyParts.map(p=>p.level))'),levels);
  assert.equal(ui.run('JSON.stringify(TrackLevelPresentation.SAMPLE_LEVEL_SUMMARY)'),summary);
});

test('unknown area routes cannot replace a valid selection or reset a draft',()=>{
  const ui=loadUI();const before=ui.run('JSON.stringify(state)');
  ui.dispatchClick({bodyLevel:'missing'});assert.equal(ui.run('JSON.stringify(state)'),before);
  ui.dispatchClick({bodyPart:'missing'});assert.equal(ui.run('JSON.stringify(state)'),before);
});
