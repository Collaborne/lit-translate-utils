import { expect } from 'chai';
import 'mocha';

import { get, Strings } from '@appnest/lit-translate';

import { getCurrentLang, getLocale, init, reset, setLocale } from '../src';

function setNavigatorLanguage(language: string) {
	// Our browser-harness allows changing this value.
	// @ts-ignore
	window.navigator.language = language;
}

const TEST_TRANSLATIONS: {[locale: string]: Strings} = {
	en: {
		test: 'ENGLISH',
	},
	es: {
		test: 'SPANISH',
	},
	fr: {
		test: 'FRENCH',
	},
};

describe('lit-translate-utils', () => {
	beforeEach(reset);

	describe('init', () => {
		it('sets the current language', async () => {
			expect(getCurrentLang()).to.be.undefined;
			await init(TEST_TRANSLATIONS);
			expect(getCurrentLang()).to.be.equal('en');
		});
		it('can be called again without changing the current locale/language', async () => {
			await init(TEST_TRANSLATIONS);
			await setLocale('fr-EU');
			await init(TEST_TRANSLATIONS);

			expect(getLocale()).to.be.equal('fr-EU');
			expect(getCurrentLang()).to.be.equal('fr');
		});
		it('can be called again and resets the current language if no longer available', async () => {
			await init(TEST_TRANSLATIONS);
			await setLocale('fr');
			const {fr, ...translationsWithoutFrench} = TEST_TRANSLATIONS;
			await init(translationsWithoutFrench);

			expect(getCurrentLang()).to.be.equal('en');
		});
		it('uses a better matching set of translations automatically', async () => {
			await init(TEST_TRANSLATIONS);
			await setLocale('fr-EU');
			expect(get('test')).to.be.equal('FRENCH');
			await init({
				...TEST_TRANSLATIONS,
				'fr-EU': {
					test: 'EURO-FRENCH',
				},
			});

			expect(getLocale()).to.be.equal('fr-EU');
			expect(getCurrentLang()).to.be.equal('fr-EU');
			expect(get('test')).to.be.equal('EURO-FRENCH');
		});
	});
	describe('setLocale', () => {
		beforeEach(async () => {
			await init(TEST_TRANSLATIONS);
		});
		it('prefers the given locale', async () => {
			await setLocale('es');
			expect(get('test')).to.be.equal('SPANISH');
		});
		it('uses the browser locale as fallback', async () => {
			setNavigatorLanguage('fr-EU');
			await setLocale('no-EU');
			expect(get('test')).to.be.equal('FRENCH');
		});
		it('uses the DEFAULT_LOCALE as fallback', async () => {
			setNavigatorLanguage('fi-EU');
			await setLocale('no-EU');
			expect(get('test')).to.be.equal('ENGLISH');
		});
	});
	describe('getLocale', () => {
		beforeEach(async () => {
			await init(TEST_TRANSLATIONS);
		});
		it('returns the default locale without setLocale', () => {
			expect(getLocale()).to.be.equal('en-US');
		});
		it('returns the last value for setLocale', async () => {
			await setLocale('fr-EU');
			expect(getCurrentLang()).to.be.equal('fr');
			expect(getLocale()).to.be.equal('fr-EU');
		});
	});
});
