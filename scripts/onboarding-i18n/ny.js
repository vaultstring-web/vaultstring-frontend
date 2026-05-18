import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'Dziwani Makasitomala Anu',
    subtitle: 'Sankhani mtundu wa akaunti kuyambira kutsimikizira',
    individualCta: 'Pitirizani ngati Munthu',
    businessCta: 'Pitirizani ngati Bizinesi',
  },
  flow: {
    changeType: 'Sinthani Mtundu',
    saveDraft: 'Sungani Draft',
    draftSaved: 'Patsogolo lasungidwa. Mutha kupitiriza pambuyo pake.',
    back: 'Bwererani ku gawo lapitalo',
    continue: 'Pitilizani ku Gawo Lotsatira',
  },
  terms: { submit: 'Malizitsani Kutsimikizira', submitting: 'Ikutumiza...' },
  completion: { goDashboard: 'Pitani ku Dashboard', startAnother: 'Yambitsani Kutsimikizira Kwina' },
});
