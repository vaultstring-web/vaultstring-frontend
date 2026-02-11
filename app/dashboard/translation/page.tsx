'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Globe, Languages, Check, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

const languages = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸', region: 'United States' },
  { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧', region: 'United Kingdom' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸', region: 'España' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷', region: 'France' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪', region: 'Deutschland' },
  { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹', region: 'Italia' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹', region: 'Portugal' },
  { code: 'zh', name: '中文 (Chinese Simplified)', flag: '🇨🇳', region: '中国 (China)' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', region: '日本 (Japan)' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷', region: '대한민국 (South Korea)' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺', region: 'Россия (Russia)' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦', region: 'المملكة العربية السعودية (Saudi Arabia)' },
];

export default function TranslationPage() {
  const [selectedLang, setSelectedLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vs_language') || 'en';
    }
    return 'en';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageChange = (code: string) => {
    setIsTranslating(true);
    // Simulate API call/loading
    setTimeout(() => {
      setSelectedLang(code);
      localStorage.setItem('vs_language', code);
      setIsTranslating(false);
      toast.success('Language updated successfully');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Globe size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Translation</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Select your preferred language and region.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Languages size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Language</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose the language for the interface.</p>
                </div>
            </div>
            
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <Input 
                    placeholder="Search languages..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isTranslating}
              className={`
                relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                ${selectedLang === lang.code
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'
                }
              `}
            >
              <span className="text-3xl">{lang.flag}</span>
              <div>
                <div className={`font-bold ${selectedLang === lang.code ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                    {lang.name}
                </div>
                <div className={`text-xs font-medium ${selectedLang === lang.code ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {lang.region}
                </div>
              </div>
              
              {selectedLang === lang.code && (
                <div className="absolute top-4 right-4 text-blue-600 dark:text-blue-400">
                    <Check size={18} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
