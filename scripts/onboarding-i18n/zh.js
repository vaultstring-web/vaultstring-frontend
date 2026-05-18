import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: '了解您的客户',
    subtitle: '选择账户类型以开始验证流程',
    individualTitle: '个人',
    individualCta: '以个人身份继续',
    businessTitle: '企业',
    businessCta: '以企业身份继续',
  },
  flow: {
    changeType: '更改类型',
    saveDraft: '保存草稿',
    draftSaved: '进度已保存，您可以稍后继续。',
    back: '返回上一步',
    stepSubtitle: '第 {current} 步，共 {total} 步',
    continue: '继续下一步',
  },
  terms: {
    submit: '完成验证',
    submitting: '提交中…',
  },
  completion: {
    goDashboard: '前往控制台',
    startAnother: '开始另一项验证',
  },
});
