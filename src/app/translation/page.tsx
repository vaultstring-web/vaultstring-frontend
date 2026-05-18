'use client';

import { useState } from 'react';
import { Globe, Languages, Check, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES } from '@/src/lib/constants/africa';
import { useTranslations } from 'next-intl';

export default function TranslationPage() {
  const tTop = useTranslations('TopBar');
  const t = useTranslations('Translation');
  const [selectedLang, setSelectedLang] = useState(() => {
    if (typeof window !== 'undefined') {
      // Canonical locale store is `vs_locale` (cookie); localStorage is just a UI convenience.
      return localStorage.getItem('vs_locale') || 'en';
    }
    return 'en';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    String(lang.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(lang.region).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageChange = (code: string) => {
    setIsTranslating(true);
    setTimeout(() => {
      setSelectedLang(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vs_locale', code);
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `vs_locale=${code}; path=/; max-age=${maxAge}`;
      }
      setIsTranslating(false);
      toast.success(t('languageUpdated'));
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Globe size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{tTop('titles.translation')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Languages size={16} />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('appLanguage')}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('appLanguageHint')}</p>
                </div>
            </div>
            
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <Input 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border-none font-medium"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isTranslating}
              className={`
                relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                ${selectedLang === lang.code
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'
                }
              `}
            >
              <span className="text-xl">{lang.flag}</span>
              <div>
                <div className={`text-sm font-bold ${selectedLang === lang.code ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                    {lang.name}
                </div>
                <div className={`text-xs font-medium ${selectedLang === lang.code ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {lang.region}
                </div>
              </div>
              
              {selectedLang === lang.code && (
                <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400">
                    <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
