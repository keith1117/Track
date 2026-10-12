(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TrackI18n = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function createI18n({messages, config, storage, browserLocales = [], search = ''}) {
    const normalize = value => /^en(?:-|$)/i.test(value || '') ? 'en' : /^zh-cn$/i.test(value || '') ? 'zh-CN' : null;
    const supported = ['en','zh-CN'];
    const publicLocales = config.publicLocales.filter(locale => supported.includes(locale));
    const available = [...new Set([...publicLocales,...(config.allowLocalePreview ? config.previewLocales : [])])].filter(locale => supported.includes(locale));
    const allowed = value => available.includes(normalize(value)) ? normalize(value) : null;
    const defaultLocale = allowed(config.defaultLocale) || 'en';
    let stored = null;
    try { stored = storage?.getItem('track.locale.v1'); } catch { /* Storage is optional. */ }
    const query = new URLSearchParams(search);
    let locale = query.has('locale') ? allowed(query.get('locale')) || defaultLocale
      : allowed(stored) || browserLocales.map(normalize).find(value => publicLocales.includes(value)) || defaultLocale;
    const missing = new Set();
    function t(key, params = {}) {
      let value = Object.hasOwn(messages[locale] || {}, key) ? messages[locale][key] : undefined;
      if (value === undefined) {
        missing.add(`${locale}:${key}`);
        value = Object.hasOwn(messages.en || {}, key) ? messages.en[key] : undefined;
      }
      if (value === undefined) { missing.add(`en:${key}`); return key; }
      if (typeof value === 'object') value = value[new Intl.PluralRules(locale).select(Number(params.count))] || value.other;
      return value.replace(/\{([a-zA-Z][\w]*)\}/g, (_, name) => {
        if (!Object.hasOwn(params, name)) { missing.add(`${locale}:${key}:{${name}}`); return `{${name}}`; }
        return typeof params[name] === 'number' ? new Intl.NumberFormat(locale).format(params[name]) : String(params[name]);
      });
    }
    return {
      getLocale: () => locale,
      getAvailableLocales: () => [...available],
      setLocale(value) {
        const next = allowed(value); if (!next) return false;
        locale = next;
        try { storage?.setItem('track.locale.v1', next); } catch { /* Preview works without persistence. */ }
        return true;
      },
      t,
      html: (key, params = {}) => escapeHTML(t(key, params)),
      formatNumber: (value, options = {}) => new Intl.NumberFormat(locale, options).format(value),
      formatDate: (value, options = {}) => new Intl.DateTimeFormat(locale, options).format(new Date(value)),
      formatPrice: price => new Intl.NumberFormat(locale, {style:'currency', currency:price.currency}).format(price.amount),
      getMissingKeys: () => [...missing]
    };
  }
  return {createI18n, escapeHTML};
});
