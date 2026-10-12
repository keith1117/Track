# English-first Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Track 原型中默认提供英文、保留受发布配置控制的中文预览，两种语言共用界面、训练数据和动作素材。

**Architecture:** 独立 JSON 词典生成可直接加载的消息脚本；国际化模块负责文案、单复数和格式化，发布配置负责可用语言和地区参数。现有页面继续使用一套渲染函数和稳定动作 ID。人体插画与 HTML 文字分离，不迁移训练存储。

**Tech Stack:** 普通 JavaScript、HTML/CSS、Node.js 24 内置模块、node:test、浏览器 Intl；无新增框架或运行依赖。

**Spec:** [已确认的设计](C:/10_software_dev/Track/docs/superpowers/specs/2026-10-10-english-first-localization-design.md)。执行者先读设计与本计划，不能只读某一个任务。

状态：用户于 2026-10-12 确认计划、选择本会话顺序执行并同意去字副本。七项任务已完成，一次独立审查发现的历史日期防护问题已通过先失败后成功的测试修补。69 项测试与词典生成检查通过，实现提交 4b21bff 已同步 dev 并通过 GitHub 工作流；收尾文档另行同步。main、默认分支和部署未改变。完整证据及限制见 docs/qa/2026-10-10-localization.md。

## 用户阅读摘要与需要确认的补充

按顺序完成：词典与生成检查 → 语言开关 → 训练页面 → 其余页面 → 部位卡片 → 浏览器验收 → GitHub 检查与同步。默认只公开英文，不发布 main。

原图检查发现中文标题覆盖了部分手臂轮廓。设计里的优先裁切不能完整保留这些部位。本计划建议：原文件保持不变，使用原图编辑生成去字副本，移除 UI 文字和标签，再裁切人体插画。保持轮廓风格、姿势和绿色目标肌群，不接受换了人体造型的结果。**此素材处理补充需用户随计划确认；未确认不得生成或编辑素材。**

数据检查还发现现有 `Number(selected.current) || 0` 会把 `70 kg` 等带单位字符串读为 0。结构化展示指标迁移时，明确读取数值重量，修正这一直接相关的读取问题；不改变计分、组完成、记录保存或历史筛选。此行为差异明确列入本计划审阅，不作为隐藏的顺手修复。

## Global Constraints

- `defaultLocale = en`、`publicLocales = [en]`、`allowLocalePreview = false`；只有 `en` 和 `zh-CN` 两份词典。
- 中文内部预览必须显式开启 `TRACK_LOCALE_PREVIEW=1`；浏览器偏好、URL 或旧偏好不能绕过公开语言列表。
- 不改 `track.training-history.v1` 的已有数据格式，也不清除浏览器存储。
- 训练和动作 ID 不变；保持 18 个页面、七类入口、39 个动作及其配图。
- 原始人体两张 PNG 文件不变；有氧仍不高亮；不修正动作姿势，不更换人体造型。
- 保持无需安装构建依赖、可直接打开 index.html；JSON 是唯一可编辑文案，messages.js 只由生成脚本产生。
- 通用地区为 kg/km；语言切换不改变单位或价格配置，通用售价为 null；¥298 仅为可显式配置的中国地区原型示例。
- 保持控件至少 44px、输入字号至少 16px、页面缩放、安全区、焦点和减少动态效果支持；验证 320、390、430 CSS 像素宽度及桌面手机框。
- 只提交相关文件到 dev；不改 main、默认分支、保护规则、部署设置，不创建正式 release/tag，不强制推送。
- 保留根目录 README.md 的用户修改。编辑产品和文档使用 apply_patch，生成的消息脚本可以由规定生成步骤写入。

## Review Focus

- 已保存中文偏好、`?locale=zh-CN`、中文浏览器偏好同时存在时，公开模式仍必须是英文：任务 2。
- localStorage 读取或写入抛错、旧历史内容损坏时，不崩溃、不主动清空其他存储：任务 2、3。
- 中文切换时有未保存重量、完成组、有氧输入或历史筛选，不丢值、不重新创建训练状态：任务 3。
- 插值含 `<img>`、`&`、引号时，页面不执行标签且不重复转义；缺失翻译必须可被检查发现：任务 1、2、4。
- 最窄手机上长英文名称、推荐标签、读屏名称与人体图同时存在，不遮挡、不露出图片中的中文：任务 5、6。

