import * as LitTranslate from '@appnest/lit-translate';

import { lookup } from 'accept-language-negotiator';

import IntlMessageFormat from 'intl-messageformat';
window.IntlMessageFormat = IntlMessageFormat;

const DEFAULT_LOCALE = 'en-US';

interface StringsByLocale {
	[key: string]: LitTranslate.Strings;
}

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
	return setLocale(currentLang || DEFAULT_LOCALE);
}

/** @visibleForTesting */
export function reset() {
	// @ts-ignore
	currentLang = undefined;
	supportedLangs = [];
}

/**
 * Sets the language of the application based on the viewer's locale.
 */
export async function setLocale(locale: string | null) {
	// Use browser locale if not explicitly provided
	// Note that we want the DEFAULT_LOCALE to be part of the language preferences,
	// not the "if you have nothing else"-fallback: For some historic reasons
	// the default locale is actually not exactly what we have afterwards available.
	// The quality values here ensure that the preferences are applied properly, a simple
	// 'a,b,c' list means "any of these is fine".
	const range = `${locale || ''},${navigator.language};q=0.9,${DEFAULT_LOCALE};q=0.8`;
	const useLanguage = lookup(range, supportedLangs, 'i-default');
	return LitTranslate.use(useLanguage);
}

export function getCurrentLang() {
	return currentLang;
}
