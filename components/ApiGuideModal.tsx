import React from 'react';
import { XCircleIcon } from './icons';

interface ApiGuideModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const LanguageGuide = ({ lang, title, steps, linkText }: { lang: string, title: string, steps: string[], linkText: string }) => (
    <div className="mb-6">
        <h4 className="font-semibold text-lg text-indigo-300 mb-2">{lang}</h4>
        <div className="bg-slate-900/50 p-4 rounded-md text-slate-300 space-y-2 text-sm">
            <p>{title}</p>
            <ol className="list-decimal list-inside space-y-1">
                {steps.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-block text-indigo-400 hover:text-indigo-300 hover:underline mt-2">
                {linkText}
            </a>
        </div>
    </div>
);


export const ApiGuideModal: React.FC<ApiGuideModalProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const guides = [
    { 
        lang: 'English', 
        title: 'How to get your Gemini API Key:',
        steps: [
            'Go to Google AI Studio.',
            'Click on "Get API Key".',
            'Create a new API key in your project.',
            'Copy the key and paste it into the app.'
        ],
        linkText: 'Go to Google AI Studio'
    },
    { 
        lang: 'বাংলা (Bengali)', 
        title: 'আপনার জেমিনি API কী কীভাবে পাবেন:',
        steps: [
            'Google AI Studio-তে যান।',
            '"Get API Key"-তে ক্লিক করুন।',
            'আপনার প্রজেক্টে একটি নতুন API কী তৈরি করুন।',
            'কী-টি কপি করে অ্যাপে পেস্ট করুন।'
        ],
        linkText: 'Google AI Studio-তে যান'
    },
    { 
        lang: 'हिन्दी (Hindi)', 
        title: 'अपनी जेमिनी API कुंजी कैसे प्राप्त करें:',
        steps: [
            'Google AI Studio पर जाएँ।',
            '"Get API Key" पर क्लिक करें।',
            'अपने प्रोजेक्ट में एक नई API कुंजी बनाएँ।',
            'कुंजी को कॉपी करें और ऐप में पेस्ट करें।'
        ],
        linkText: 'Google AI Studio पर जाएं'
    },
     { 
        lang: 'العربية (Arabic)', 
        title: 'كيفية الحصول على مفتاح Gemini API الخاص بك:',
        steps: [
            'اذهب إلى Google AI Studio.',
            'انقر على "Get API Key".',
            'قم بإنشاء مفتاح API جديد في مشروعك.',
            'انسخ المفتاح والصقه في التطبيق.'
        ],
        linkText: 'اذهب إلى Google AI Studio'
    },
    { 
        lang: '中文 (Chinese)', 
        title: '如何获取您的 Gemini API 密钥：',
        steps: [
            '前往 Google AI Studio。',
            '点击“获取 API 密钥”。',
            '在您的项目中创建一个新的 API 密钥。',
            '复制密钥并将其粘贴到应用程序中。'
        ],
        linkText: '前往 Google AI Studio'
    },
    { 
        lang: 'Русский (Russian)', 
        title: 'Как получить ключ Gemini API:',
        steps: [
            'Перейдите в Google AI Studio.',
            'Нажмите на "Get API Key".',
            'Создайте новый ключ API в своем проекте.',
            'Скопируйте ключ и вставьте его в приложение.'
        ],
        linkText: 'Перейти в Google AI Studio'
    },
  ];

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-800/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">API Key Guide</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors duration-200">
            <XCircleIcon className="w-7 h-7" />
          </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto">
            {guides.map(guide => <LanguageGuide key={guide.lang} {...guide} />)}
        </div>
      </div>
    </div>
  );
};