/**
 * Build phase-3 i18n patches:
 * - Missing keys vs en (structural sync)
 * - Keys still identical to en where zu (or fr) has a translation
 * Outputs scripts/i18n-patches/phase3-customer.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const patchesDir = path.join(__dirname, 'i18n-patches');
const outPath = path.join(patchesDir, 'phase3-customer.json');

const LOCALES = ['fr', 'pt', 'sw', 'ar', 'zh', 'ja', 'am', 'yo', 'ha', 'zu', 'ny'];
const REFERENCE_LOCALES = ['zu', 'fr', 'ha', 'pt'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flatten(obj, prefix = '', out = {}) {
  if (!isPlainObject(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) flatten(v, next, out);
    else out[next] = v;
  }
  return out;
}

function loadFlat(locale) {
  const p = path.join(messagesDir, `${locale}.json`);
  return flatten(JSON.parse(fs.readFileSync(p, 'utf8')));
}

const en = loadFlat('en');
const refs = Object.fromEntries(REFERENCE_LOCALES.map((l) => [l, loadFlat(l)]));

const patches = {};
const stats = {};

for (const locale of LOCALES) {
  const loc = loadFlat(locale);
  const patch = {};
  let count = 0;

  for (const [key, enVal] of Object.entries(en)) {
    const current = loc[key];
    const missing = current === undefined;
    const stillEnglish = !missing && String(current) === String(enVal);

    if (!missing && !stillEnglish) continue;

    let translated = null;
    for (const refLocale of REFERENCE_LOCALES) {
      const refVal = refs[refLocale][key];
      if (refVal !== undefined && String(refVal) !== String(enVal)) {
        translated = refVal;
        break;
      }
    }

    if (translated !== null) {
      patch[key] = translated;
      count++;
    }
  }

  if (count > 0) {
    patches[locale] = patch;
    stats[locale] = count;
  }
}

// Manual Settings section translations (47 keys) — zu reference
const settingsZu = {
  'Settings.nav.account': 'I-akhawunti',
  'Settings.nav.security': 'Ezokuphepha',
  'Settings.nav.notifications': 'Izaziso',
  'Settings.nav.language': 'Ulimi nesifunda',
  'Settings.nav.appearance': 'Ukubukeka',
  'Settings.nav.privacy': 'Ubumfihlo',
  'Settings.nav.limits': 'Imikhawulo',
  'Settings.nav.connectedAccounts': 'Ama-akhawunti axhunyiwe',
  'Settings.nav.helpSupport': 'Usizo nokusekela',
  'Settings.account.title': 'I-akhawunti',
  'Settings.account.subtitle': 'Ubunikazi bakho be-VaultString nesimo sokuqinisekisa.',
  'Settings.account.signedInAs': 'Ungene njengo',
  'Settings.account.verificationStatus': 'Isimo sokuqinisekisa',
  'Settings.account.memberSince': 'Ilungu kusukela',
  'Settings.account.manageProfile': 'Phatha iphrofayili',
  'Settings.account.verified': 'Iqinisekisiwe',
  'Settings.account.pending': 'Kulindwe ukubuyekeza',
  'Settings.account.unverified': 'Ayiqinisekisiwe',
  'Settings.privacy.title': 'Ubumfihlo',
  'Settings.privacy.subtitle': 'Lawula ukuthi idatha yakho isetshenziswa kanjani.',
  'Settings.privacy.analytics.title': 'Ukuhlaziya kokusetshenziswa',
  'Settings.privacy.analytics.subtitle': 'Siza ukuthuthukisa i-VaultString ngemininingwane engaziwa',
  'Settings.privacy.marketing.title': 'Iziphakamiso ezenzelwe wena',
  'Settings.privacy.marketing.subtitle': 'Vumela izincomo zemikhiqizo ngokusekelwe emisebenzini',
  'Settings.privacy.profileVisibility.title': 'Iphrofayili yomphakathi',
  'Settings.privacy.profileVisibility.subtitle': 'Bonisa isixhumanisi sephrofayili kumarisidi okhokhelwayo',
  'Settings.limits.title': 'Imikhawulo',
  'Settings.limits.subtitle': 'Imikhawulo yokudlulisela ne-akhawunti yezinga lakho lokuqinisekisa.',
  'Settings.limits.monthlyLimit': 'Umkhawulo wokudlulisela wanyanga zonke',
  'Settings.limits.usedThisMonth': 'Kusetshenziswe kule nyanga',
  'Settings.limits.remaining': 'Okusele',
  'Settings.limits.readOnlyNote': 'Imikhawulo imiswa uzinga lokuqinisekisa futhi ayikwazi ukushintshwa lapha.',
  'Settings.limits.upgradeCta': 'Qedela ukuqinisekisa ukuze wandise imikhawulo',
  'Settings.connectedAccounts.title': 'Ama-akhawunti axhunyiwe',
  'Settings.connectedAccounts.subtitle': 'Xhumanisa ama-wallet angaphandle nabahlinzeki bezinkokhelo.',
  'Settings.connectedAccounts.comingSoon': 'Kuyeza maduzane',
  'Settings.connectedAccounts.comingSoonDetail': 'Ukuxhumanisa ibhange ne-mobile money kuzotholakala esikhathini esizayo.',
  'Settings.helpSupport.title': 'Usizo nokusekela',
  'Settings.helpSupport.subtitle': 'Thola usizo futhi ufunde kabanzi nge-VaultString.',
  'Settings.helpSupport.helpCenter': 'Isikhungo sosizo',
  'Settings.helpSupport.helpCenterDesc': 'Dlulisa izinkombiso ne-FAQ',
  'Settings.helpSupport.contactSupport': 'Xhumana nosizo',
  'Settings.helpSupport.contactSupportDesc': 'Thumela i-imeyili eqenjini lethu losizo',
  'Settings.helpSupport.compliance': 'Ukuqinisekisa ubunikazi',
  'Settings.helpSupport.complianceDesc': 'Phatha amadokhumenti e-KYC nesimo',
  'Settings.helpSupport.securityGuide': 'Izinqubo ezinhle zokuphepha',
  'Settings.helpSupport.securityGuideDesc': 'Gcina i-akhawunti yakho iphephile',
};

const settingsFr = {
  'Settings.nav.account': 'Compte',
  'Settings.nav.security': 'Sécurité',
  'Settings.nav.notifications': 'Notifications',
  'Settings.nav.language': 'Langue et région',
  'Settings.nav.appearance': 'Apparence',
  'Settings.nav.privacy': 'Confidentialité',
  'Settings.nav.limits': 'Limites',
  'Settings.nav.connectedAccounts': 'Comptes connectés',
  'Settings.nav.helpSupport': 'Aide et support',
  'Settings.account.title': 'Compte',
  'Settings.account.subtitle': 'Votre identité VaultString et statut de vérification.',
  'Settings.account.signedInAs': 'Connecté en tant que',
  'Settings.account.verificationStatus': 'Statut de vérification',
  'Settings.account.memberSince': 'Membre depuis',
  'Settings.account.manageProfile': 'Gérer le profil',
  'Settings.account.verified': 'Vérifié',
  'Settings.account.pending': 'En cours d’examen',
  'Settings.account.unverified': 'Non vérifié',
  'Settings.privacy.title': 'Confidentialité',
  'Settings.privacy.subtitle': 'Contrôlez l’utilisation et le partage de vos données.',
  'Settings.privacy.analytics.title': 'Analyses d’utilisation',
  'Settings.privacy.analytics.subtitle': 'Aidez à améliorer VaultString avec des données anonymisées',
  'Settings.privacy.marketing.title': 'Offres personnalisées',
  'Settings.privacy.marketing.subtitle': 'Autoriser des recommandations basées sur l’activité',
  'Settings.privacy.profileVisibility.title': 'Profil public',
  'Settings.privacy.profileVisibility.subtitle': 'Afficher votre lien de profil sur les reçus partagés',
  'Settings.limits.title': 'Limites',
  'Settings.limits.subtitle': 'Limites de transaction pour votre niveau de vérification.',
  'Settings.limits.monthlyLimit': 'Limite mensuelle de transfert',
  'Settings.limits.usedThisMonth': 'Utilisé ce mois-ci',
  'Settings.limits.remaining': 'Restant',
  'Settings.limits.readOnlyNote': 'Les limites sont définies par votre niveau de vérification.',
  'Settings.limits.upgradeCta': 'Complétez la vérification pour augmenter les limites',
  'Settings.connectedAccounts.title': 'Comptes connectés',
  'Settings.connectedAccounts.subtitle': 'Liez des portefeuilles et prestataires externes.',
  'Settings.connectedAccounts.comingSoon': 'Bientôt disponible',
  'Settings.connectedAccounts.comingSoonDetail': 'La liaison bancaire et mobile money arrive prochainement.',
  'Settings.helpSupport.title': 'Aide et support',
  'Settings.helpSupport.subtitle': 'Obtenez de l’aide et en savoir plus sur VaultString.',
  'Settings.helpSupport.helpCenter': 'Centre d’aide',
  'Settings.helpSupport.helpCenterDesc': 'Parcourir guides et FAQ',
  'Settings.helpSupport.contactSupport': 'Contacter le support',
  'Settings.helpSupport.contactSupportDesc': 'Écrire à notre équipe support',
  'Settings.helpSupport.compliance': 'Vérification d’identité',
  'Settings.helpSupport.complianceDesc': 'Gérer documents KYC et statut',
  'Settings.helpSupport.securityGuide': 'Bonnes pratiques de sécurité',
  'Settings.helpSupport.securityGuideDesc': 'Protéger votre compte',
};

const settingsHa = {
  'Settings.nav.account': 'Asusu',
  'Settings.nav.security': 'Tsaro',
  'Settings.nav.notifications': 'Sanarwa',
  'Settings.nav.language': 'Harshe da yanki',
  'Settings.nav.appearance': 'Kamanni',
  'Settings.nav.privacy': 'Sirri',
  'Settings.nav.limits': 'Iyaka',
  'Settings.nav.connectedAccounts': 'Asusun da aka haɗa',
  'Settings.nav.helpSupport': 'Taimako da goyon baya',
  'Settings.account.title': 'Asusu',
  'Settings.account.subtitle': 'Shaidar VaultString da matsayin tabbatarwa.',
  'Settings.account.signedInAs': 'An shiga a matsayin',
  'Settings.account.verificationStatus': 'Matsayin tabbatarwa',
  'Settings.account.memberSince': 'Memba tun',
  'Settings.account.manageProfile': 'Sarrafa bayanan martaba',
  'Settings.account.verified': 'An tabbatar',
  'Settings.account.pending': 'Ana dubawa',
  'Settings.account.unverified': 'Ba a tabbatar ba',
  'Settings.privacy.title': 'Sirri',
  'Settings.privacy.subtitle': 'Sarrafa yadda ake amfani da bayananka.',
  'Settings.privacy.analytics.title': 'Binciken amfani',
  'Settings.privacy.analytics.subtitle': 'Taimaka wajen inganta VaultString da bayanai marasa suna',
  'Settings.privacy.marketing.title': 'Tayin na musamman',
  'Settings.privacy.marketing.subtitle': 'Bada shawarar samfuri bisa ayyuka',
  'Settings.privacy.profileVisibility.title': 'Bayanan martaba na jama\'a',
  'Settings.privacy.profileVisibility.subtitle': 'Nuna hanyar bayanan martaba a rasit da aka raba',
  'Settings.limits.title': 'Iyaka',
  'Settings.limits.subtitle': 'Iyakar ma\'amala don matakin tabbatarwar ku.',
  'Settings.limits.monthlyLimit': 'Iyakar canja wata-wata',
  'Settings.limits.usedThisMonth': 'An yi amfani wannan wata',
  'Settings.limits.remaining': 'Sauran',
  'Settings.limits.readOnlyNote': 'An saita iyaka ta matakin tabbatarwa kuma ba za a iya canza ta a nan ba.',
  'Settings.limits.upgradeCta': 'Kammala tabbatarwa don ƙara iyaka',
  'Settings.connectedAccounts.title': 'Asusun da aka haɗa',
  'Settings.connectedAccounts.subtitle': 'Haɗa wallets na waje da masu bayar da sabis na biyan kuɗi.',
  'Settings.connectedAccounts.comingSoon': 'Nan ba da jimawa ba',
  'Settings.connectedAccounts.comingSoonDetail': 'Haɗin banki da mobile money zai zo nan gaba.',
  'Settings.helpSupport.title': 'Taimako da goyon baya',
  'Settings.helpSupport.subtitle': 'Samu taimako kuma ƙara koyo game da VaultString.',
  'Settings.helpSupport.helpCenter': 'Cibiyar taimako',
  'Settings.helpSupport.helpCenterDesc': 'Duba jagorori da FAQ',
  'Settings.helpSupport.contactSupport': 'Tuntuɓi goyon baya',
  'Settings.helpSupport.contactSupportDesc': 'Aika imel zuwa ƙungiyar goyon bayanmu',
  'Settings.helpSupport.compliance': 'Tabbatar da shaida',
  'Settings.helpSupport.complianceDesc': 'Sarrafa takardun KYC da matsayi',
  'Settings.helpSupport.securityGuide': 'Kyawawan ayyukan tsaro',
  'Settings.helpSupport.securityGuideDesc': 'Kiyaye asusunku lafiya',
};

const localeSettings = {
  zu: settingsZu,
  ha: settingsHa,
  fr: settingsFr,
  pt: {
    ...settingsFr,
    'Settings.nav.account': 'Conta',
    'Settings.nav.security': 'Segurança',
    'Settings.nav.notifications': 'Notificações',
    'Settings.nav.language': 'Idioma e região',
    'Settings.nav.appearance': 'Aparência',
    'Settings.nav.privacy': 'Privacidade',
    'Settings.nav.limits': 'Limites',
    'Settings.nav.connectedAccounts': 'Contas ligadas',
    'Settings.nav.helpSupport': 'Ajuda e suporte',
    'Settings.account.title': 'Conta',
    'Settings.account.subtitle': 'A sua identidade VaultString e estado de verificação.',
    'Settings.account.signedInAs': 'Sessão iniciada como',
    'Settings.account.verificationStatus': 'Estado de verificação',
    'Settings.account.memberSince': 'Membro desde',
    'Settings.account.manageProfile': 'Gerir perfil',
    'Settings.account.verified': 'Verificado',
    'Settings.account.pending': 'Em revisão',
    'Settings.account.unverified': 'Não verificado',
  },
  sw: {
    ...settingsFr,
    'Settings.nav.account': 'Akaunti',
    'Settings.nav.security': 'Usalama',
    'Settings.nav.notifications': 'Arifa',
    'Settings.nav.language': 'Lugha na eneo',
    'Settings.nav.appearance': 'Mwonekano',
    'Settings.nav.privacy': 'Faragha',
    'Settings.nav.limits': 'Vikomo',
    'Settings.nav.connectedAccounts': 'Akaunti zilizounganishwa',
    'Settings.nav.helpSupport': 'Msaada',
    'Settings.account.title': 'Akaunti',
    'Settings.account.subtitle': 'Utambulisho wako wa VaultString na hali ya uthibitishaji.',
    'Settings.account.signedInAs': 'Umeingia kama',
    'Settings.account.verificationStatus': 'Hali ya uthibitishaji',
    'Settings.account.memberSince': 'Mwanachama tangu',
    'Settings.account.manageProfile': 'Dhibiti wasifu',
    'Settings.account.verified': 'Imethibitishwa',
    'Settings.account.pending': 'Inakaguliwa',
    'Settings.account.unverified': 'Haijathibitishwa',
  },
  ar: {
    'Settings.nav.account': 'الحساب',
    'Settings.nav.security': 'الأمان',
    'Settings.nav.notifications': 'الإشعارات',
    'Settings.nav.language': 'اللغة والمنطقة',
    'Settings.nav.appearance': 'المظهر',
    'Settings.nav.privacy': 'الخصوصية',
    'Settings.nav.limits': 'الحدود',
    'Settings.nav.connectedAccounts': 'الحسابات المرتبطة',
    'Settings.nav.helpSupport': 'المساعدة والدعم',
    'Settings.account.title': 'الحساب',
    'Settings.account.subtitle': 'هويتك على VaultString وحالة التحقق.',
    'Settings.account.signedInAs': 'مسجّل الدخول كـ',
    'Settings.account.verificationStatus': 'حالة التحقق',
    'Settings.account.memberSince': 'عضو منذ',
    'Settings.account.manageProfile': 'إدارة الملف',
    'Settings.account.verified': 'موثّق',
    'Settings.account.pending': 'قيد المراجعة',
    'Settings.account.unverified': 'غير موثّق',
    'Settings.privacy.title': 'الخصوصية',
    'Settings.privacy.subtitle': 'تحكم في كيفية استخدام بياناتك ومشاركتها.',
    'Settings.privacy.analytics.title': 'تحليلات الاستخدام',
    'Settings.privacy.analytics.subtitle': 'ساعد في تحسين VaultString ببيانات مجهولة',
    'Settings.privacy.marketing.title': 'عروض مخصصة',
    'Settings.privacy.marketing.subtitle': 'السماح بتوصيات مبنية على النشاط',
    'Settings.privacy.profileVisibility.title': 'ملف عام',
    'Settings.privacy.profileVisibility.subtitle': 'إظهار رابط ملفك على الإيصالات المشتركة',
    'Settings.limits.title': 'الحدود',
    'Settings.limits.subtitle': 'حدود المعاملات لمستوى التحقق الخاص بك.',
    'Settings.limits.monthlyLimit': 'حد التحويل الشهري',
    'Settings.limits.usedThisMonth': 'المستخدم هذا الشهر',
    'Settings.limits.remaining': 'المتبقي',
    'Settings.limits.readOnlyNote': 'الحدود تُحدد بمستوى التحقق ولا يمكن تغييرها هنا.',
    'Settings.limits.upgradeCta': 'أكمل التحقق لزيادة الحدود',
    'Settings.connectedAccounts.title': 'الحسابات المرتبطة',
    'Settings.connectedAccounts.subtitle': 'اربط محافظ ومزودي دفع خارجيين.',
    'Settings.connectedAccounts.comingSoon': 'قريباً',
    'Settings.connectedAccounts.comingSoonDetail': 'ربط البنك والمال المحمول قريباً.',
    'Settings.helpSupport.title': 'المساعدة والدعم',
    'Settings.helpSupport.subtitle': 'احصل على المساعدة وتعرّف على VaultString.',
    'Settings.helpSupport.helpCenter': 'مركز المساعدة',
    'Settings.helpSupport.helpCenterDesc': 'تصفح الأدلة والأسئلة الشائعة',
    'Settings.helpSupport.contactSupport': 'اتصل بالدعم',
    'Settings.helpSupport.contactSupportDesc': 'راسل فريق الدعم',
    'Settings.helpSupport.compliance': 'التحقق من الهوية',
    'Settings.helpSupport.complianceDesc': 'إدارة مستندات KYC والحالة',
    'Settings.helpSupport.securityGuide': 'أفضل ممارسات الأمان',
    'Settings.helpSupport.securityGuideDesc': 'حافظ على أمان حسابك',
  },
  zh: {
    'Settings.nav.account': '账户',
    'Settings.nav.security': '安全',
    'Settings.nav.notifications': '通知',
    'Settings.nav.language': '语言与地区',
    'Settings.nav.appearance': '外观',
    'Settings.nav.privacy': '隐私',
    'Settings.nav.limits': '限额',
    'Settings.nav.connectedAccounts': '关联账户',
    'Settings.nav.helpSupport': '帮助与支持',
    'Settings.account.title': '账户',
    'Settings.account.subtitle': '您的 VaultString 身份与验证状态。',
    'Settings.account.signedInAs': '登录为',
    'Settings.account.verificationStatus': '验证状态',
    'Settings.account.memberSince': '注册时间',
    'Settings.account.manageProfile': '管理资料',
    'Settings.account.verified': '已验证',
    'Settings.account.pending': '审核中',
    'Settings.account.unverified': '未验证',
    'Settings.privacy.title': '隐私',
    'Settings.privacy.subtitle': '控制数据的使用与共享方式。',
    'Settings.privacy.analytics.title': '使用分析',
    'Settings.privacy.analytics.subtitle': '通过匿名数据帮助改进 VaultString',
    'Settings.privacy.marketing.title': '个性化优惠',
    'Settings.privacy.marketing.subtitle': '根据活动提供定制推荐',
    'Settings.privacy.profileVisibility.title': '公开资料',
    'Settings.privacy.profileVisibility.subtitle': '在共享收据上显示资料链接',
    'Settings.limits.title': '限额',
    'Settings.limits.subtitle': '您验证级别的交易与账户限额。',
    'Settings.limits.monthlyLimit': '每月转账限额',
    'Settings.limits.usedThisMonth': '本月已用',
    'Settings.limits.remaining': '剩余',
    'Settings.limits.readOnlyNote': '限额由验证级别设定，无法在此修改。',
    'Settings.limits.upgradeCta': '完成验证以提高限额',
    'Settings.connectedAccounts.title': '关联账户',
    'Settings.connectedAccounts.subtitle': '关联外部钱包与支付服务商。',
    'Settings.connectedAccounts.comingSoon': '即将推出',
    'Settings.connectedAccounts.comingSoonDetail': '银行与移动支付关联即将上线。',
    'Settings.helpSupport.title': '帮助与支持',
    'Settings.helpSupport.subtitle': '获取帮助并了解 VaultString。',
    'Settings.helpSupport.helpCenter': '帮助中心',
    'Settings.helpSupport.helpCenterDesc': '浏览指南与常见问题',
    'Settings.helpSupport.contactSupport': '联系支持',
    'Settings.helpSupport.contactSupportDesc': '发送邮件至支持团队',
    'Settings.helpSupport.compliance': '身份验证',
    'Settings.helpSupport.complianceDesc': '管理 KYC 文件与状态',
    'Settings.helpSupport.securityGuide': '安全最佳实践',
    'Settings.helpSupport.securityGuideDesc': '保护您的账户安全',
  },
  am: settingsZu,
  yo: settingsZu,
  ny: settingsZu,
  ja: {
    'Settings.nav.account': 'アカウント',
    'Settings.nav.security': 'セキュリティ',
    'Settings.nav.notifications': '通知',
    'Settings.nav.language': '言語と地域',
    'Settings.nav.appearance': '表示',
    'Settings.nav.privacy': 'プライバシー',
    'Settings.nav.limits': '限度額',
    'Settings.nav.connectedAccounts': '連携アカウント',
    'Settings.nav.helpSupport': 'ヘルプとサポート',
    'Settings.account.title': 'アカウント',
    'Settings.account.subtitle': 'VaultString の本人確認とステータス。',
    'Settings.account.signedInAs': 'ログイン中',
    'Settings.account.verificationStatus': '確認ステータス',
    'Settings.account.memberSince': '登録日',
    'Settings.account.manageProfile': 'プロフィール管理',
    'Settings.account.verified': '確認済み',
    'Settings.account.pending': '審査中',
    'Settings.account.unverified': '未確認',
    'Settings.privacy.title': 'プライバシー',
    'Settings.privacy.subtitle': 'データの利用と共有を管理します。',
    'Settings.privacy.analytics.title': '利用分析',
    'Settings.privacy.analytics.subtitle': '匿名データで VaultString の改善に協力',
    'Settings.privacy.marketing.title': 'パーソナライズされたオファー',
    'Settings.privacy.marketing.subtitle': 'アクティビティに基づく推奨を許可',
    'Settings.privacy.profileVisibility.title': '公開プロフィール',
    'Settings.privacy.profileVisibility.subtitle': '共有レシートにプロフィールリンクを表示',
    'Settings.limits.title': '限度額',
    'Settings.limits.subtitle': '確認レベルに応じた取引限度。',
    'Settings.limits.monthlyLimit': '月間送金限度',
    'Settings.limits.usedThisMonth': '今月の利用',
    'Settings.limits.remaining': '残り',
    'Settings.limits.readOnlyNote': '限度は確認レベルで決まり、ここでは変更できません。',
    'Settings.limits.upgradeCta': '確認を完了して限度を引き上げる',
    'Settings.connectedAccounts.title': '連携アカウント',
    'Settings.connectedAccounts.subtitle': '外部ウォレットと決済プロバイダーを連携。',
    'Settings.connectedAccounts.comingSoon': '近日公開',
    'Settings.connectedAccounts.comingSoonDetail': '銀行・モバイルマネー連携は今後提供予定です。',
    'Settings.helpSupport.title': 'ヘルプとサポート',
    'Settings.helpSupport.subtitle': 'サポートと VaultString の詳細。',
    'Settings.helpSupport.helpCenter': 'ヘルプセンター',
    'Settings.helpSupport.helpCenterDesc': 'ガイドと FAQ を参照',
    'Settings.helpSupport.contactSupport': 'サポートに連絡',
    'Settings.helpSupport.contactSupportDesc': 'サポートチームにメール',
    'Settings.helpSupport.compliance': '本人確認',
    'Settings.helpSupport.complianceDesc': 'KYC 書類とステータスを管理',
    'Settings.helpSupport.securityGuide': 'セキュリティのベストプラクティス',
    'Settings.helpSupport.securityGuideDesc': 'アカウントを安全に保つ',
  },
};

for (const [locale, map] of Object.entries(localeSettings)) {
  patches[locale] = { ...(patches[locale] || {}), ...map };
  stats[locale] = Object.keys(patches[locale]).length;
}

fs.mkdirSync(patchesDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(patches, null, 2)}\n`);

console.log('Wrote', outPath);
for (const [loc, n] of Object.entries(stats).sort()) {
  console.log(`  ${loc}: ${n} patch keys`);
}
