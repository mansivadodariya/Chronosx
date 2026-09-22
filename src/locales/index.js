import en from './en.json';

/**
 * In-memory cache for loaded language dictionaries. 'en' is bundled as base fallback
 */
export const translations = {
  en,
};

/** All supported locale codes */
export const SUPPORTED_LOCALES = ['en', 'ar', 'ary', 'es', 'ru', 'zh', 'vi', 'id', 'fil'];

/** RTL locale codes */
export const RTL_LOCALES = ['ar', 'ary'];

/**
 * Dynamic loader map for non-English locales to prevent bundling ~750KB on initial load
 */
const localeLoaders = {
  ar: () => import('./ar.json'),
  ary: () => import('./ary.json'),
  es: () => import('./es.json'),
  ru: () => import('./ru.json'),
  zh: () => import('./zh.json'),
  vi: () => import('./vi.json'),
  id: () => import('./id.json'),
  fil: () => import('./fil.json'),
};

/**
 * Dynamically load dictionary for a given locale if not yet cached.
 *
 * @param {string} lang - Locale code
 * @returns {Promise<Object>}
 */
export async function loadLocaleData(lang) {
  if (!lang || lang === 'en' || translations[lang]) {
    return translations[lang] || translations.en;
  }
  if (localeLoaders[lang]) {
    try {
      const module = await localeLoaders[lang]();
      translations[lang] = module.default || module;
      return translations[lang];
    } catch (e) {
      console.warn('[Locales] Could not dynamically load locale "' + lang + '":', e);
    }
  }
  return translations.en;
}

/**
 * Resolve a nested key like "nav.home" from a translations dict.
 * Returns undefined if any segment is missing.
 */
function resolveKey(dict, key) {
  if (!dict || !key) return undefined;
  const keys = key.split('.');
  let result = dict;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return undefined;
    }
  }
  return result;
}

/**
 * Replace {{variable}} placeholders in a string with provided values.
 * Example: interpolate("Hello, {{name}}!", { name: "Trader" }) => "Hello, Trader!"
 */
function interpolate(template, variables) {
  if (!template || typeof template !== 'string' || !variables) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? String(variables[varName]) : match;
  });
}

/**
 * Get a translated string for a given language and key.
 *
 * @param {string} lang - Locale code (e.g. 'en', 'ar', 'es')
 * @param {string} key - Dot-notation key (e.g. 'nav.home')
 * @param {string} [fallback] - Fallback string if key is not found in any locale
 * @param {Object} [variables] - Variables for interpolation (e.g. { name: 'Trader' })
 * @returns {string}
 */
export const getTranslation = (lang, key, fallback = '', variables = null) => {
  if (!key) return fallback;

  // 1. Try the selected language if loaded
  const currentDict = translations[lang];
  let result = resolveKey(currentDict, key);

  // 2. Fallback to English if missing or not yet loaded
  if (result === undefined || result === null || result === '') {
    result = resolveKey(translations.en, key);
  }

  // 3. Final fallback
  if (result === undefined || result === null || result === '') {
    return fallback || key;
  }

  // 4. Apply interpolation if variables provided
  if (variables && typeof result === 'string') {
    return interpolate(result, variables);
  }

  return result;
};