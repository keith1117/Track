(function(root, factory) {
  const config = factory();
  if (typeof module === 'object' && module.exports) module.exports = config;
  if (root) root.TrackReleaseConfig = config;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  return {
    defaultLocale: 'en',
    publicLocales: ['en'],
    previewLocales: ['zh-CN'],
    allowLocalePreview: false,
    regionProfile: 'global',
    regions: {
      global: {weightUnit:'kg', distanceUnit:'km', annualPrice:null},
      'cn-prototype': {weightUnit:'kg', distanceUnit:'km', annualPrice:{amount:298, currency:'CNY', isPrototype:true}}
    }
  };
});