## 文件边界与检查命令

以下执行命令在 `C:/10_software_dev/Track` 运行。Windows 本机已验证的 Node 路径为 `C:/Users/happy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`，版本 v24.19.0；文中的 `node` 在 PATH 不可用时使用此路径。

新增：`mobile/locales/en.json`、`zh-CN.json`、生成的 `messages.js`、`mobile/scripts/build-locales.js`、`mobile/i18n.js`、`mobile/release-config.js`、对应测试、共享 UI 测试加载器、两张去字素材及 `.github/workflows/mobile-checks.yml`。

修改：[app.js](C:/10_software_dev/Track/mobile/app.js)、[index.html](C:/10_software_dev/Track/mobile/index.html)、[styles.css](C:/10_software_dev/Track/mobile/styles.css)、[server.js](C:/10_software_dev/Track/mobile/server.js)、[UI 测试](C:/10_software_dev/Track/mobile/tests/ui.test.js)、[核心测试](C:/10_software_dev/Track/mobile/tests/core.test.js)、[移动端说明](C:/10_software_dev/Track/mobile/README.md)、[项目约定](C:/10_software_dev/Track/AGENTS.md)。`mobile/core.js` 不需要改变训练状态模型。

基线：`node --test mobile/tests/core.test.js mobile/tests/ui.test.js`，2026-10-10 已运行，26 项全部通过。实施后每一阶段应保持已有业务断言通过；以新检查替换旧的中文字符串或整图覆盖布局断言，不能删除对应功能的覆盖。

全量命令：在项目根目录运行 `node --test`、`node mobile/scripts/build-locales.js --check`、`git diff --check`。已验证 Node 24 的自动测试发现能运行本项目现有全部 26 项测试。

## Task 1: 建立独立词典与可重复生成检查

**Files:** Create `mobile/locales/en.json`, `mobile/locales/zh-CN.json`, `mobile/scripts/build-locales.js`, generated `mobile/locales/messages.js`, `mobile/tests/locales.test.js`。

**Interfaces:**

- Produces `loadCatalogs() -> {en: Catalog, 'zh-CN': Catalog}`、`validateCatalogs(catalogs) -> string[]`、`serializeMessages(catalogs) -> string`，从生成脚本导出用于测试。
- `Catalog` 为语义键到非空字符串或 `{one: string, other: string}` 的映射；每一语义键和每一变体的 `{parameter}` 名称在两种语言中一致。中文保留相同的 one/other 结构，选择时由 Intl.PluralRules 决定。
- 生成文件通过现有 core.js 的浏览器/Node 双导出模式提供 `TrackMessages`；生成顺序确定，末尾换行确定，检查模式允许 CRLF/LF 差别但不允许内容过期。

- [x] Step 1：写 `catalogs have matching keys and parameters` 测试。断言四个导航英文依次为 `Home`、`Level`、`Community`、`Profile`；中文为现有文案；七个部位名称和全部 39 个 `exercise.<id>.name` 存在。删去中文 `workout.save` 或将 `{count}` 改成 `{sets}` 均返回校验错误。

