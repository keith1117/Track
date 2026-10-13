# Level Space Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Level 主界面改成同等突出 Strength Rank 与 Experience Level 的紧凑单屏，并为七个数字等级入口提供一致导航、为六个力量部位提供局部等级配色。

**Architecture:** 新增小型等级展示模块和独立插画显示模块，沿用现有普通 JavaScript 页面、国际化与训练目录。插画只在浏览器内按原图绿色区域局部换色，不生成替代人体或改写 PNG。Progress 是只读 Level 子页面，复用现有导航和称号功能；不增加真实计分或 XP 结算。

**Tech Stack:** 普通 JavaScript、HTML/CSS、浏览器 Canvas 2D、Node.js 24 内置模块、node:test、现有国际化工具。无新增框架、动画库或安装依赖。

**Spec:** [已确认的设计](C:/10_software_dev/Track/docs/superpowers/specs/2026-10-12-level-space-design.md)。执行前完整阅读设计、本计划与 AGENTS.md。

状态：用户确认计划及本会话顺序执行，另明确选择当前 dev、保留 README。任务1–3已完成，任务4本地回归、浏览器验收、独立审查和唯一重要问题的修补完成，远端同步收尾中。基线69项，当前94项测试通过，语言生成检查通过。完整证据见 `docs/qa/2026-10-12-level-space.md`。

## 用户阅读摘要

按顺序完成四项任务：等级和徽章 → 原肌肉区域换色 → 主页面、Progress 和返回路径 → 全面测试、截图与 dev 同步。只在主 Level 换色，Home 仍为绿色，有氧永远灰白。示例等级不会因本次保存训练而自动增长。

建议本会话顺序执行，最后一次独立整体验收。四项任务共用紧密相关的展示接口，无需同时让多个实现者修改 app.js。用户需审阅本文件并选择本会话执行或逐任务子代理执行；不沿用上次语言任务的执行选择自动授权本轮。

## Global Constraints

- 七个稳定 ID 与顺序：`chest → back → shoulders → legs → arms → abs → cardio`；`abs` 显示名仍为 Core。39 个动作 ID、配图和训练逻辑不变。
- 仅主 Level 左上用 Strength Rank；Experience、部位及动作继续使用数字 `Lv.`。初始 Rank 为示例 Gold II；Experience 为 Lv.27、12,450 / 18,000 XP；六个部位保持原数字 24、27、23、25、22、20，有氧 18。
- Lv.1–9：`#32D992`；10–19：`#62B5F6`；20–29：`#B49AF6`；30–39：`#EBC76F`；40 及以上：`#BDECF1`；无有效等级：`#8B9CA5`。有效值是有限正整数，不强制转换字符串或小数。
- 配色不是力量评分。没有真实力量评估、XP 结算、等级增长、虚构过去趋势或自动晋升逻辑；XP 不直接增加 Strength Rank。
- 仅替换六张主 Level 插画中的原绿色肌肉区域；轮廓、姿势、比例和背景不变。Home 保持绿色，Cardio 保持灰白且不参与肌肉配色。两张原图、两张去字副本及原提示词不改写。
- 不改 `track.training-history.v1` 的结构、日期、numeric kg/km 或已有记录，不清空存储。只读浏览和语言切换保留未保存输入与筛选；主动部位/动作切换沿用既有规则。
- 英文公开基线不变；中文只通过显式 `TRACK_LOCALE_PREVIEW=1` 预览。词典 en.json、zh-CN.json 同时编辑，messages.js 由规定脚本生成。
- 默认字号在 320×740、390×844、430×932 竖屏显示全部主内容，无主内容滚动或横向溢出；大字号、缩放、横屏及极小高度允许安全滚动兜底。控件至少 44×44 CSS 像素，输入至少 16px，不禁用缩放。
- 保留 Free/Pro、底部四项导航、Profile 的现有数字等级与 Stats 功能；新增 Progress 后是 19 个页面，原 18 页不删除。
- 所有相关提交先通过语言生成检查与根目录 `node --test`。只同步 dev，保留用户根 README.md；不碰 main、标签、部署、保护规则、默认分支，不强推。

## Review Focus

