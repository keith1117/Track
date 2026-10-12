const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const messages = require('../locales/messages.js');
function make(options = {}) {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../i18n.js')), 'i18n is not implemented');
  return require('../i18n.js').createI18n({messages, config:require('../release-config.js'), ...options});
}
test('public locale cannot be bypassed', () => {
  const i = make({search:'?locale=zh-CN', browserLocales:['zh-CN'], storage:{getItem:()=> 'zh-CN', setItem:()=>assert.fail('unauthorized write')}});
  assert.equal(i.getLocale(), 'en'); assert.deepEqual(i.getAvailableLocales(), ['en']);
  assert.equal(i.setLocale('zh-CN'), false); assert.equal(i.t('workout.save'), 'Save exercise');
});
test('preview precedence and invalid requests honor the whitelist', () => {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../release-config.js')), 'release config is not implemented');
  const config = {...require('../release-config.js'), allowLocalePreview:true};
  const store = locale => ({getItem:()=>locale, setItem(){}});
  for (const [options, want] of [
    [{search:'?locale=zh-CN',storage:store('en')},'zh-CN'],
    [{search:'?locale=en-GB',storage:store('zh-CN')},'en'],
    [{search:'?locale=fr',storage:store('zh-CN')},'en'],
    [{storage:store('zh-CN'),browserLocales:['en-US']},'zh-CN'],
    [{browserLocales:['zh-CN']},'en'],
    [{browserLocales:['en-US']},'en']
  ]) assert.equal(make({config,...options}).getLocale(), want);
  assert.equal(make({config:{...config,publicLocales:['en','zh-CN']},browserLocales:['zh-CN']}).getLocale(),'zh-CN');
});
test('storage failures never prevent display or explicit preview switching', () => {
  const config = {...require('../release-config.js'),allowLocalePreview:true};
  const i = make({config, storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});
  assert.equal(i.getLocale(),'en'); assert.equal(i.setLocale('zh-CN'),true); assert.equal(i.t('nav.home'),'首页');
});
test('plural counts and interpolation remain text with exactly one escaping boundary', () => {
  const i = make();
  for (const [count,want] of [[0,'0 sets'],[1,'1 set'],[2,'2 sets']]) assert.equal(i.t('workout.setCount',{count}),want);
  const term = '<img src=x onerror=1>&"';
  assert.equal(i.t('search.remove',{term}),`Remove search ${term}`);
  assert.equal(i.html('search.remove',{term}),'Remove search &lt;img src=x onerror=1&gt;&amp;&quot;');
  const partial = structuredClone(messages); delete partial['zh-CN']['workout.save'];
  const zh = make({messages:partial,config:{...require('../release-config.js'),allowLocalePreview:true},search:'?locale=zh-CN'});
  assert.equal(zh.t('workout.save'),'Save exercise'); assert.deepEqual(zh.getMissingKeys(),['zh-CN:workout.save']);
  assert.equal(zh.t('missing.key'),'missing.key'); assert.ok(zh.getMissingKeys().includes('en:missing.key'));
});
test('formatting uses locale without changing the region or stored timestamps', () => {
  const config = {...require('../release-config.js'),allowLocalePreview:true};
  const before = JSON.stringify(config); const date = '2026-03-08T12:00:00Z';
  const i = make({config});
  for (const locale of ['en','zh-CN']) {
    i.setLocale(locale);
    assert.equal(i.formatNumber(12345.5),new Intl.NumberFormat(locale).format(12345.5));
    assert.equal(i.formatDate(date,{timeZone:'UTC'}),new Intl.DateTimeFormat(locale,{timeZone:'UTC'}).format(new Date(date)));
    assert.equal(i.formatPrice(config.regions['cn-prototype'].annualPrice),new Intl.NumberFormat(locale,{style:'currency',currency:'CNY'}).format(298));
  }
  assert.equal(JSON.stringify(config), before);
});
