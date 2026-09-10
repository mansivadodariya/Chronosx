import en from './en.json';
import ar from './ar.json';
import ary from './ary.json';
import es from './es.json';
import ru from './ru.json';
import zh from './zh.json';
import vi from './vi.json';
import id from './id.json';
import fil from './fil.json';

export const translations = {
  en,
  ar,
  ary,
  es,
  ru,
  zh,
  vi,
  id,
  fil,
};

/** All supported locale codes */
export const SUPPORTED_LOCALES = ['en', 'ar', 'ary', 'es', 'ru', 'zh', 'vi', 'id', 'fil'];

/** RTL locale codes */
export const RTL_LOCALES = ['ar', 'ary'];

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

  // 1. Try the selected language
  const currentDict = translations[lang];
  let result = resolveKey(currentDict, key);

  // 2. Fallback to English if missing
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