```js
const catalogs = loadCatalogs();
assert.deepEqual(validateCatalogs(catalogs), []);
assert.deepEqual(['home', 'level', 'social', 'profile'].map(id => catalogs.en[`nav.${id}`]),
  ['Home', 'Level', 'Community', 'Profile']);
assert.equal(catalogs.en['exercise.bench-press.name'], 'Bench Press');
const bad = structuredClone(catalogs);
delete bad['zh-CN']['workout.save'];
assert.ok(validateCatalogs(bad).some(error => error.includes('workout.save')));
```
- [x] Step 2：运行 `node --test mobile/tests/locales.test.js`，确认缺少词典/生成接口造成失败，而不是测试语法失败。
- [x] Step 3：建立词典，将 app.js、index.html 的产品文案按 nav/body/exercise/workout/history/level/titles/social/profile/settings/subscription/coach/common/meta 分组。英文动作名采用通用运动名称；不修改用户姓名、handle 或用户自己的输入。
- [x] Step 4：实现上述三个接口和 CLI。`node mobile/scripts/build-locales.js` 校验后生成消息文件；`--check` 仅检查，不写文件；词典错误或生成文件过期时退出非零并指出键名。直接 require 脚本不产生写入。
- [x] Step 5：写 `generation is deterministic and detects stale output` 测试：相同词典生成相同内容；消息文件 require 后等于词典；空字符串、缺失 other、参数不一致和过期输出均失败。
- [x] Step 6：生成后运行词典测试、`--check` 和基线测试，全部通过后只提交任务 1 文件，提交说明 `feat: add validated English and Chinese message catalogs`。

## Task 2: 实现语言解析、地区配置与安全的预览入口

**Files:** Create `mobile/release-config.js`, `mobile/i18n.js`, `mobile/tests/i18n.test.js`, `mobile/tests/server.test.js`; modify [server.js](C:/10_software_dev/Track/mobile/server.js)。暂不替换页面文案。

**Interfaces:**

- Consumes 任务 1 的 Catalog、`TrackMessages`。
- `TrackReleaseConfig` 与 Node 导出的配置相同：`defaultLocale: 'en'`、`publicLocales: ['en']`、`previewLocales: ['zh-CN']`、`allowLocalePreview: false`、`regionProfile: 'global'`。`regions.global` 含 `weightUnit: 'kg'`、`distanceUnit: 'km'`、`annualPrice: null`；`regions['cn-prototype'].annualPrice` 为 `{amount: 298, currency: 'CNY', isPrototype: true}`，单位同 global。
- `createI18n({messages, config, storage, browserLocales = [], search = ''})` 返回 `getLocale(): string`、`getAvailableLocales(): string[]`、`setLocale(locale): boolean`、`t(key, params = {}): string`、`html(key, params = {}): string`、`formatNumber(value, options = {}): string`、`formatDate(value, options = {}): string`、`formatPrice(price): string`、`getMissingKeys(): string[]`。模块按 core.js 模式同时导出到 Node 与 `window.TrackI18n`。
- 语言偏好键为 `track.locale.v1`；storage 为具有 getItem/setItem 的对象或 null。t 返回原始文本，html 对整句转义一次；不会写训练存储。价格输入是地区配置的对象，不由 locale 选价。
- `createPreviewServer({allowLocalePreview = false} = {}) -> http.Server` 从 server.js 导出；require 不监听端口。CLI 仍仅监听 `127.0.0.1:4173`，只在环境值严格为 `1` 时开启预览。

- [x] Step 1：写 `public locale cannot be bypassed` 测试，生产配置同时传 `search: '?locale=zh-CN'`、storage 返回 zh-CN、browserLocales 为 zh-CN，断言 getLocale 为 en、availableLocales 只有 en、setLocale('zh-CN') 为 false。

