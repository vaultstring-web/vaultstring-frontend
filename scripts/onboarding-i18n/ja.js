import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: '本人確認（KYC）',
    subtitle: 'アカウント種別を選択して認証を開始してください',
    individualTitle: '個人',
    individualCta: '個人として続行',
    businessTitle: '法人',
    businessCta: '法人として続行',
  },
  flow: {
    changeType: '種別を変更',
    saveDraft: '下書きを保存',
    draftSaved: '進捗を保存しました。後で再開できます。',
    back: '前のステップに戻る',
    stepSubtitle: 'ステップ {current} / {total}',
    continue: '次のステップへ',
  },
  terms: {
    submit: '認証を完了',
    submitting: '送信中…',
  },
  completion: {
    goDashboard: 'ダッシュボードへ',
    startAnother: '別の認証を開始',
  },
});