- 快速切换页面、语言或会员模式时，图片异步结果不能写进已移除节点或新页面：任务 2、3 的异步渲染与状态测试。
- 图片读入失败、Canvas 不可用或读取像素被浏览器拒绝时，保留名称、数字和可操作入口，不显示错误的绿色等级图：任务 2 的失败回退测试。
- 绿色阴影边缘、银白轮廓及偏蓝背景同时存在时，只换肌肉颜色且不改原数组：任务 2 的像素测试和六部位浏览器比较。
- 最窄视口同时显示语言/会员开关、长名称、未评估或很长数字时，不遮挡导航、不截断语义；放大时可以滚动：任务 3、4 的布局检查。
- 从 Level 打开有氧，再由 Home 打开训练时，返回来源不能泄漏；只读进度浏览不改未保存输入或历史：任务 3 的导航回归。

## 文件与运行方式

- 新增 `mobile/level-presentation.js`：有效等级、配色映射、示例摘要、XP 显示进度、代码原生 SVG 徽章。
- 新增 `mobile/level-art.js`：原裁切元数据、纯像素换色函数、浏览器内插画显示与失败处理。app.js 只保留原 `bodyIllustrationCrops` 名称对元数据的引用，Home 渲染形式不变。
- 修改 `mobile/app.js`：Level 与 Progress 渲染、等级卡片入口、带来源的有氧列表返回；不大范围重构其余页面。修改 `mobile/core.js` 仅新增不持久化的 `exerciseReturnPage: 'home'` 导航字段，不改评分、训练保存和筛选算法。
- 修改 `mobile/styles.css`：Level 专用紧凑布局、详情样式和可访问性兜底，不覆盖 Profile 的旧摘要卡。修改 `mobile/index.html`：按依赖顺序加载两模块并更新缓存版本。
- 修改两词典、生成 messages.js、测试加载器和既有页面枚举测试；新增 `mobile/tests/level-presentation.test.js`、`level-art.test.js`、`level-ui.test.js` 与 `mobile/tests/fixtures/level-art.html`。
- 最后更新 `mobile/README.md`、新增 `docs/qa/2026-10-12-level-space.md` 和对应 QA 截图；更新本计划完成状态。根目录 README.md 不编辑、不暂存。

所有命令从 `C:/10_software_dev/Track` 运行；`node` 不在 PATH 时用 `C:/Users/happy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`。预览沿用 `node mobile/server.js`，端口 4173，只有开启内部预览才设置 `TRACK_LOCALE_PREVIEW=1`。先检查已有进程，不结束无关服务。浏览器交互使用可用的浏览器控制工具，不另装自动化库。

素材 SHA256 基线（任务2和4核对，不重新生成文件）：

- `body-parts-reference.png`：`5e8dada91105f352db3301c43ec9f1804be56090b031923fa65adb711b4a1488`
- `body-parts-arms-core.png`：`7c1fe9a720f40fb784299f8512f94462ec4f1734cb8929ca608061cdfde0d550`
- `body-parts-clean-reference.png`：`9cc01a08ffeea6ed5a4c2fd231ffb6d1a878a351c9dc100a63240e1fabdb851e`
- `body-parts-clean-arms-core.png`：`3d23f1e9abacc169bc0ae4a9500acbeb22e08ba8c0320178274e7704c952800f`
- `exercises/cardio-runner.png`：`5d78f0e5865f7d3dadc8f7a79509c8081dccf91240d7cdf045eee841b1bea5ae`

## Task 1: 数字等级、示例摘要与 Rank 徽章

**Files:** Create `mobile/level-presentation.js`, `mobile/tests/level-presentation.test.js`。Modify `mobile/index.html`, `mobile/tests/helpers/load-ui.js`，加载新模块但不改变现有页面。

**Interfaces:** 浏览器/Node 双导出 `TrackLevelPresentation`，沿用 core.js 的模块形式。

