declare module 'accept-language-negotiator/src' {
	export function lookup(range: string, languageTags: string[], defaultValue: string): string;
}
