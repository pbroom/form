import type {TextmateGrammar, TextmateTheme} from 'modern-monaco';

// Vendored Shiki themes (dark/light)
// Using static imports keeps the app fully offline and avoids runtime network access.
import vitesseDark from '@/vendor/shiki/themes/vitesse-dark.json';
import vitesseLight from '@/vendor/shiki/themes/vitesse-light.json';

// Vendored grammars we use in the editor
import jsGrammar from '@/vendor/shiki/grammars/javascript.json';
import jsxGrammar from '@/vendor/shiki/grammars/jsx.json';
import tsGrammar from '@/vendor/shiki/grammars/typescript.json';
import tsxGrammar from '@/vendor/shiki/grammars/tsx.json';
import glslGrammar from '@/vendor/shiki/grammars/glsl.json';
import cGrammar from '@/vendor/shiki/grammars/c.json';

export type VendoredThemeAndGrammars = {
	theme: TextmateTheme;
	langs: Array<TextmateGrammar>;
};

export async function loadVendoredThemeAndGrammars(
	isDark: boolean
): Promise<VendoredThemeAndGrammars> {
	// Static imports are already resolved; return synchronously-compatible values.
	const theme = (isDark ? vitesseDark : vitesseLight) as TextmateTheme;
	const langs = [
		jsGrammar as TextmateGrammar,
		jsxGrammar as TextmateGrammar,
		tsGrammar as TextmateGrammar,
		tsxGrammar as TextmateGrammar,
		glslGrammar as TextmateGrammar,
		cGrammar as TextmateGrammar,
	];
	return {theme, langs};
}