- 冻结的 `LEVEL_TONES: Record<string,string>`：六个 tone 到 Global Constraints 中 HEX 的唯一映射；等级 helper 和插画模块共同消费，不能分别维护两份配色。
- `getLevelAppearance(value) -> {level: number|null, tone: string, color: string}`。tone 固定为 `green|blue|purple|gold|ice|neutral`，值与 Global Constraints 对应。
- `getExperienceProgress(currentXP, nextXP) -> {fraction: number, remaining: number|null}`。有效输入是非负有限 currentXP、正有限 nextXP；fraction 限在 0–1，remaining 不小于 0。非法输入返回 fraction 0、remaining null，不出现 NaN。
- 冻结的 `SAMPLE_LEVEL_SUMMARY`：`strengthRank: {id:'gold-ii', badge:'gold', nameKey:'level.rank.goldII'}`，`experience: {level:27, currentXP:12450, nextXP:18000}`。
- `rankBadgeSVG(stage) -> string`：`foundation|gold|elite|neutral` 四种纯 SVG。未知输入回到 neutral，SVG 装饰性且不包含外部图片、用户插值、图片文字或事件处理器。名称由词典与真实 HTML 提供。

- [ ] **Step 1: 写失败测试。** 验证全部分段边界、缺失/0/负数/小数/字符串/NaN/Infinity；徽章四态结构不同，未知态中性；XP 非法/超额安全且不改输入。核心断言：

```js
assert.deepEqual(getLevelAppearance(24), {level:24,tone:'purple',color:'#B49AF6'});
assert.deepEqual(getLevelAppearance('24'), {level:null,tone:'neutral',color:'#8B9CA5'});
assert.equal(getExperienceProgress(12450,18000).remaining,5550);
assert.equal(getExperienceProgress(12450,18000).fraction,12450/18000);
assert.equal(getExperienceProgress(20000,18000).fraction,1);
assert.equal(getExperienceProgress(NaN,18000).remaining,null);
assert.equal(rankBadgeSVG('unknown'),rankBadgeSVG('neutral'));
```

- [ ] **Step 2: 运行 `node --test mobile/tests/level-presentation.test.js`。** 应因模块/导出尚不存在而失败，不能因断言拼错失败。
- [ ] **Step 3: 实现上述接口。** 不从训练历史、重量或 XP 推算 Rank/部位等级。徽章的低阶简洁、中阶金色分层、高阶冰银精致对应设计，neutral 不冒充已评估。
- [ ] **Step 4: 运行该测试、语言检查与 `node --test`。** 应全部通过；原 18 页内容与状态不变。
- [ ] **Step 5: 只提交此任务相关模块、加载入口和测试。** 提交信息 `feat: add level presentation rules and rank badges`。

## Task 2: 原肌肉区域局部换色，不改 PNG

**Files:** Create `mobile/level-art.js`, `mobile/tests/level-art.test.js`, `mobile/tests/fixtures/level-art.html`。Modify `mobile/app.js: bodyIllustrationCrops`, `mobile/index.html`, `mobile/tests/helpers/load-ui.js`。

**Interfaces:** `TrackLevelArt` 浏览器/Node 双导出：

- `BODY_CROPS`：完全保留当前六个 source、imageWidth、imageHeight、left、top、width、height；所有裁切仍为 600×460。app.js 用 `const bodyIllustrationCrops = window.TrackLevelArt.BODY_CROPS`，原 Home helper 不改。
- `recolorGreenPixels(sourceRGBA: Uint8ClampedArray, targetHex: string) -> Uint8ClampedArray`，返回新数组，不改 alpha、原数组或无绿色成分的像素。targetHex 为映射的六位 HEX；非法目标色原样复制。
- `hydrateLevelArt(root: HTMLElement) -> Promise<void>`，只处理 root 下 `[data-level-art]`，读取其部位 ID 与 `data-tone`，从 Task 1 的 LEVEL_TONES 取得目标色。仅六个已知部位可处理；Cardio 不传入此接口。每节点公开 `data-art-state=loading|ready|unavailable` 供验收，不写训练状态。

- [ ] **Step 1: 写失败测试。** 使用至少以下像素及蓝、白、黑、浅灰、半透明像素；覆盖六个目标色、未知色和 alpha。确认新数组不是原数组，非肌肉颜色逐字节不变，输出亮度保留阴影顺序：

