import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'Yazi Ikhasimende Lakho',
    subtitle: 'Khetha uhlobo lwe-akhawunti ukuze uqale ukuqinisekisa',
    individualCta: 'Qhubeka Njengomuntu Siqu',
    businessCta: 'Qhubeka Njengebhizinisi',
  },
  flow: {
    changeType: 'Shintsha Uhlobo',
    saveDraft: 'Londoloza Okusalungiswa',
    draftSaved: 'Inqubekelaphambili ilondoloziwe. Ungaqhubeka kamuva.',
    back: 'Buyela esinyathelweni sangaphambilini',
    continue: 'Qhubeka esinyathelweni esilandelayo',
  },
  terms: { submit: 'Qedela Ukuqinisekisa', submitting: 'Iyathumela...' },
  completion: { goDashboard: 'Iya ku-Dashboard', startAnother: 'Qala Okunye Ukuqinisekisa' },
});
