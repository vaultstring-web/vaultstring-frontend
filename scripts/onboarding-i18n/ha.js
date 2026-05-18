import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'San Abokin Cinikinka',
    subtitle: 'Zaɓi nau\'in asusun don fara tantancewa',
    individualCta: 'Ci gaba a matsayin Mutum',
    businessCta: 'Ci gaba a matsayin Kasuwanci',
  },
  flow: {
    changeType: 'Canja Nau\'i',
    saveDraft: 'Ajiye Draft',
    draftSaved: 'An ajiye ci gaba. Za ka iya ci gaba daga baya.',
    back: 'Komawa mataki na baya',
    continue: 'Ci gaba zuwa Mataki na Gaba',
  },
  terms: { submit: 'Kammala Tantancewa', submitting: 'Ana aikawa...' },
  completion: { goDashboard: 'Je zuwa Dashboard', startAnother: 'Fara wani Tantancewa' },
});
