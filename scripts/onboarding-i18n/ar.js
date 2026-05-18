import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'اعرف عميلك',
    subtitle: 'اختر نوع الحساب لبدء عملية التحقق',
    individualTitle: 'فرد',
    individualCta: 'المتابعة كفرد',
    businessTitle: 'شركة',
    businessCta: 'المتابعة كشركة',
  },
  flow: {
    changeType: 'تغيير النوع',
    saveDraft: 'حفظ المسودة',
    draftSaved: 'تم حفظ التقدم. يمكنك المتابعة لاحقاً.',
    back: 'العودة إلى الخطوة السابقة',
    stepSubtitle: 'الخطوة {current} من {total}',
    continue: 'المتابعة إلى الخطوة التالية',
  },
  terms: {
    submit: 'إكمال التحقق',
    submitting: 'جارٍ الإرسال…',
  },
  completion: {
    goDashboard: 'الانتقال إلى لوحة التحكم',
    startAnother: 'بدء تحقق آخر',
  },
});
