import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'Mọ Onibara Rẹ',
    subtitle: 'Yan iru iwe akọọlẹ lati bẹrẹ iṣẹ idaniloju',
    individualCta: 'Tẹsiwaju gẹgẹbi Eniyan',
    businessCta: 'Tẹsiwaju gẹgẹbi Iṣowo',
  },
  flow: {
    changeType: 'Yi Irú Padà',
    saveDraft: 'Fi Akọsilẹ Pamọ',
    draftSaved: 'A ti fi ilọsiwaju pamọ. O le tẹsiwaju nigbamii.',
    back: 'Pada si igbesẹ to kọja',
    continue: 'Tẹsiwaju si Igbesẹ to Kan',
  },
  terms: { submit: 'Parí Idaniloju', submitting: 'N fi ránṣẹ...' },
  completion: { goDashboard: 'Lọ si Dasibodu', startAnother: 'Bẹrẹ Idaniloju Miiran' },
});
