import * as LitTranslate from '@appnest/lit-translate';

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
	setLocale(DEFAULT_LOCALE);
}

/**
 * Sets the language of the application based on the viewer's locale.
 */
export function setLocale(locale: string | null) {
	// Use browser locale if not explcitely provided
	const useLocale = locale || navigator.language || '';

	const language = useLocale.replace(/[-_].*/, '');

	// Only allow picking locales for which we have translations
	const useLanguage = supportedLangs.includes(language) ? language : DEFAULT_LOCALE;

	LitTranslate.use(useLanguage);
}