```js
const source=Uint8ClampedArray.from([12,120,60,255, 180,190,200,255, 7,16,19,255]);
const before=source.slice();
const result=recolorGreenPixels(source,'#B49AF6');
assert.notStrictEqual(result,source);
assert.deepEqual(source,before);
assert.deepEqual(result.slice(4),source.slice(4));
assert.equal(result[3],255);
assert.ok(result[2]>result[0] && result[0]>result[1]);
```

- [ ] **Step 2: 运行 `node --test mobile/tests/level-art.test.js`，确认接口不存在导致失败。** 再加入 PNG 尺寸/裁切边界与四张人体文件、跑者的既有 SHA256 断言。
- [ ] **Step 3: 实现纯像素算法与元数据。** 绿色强度 `d = g - max(r,b)`；d≤8 的像素逐字节保留。其余像素以 `clamp((d-8)/24,0,1)` 混合权重进行 HSV 局部换色：保留原 V，替换成目标 H，将原 S 乘以目标 S，alpha 不变。这是代码原生显示处理，不在仓库写换色后的位图；禁止全图 CSS 色相滤镜。若六部位实际比较发现阈值污染轮廓或遗漏明显绿色边缘，先调整并补失败样本，不直接接受。
- [ ] **Step 4: 实现浏览器显示。** 从两张原去字副本读入600×460裁切、调用纯函数，再把结果 Canvas 放入对应 Level 图框。缓存同源图片读入 Promise；六个可见节点各保留当前 Canvas，不积累所有等级的永久图像缓存。不放大源图、不改原裁切比例。
- [ ] **Step 5: 加异步/失败测试。** 空 root、未知 ID/tone、图片失败、Canvas/getImageData 不可用均不抛出未处理错误。失败只隐藏图框，按钮名称和等级留在原 HTML；不回退为绿色图片。完成前必须核对节点仍连接、仍在本 root 且 tone 未变，旧异步结果不能污染新页面。失败的读入缓存允许后续重试。测试加载器节点提供 `querySelectorAll:()=>[]`，不伪装它已验证真实 Canvas。
- [ ] **Step 6: 建立仅供 QA 的 fixture。** 使用上述两模块和同一裁切目录，提供真实部位/色段选择控件、原图与局部换色并排、读取结果及错误状态。源图复制到可见 Canvas 作独立比较；报告非选择像素改动数，额外检查预先确认的银白/背景锚点。只服务于本机人工检查，不往生产 Level 加测试开关。
- [ ] **Step 7: 用浏览器检查六部位的绿、紫、冰银与中性灰。** 在默认及缩小尺寸比较；轮廓、背景、目标肌群形状必须一致，边缘无明显残绿或污染。此为换色可行性关口；不通过则停止产品接入并报告具体限制。测试 fixture 的数值报告不能代替目视对照。
- [ ] **Step 8: 运行等级/插画测试、语言检查和全量测试；全部通过后提交。** 提交信息 `feat: recolor level muscle highlights without changing source art`。Home 仍展示原绿色，无新生成素材或提示词修改。

## Task 3: 主 Level、只读 Progress 和七入口导航

**Files:** Modify `mobile/app.js: renderLevel/render/renderExercise/views/rootPages/click handlers`, `mobile/core.js: createInitialState`, `mobile/styles.css`, `mobile/index.html`, `mobile/locales/en.json`, `zh-CN.json`, generated messages.js, `mobile/tests/ui.test.js`, `localization-ui.test.js`。Create `mobile/tests/level-ui.test.js`。

**Interfaces:** 消费 Task 1 摘要/映射/徽章与 Task 2 元数据/hydrate；app.js 新增：

- `renderLevelAreaCard(part) -> string`：六部位 `data-body-level`、真实 HTML 名称与数字等级、`data-level-art` 和 tone；有氧仍 `data-body-level="cardio"`，使用已有 `cardioTile()`，无 tone/局部肌肉 Canvas。
- `renderProgress() -> string`：`views.progress`，`rootPages.progress='level'`，返回 Level；只读 XP、剩余 XP、示例说明、Strength/XP 分离说明、`data-page="titles"`。
- `openExerciseList(bodyPart, origin='home') -> boolean`：合法目录才更新 `state.exerciseReturnPage` 与原导航 bodyPart；origin 仅 home/level。未知部位不改变状态。不创建组或结算训练。
- `state.exerciseReturnPage='home'`：非持久化导航字段。Home 部位入口每次明确设 home；Level 有氧明确设 level。列表返回读取此字段；有氧从 Level 打开时底栏仍标记 Level。日志/保存流程复用原实现。

