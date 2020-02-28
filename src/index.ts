import * as LitTranslate from '@appnest/lit-translate';

import { lookup } from 'accept-language-negotiator/src';

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

/**
 * Sets the language of the application based on the viewer's locale.
 */
export async function setLocale(locale: string | null) {
	currentLocale = locale;

	// Use browser locale if not explicitly provided
	// Note that we want the DEFAULT_LOCALE to be part of the language preferences,
	// not the "if you have nothing else"-fallback: For some historic reasons
	// the default locale is actually not exactly what we have afterwards available.
	// The quality values here ensure that the preferences are applied properly, a simple
	// 'a,b,c' list means "any of these is fine".
	//
	// The "lookup" algorithm as implemented by the accept-language-negotiator seems to prefer
	// exact matches even with lower quality ratings, we want to have the quality to be the only
	// relevant factor. As the user may have configured a browser language that matches exactly
	// we therefore run two lookups.
	let useLanguage = lookup(locale || navigator.language, supportedLangs, undefined);
	if (!useLanguage) {
		const range = `${navigator.language},${DEFAULT_LOCALE};q=0.9`;
		useLanguage = lookup(range, supportedLangs, 'i-default')!;
	}
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
