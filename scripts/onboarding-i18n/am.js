import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'ደንበኛዎን ይወቁ',
    subtitle: 'ማረጋገጫ ሂደቱን ለመጀመር የመለያ አይነት ይምረጡ',
    individualCta: 'እንደ ግለሰብ ይቀጥሉ',
    businessCta: 'እንደ ንግድ ይቀጥሉ',
  },
  flow: {
    changeType: 'አይነት ቀይር',
    saveDraft: 'ረቂቅ አስቀምጥ',
    draftSaved: 'ሂደቱ ተቀምጧል። በኋላ መቀጠል ይችላሉ።',
    back: 'ወደ ቀዳሚው ደረጃ ተመለስ',
    continue: 'ወደ ቀጣይ ደረጃ ቀጥል',
  },
  terms: { submit: 'ማረጋገጫ አጠናቅቅ', submitting: 'በመላክ ላይ…' },
  completion: { goDashboard: 'ወደ ዳሽቦርድ ሂድ', startAnother: 'ሌላ ማረጋገጫ ጀምር' },
});