- [ ] **Step 1: 写失败的主界面测试。** en/zh-CN × Free/Pro 验证：左上 Gold II 的 Rank 不混入整体 Lv.26；右上 Lv.27 明显、XP 共用同组数值；Review 按钮包含在 Experience 容器；七卡稳定顺序与原数字；六卡 purple、有氧无 tone；无雷达或独立称号横条。把 `bodyParts[0].level` 临时设为无效值，验证 localized Not assessed，不出现 Lv.0/NaN。用 VM 测试结束后还原测试数据。
- [ ] **Step 2: 写失败的导航与保留测试。** Progress 返回 Level、称号可达；六部位到原 Muscle；有氧列表返回来源正确；Level 有氧→Home→Chest 后返回 Home。只读浏览和语言切换保持 weight 75.5、reps 11、cardio 31分钟/5.2km、相关筛选及完整 history；storageWrites 不增加训练历史写入。主动换部位继续执行既有筛选重置。
- [ ] **Step 3: 运行 `node --test mobile/tests/level-ui.test.js`，确认因新界面/入口尚不存在失败。** 例如：

```js
const ui=loadUI({allowLocalePreview:true});
ui.dispatchClick({page:'level'});
ui.dispatchClick({page:'progress'});
assert.equal(ui.run('state.page'),'progress');
assert.match(ui.app.innerHTML,/5,550/);
ui.dispatchClick({page:'level'});
ui.dispatchClick({bodyLevel:'cardio'});
assert.equal(ui.run('state.page'),'exercise');
assert.equal(ui.run('state.exerciseReturnPage'),'level');
assert.match(ui.run('renderExercise()'),/data-page="level"/);
```

- [ ] **Step 4: 同时编辑词典并生成消息。** 新增独立 `level.strengthRank`、`level.experienceLevel`、`level.reviewProgress`、`level.notAssessed`、`level.sampleData`、三种示例段位名称与 `progress.*` 文案；英文分别为 Strength Rank、Experience Level、Review Progress、Not assessed、Sample data。不修改 Profile 使用的 Body level 原键，不在模块里硬编码双语言。运行 `node mobile/scripts/build-locales.js`。
- [ ] **Step 5: 实现主界面及 Progress。** 主摘要并排等高；左 SVG + HTML 段位，右大号数字 + XP条 + 44px Review按钮；主 Level 明确显示 Sample data，不新增评分说明大块。六人体卡两列三排、有氧满行。渲染后调用 hydrate，只影响插画，不重建训练状态。Progress 保持同一示例来源，fraction/remaining 来自 Task 1；不加假趋势。
- [ ] **Step 6: 实现导航来源。** 复用六部位原 data-body-level 逻辑，cardio 分支调用 openExerciseList；Home 原入口也调用该函数设 home。renderExercise 返回读来源，render 底栏仅对从 Level 打开的有氧列表作来源覆盖。不用 previousPage 作长期来源，避免 log→exercise 时丢失。未知 ID 无状态变化。
- [ ] **Step 7: 添加 Level 专用 CSS。** 不修改 `.compact-levels` 等 Profile 共享外观。图片与等级紧凑排列；可用空间较小时六卡采用小插画与文字并排，图框比例600/460。摘要数字约48–56px、徽章约64–74px，名称至少12px、等级约24–28px；不用缩放全页或隐藏预览开关。等级网格四行、每行最低66px，随可用空间增长；不锁死 app overflow，内容不足高度时安全滚动。
- [ ] **Step 8: 扩展页面枚举回归为明确的19页。** 原18页列表 + progress 精确验证；既有页面、39动作、语言白名单、价格/单位、history 断言保留。渲染与保存训练前后 SAMPLE_LEVEL_SUMMARY、部位等级和 Level 展示保持相同；禁止把本轮当成真实成长实现。
- [ ] **Step 9: 运行新测试、生成检查与全量测试，全部通过再提交。** 提交信息 `feat: build compact level overview and progress navigation`。同步提升 index.html 相应脚本/CSS版本，不改公开语言配置。

