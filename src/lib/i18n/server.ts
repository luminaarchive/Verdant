import { cookies } from "next/headers";
import { defaultLanguage, getDictionary, isLanguage, languageCookieName, translate, type Language } from ".";

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const value = cookieStore.get(languageCookieName)?.value;
  return isLanguage(value) ? value : defaultLanguage;
}

export async function getServerTranslations() {
  const language = await getServerLanguage();
  const dictionary = getDictionary(language);

  return {
    language,
    dictionary,
    t: (key: string, fallback?: string) => translate(dictionary, key, fallback),
  };
}
