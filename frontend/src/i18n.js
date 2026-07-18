// Central bilingual dictionary — single source of truth for all user-facing
// copy. Ported verbatim from the Claude Design prototype; do not fork copies
// of these strings into components.
export const STR = {
  brandSub: { ar: 'أداة فرز أولي للأشعة الصدرية', en: 'Chest X-ray screening aid' },
  navScan: { ar: 'الفحص', en: 'Screening' },
  navHistory: { ar: 'السجل', en: 'History' },
  heroTitle: {
    ar: 'فرز أولي لالتهاب الرئة من صورة أشعة الصدر',
    en: 'First-pass pneumonia screening from a chest X-ray',
  },
  heroSub: {
    ar: 'ارفع صورة أشعة سينية للصدر، ويحللها نموذج VGG16 خلال ثوانٍ ليعطي احتمال وجود التهاب رئوي. أداة مساعدة للفرز فقط — ليست تشخيصًا طبيًا.',
    en: 'Upload a chest X-ray and a VGG16 model analyzes it in seconds, estimating the likelihood of pneumonia. A screening aid only — not a medical diagnosis.',
  },
  dropTitle: { ar: 'أسقط صورة الأشعة هنا', en: 'Drop the X-ray here' },
  dropActive: { ar: 'أفلت الصورة للتحليل', en: 'Release to analyze' },
  dropOr: { ar: 'أو', en: 'or' },
  choose: { ar: 'اختيار صورة', en: 'Choose image' },
  sample: { ar: 'تجربة صورة نموذجية', en: 'Try a sample image' },
  fileHint: { ar: 'JPEG أو PNG · حتى ٨ م.ب', en: 'JPEG or PNG · up to 8 MB' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  verdictLabel: { ar: 'النتيجة', en: 'Verdict' },
  NORMAL: { ar: 'سليمة', en: 'Normal' },
  PNEUMONIA: { ar: 'التهاب رئوي', en: 'Pneumonia' },
  confidence: { ar: 'درجة الثقة', en: 'Confidence' },
  breakdown: { ar: 'توزيع الاحتمالات', en: 'Probability breakdown' },
  limitTitle: { ar: 'حدود الأداة', en: 'Limitations' },
  limitBody: {
    ar: 'مصنّف ثنائي (سليمة / التهاب رئوي) فقط، ولا يستبعد حالات أخرى. النتيجة أداة فرز مساعدة وليست بديلًا عن تقييم الطبيب.',
    en: 'Binary classifier (Normal / Pneumonia) only; it does not rule out other conditions. The result is a screening aid, not a substitute for a doctor’s assessment.',
  },
  newScan: { ar: 'فحص جديد', en: 'New scan' },
  histTitle: { ar: 'سجل الفحوصات', en: 'Screening history' },
  histEmpty: { ar: 'لا توجد فحوصات بعد — ابدأ بفحص جديد.', en: 'No scans yet — start a new scan.' },
  histClear: { ar: 'مسح السجل', en: 'Clear history' },
  open: { ar: 'عرض', en: 'View' },
  retry: { ar: 'إعادة المحاولة', en: 'Try again' },
  back: { ar: 'العودة للفحص', en: 'Back to screening' },
  errServiceTitle: { ar: 'خدمة التحليل غير متاحة', en: 'Inference service unavailable' },
  errServiceMsg: {
    ar: 'تعذّر الاتصال بخادم التحليل. تأكد من تشغيل الخدمة ثم أعد المحاولة.',
    en: 'Could not reach the inference server. Check that the service is running and try again.',
  },
  errTypeTitle: { ar: 'نوع الملف غير مدعوم', en: 'Unsupported file type' },
  errTypeMsg: {
    ar: 'تُقبل صيغ JPEG وPNG وWebP فقط. اختر صورة أشعة بصيغة مدعومة.',
    en: 'Only JPEG, PNG and WebP are accepted. Choose an X-ray in a supported format.',
  },
  errSizeTitle: { ar: 'الملف أكبر من الحد المسموح', en: 'File exceeds the size limit' },
  errSizeMsg: {
    ar: 'الحد الأقصى لحجم الملف ٨ م.ب. صغّر الصورة ثم أعد المحاولة.',
    en: 'The file size limit is 8 MB. Reduce the image size and try again.',
  },
  credit: {
    ar: 'شعاع · معرض الذكاء الاصطناعي — الأردن ٢٠٢٦ · مسار الرعاية الصحية',
    en: 'Shu’a’ · AI Expo Jordan 2026 · Healthcare track',
  },
  disclaimerStrip: {
    ar: 'أداة فرز مساعِدة — لا تُستخدم للتشخيص النهائي.',
    en: 'Screening aid — not for definitive diagnosis.',
  },
  demoLabel: { ar: 'معاينة حالات الخطأ:', en: 'Preview error states:' },
  demoService: { ar: 'عطل الخدمة', en: 'Service down' },
  demoType: { ar: 'نوع غير مدعوم', en: 'Bad file type' },
  demoSize: { ar: 'ملف كبير', en: 'File too large' },
  createdBy: { ar: 'إعداد', en: 'Created by' },
};

export const PHASES = [
  { ar: 'معايرة الصورة…', en: 'Calibrating image…' },
  { ar: 'تشغيل نموذج VGG16…', en: 'Running VGG16 model…' },
  { ar: 'حساب الاحتمالات…', en: 'Computing probabilities…' },
];

export const ERR_CODES = {
  service: 'ERR 503 · INFERENCE_UNAVAILABLE',
  type: 'ERR 415 · UNSUPPORTED_MEDIA_TYPE',
  size: 'ERR 413 · PAYLOAD_TOO_LARGE',
};

export function dict(lang) {
  const t = {};
  for (const k in STR) t[k] = STR[k][lang];
  return t;
}

// Eastern Arabic numerals + decimal separator for AR
export function digits(s, lang) {
  if (lang !== 'ar') return String(s);
  return String(s)
    .replace(/[0-9]/g, (c) => '٠١٢٣٤٥٦٧٨٩'[+c])
    .replace(/\./g, '٫');
}

export function fmtPercent(n, lang, reveal = 1) {
  return digits((n * 100 * reveal).toFixed(1), lang) + (lang === 'ar' ? '٪' : '%');
}

// Verdict text: prefer the backend's own Arabic label, fall back to the dictionary
export function verdictText(item, lang) {
  if (lang === 'ar') return item.labelAr || STR[item.label].ar;
  return STR[item.label].en;
}