```js
const i18n = createI18n({messages: loadCatalogs(), config: require('../release-config.js'),
  storage: {getItem: () => 'zh-CN', setItem: () => assert.fail('unauthorized write')},
  browserLocales: ['zh-CN'], search: '?locale=zh-CN'});
assert.equal(i18n.getLocale(), 'en');
assert.deepEqual(i18n.getAvailableLocales(), ['en']);
assert.equal(i18n.setLocale('zh-CN'), false);
```
- [x] Step 2：写预览优先级测试：明确允许的 URL 优先于存储，存储优先于浏览器；en-US/en-GB 归入 en；zh-CN 只在允许时使用；其他语言无效。显式无效请求回到默认 en，不借用旧中文偏好。读取或写入抛错不崩溃，不删除或清空存储。
- [x] Step 3：运行 `node --test mobile/tests/i18n.test.js mobile/tests/server.test.js`，确认接口不存在导致失败。
- [x] Step 4：实现配置和国际化接口。计数 0/1/2 选对英文单复数；中文语序由整句词典控制；缺失中文键回退英文并记录 `zh-CN:<key>`；两边都缺失时记录诊断，检查阶段必须失败。避免访问用户传入的任意文件或动态执行翻译。
- [x] Step 5：增加转义和格式测试：`t('search.remove', {term: '<img src=x onerror=1>&"'})` 保留原始文本；html 对应输出含 `&lt;img`、`&amp;`、`&quot;`，不含实际 img 标签或 `&amp;lt;`。在两语言下分别对固定 UTC 日期、12345.5 和 CNY 298 比较相应 Intl 的结果；切换语言后地区对象不变。
- [x] Step 6：修改服务器配置响应，静态配置默认关闭预览；预览服务仅覆盖返回的运行时配置，不改磁盘文件。先拆除 query 再把 `/` 映射 index.html，保证 `/?locale=zh-CN` 正常返回 HTML。测试用 port 0 的临时服务验证普通/预览配置和带 query 的根路径，结束后关闭服务。
- [x] Step 7：运行任务 1、2 和基线检查，通过后提交该任务文件，说明 `feat: gate locale preview with release configuration`。

## Task 3: 接入语言层并迁移训练显示数据

**Files:** Modify [app.js](C:/10_software_dev/Track/mobile/app.js:1), [index.html](C:/10_software_dev/Track/mobile/index.html:1), [core.test.js](C:/10_software_dev/Track/mobile/tests/core.test.js:1), [ui.test.js](C:/10_software_dev/Track/mobile/tests/ui.test.js:1); create `mobile/tests/helpers/load-ui.js`, `mobile/tests/localization-ui.test.js`；增补两份词典并重新生成 messages.js。

**Interfaces:**

- Consumes 任务 2 的 createI18n；页面中单一 `const i18n`，选择语言不重新调用 createInitialState。
- Produces `bodyPartName(id): string`、`exerciseName(id): string`、`formatExerciseMetric(metric): string`、`metricWeight(metric): number`、`setAppLocale(locale): boolean`、`syncLocaleChrome(): void`、`renderLocaleSwitcher(): string`。名前缀分别为 `body.<id>.name` 与 `exercise.<id>.name`。
- `Metric = {kind: 'weight' | 'reps' | 'bodyweight' | 'duration', value: number}`；current/pr 均为 Metric。weight 为 kg、duration 为分钟、bodyweight 为额外 kg；metricWeight 仅对 weight/bodyweight 返回 value，其他为 0。
- `loadUI({locale = 'en', allowLocalePreview = false, publicLocales = ['en'], regionProfile = 'global', storedLocale = null, browserLocales = ['en'], search = '', storageThrows = false, history = []} = {})` 返回 `{context, app, nodes, handlers, storageWrites, run(source), dispatchClick(dataset)}`。locale 是测试希望请求的语言，并非绕过白名单的强制设值；history 允许数组或损坏的原始 JSON 字符串用于存储测试。共享加载器按 index.html 依赖顺序运行脚本；run 是 node:vm 内的测试求值，不是浏览器绕过 UI 的接口。

- [x] Step 1：先扩展测试加载器的 document、navigator、location 和存储桩，能在同一页面环境调用真实点击事件；原有核心测试不再截取依赖国际化的半段源码单独运行，改用此完整加载器读取目录。
- [x] Step 2：写训练页面与数据切换失败测试：bench-press 英文名称为 Bench Press，39 个 ID 和参与比例不变，中文预览仍显示对应中文。输入状态设为 Pro、75.5 kg、已完成组、指定历史筛选及有氧 31 分钟/5.2 km，保存状态 JSON，调用 setAppLocale 后状态 JSON 完全相同；历史存储无额外写入。

