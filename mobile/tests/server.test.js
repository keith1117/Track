const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const serverPath = path.resolve(__dirname,'../server.js');
test('preview server only exposes Chinese after explicit configuration', async () => {
  const gate = spawnSync(process.execPath,['-e',`const assert=require('node:assert/strict');assert.equal(typeof require(${JSON.stringify(serverPath)}).createPreviewServer,'function');`],{encoding:'utf8',timeout:3000});
  assert.equal(gate.status,0,gate.stderr);
  const {createPreviewServer} = require(serverPath);
  for (const allowLocalePreview of [false,true]) {
    const server = createPreviewServer({allowLocalePreview});
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const html = await fetch(`${base}/?locale=zh-CN`);
      assert.equal(html.status,200); assert.match(await html.text(),/<!doctype html>/);
      const response = await fetch(`${base}/release-config.js?v=1`);
      assert.equal(response.status,200); const browser = {};
      vm.runInNewContext(await response.text(),browser);
      assert.equal(browser.TrackReleaseConfig.allowLocalePreview,allowLocalePreview);
      assert.equal(browser.TrackReleaseConfig.defaultLocale,'en');
      assert.equal(JSON.stringify(browser.TrackReleaseConfig.publicLocales),'["en"]');
    } finally { await new Promise(resolve=>server.close(resolve)); }
  }
  assert.equal(require('../release-config.js').allowLocalePreview,false);
});
