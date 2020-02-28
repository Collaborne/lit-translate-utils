declare module 'accept-language-negotiator/src' {
	export function languagePriorityList(range: string): Array<{tag: string, quality: number}>;
	export function basicFilter(range: string, languageTags: string[]): string[];
	export function extendedFilter(range: string, languageTags: string[]): string[];
	export function lookup(range: string, languageTags: string[], defaultValue: string | undefined): string | undefined;
}