```js
const ui = loadUI({allowLocalePreview: true});
ui.run("state.plan='pro'; state.page='log'; state.workout.sets[0].weight=75.5; state.workout.sets[0].completed=true; state.cardioLog={minutes:31,distance:5.2}; state.historyFilters.minWeight='70'");
const before = ui.run('JSON.stringify(state)');
assert.equal(ui.run("setAppLocale('zh-CN')"), true);
assert.equal(ui.run('JSON.stringify(state)'), before);
assert.equal(ui.run("exerciseName('bench-press')"), '杠铃卧推');
assert.ok(ui.storageWrites.every(write => write.key !== 'track.training-history.v1'));
```
- [x] Step 3：运行 `node --test mobile/tests/localization-ui.test.js`，确认缺少语言接入/显示迁移造成失败。
- [x] Step 4：在 index.html 按 release-config、messages、i18n、core、app 顺序加载。静态首屏元信息与四个导航为英文；syncLocaleChrome 同步 lang、导航文字/读屏标签、页面标题/说明。只有预览开启或公开语言超过一种时渲染语言控件；点击只更新 i18n 并 render(true)，不导航、不重置训练。
- [x] Step 5：把七类部位和 39 个动作的名字改为键，把推荐/状态改为键和参数，把 current/pr 改为 Metric。demoHistory 使用 Metric 数值，bodyweight 保持原示例基数 20，不根据已格式化文案解析数字。标题获得日期改为固定 ISO 值显示，不修改存储记录。
- [x] Step 6：迁移 pageHeader、dailyStrain、训练相关 coach 片段、renderHome 的非图片文字、renderExercise、renderLog、renderComplete、肌群分布说明及训练 Toast。cardio 输入继续 minutes/distance；非有氧初始化与 use-last 使用 metricWeight，明确验证 70 kg 会读回 70、32.5 kg 会读回 32.5，而不是旧的 0；计分与保存行为保持原测试。
- [x] Step 7：测试 setAppLocale 拒绝未开放语言、存储异常可显示/切换、未保存输入和历史保存格式不变；另写 `corrupt training history is not deleted`，传入 history 为损坏 JSON，断言状态历史为空但未写入/清空原历史键。默认导航四个标签与 aria 同步、html lang 正确、Free/Pro 切换仍保留状态。执行全量已建立测试、生成检查并提交，说明 `feat: localize workout flow without changing stored history`。

## Task 4: 完成其余页面、无障碍文案与地区显示

**Files:** Modify [app.js](C:/10_software_dev/Track/mobile/app.js:310), `mobile/locales/en.json`, `mobile/locales/zh-CN.json`, generated `messages.js`, `mobile/tests/localization-ui.test.js`；更新受影响的原 UI 断言。

**Interfaces:** Consumes 任务 3 的共享测试加载器、i18n、名称/指标辅助函数。保留 views 的 18 个键、rootPages、事件数据属性和训练核心接口。地区显示读取 `TrackReleaseConfig.regions[regionProfile]`，不从 locale 推断地区。

- [x] Step 1：写全页面矩阵失败测试：`home, exercise, log, complete, coach, level, muscle, titles, title-detail, social, search, explore, public-profile, profile, stats, achievements, settings, subscription` × en/zh-CN × free/pro。英文默认原型文字不含汉字、undefined、NaN 或缺失键；内部语言选择控件的原生语言名称允许出现中文，但产品文字不漏译。

