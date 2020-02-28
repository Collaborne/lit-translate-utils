declare module 'accept-language-negotiator' {
	export function lookup(range: string, languageTags: string[], defaultValue: string): string;
}
