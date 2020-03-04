import * as LitTranslate from '@appnest/lit-translate';

import { lookup } from 'langtag-utils';

import IntlMessageFormat from 'intl-messageformat';
window.IntlMessageFormat = IntlMessageFormat;

const DEFAULT_LOCALE = 'en-US';

interface StringsByLocale {
	[locale: string]: LitTranslate.Strings;
}

let currentLocale: string | null;
let currentLang: string;
let supportedLangs: string[] = [];

export function init(translations: StringsByLocale) {
	LitTranslate.registerTranslateConfig({
		interpolate: (text, values) => {
			const msg = new IntlMessageFormat(text, currentLang);
			return msg.format(values);
		},
		loader: lang => {
			currentLang = lang;
			return Promise.resolve(translations[lang]);
		},
		lookup: (key: string, transConfig: LitTranslate.ITranslateConfig): string | null => {
			const trans = transConfig.strings ? transConfig.strings[key] as string : null;

			return trans || null;
		},
	});

	supportedLangs = Object.keys(translations);
	return setLocale(currentLocale || DEFAULT_LOCALE);
}

/** @visibleForTesting */
export function reset() {
	// @ts-ignore
	currentLocale = undefined;
	// @ts-ignore
	currentLang = undefined;
	supportedLangs = [];
}

function isNonEmptyString(s: string|null): s is string {
	return Boolean(s);
}

/**
 * Compare function to sort tags by "longest first"
 */
function byTagLength(t1: string, t2: string): number {
	return t1.length > t2.length ? -1 : t1.length === t2.length ? 0 : 1;
}

/**
 * Sets the language of the application based on the viewer's locale.
 */
export async function setLocale(locale: string | null) {
	currentLocale = locale;

	// Use browser locale if not explicitly provided
	// Note that we want the DEFAULT_LOCALE to be part of the language preferences,
	// not the "if you have nothing else"-fallback: For some historic reasons
	// the default locale is actually not exactly what we have afterwards available.
	const ranges = [locale, navigator.language, DEFAULT_LOCALE].filter(isNonEmptyString);
	// Sort the tags by length, so that we find the _longest_ matching tag
	// See https://github.com/hupe1980/langtag-utils/issues/4
	const tags = supportedLangs.sort(byTagLength);
	const useLanguage = lookup(tags, ranges);
	return LitTranslate.use(useLanguage);
}

/**
 * Return the currently selected language
 *
 * The returned value is guaranteed to match one of the available entries
 * in the translations provided to `init`.
 */
export function getCurrentLang() {
	return currentLang;
}

/**
 * Return the currently selected locale
 *
 * @returns the value last provided to `setLocale` last
 */
export function getLocale() {
	return currentLocale;
}
