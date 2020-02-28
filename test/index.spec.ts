import { expect } from 'chai';
import 'mocha';

import { get } from '@appnest/lit-translate';

import { init, setLocale } from '../src';

function setNavigatorLanguage(language: string) {
	// Our browser-harness allows changing this value.
	// @ts-ignore
	window.navigator.language = language;
}

describe('lit-translate-utils', () => {
	describe('setLocale', () => {
		beforeEach(async () => {
			await init({
				en: {
					test: 'ENGLISH',
				},
				es: {
					test: 'SPANISH',
				},
				fr: {
					test: 'FRENCH',
				},
			});
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
});
