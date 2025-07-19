import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supportedLanguages } from '@/lib/i18n';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe, Check } from 'lucide-react';

type Language = 'en' | 'zh' | 'fr' | 'de' | 'hi' | 'it' | 'ja' | 'pt' | 'ru' | 'es' | 'tr';

const SUPPORTED_LANGUAGES = [
  { code: 'en' as Language, name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'tr' as Language, name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh' as Language, name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'fr' as Language, name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'it' as Language, name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja' as Language, name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'pt' as Language, name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru' as Language, name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es' as Language, name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, changeLanguage, currentLanguage } = useTranslation();
  
  const currentLangData = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (langCode: Language) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 bg-hermes-card border-hermes-border hover:bg-[#62cbc1] hover:text-white text-white"
        >
          <Globe className="w-4 h-4" />
          <span className="text-lg">{currentLangData?.flag}</span>
          <span className="hidden sm:block">{currentLangData?.nativeName}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-hermes-card border-hermes-border max-w-md max-h-96 overflow-y-auto" aria-describedby="language-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Select Language / Dil Seç</span>
          </DialogTitle>
          <p id="language-description" className="text-sm text-gray-400 sr-only">
            Choose your preferred language for the interface
          </p>
        </DialogHeader>
        
        <div className="grid gap-2 mt-4">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              className="w-full justify-start text-left p-3 h-auto text-white border-transparent bg-transparent hover:bg-[#62cbc1]/50 hover:text-white rounded-lg transition-colors flex"
              style={{
                backgroundColor: currentLanguage === language.code ? '#62cbc1' : 'transparent',
                color: currentLanguage === language.code ? '#000000' : '#ffffff',
              }}
              onMouseEnter={(e) => {
                if (currentLanguage !== language.code) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.5)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (currentLanguage !== language.code) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-sm opacity-70">{language.name}</span>
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 ml-auto text-black" />
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}