// Plik: frontend/src/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Komponenty SVG dla flag
const PolishFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-6 h-4 rounded-sm">
        <rect width="5" height="3" fill="#fff"/>
        <rect width="5" height="1.5" y="1.5" fill="#dc143c"/>
    </svg>
);

const BritishFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-4 rounded-sm">
        <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
        <path d="M0 0v30h60V0z" fill="#012169"/>
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/>
        <path d="M0 0l60 30m0-30L0 30" stroke="#c8102e" strokeWidth="4" clipPath="url(#a)"/>
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6"/>
    </svg>
);

const UkrainianFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-4 rounded-sm">
        <path fill="#005bbb" d="M0 0h512v256H0z"/>
        <path fill="#ffd500" d="M0 256h512v256H0z"/>
    </svg>
);


const languages = [
  { code: 'pl', name: 'Polski', flag: <PolishFlag /> },
  { code: 'en', name: 'English', flag: <BritishFlag /> },
  { code: 'uk', name: 'Українська', flag: <UkrainianFlag /> },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lng) => (
        <motion.button
          key={lng.code}
          onClick={() => changeLanguage(lng.code)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            i18n.resolvedLanguage === lng.code
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {lng.flag}
          <span className="text-sm font-semibold">{lng.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