```js
const ui = loadUI();
const pages = ui.run('Object.keys(views)');
assert.equal(pages.length, 18);
for (const plan of ['free', 'pro']) for (const page of pages) {
  const html = ui.run(`state.plan=${JSON.stringify(plan)}; state.page=${JSON.stringify(page)}; views[state.page]()`);
  assert.doesNotMatch(html, /[\u3400-\u9fff]|undefined|NaN/, `${page}/${plan}/en`);
}
assert.equal(ui.run('i18n.getMissingKeys().length'), 0);
```
- [x] Step 2：运行 `node --test mobile/tests/localization-ui.test.js`，确认未迁移页面造成失败，并保留各失败页面名。
- [x] Step 3：迁移 radar、level、muscle 的当前/历史/记录、historyChart/Date、称号、动态/搜索/发现、公开主页、个人页、统计、成就、设置、订阅、完整教练页和剩余 Toast。搜索项和未来用户投稿保持用户原文；当前原型示例帖子是词典内容。统一参数句子和数值格式，不改变筛选、趋势分组、点赞或导航逻辑。
- [x] Step 4：按独立地区配置渲染订阅：global 的 annualPrice 为 null 时两种语言显示 Pricing coming soon / 定价尚未确定；cn-prototype 显式配置时显示 CNY 298 并标记原型示例。测试 setAppLocale 不改变配置，也不会出现凭空的 USD 价格；不添加真实购买或地区选择界面。
- [x] Step 5：扩展交互矩阵覆盖七个部位/全部动作记录入口、三个肌群标签、空历史、推荐标签、动态单复数、各提示事件、表单 placeholder 与 aria、带 `<img>` 的搜索输入。每次采集 getMissingKeys，预设完整词典下必须为空；渲染后的英文 UI 除允许的用户内容外无汉字。
- [x] Step 6：运行全量测试和生成检查；查找 app/index 中尚残留的中文产品字符串并逐项归入词典，技术注释与原图来源记录不视为漏译。通过后提交任务文件，说明 `feat: complete shared bilingual screens and regional display`。

## Task 5: 分离身体部位插画与真实卡片文字

**Files:** Create `mobile/assets/body-parts-clean-reference.png`, `mobile/assets/body-parts-clean-arms-core.png`, `mobile/assets/body-parts-clean.prompt.md`；modify [app.js](C:/10_software_dev/Track/mobile/app.js:283), [styles.css](C:/10_software_dev/Track/mobile/styles.css:90), `mobile/tests/localization-ui.test.js`, [ui.test.js](C:/10_software_dev/Track/mobile/tests/ui.test.js:95)。

**Interfaces:** Consumes 原始两 PNG、任务 3 的部位名称/状态词典。Produces `bodyIllustrationCrops`（chest/back/shoulders/legs/arms/abs → `{source, imageWidth, imageHeight, left, top, width, height}`）、`bodyPartIllustration(id): string`、`renderBodyPartCard(part): string`；source 仅指向去字副本，实际坐标在观察完成素材后记录，不猜测坐标。裁切矩形必须在实际 PNG 尺寸内。

- [x] Step 1：检查用户已明确同意本计划的原图去字补充。如果未同意，停止此任务并修改计划，不用截掉手臂的躯干裁切冒充完整插画。
- [x] Step 2：写卡片失败测试：六个真实按钮、同一插画结构、真实名称/状态/标签、可读 aria 和训练路由；两个语言都保持六个独立入口，有氧继续用原有无高亮图片。旧整张中文面板覆盖按钮的断言替换为这组功能断言，原文件的 SHA256 不变性检查保留。

```js
const ui = loadUI();
for (const id of ['chest', 'back', 'shoulders', 'legs', 'arms', 'abs']) {
  const card = ui.run(`renderBodyPartCard(bodyParts.find(part => part.id === '${id}'))`);
  assert.match(card, new RegExp(`data-body-part="${id}"`));
  assert.match(card, /body-part-illustration/);
  assert.match(card, /class="body-copy"/);
  assert.doesNotMatch(card, /[\u3400-\u9fff]/);
}
```
- [x] Step 3：运行 `node --test mobile/tests/ui.test.js mobile/tests/localization-ui.test.js`，确认当前整图面板不满足新结构。
- [x] Step 4：在实施阶段读取 ImageGen 技能并通过内置图像编辑工具生成两张去字副本，分别引用已观察的原文件。只移除标题、状态、推荐文字、箭头和 UI 背景干扰；不添加乳头，不改变目标肌群、轮廓风格或姿势。保留原始两文件，记录实际提示词/来源；不要用 Python 或离线位图编辑替代。
- [x] Step 5：逐张观察输出，与原图对照胸/背/肩/腿/臂/核心的轮廓和高亮。拒绝丢手臂、改变解剖造型、残留中文字或错误高亮的结果；必要时针对副本继续编辑，不覆盖原件。若无法满足，报告明确缺陷并暂停，不擅自重画人体。
- [x] Step 6：以实际图片尺寸和观察到的区域填入 bodyIllustrationCrops；CSS 只显示人体部分。六张卡共用两列网格、标题/状态字号、边框、推荐标签和箭头；所有文字来自词典。避免缩小文字、裁掉肢体或把英文字再烘焙进图片；有氧继续为跨列卡片。
- [x] Step 7：运行卡片/路由/原图 hash 测试，并检查每个 crop 在 PNG 的实际 IHDR 尺寸范围内。通过后提交本任务源文件、测试、副本和记录，说明 `feat: separate body-part artwork from localized labels`。