## Task 4: 回归、浏览器验收、独立审查与同步

**Files:** Modify 此计划、`mobile/README.md`、必要的上述任务源文件/测试。Create `docs/qa/2026-10-12-level-space.md` 与 `docs/qa/screenshots/2026-10-12-level-*.jpg`。不写根 README.md。

**Interfaces:** 只使用已有19页、既有原型切换与 QA fixture；测试数据和配色对照不成为生产界面的长期开关。消费前三任务的公开接口，不增加新计分模型。

- [ ] **Step 1: 添加遗漏回归的失败测试。** 包括异步节点替换、无法读 Canvas、未知 Rank、中性/长等级、公开中文请求、locale切换输入不丢、保存训练不改变未实现等级；先观察具体失败，再最小修补。没有遗漏时记录该轮覆盖已满足，不制造无意义测试。
- [ ] **Step 2: 运行 `node mobile/scripts/build-locales.js --check`、`node --test`、`git diff --check`。** 结果必须全通过，不能用跳过测试或删旧断言解决失败。
- [ ] **Step 3: 真实浏览器验证12组默认布局。** 320×740、390×844、430×932 × en/zh-CN内部预览 × Free/Pro，包含现有语言/会员切换器。检查 `scrollHeight<=clientHeight`、无横向溢出、七块完整、底栏不遮挡、Review可点、所有图框ready、有氧灰白。浏览器视口调整仅用于本步骤真实响应式测试，不为了截图假装缩放通过。
- [ ] **Step 4: 验证兜底及浏览路径。** 大字号/200%缩放、横屏、较低高度可滚动访问末尾；长名称/数字/Not assessed 不横向溢出，焦点和44px触控区保留。检查六部位详情、历史筛选、Progress、称号、有氧训练、Home返回以及未保存输入。检查Home仍绿色；低/中/高与未评估图像通过fixture显示，不改用户数据。无真实手机时明确标注安全区/软键盘/真机未验证。
- [ ] **Step 5: 按用户选定的执行方式做独立审查。** 本会话执行则最后整分支审查；逐任务子代理则每任务独立审查并末尾整体审查。未获执行方式确认前不派代理。本轮修补也先失败测试后通过；审查结论和未解决限制写入QA。
- [ ] **Step 6: 更新移动端说明、计划完成状态和QA截图。** README记19页、主Level替代雷达、示例非真实评分、局部配色和Canvas失败限制；不改旧语言任务的验收历史。QA记录实际视口、语言/模式、测试数量、原图哈希、图像对照、审查结论及未验证项，不能把fixture或旧A草稿当作新产品完成截图。
- [ ] **Step 7: 再运行生成检查、全量测试和diff检查，提交本任务文档与必要修补。** 提交信息 `test: verify compact level layouts and preserve workout state`。所有任务提交都只暂存明确文件，不使用 git add .。
- [ ] **Step 8: 检查并同步dev。** fetch远端后核对 `HEAD...origin/dev`；只允许本地领先而远端不领先。若分叉或远端新增提交，报告情况，不自行合并/rebase。正常push后用ls-remote核对dev等于本次HEAD，报告分支和提交链接；查看现有只读CI结果，不新建PR、不启用部署。认证或网络失败必须如实说明未完成同步。

## 计划自检与执行入口

设计第1–2节由任务3覆盖；第3节由任务1–2及任务4图像/布局检查覆盖；第4节由任务1的示例边界与任务3保存不增长测试覆盖；第5–6节由任务3覆盖；第7–8节由任务3–4覆盖；第9节由本审阅入口和任务4同步覆盖。五个 Review Focus 均有所属任务与明确验证。

用户已选择本会话顺序实施与末尾独立审查，并明确在当前 dev 中工作。本轮没有创建工作树，没有逐任务派实现子代理。最终审查按计划执行，远端只同步 dev。
