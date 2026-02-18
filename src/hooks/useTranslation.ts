import { useNavigationStore } from '../store/useNavigationStore';
import { translations } from '../lib/translations';
import type { TranslationKeys, Language } from '../lib/translations';

export function useTranslation() {
    const { language } = useNavigationStore();

    const t = (key: TranslationKeys): string => {
        const langPack = translations[language as Language] || translations.EN;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (langPack as any)[key] || (translations.EN as any)[key] || key;
    };

    return { t, language };
}