## Task 6: 浏览器验证双语言、窄屏与直接打开兼容性

**Files:** Modify [styles.css](C:/10_software_dev/Track/mobile/styles.css), 必要的 app/index 小修复、相应测试；create `docs/qa/2026-10-10-localization.md`。

**Interfaces:** Consumes 任务 1–5 的可运行页面；produces 记录实际配置、检查结果和截图路径的 QA 文档。只通过浏览器支持的 UI 操作验证，不从浏览器求值修改内部状态或存储来伪造结果。

- [x] Step 1：在普通服务/静态配置下验证默认英文、中文 URL/偏好不开放中文、无公开中文按钮。通过明确开启的本地预览服务验证语言控件和中文；处理已有 4173 服务时确认它属于当前任务再重启，不停止未知进程。
- [x] Step 2：分别检查英文/中文、Free/Pro、七类动作、记录/历史/称号/教练等 18 页；实际编辑重量 75.5、次数 8，有氧 31 分钟/5.2 km，切换语言，检查输入、当前页和筛选保留。存储/刷新检查使用独立测试源或任务 3 的存储测试夹具，不清除用户已有历史；不假定浏览器工具支持隔离上下文。
- [x] Step 3：使用浏览器视口能力分别测试 320×740、390×844、430×932 CSS 尺寸以及正常桌面手机框；读 DOM 实际宽度，检查横向滚动、卡片文字边界、图像边界、固定底栏、输入和焦点。长英文动作名自然换行；捕获软件键盘/触控无法在桌面确定的部分并标记真机待确认。
- [x] Step 4：直接打开 index.html 验证默认英文与所有本地脚本/图片工作；不通过 file:// 请求 JSON，不将内部预览默认开启。浏览器策略若限制文件访问，记录限制并验证 HTTP 路径，不声称完成未实际验证的检查。
- [x] Step 5：需要修复的每个排版/数据保留缺陷先添加相应失败测试，再最小修复，重复该检查直到通过；不扩大到动效或其他设计改造。
- [x] Step 6：保存真实页面截图（英文首页部位卡、有氧、英文动作列表、中文预览），恢复临时视口覆盖，保留最终预览标签。QA 记录截图绝对路径、实际检查、未验证项和原始素材 hash；最终回复嵌入能证明结果的截图。
- [x] Step 7：运行全量测试、生成检查和 diff 检查，全部通过后提交相关修复及 QA 文档，说明 `test: verify bilingual mobile layouts and state preservation`。

## Task 7: 持续检查、维护说明与 dev 同步

**Files:** Create `.github/workflows/mobile-checks.yml`；modify [移动端说明](C:/10_software_dev/Track/mobile/README.md)、[AGENTS.md](C:/10_software_dev/Track/AGENTS.md)、`mobile/tests/locales.test.js`；必要时更新 QA 记录，不修改根目录 README.md。

**Interfaces:** Consumes 全量测试命令和生成脚本 `--check`；produces 只读检查工作流，不部署、不写仓库或使用额外 secrets。

- [x] Step 1：写检查入口测试，断言词典生成检查模式不写文件，完整默认配置仍仅公开 en，README 的正常/中文预览启动方式与配置一致。

