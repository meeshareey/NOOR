import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Tabs } from './components/Tabs';
import { SearchView } from './components/SearchView';
import { VocabularyView } from './components/VocabularyView';
import { AboutView } from './components/AboutView';
import { Language } from './types';
import { LANGUAGES } from './constants';

const UI_TEXTS = {
  ar: {
    // Search View
    welcomeTitle: 'مرحباً بك في نور',
    welcomeSubtitle: 'مساعدك لفهم اللغة العربية وتعاليم الإسلام. اسأل أي شيء.',
    searchPlaceholder: 'اسأل عن اللغة العربية أو التعاليم الإسلامية...',
    searchButton: 'بحث',
    sources: 'المصادر',
    noSources: 'لم يتم العثور على مصادر.',
    errorGeneric: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    errorNetwork: 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.',
    errorApiKey: 'حدثت مشكلة في الإعدادات. يرجى الاتصال بالدعم.',
    errorQuota: 'الخدمة مشغولة حاليًا. يرجى المحاولة مرة أخرى بعد لحظات قليلة.',
    // Tabs
    searchTab: 'بحث',
    vocabularyTab: 'مفردات',
    aboutTab: 'حول',
    // Vocabulary View
    vocabTitle: 'باني المفردات',
    vocabSubtitle: 'اختر فئة واحصل على قائمة لا نهائية من المفردات.',
    selectCategory: 'اختر فئة',
    tableHeadArabic: 'العربية',
    tableHeadEnglish: 'الإنجليزية',
    tableHeadHausa: 'الهوسا',
    // About View
    aboutTitle: 'ما هو نور؟',
    aboutContent: `
نور هو مساعد تعليمي مدعوم بالذكاء الاصطناعي مصمم خصيصًا للطلاب الذين يسعون إلى فهم أعمق للغة العربية والتعاليم الإسلامية. مهمتنا هي جعل المعرفة المعقدة بسيطة ومتاحة ومشجعة للجميع.

**كيف يساعدك نور؟**

1.  **محرك بحث ذكي:** بدلاً من مجرد البحث في الويب، يستخدم نور الذكاء الاصطناعي للبحث في الإنترنت بالكامل، وفهم استفسارك، وتقديم إجابة شاملة وسهلة الفهم. إنه مثل وجود مدرس خبير بجانبك، جاهز لتبسيط أي موضوع.

2.  **دعم متعدد اللغات:** نحن نؤمن بأن اللغة لا ينبغي أن تكون عائقًا أمام التعلم. يوفر نور إجابات باللغة العربية والإنجليزية والهوسا، مما يسمح لك بالتعلم باللغة التي تناسبك.

3.  **باني مفردات لا نهائي:** تعلم المفردات أمر أساسي. تتيح لك علامة التبويب "مفردات" اختيار فئة وإنشاء قائمة لا حصر لها من الكلمات مع ترجماتها. يتم عرض جميع الكلمات العربية مع التشكيل الكامل لضمان النطق الصحيح.

**الشفافية والتكنولوجيا**

تم بناء نور باستخدام نموذج Gemini القوي من Google AI لضراسة ضمان حصولك على إجابات دقيقة ومحدثة وسياقية. نحن ملتزمون بتوفير أداة تعليمية شفافة وقوية لدعم رحلتك التعليمية.
    `,
    // Feedback
    feedbackButton: 'ملاحظات',
    feedbackModalTitle: 'تقديم ملاحظات',
    feedbackPlaceholder: 'ما الذي أعجبك أو لم يعجبك في النتائج؟',
    submitButton: 'إرسال',
    cancelButton: 'إلغاء',
    retryButton: 'إعادة المحاولة',
  },
  en: {
    // Search View
    welcomeTitle: 'Welcome to NOOR',
    welcomeSubtitle: 'Your assistant for understanding Arabic and Islamic teachings. Ask anything.',
    searchPlaceholder: 'Ask about Arabic language or Islamic teachings...',
    searchButton: 'Search',
    sources: 'Sources',
    noSources: 'No sources found.',
    errorGeneric: 'An unexpected error occurred. Please try again.',
    errorNetwork: 'Network connection failed. Please check your internet connection.',
    errorApiKey: 'There was a configuration issue. Please contact support.',
    errorQuota: 'The service is currently busy. Please try again in a few moments.',
    // Tabs
    searchTab: 'Search',
    vocabularyTab: 'Vocabulary',
    aboutTab: 'About',
    // Vocabulary View
    vocabTitle: 'Vocabulary Builder',
    vocabSubtitle: 'Select a category and get an endless list of vocabulary.',
    selectCategory: 'Select a category',
    tableHeadArabic: 'Arabic',
    tableHeadEnglish: 'English',
    tableHeadHausa: 'Hausa',
    // About View
    aboutTitle: 'What is NOOR?',
    aboutContent: `
NOOR is an AI-powered learning assistant designed specifically for students seeking a deeper understanding of the Arabic language and Islamic teachings. Our mission is to make complex knowledge simple, accessible, and encouraging for everyone.

**How does NOOR help you?**

1.  **Intelligent Search Engine:** Instead of just browsing the web, NOOR uses AI to search the entire internet, understand your query, and synthesize a comprehensive, easy-to-understand answer. It's like having an expert tutor by your side, ready to simplify any topic.

2.  **Multi-Language Support:** We believe language should never be a barrier to learning. NOOR provides answers in Arabic, English, and Hausa, allowing you to learn in the language that works best for you.

3.  **Infinite Vocabulary Builder:** Learning vocabulary is fundamental. Our 'Vocabulary' tab lets you pick a category and generate an endless list of words with their translations. All Arabic words are presented with full vowels (Tashkeel) to ensure correct pronunciation.

**Transparency & Technology**

NOOR is built using Google's powerful Gemini AI model to ensure you receive accurate, up-to-date, and contextually relevant answers. We are committed to providing a transparent and powerful educational tool to support your learning journey.
    `,
    // Feedback
    feedbackButton: 'Feedback',
    feedbackModalTitle: 'Provide Feedback',
    feedbackPlaceholder: 'What did you like or dislike about the results?',
    submitButton: 'Submit',
    cancelButton: 'Cancel',
    retryButton: 'Retry',
  },
  ha: {
    // Search View
    welcomeTitle: 'Barka da zuwa NOOR',
    welcomeSubtitle: 'Mataimakin ku don fahimtar harshen Larabci da koyarwar Musulunci. Tambayi komai.',
    searchPlaceholder: 'Yi tambaya game da harshen Larabci ko koyarwar Musulunci...',
    searchButton: 'Bincika',
    sources: 'Majiya',
    noSources: 'Ba a sami majiya ba.',
    errorGeneric: 'An sami kuskure da ba a zata ba. Da fatan za a sake gwadawa.',
    errorNetwork: 'Haɗin yanar gizo ya kasa. Da fatan za a duba haɗin intanet ɗinku.',
    errorApiKey: 'An sami matsala ta sanyi. Da fatan za a tuntuɓi tallafi.',
    errorQuota: 'Sabis ɗin yana aiki a halin yanzu. Da fatan za a sake gwadawa anan gaba kaɗan.',
    // Tabs
    searchTab: 'Bincike',
    vocabularyTab: 'Kalmomi',
    aboutTab: 'Game da',
    // Vocabulary View
    vocabTitle: 'Gina Kalmomi',
    vocabSubtitle: 'Zaɓi rukuni kuma sami jerin kalmomi marasa iyaka.',
    selectCategory: 'Zaɓi rukuni',
    tableHeadArabic: 'Larabci',
    tableHeadEnglish: 'Turanci',
    tableHeadHausa: 'Hausa',
    // About View
    aboutTitle: 'Menene NOOR?',
    aboutContent: `
NOOR wani mataimaki ne na ilmantarwa da ke amfani da basirar wucin gadi (AI), wanda aka kera shi musamman don ɗaliban da ke neman zurfafa fahimtar harshen Larabci da koyarwar Musulunci. Manufarmu ita ce sauƙaƙe ilimi mai zurfi, samar da shi ga kowa, da kuma ƙarfafa gwiwa.

**Yaya NOOR ke taimaka maka?**

1.  **Ingantaccen Injin Bincike:** Maimakon bincike a yanar gizo kawai, NOOR yana amfani da AI don bincika dukkan intanet, fahimtar tambayarka, da kuma samar da amsa mai sauƙin fahimta. Kamar kana da ƙwararren malami a gefenka, a shirye don sauƙaƙe kowane fanni.

2.  **Taimako da Harsuna Daban-daban:** Mun yi imanin cewa harshe bai kamata ya zama shamaki ga ilimi ba. NOOR yana ba da amsoshi a cikin Larabci, Turanci, da Hausa, wanda zai ba ka damar koya a harshen da ya fi maka sauƙi.

3.  **Gina Kalmomi Marasa Iyaka:** Koyon sabbin kalmomi yana da matuƙar muhimmanci. Shafinmu na 'Kalmomi' yana ba ka damar zaɓar rukuni da kuma samar da jerin kalmomi marasa iyaka tare da fassarorinsu. Dukkan kalmomin Larabci suna zuwa da cikakken wasali (Tashkeel) don tabbatar da lafazin da ya dace.

**Bayyanawa & Fasaha**

An gina NOOR ta amfani da ingantaccen tsarin Gemini AI na Google don tabbatar da cewa ka sami amsoshi ingantattu, na zamani, kuma masu ma'ana. Mun himmatu wajen samar da kayan aiki na ilimi mai bayyana kuma mai ƙarfi don tallafawa tafiyarka ta ilimi.
    `,
    // Feedback
    feedbackButton: 'Ra\'ayi',
    feedbackModalTitle: 'Bayar da Ra\'ayi',
    feedbackPlaceholder: 'Me kuka so ko ba ku so game da sakamakon?',
    submitButton: 'Aika',
    cancelButton: 'Soke',
    retryButton: 'Sake gwadawa',
  }
};

