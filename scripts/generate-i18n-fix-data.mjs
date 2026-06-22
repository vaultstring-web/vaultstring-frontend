/**
 * Generates scripts/i18n-fix/{locale}.json with translations for all keys needing fix.
 * Run: node scripts/generate-i18n-fix-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const fixDir = path.join(__dirname, 'i18n-fix');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];

function flatten(obj, prefix = '', out = {}) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) flatten(v, next, out);
    else out[next] = v;
  }
  return out;
}

function needsFix(locale, key, value, en, fr) {
  if (value === undefined) return true;
  if (String(value) === String(en[key])) return true;
  if (locale !== 'fr' && String(value) === String(fr[key]) && String(fr[key]) !== String(en[key])) return true;
  return false;
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

// Per-key translations for all locales. Keys are dot-paths; values are locale -> string.
const T = {
  'Auth.language.label': {
    fr: 'Langue', pt: 'Idioma', sw: 'Lugha', ja: '言語', zh: '语言', am: 'ቋንቋ', yo: 'Èdè', ny: 'Chilankhulo', ar: 'اللغة', zu: 'Ulimi', ha: 'Harshe',
  },
  'Auth.social.apple': {
    fr: 'Apple', pt: 'Apple', sw: 'Apple', ja: 'Apple', zh: 'Apple', am: 'Apple', yo: 'Apple', ny: 'Apple', ar: 'Apple', zu: 'Apple', ha: 'Apple',
  },
  'Auth.social.google': {
    fr: 'Google', pt: 'Google', sw: 'Google', ja: 'Google', zh: 'Google', am: 'Google', yo: 'Google', ny: 'Google', ar: 'Google', zu: 'Google', ha: 'Google',
  },
  'Common.passwordMask': {
    fr: '••••••••', pt: '••••••••', sw: '••••••••', ja: '••••••••', zh: '••••••••', am: '••••••••', yo: '••••••••', ny: '••••••••', ar: '••••••••', zu: '••••••••', ha: '••••••••',
  },
  'Dashboard.market.badgeLive': {
    fr: 'En direct', pt: 'Ao vivo', sw: 'Moja kwa moja', ja: 'ライブ', zh: '实时', am: 'ቀጥታ', yo: 'Taara', ny: 'Mochedwa', ar: 'مباشر', zu: 'Bukhoma', ha: 'Kai tsaye',
  },
  'Dashboard.market.badgeSeed': {
    fr: 'Données test', pt: 'Dados de teste', sw: 'Data ya majaribio', ja: 'シード', zh: '种子数据', am: 'የሙከራ ውሂብ', yo: 'Data idanwo', ny: 'Deta yoyesera', ar: 'بيانات تجريبية', zu: 'Idatha yokuhlola', ha: 'Bayanan gwaji',
  },
  'Dashboard.market.rateLabel': {
    fr: 'Taux', pt: 'Taxa', sw: 'Kiwango', ja: 'レート', zh: '汇率', am: 'መጠን', yo: 'Oṣuwọn', ny: 'Mtengo', ar: 'السعر', zu: 'Izinga', ha: 'Farashi',
  },
  'Dashboard.market.source.bodyLive': {
    fr: 'Taux issus des API FX publiques (Frankfurter, exchangerate.host). Mis en cache et actualisés toutes les quelques minutes.',
    pt: 'Taxas de APIs FX públicas (Frankfurter, exchangerate.host). Em cache e atualizadas a cada poucos minutos.',
    sw: 'Viwango kutoka API za FX za umma (Frankfurter, exchangerate.host). Vinahifadhiwa na kusasishwa kila dakika chache.',
    ja: '公開FX API（Frankfurter、exchangerate.host）からのレート。数分ごとにキャッシュ更新されます。',
    zh: '来自公开外汇 API（Frankfurter、exchangerate.host）的汇率。缓存并每隔几分钟刷新。',
    am: 'ከህዝብ FX APIዎች (Frankfurter, exchangerate.host) የመጡ ተመኖች። በየጥቂት ደቂቃዎች ይዘመናሉ።',
    yo: 'Awọn oṣuwọn lati awọn API FX gbangba (Frankfurter, exchangerate.host). Ti a ṣe atokọ ati ṣe imudojuiwọn ni iṣẹju diẹ.',
    ny: 'Mitengo kuchokera ku FX API zapagulu (Frankfurter, exchangerate.host). Zimasungidwa ndikusinthidwa nthawi zonse.',
    ar: 'أسعار من واجهات FX العامة (Frankfurter، exchangerate.host). مخزنة ومحدّثة كل بضع دقائق.',
    zu: 'Amanani avela ku-FX API zomphakathi (Frankfurter, exchangerate.host). Agcinwe futhi avuselelwa njalo ngemizuzu embalwa.',
    ha: 'Farashi daga FX API na jama\'a (Frankfurter, exchangerate.host). Ana adana su kuma ana sabunta su kowane \'yan mintuna.',
  },
  'Dashboard.market.source.bodySeed': {
    fr: 'Taux issus des données de test hors ligne. Définissez FOREX_LIVE_ENABLED=true sur le backend pour les taux en direct.',
    pt: 'Taxas de dados de teste offline. Defina FOREX_LIVE_ENABLED=true no backend para taxas ao vivo.',
    sw: 'Viwango kutoka data ya majaribio nje ya mtandao. Weka FOREX_LIVE_ENABLED=true kwenye backend kwa viwango halisi.',
    ja: 'オフライン用シードデータのレート。ライブレートにはバックエンドでFOREX_LIVE_ENABLED=trueを設定してください。',
    zh: '来自离线测试种子数据的汇率。在后端设置 FOREX_LIVE_ENABLED=true 以获取实时汇率。',
    am: 'ከኦፍላይን የሙከራ ውሂብ የመጡ ተመኖች። ቀጥታ ተመኖች ለማግኘት በቤክኤንድ FOREX_LIVE_ENABLED=true ያዘጋጁ።',
    yo: 'Awọn oṣuwọn lati data idanwo aisinipo. Ṣeto FOREX_LIVE_ENABLED=true lori backend fun awọn oṣuwọn taara.',
    ny: 'Mitengo kuchokera ku deta yoyesera yopanda intaneti. Khazikitsani FOREX_LIVE_ENABLED=true pa backend kuti mupeze mitengo yenicheni.',
    ar: 'أسعار من بيانات تجريبية دون اتصال. عيّن FOREX_LIVE_ENABLED=true في الخادم للأسعار المباشرة.',
    zu: 'Amanani avela kudatha yokuhlola engaxhunyiwe ku-intanethi. Setha FOREX_LIVE_ENABLED=true ku-backend ukuze uthole amanani abukhoma.',
    ha: 'Farashi daga bayanan gwaji na offline. Saita FOREX_LIVE_ENABLED=true a backend don farashin kai tsaye.',
  },
  'Dashboard.moneySources.subtitle': {
    fr: 'Mêmes prestataires que pour le dépôt — gérez-les dans Portefeuille ou Paramètres.',
    pt: 'Mesmos provedores do depósito — gerencie na Carteira ou Definições.',
    sw: 'Watoa huduma sawa na amana — simamia kwenye Mkoba au Mipangilio.',
    ja: '入金と同じプロバイダー — ウォレットまたは設定で管理。',
    zh: '与充值相同的提供商 — 在钱包或设置中管理。',
    am: 'ከተቀማጭ ገንዘብ ጋር ተመሳሳይ አቅራቢዎች — በዋሌት ወይም በቅንብሮች ያስተዳድሩ።',
    yo: 'Awọn olupese kanna bi idogo — ṣakoso ni Wallet tabi Eto.',
    ny: 'Othandizira omwe ngati choikamo — sankhani mu Wallet kapena Zokonda.',
    ar: 'نفس مزودي الإيداع — أدرها في المحفظة أو الإعدادات.',
    zu: 'Abahlinzeki abafana nokufaka imali — phatha ku-Wallet noma Kuzilungiselelo.',
    ha: 'Masu bayarwa iri ɗaya da ajiya — sarrafa a Wallet ko Saituna.',
  },
  'Dashboard.moneySources.title': {
    fr: 'Moyens de paiement liés', pt: 'Métodos de pagamento vinculados', sw: 'Njia za malipo zilizounganishwa',
    ja: '連携済み支払い方法', zh: '已关联的支付方式', am: 'የተገናኙ የክፍያ ዘዴዎች', yo: 'Awọn ọna isanwo ti a sopọ',
    ny: 'Njira zolipirira zolumikizidwa', ar: 'طرق الدفع المرتبطة', zu: 'Izindlela zokukhokha ezixhunyiwe', ha: 'Hanyoyin biya da aka haɗa',
  },
  'Dashboard.moneySources.viewWallet': {
    fr: 'Ouvrir le portefeuille', pt: 'Abrir carteira', sw: 'Fungua mkoba', ja: 'ウォレットを開く', zh: '打开钱包',
    am: 'ዋሌት ክፈት', yo: 'Ṣii wallet', ny: 'Tsegulani wallet', ar: 'فتح المحفظة', zu: 'Vula i-wallet', ha: 'Buɗe wallet',
  },
  'Dashboard.quickActions.history': {
    fr: 'Transactions', pt: 'Transações', sw: 'Miamala', ja: '取引', zh: '交易', am: 'ግብይቶች', yo: 'Awọn iṣowo', ny: 'Zogulitsa', ar: 'المعاملات', zu: 'Ukuthengiselana', ha: 'Ma\'amaloli',
  },
  'Dashboard.walletData.docsPath': {
    fr: 'Étapes seed : kyd-payment-system → docker compose --profile tools run --rm seed-runner (voir docs/LOCAL_TESTING.md)',
    pt: 'Passos seed: kyd-payment-system → docker compose --profile tools run --rm seed-runner (ver docs/LOCAL_TESTING.md)',
    sw: 'Hatua za seed: kyd-payment-system → docker compose --profile tools run --rm seed-runner (tazama docs/LOCAL_TESTING.md)',
    ja: 'シード手順: kyd-payment-system → docker compose --profile tools run --rm seed-runner（docs/LOCAL_TESTING.md参照）',
    zh: '种子步骤：kyd-payment-system → docker compose --profile tools run --rm seed-runner（见 docs/LOCAL_TESTING.md）',
    am: 'የሙከራ ደረጃዎች: kyd-payment-system → docker compose --profile tools run --rm seed-runner (docs/LOCAL_TESTING.md ይመልከቱ)',
    yo: 'Awọn igbese seed: kyd-payment-system → docker compose --profile tools run --rm seed-runner (wo docs/LOCAL_TESTING.md)',
    ny: 'Masitepe a seed: kyd-payment-system → docker compose --profile tools run --rm seed-runner (onani docs/LOCAL_TESTING.md)',
    ar: 'خطوات البذرة: kyd-payment-system → docker compose --profile tools run --rm seed-runner (راجع docs/LOCAL_TESTING.md)',
    zu: 'Izinyathelo ze-seed: kyd-payment-system → docker compose --profile tools run --rm seed-runner (buka docs/LOCAL_TESTING.md)',
    ha: 'Matakan seed: kyd-payment-system → docker compose --profile tools run --rm seed-runner (duba docs/LOCAL_TESTING.md)',
  },
  'Dashboard.walletData.errorHint': {
    fr: 'Échec de la requête API portefeuille. Vérifiez que la passerelle tourne sur le port 9000 et que vous êtes connecté.',
    pt: 'Falha na API da carteira. Confirme que o gateway está na porta 9000 e que você está autenticado.',
    sw: 'Ombi la API la mkoba limeshindwa. Thibitisha lango liko bandari 9000 na umeingia.',
    ja: 'ウォレットAPIリクエストが失敗しました。ゲートウェイがポート9000で動作し、ログイン済みか確認してください。',
    zh: '钱包 API 请求失败。请确认网关在 9000 端口运行且您已登录。',
    am: 'የዋሌት API ጥያቄ አልተሳካም። መግቢያው በ9000 ፖርት እንደሚሰራ እና እንደገቡ ያረጋግጡ።',
    yo: 'Ibeere API wallet kuna. Jẹrisi pe agbọn nṣiṣẹ lori port 9000 ati pe o ti wọle.',
    ny: 'Pempho la API la wallet lasalira. Onetsetsani kuti gateway ikugwira pa port 9000 ndipo mwalowa.',
    ar: 'فشل طلب API للمحفظة. تأكد أن البوابة تعمل على المنفذ 9000 وأنك مسجل الدخول.',
    zu: 'Isicelo se-API yewallet asiphumelelanga. Qinisekisa ukuthi i-gateway isebenza ku-port 9000 futhi ungene ngemvume.',
    ha: 'Bukatar API na wallet ta gaza. Tabbatar cewa gateway yana aiki a port 9000 kuma ka shiga.',
  },
  'Dashboard.walletData.loginHint': {
    fr: 'Connexion test :', pt: 'Login de teste:', sw: 'Kuingia kwa majaribio:', ja: 'テストログイン:', zh: '测试登录:',
    am: 'የሙከራ መግቢያ:', yo: 'Iwọle idanwo:', ny: 'Lowo koyesera:', ar: 'تسجيل تجريبي:', zu: 'Ukungena kokuhlola:', ha: 'Shiga gwaji:',
  },
  'Dashboard.walletData.seedHint': {
    fr: 'Aucun portefeuille renvoyé par l\'API. Lancez le seed de la base, puis connectez-vous avec le compte client test.',
    pt: 'Nenhuma carteira retornada pela API. Execute o seed do banco e entre com a conta de teste.',
    sw: 'Hakuna mkoba uliorudishwa na API. Endesha seed ya hifadhidata, kisha ingia kwa akaunti ya majaribio.',
    ja: 'APIからウォレットが返されませんでした。DBシードを実行し、テスト顧客でログインしてください。',
    zh: 'API 未返回钱包。请运行数据库种子，然后用测试客户账户登录。',
    am: 'ከAPI ዋሌት አልተመለሰም። የውሂብ ጎዳና ስትል ያስኬዱና በሙከራ መለያ ይግቡ።',
    yo: 'Ko si wallet ti API da pada. Ṣe seed data, lẹhinna wọle pẹlu akanti idanwo onibara.',
    ny: 'Palibe wallet yobwezeretsedwa ndi API. Thirani seed ya database, kenako lowani ndi akaunti yoyesera.',
    ar: 'لم تُرجع الواجهة أي محفظة. شغّل بذرة قاعدة البيانات ثم سجّل الدخول بحساب العميل التجريبي.',
    zu: 'Ayikho i-wallet ebuyisiwe yi-API. Gijima i-database seed, bese ungena nge-akhawunti yokuhlola yekhasimende.',
    ha: 'Babu wallet da API ya dawo da shi. Gudanar da database seed, sannan shiga da asusun gwaji na abokin ciniki.',
  },
  'Dashboard.walletData.title': {
    fr: 'Aucune donnée portefeuille', pt: 'Sem dados de carteira', sw: 'Hakuna data ya mkoba', ja: 'ウォレットデータなし', zh: '无钱包数据',
    am: 'የዋሌት ውሂብ የለም', yo: 'Ko si data wallet', ny: 'Palibe deta ya wallet', ar: 'لا توجد بيانات محفظة', zu: 'Ayikho idatha yewallet', ha: 'Babu bayanan wallet',
  },
  'Language.searchPlaceholder': {
    fr: 'Rechercher des langues…', pt: 'Pesquisar idiomas…', sw: 'Tafuta lugha…', ja: '言語を検索…', zh: '搜索语言…',
    am: 'ቋንቋዎችን ፈልግ…', yo: 'Wa awọn ede…', ny: 'Fufuzani zilankhulo…', ar: 'البحث عن اللغات…', zu: 'Sesha izilimi…', ha: 'Nemo harsuna…',
  },
  'MoneySources.fundingTitle': {
    fr: 'Sources de fonds', pt: 'Fontes de fundos', sw: 'Vyanzo vya fedha', ja: '資金源', zh: '资金来源',
    am: 'የገንዘብ ምንጮች', yo: 'Awọn orisun owo', ny: 'Magwero a ndalama', ar: 'مصادر الأموال', zu: 'Imithombo yemali', ha: 'Tushen kuɗi',
  },
  'MoneySources.moreInDeposit': {
    fr: 'Plus de prestataires disponibles lors d\'un dépôt ou d\'un envoi.',
    pt: 'Mais provedores ao depositar ou enviar dinheiro.',
    sw: 'Watoa huduma zaidi unapoweka au kutuma pesa.',
    ja: '入金または送金時にさらに多くのプロバイダーが利用可能です。',
    zh: '充值或汇款时可使用更多提供商。',
    am: 'ገንዘብ ሲያስቀምጡ ወይም ሲላኩ ተጨማሪ አቅራቢዎች ይገኛሉ።',
    yo: 'Awọn olupese diẹ sii wa nigba ti o ba fi owo si tabi ranṣẹ.',
    ny: 'Othandizira enanso amapezeka mukaiika kapena kutumiza ndalama.',
    ar: 'مزودون إضافيون عند الإيداع أو الإرسال.',
    zu: 'Abahlinzeki abengeziwe batholakala uma ufaka imali noma uthumela.',
    ha: 'Ƙarin masu bayarwa suna samuwa lokacin ajiya ko aika kuɗi.',
  },
  'MoneySources.payoutTitle': {
    fr: 'Prestataires de paiement', pt: 'Provedores de pagamento', sw: 'Watoa huduma wa malipo', ja: '支払いプロバイダー', zh: '付款提供商',
    am: 'የክፍያ አቅራቢዎች', yo: 'Awọn olupese sisan', ny: 'Othandizira malipiro', ar: 'مزودو الدفع', zu: 'Abahlinzeki bokukhokha', ha: 'Masu bayar da biya',
  },
  'MoneySources.processing.api': {
    fr: 'Règlement API', pt: 'Liquidação API', sw: 'Malipo ya API', ja: 'API決済', zh: 'API 结算',
    am: 'API ማጠናቀቂያ', yo: 'Isanwo API', ny: 'Kumaliza API', ar: 'تسوية API', zu: 'Ukuhlukaniswa kwe-API', ha: 'Musanya API',
  },
  'MoneySources.processing.card': {
    fr: '10–30 min', pt: '10–30 min', sw: 'Dakika 10–30', ja: '10〜30分', zh: '10–30 分钟',
    am: '10–30 ደቂቃ', yo: 'Iṣẹju 10–30', ny: 'Mphindi 10–30', ar: '10–30 دقيقة', zu: 'Imizuzu 10–30', ha: 'Minti 10–30',
  },
  'MoneySources.processing.days': {
    fr: '1–2 jours ouvrés', pt: '1–2 dias úteis', sw: 'Siku 1–2 za kazi', ja: '1〜2営業日', zh: '1–2 个工作日',
    am: '1–2 የስራ ቀናት', yo: 'Ọjọ iṣẹ 1–2', ny: 'Masiku 1–2 a ntchito', ar: '1–2 أيام عمل', zu: 'Izinsuku zomsebenzi ezi-1–2', ha: 'Kwanaki 1–2 na aiki',
  },
  'MoneySources.processing.instant': {
    fr: 'Instantané', pt: 'Instantâneo', sw: 'Papo hapo', ja: '即時', zh: '即时',
    am: 'ወዲያውኑ', yo: 'Ni kiakia', ny: 'Nthawi yomweyo', ar: 'فوري', zu: 'Ngokushesha', ha: 'Nan take',
  },
  'MoneySources.processing.minutes': {
    fr: '5–15 min', pt: '5–15 min', sw: 'Dakika 5–15', ja: '5〜15分', zh: '5–15 分钟',
    am: '5–15 ደቂቃ', yo: 'Iṣẹju 5–15', ny: 'Mphindi 5–15', ar: '5–15 دقيقة', zu: 'Imizuzu 5–15', ha: 'Minti 5–15',
  },
  'TopBar.account.member': {
    fr: 'Compte', pt: 'Conta', sw: 'Akaunti', ja: 'アカウント', zh: '账户', am: 'መለያ', yo: 'Àkántì', ny: 'Akaunti', ar: 'الحساب', zu: 'I-akhawunti', ha: 'Asusu',
  },
  'Sidebar.sectionAccount': {
    fr: 'Compte', pt: 'Conta', sw: 'Akaunti', ja: 'アカウント', zh: '账户', am: 'መለያ', yo: 'Àkántì', ny: 'Akaunti', ar: 'الحساب', zu: 'I-akhawunti', ha: 'Asusu',
  },
  'Sidebar.sectionMoney': {
    fr: 'Argent', pt: 'Dinheiro', sw: 'Fedha', ja: 'お金', zh: '资金', am: 'ገንዘብ', yo: 'Owó', ny: 'Ndalama', ar: 'الأموال', zu: 'Imali', ha: 'Kuɗi',
  },
};

// Load extended translations from companion file if present
const extPath = path.join(__dirname, 'i18n-fix-translations-ext.mjs');
let EXT = {};
if (fs.existsSync(extPath)) {
  EXT = (await import(extPath)).default;
  Object.assign(T, EXT);
}

if (!fs.existsSync(fixDir)) fs.mkdirSync(fixDir, { recursive: true });

for (const locale of LOCALES) {
  const data = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8')));
  const fixes = {};

  for (const key of Object.keys(en)) {
    if (!needsFix(locale, key, data[key], en, fr)) continue;
    if (T[key]?.[locale]) {
      fixes[key] = T[key][locale];
    }
  }

  fs.writeFileSync(path.join(fixDir, `${locale}.json`), `${JSON.stringify(fixes, null, 2)}\n`);
  console.log(`${locale}: generated ${Object.keys(fixes).length} fixes (${Object.keys(en).length - Object.keys(fixes).length} still missing translations)`);
}
