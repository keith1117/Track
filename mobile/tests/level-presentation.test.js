const test = require('node:test');
const assert = require('node:assert/strict');
const {getLevelAppearance,getExperienceProgress,rankBadgeSVG} = require('../level-presentation.js');

test('numeric levels select their correct visual band at each boundary', () => {
  const cases = [[1,'green','#32D992'],[9,'green','#32D992'],[10,'blue','#62B5F6'],[19,'blue','#62B5F6'],
    [20,'purple','#B49AF6'],[29,'purple','#B49AF6'],[30,'gold','#EBC76F'],[39,'gold','#EBC76F'],
    [40,'ice','#BDECF1'],[250,'ice','#BDECF1']];
  for (const [level,tone,color] of cases) assert.deepEqual(getLevelAppearance(level),{level,tone,color});
});

test('missing or invalid level data stays unassessed rather than implying level zero', () => {
  for (const value of [undefined,null,0,-1,1.5,'24','',false,{},NaN,Infinity,-Infinity]) {
    assert.deepEqual(getLevelAppearance(value),{level:null,tone:'neutral',color:'#8B9CA5'});
  }
});

test('experience text and progress derive from the same pair of numbers', () => {
  assert.deepEqual(getExperienceProgress(12450,18000),{fraction:12450/18000,remaining:5550});
  assert.deepEqual(getExperienceProgress(0,18000),{fraction:0,remaining:18000});
  assert.deepEqual(getExperienceProgress(20000,18000),{fraction:1,remaining:0});
  for (const [current,next] of [[NaN,18000],[12,0],[-1,18000],[12,-1],[12,Infinity],['12',18000]]) {
    assert.deepEqual(getExperienceProgress(current,next),{fraction:0,remaining:null});
  }
});

test('rank stages have distinct decorative badges and safely fall back when unknown', () => {
  const badges=['foundation','gold','elite','neutral'].map(rankBadgeSVG);
  assert.equal(new Set(badges).size,4);
  for (const badge of badges) {
    assert.match(badge,/<svg[^>]*aria-hidden="true"/);
    assert.doesNotMatch(badge,/<text|<image|<script|\bon\w+=|https?:/i);
  }
  assert.equal(rankBadgeSVG('unknown'),rankBadgeSVG('neutral'));
  assert.equal(rankBadgeSVG('<script>'),rankBadgeSVG('neutral'));
});
