(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TrackLevelPresentation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const LEVEL_TONES = Object.freeze({green:'#32D992',blue:'#62B5F6',purple:'#B49AF6',gold:'#EBC76F',ice:'#BDECF1',neutral:'#8B9CA5'});
  const SAMPLE_LEVEL_SUMMARY = Object.freeze({
    strengthRank:Object.freeze({id:'gold-ii',badge:'gold',nameKey:'level.rank.goldII'}),
    experience:Object.freeze({level:27,currentXP:12450,nextXP:18000})
  });

  function getLevelAppearance(value) {
    const level = Number.isInteger(value) && value > 0 ? value : null;
    const tone = level === null ? 'neutral' : level < 10 ? 'green' : level < 20 ? 'blue' : level < 30 ? 'purple' : level < 40 ? 'gold' : 'ice';
    return {level,tone,color:LEVEL_TONES[tone]};
  }

  function getExperienceProgress(currentXP, nextXP) {
    if (!Number.isFinite(currentXP) || currentXP < 0 || !Number.isFinite(nextXP) || nextXP <= 0) return {fraction:0,remaining:null};
    return {fraction:Math.min(1,currentXP/nextXP),remaining:Math.max(0,nextXP-currentXP)};
  }

  function rankBadgeSVG(stage) {
    const badges = {
      neutral:'<path d="M48 12 76 28v29L48 82 20 57V28Z" fill="#15242A" stroke="#75878E"/><path d="M37 47h22M48 36v22" stroke="#8B9CA5" stroke-width="3"/>',
      foundation:'<path d="M48 10 78 27v30L48 84 18 57V27Z" fill="#172E29" stroke="#71958A" stroke-width="2"/><path d="m48 22 20 11v19L48 70 28 52V33Z" fill="#244539"/><path d="M34 46h28M34 39v14M62 39v14" stroke="#A3C7B8" stroke-width="4"/>',
      gold:'<path d="m7 35 16 6-3 20-12-9Zm82 0-16 6 3 20 12-9Z" fill="#8C6A31"/><path d="M48 7 79 25v33L48 87 17 58V25Z" fill="#CBA34F" stroke="#F4DA91" stroke-width="2"/><path d="M48 17 69 30v24L48 74 27 54V30Z" fill="#352C1C" stroke="#EBC76F"/><path d="m48 28 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" fill="#F1D78B"/><path d="m35 75 13 7 13-7" fill="none" stroke="#FFF0B8" stroke-width="2"/>',
      elite:'<path d="m3 29 20 9 2 26-20-13 6-5-8-5Zm90 0-20 9-2 26 20-13-6-5 8-5Z" fill="#537880" stroke="#BDECF1"/><path d="m32 13 8 5 8-13 8 13 8-5-3 16H35Z" fill="#DCF7FA"/><path d="M48 20 77 34v28L48 89 19 62V34Z" fill="#82BEC9" stroke="#DFFAFF" stroke-width="2"/><path d="M48 28 67 39v19L48 77 29 58V39Z" fill="#172B36"/><path d="m48 34 7 13 13 4-13 5-7 14-7-14-13-5 13-4Z" fill="#DDF8FD"/><path d="M48 38v24" stroke="#70B9CE" stroke-width="2"/>'
    };
    const key = Object.hasOwn(badges,stage) ? stage : 'neutral';
    return `<svg class="rank-badge rank-badge-${key}" viewBox="0 0 96 96" aria-hidden="true" focusable="false">${badges[key]}</svg>`;
  }
  return {LEVEL_TONES,SAMPLE_LEVEL_SUMMARY,getLevelAppearance,getExperienceProgress,rankBadgeSVG};
});
