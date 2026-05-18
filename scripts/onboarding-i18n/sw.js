import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'Mjue Mteja Wako',
    subtitle: 'Chagua aina ya akaunti kuanza mchakato wa uthibitishaji',
    individualTitle: 'Binafsi',
    individualCta: 'Endelea kama Binafsi',
    businessTitle: 'Biashara',
    businessCta: 'Endelea kama Biashara',
  },
  flow: {
    changeType: 'Badilisha Aina',
    saveDraft: 'Hifadhi Rasimu',
    draftSaved: 'Maendeleo yamehifadhiwa. Unaweza kuendelea baadaye.',
    back: 'Rudi hatua iliyotangulia',
    stepSubtitle: 'Hatua {current} kati ya {total}',
    continue: 'Endelea Hatua Inayofuata',
  },
  terms: {
    submit: 'Maliza Uthibitishaji',
    submitting: 'Inawasilishwa...',
  },
  completion: {
    goDashboard: 'Nenda kwenye Dashibodi',
    startAnother: 'Anza Uthibitishaji Mwingine',
  },
});