```js
const before = fs.readFileSync(messagesPath, 'utf8');
const result = spawnSync(process.execPath, [buildScriptPath, '--check'], {encoding: 'utf8'});
assert.equal(result.status, 0, result.stderr);
assert.equal(fs.readFileSync(messagesPath, 'utf8'), before);
assert.deepEqual(require('../release-config.js').publicLocales, ['en']);
assert.match(fs.readFileSync(readmePath, 'utf8'), /TRACK_LOCALE_PREVIEW/);
assert.ok(fs.existsSync(workflowPath));
```

其中 messagesPath 为 mobile/locales/messages.js、buildScriptPath 为 mobile/scripts/build-locales.js、readmePath 为 mobile/README.md、workflowPath 为 .github/workflows/mobile-checks.yml 的绝对路径，从测试目录解析；spawnSync 来自 node:child_process。README 检查需明确记录 `$env:TRACK_LOCALE_PREVIEW="1"; node mobile/server.js` 及退出预览后正常英文启动方式，不能把环境开关写成正式默认配置。
- [x] Step 2：运行 `node --test mobile/tests/locales.test.js`，确认新增的 README/工作流存在性断言失败，前面词典和配置功能仍通过。
- [x] Step 3：添加 workflow：push 到 dev/main 或针对这两分支的普通 pull_request，相关路径 mobile/**、工作流自身、AGENTS.md 时触发；`permissions: contents: read`、ubuntu-latest、Node 24，不使用 pull_request_target、自动部署或自动提交。使用官方当前示例的 actions/checkout@v7（persist-credentials: false）及 actions/setup-node@v7（node-version: 24、package-manager-cache: false），执行生成检查和 `node --test`，无需 npm install。
- [x] Step 4：更新移动端 README，说明英文默认、PowerShell 中文预览命令、词典唯一来源、生成/check、原图不变/去字副本、地区与语言独立、动作图仍待专业校正、真机待验证。AGENTS 记录统一业务、英文基准键、禁止永久语言分支、日常同步 dev 和 main 发布需单独确认。
- [x] Step 5：执行全量检查并进行全分支独立审查。顺序执行方式下，实施者完成全部任务后按 executing-plans 技能安排一次独立审查；分阶段方式按 subagent-driven-development 对每阶段实施与审查。修复范围内问题后重跑检查。
- [x] Step 6：读取 git status 和远端 dev；仅相关提交/文件，确认无凭据和未授权文件。先 fetch，若出现分叉立即报告，不强制推送或擅自 rebase。将任务相关提交 push origin dev，并使用 ls-remote 核对远端 SHA；保留根 README.md 用户改动。
- [x] Step 7：检查 GitHub 工作流结果；若权限或 Actions 未启用导致无法运行，记录本地检查通过和远端 CI 未验证的区别，不修改仓库保护或购买服务。完成回复给出提交链接、测试数量、真实截图、中文预览方法、仍待校正的图像/真机项。不得声称已上线。

官方工作流版本与只读权限参考：[Checkout](https://github.com/actions/checkout)、[Setup Node](https://github.com/actions/setup-node)，2026-10-10 已核对。不要把示例中安装 npm 依赖的步骤带入本无依赖项目。

## 覆盖检查与执行交接

设计的加载/词典/文本要求由任务 1–4 覆盖，中文发布白名单由任务 2–3 覆盖，数据保留由任务 3、6 覆盖，图片/响应式由任务 5–6 覆盖，地区/价格由任务 2、4 覆盖，GitHub/维护由任务 7 覆盖。Review Focus 的五类条件都有具体测试或真实浏览器检查。

用户确认后已按上述顺序执行。原始图片保持不变，去字副本和实际浏览器截图均纳入提交；直接文件打开、真机交互及动作图专业校正的未验证范围保留在 QA 记录中。

推荐本会话顺序执行（Native）：七个任务逐步建立共同词典和状态接口，顺序推进可减少跨阶段接口不一致；最后一次独立审查覆盖整个改动。另一选择为分阶段代理实施与审查（Subagent-driven），提供更频繁的独立审查，但需要更多独立上下文。