type ActiveTab = 'search' | 'vocabulary' | 'about';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(LANGUAGES[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  
  const uiText = useMemo(() => UI_TEXTS[currentLanguage.code as keyof typeof UI_TEXTS], [currentLanguage]);

  useEffect(() => {
    document.documentElement.lang = currentLanguage.code;
    document.documentElement.dir = currentLanguage.dir;
  }, [currentLanguage]);
  
  const TABS = [
      { id: 'search', label: uiText.searchTab },
      { id: 'vocabulary', label: uiText.vocabularyTab },
      { id: 'about', label: uiText.aboutTab },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-teal-900 to-gray-900 text-white flex flex-col font-sans">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        languages={LANGUAGES}
      />
      <main className="flex-grow flex flex-col items-center p-4 pt-24 md:pt-32">
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as ActiveTab)} />

        {activeTab === 'search' && (
            <SearchView 
                currentLanguage={currentLanguage} 
                uiText={{
                    welcomeTitle: uiText.welcomeTitle,
                    welcomeSubtitle: uiText.welcomeSubtitle,
                    searchPlaceholder: uiText.searchPlaceholder,
                    searchButton: uiText.searchButton,
                    sources: uiText.sources,
                    noSources: uiText.noSources,
                    errorGeneric: uiText.errorGeneric,
                    errorNetwork: uiText.errorNetwork,
                    errorApiKey: uiText.errorApiKey,
                    errorQuota: uiText.errorQuota,
                    feedbackButton: uiText.feedbackButton,
                    feedbackModalTitle: uiText.feedbackModalTitle,
                    feedbackPlaceholder: uiText.feedbackPlaceholder,
                    submitButton: uiText.submitButton,
                    cancelButton: uiText.cancelButton,
                    retryButton: uiText.retryButton,
                }} 
            />
        )}
        
        {activeTab === 'vocabulary' && (
            <VocabularyView 
                currentLanguage={currentLanguage} 
                uiText={{
                    title: uiText.vocabTitle,
                    subtitle: uiText.vocabSubtitle,
                    selectCategory: uiText.selectCategory,
                    tableHeadArabic: uiText.tableHeadArabic,
                    tableHeadEnglish: uiText.tableHeadEnglish,
                    tableHeadHausa: uiText.tableHeadHausa,
                    errorGeneric: uiText.errorGeneric,
                    errorNetwork: uiText.errorNetwork,
                    errorApiKey: uiText.errorApiKey,
                    errorQuota: uiText.errorQuota,
                    retryButton: uiText.retryButton,
                }}
            />
        )}

        {activeTab === 'about' && (
            <AboutView
                uiText={{
                    title: uiText.aboutTitle,
                    content: uiText.aboutContent
                }}
                dir={currentLanguage.dir}
            />
        )}

      </main>
      <Footer />
    </div>
  );
}