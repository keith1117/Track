const test=require('node:test');
const assert=require('node:assert/strict');
const {loadUI}=require('./helpers/load-ui.js');

test('Home exposes current strain and completion status with one sample disclaimer and seven training entries',()=>{
  for(const locale of ['en','zh-CN'])for(const plan of ['free','pro']) {
    const ui=loadUI({locale,allowLocalePreview:true});
    ui.run(`state.plan='${plan}';state.dailyStrain=40;state.completedExercises=['bench-press','push-up']`);
    ui.dispatchClick({page:'home'});
    const html=ui.app.innerHTML;
    assert.deepEqual([...html.matchAll(/data-body-part="([^"]+)"/g)].map(m=>m[1]),['chest','back','shoulders','legs','arms','abs','cardio']);
    assert.equal((html.match(locale==='en'?/Sample data/g:/示例数据/g)||[]).length,1);
    assert.match(html,/role="progressbar"[^>]*aria-valuenow="40"/);
    assert.match(html,locale==='en'?/2 exercises complete/:/2 个动作完成/);
    assert.match(html,/data-action="open-coach"/);
    assert.equal(ui.run('i18n.getMissingKeys().length'),0);
  }
});

test('compact Home keeps the Free coach gate and Pro coaching route',()=>{
  for(const plan of ['free','pro']) {
    const ui=loadUI();ui.run(`state.plan='${plan}'`);
    ui.dispatchClick({action:'open-coach'});
    assert.equal(ui.run('state.page'),plan==='free'?'subscription':'coach');
  }
});

test('Home coach accessible name includes its visible heading',()=>{
  for(const [locale,plan,heading] of [
    ['en','free','Your next workout'],['en','pro','Train chest today'],
    ['zh-CN','free','你的下一次训练'],['zh-CN','pro','今天建议训练胸部']
  ]) {
    const ui=loadUI({locale,allowLocalePreview:true});ui.run(`state.plan='${plan}'`);
    const html=ui.run('coachHomeCard()');
    assert.match(html,new RegExp(`aria-label="[^"]*${heading}`));
  }
});

test('calendar keeps readable dates and checkmarks only on distinct saved workout days',()=>{
  const history=[
    {id:'one',bodyPart:'chest',exerciseId:'bench-press',date:'2026-10-05T12:00:00Z',sets:[{weight:65,reps:8}]},
    {id:'two',bodyPart:'chest',exerciseId:'push-up',date:'2026-10-05T15:00:00Z',sets:[{weight:0,reps:12}]},
    {id:'three',bodyPart:'back',exerciseId:'lat-pulldown',date:'2026-10-14T12:00:00Z',sets:[{weight:45,reps:8}]}
  ];
  for(const locale of ['en','zh-CN']) {
    const ui=loadUI({locale,allowLocalePreview:true,history});ui.run("state.calendarMonth='2026-10'");
    const html=ui.run('renderTrainingCalendar()');
    assert.equal((html.match(/class="calendar-check"/g)||[]).length,2);
    for(const day of ['05','14']) {
      const cell=html.match(new RegExp(`data-training-date="2026-10-${day}"[\\s\\S]*?</i></span>`))?.[0];
      assert.ok(cell);assert.match(cell,/class="calendar-date"/);assert.match(cell,/class="calendar-check" aria-hidden="true">✓/);
      assert.match(cell,locale==='en'?/Workout saved/:/已保存训练/);
    }
    const empty=loadUI({locale,allowLocalePreview:true}).run('renderTrainingCalendar()');
    assert.doesNotMatch(empty,/class="calendar-check"/);
    assert.match(empty,locale==='en'?/Saved workout/:/已保存训练/);
  }
});

test('Home display and preview toggles preserve training drafts and saved history',()=>{
  const ui=loadUI({allowLocalePreview:true});
  ui.run("state.workout.sets[0].weight=75.5;state.workout.sets[0].reps=11;state.cardioLog={minutes:31,distance:5.2};state.historyFilters.minWeight='70'");
  const snapshot=()=>ui.run('JSON.stringify({workout:state.workout,cardio:state.cardioLog,filters:state.historyFilters,history:state.history})');
  const before=snapshot();
  ui.dispatchClick({page:'home'});ui.dispatchClick({locale:'zh-CN'});ui.dispatchClick({plan:'pro'});ui.dispatchClick({page:'level'});ui.dispatchClick({page:'home'});
  assert.equal(snapshot(),before);
  assert.ok(ui.storageWrites.every(write=>write.key!=='track.training-history.v1'));
});
