/**
 * Patches all incomplete translation files with the missing 91 keys.
 * Run once: node scripts/patch-translations.js
 */

const fs   = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../messages');

// ── Missing translations per language ────────────────────────────────────────
const patches = {
  es: {
    ad: {
      optional: "(Opcional)", uploadImage: "Subir Imagen", currentImage: "Imagen actual:",
      uploadingImage: "Subiendo Imagen...", shareProduct: "Comparte tu producto o servicio con una audiencia global",
      pleaseUploadImage: "Por favor sube una imagen", noImage: "Sin Imagen", anonymous: "Anónimo",
      excellent: "Excelente", veryGood: "Muy Bueno", good: "Bueno", fair: "Regular", poor: "Malo",
      commentPlaceholder: "Comparte tus pensamientos...", yourName: "Tu nombre (opcional)",
      star: "estrella", stars: "estrellas", unpaid: "No pagado", expired: "Expirado", active: "Activo",
      paymentRequired: "Pago requerido para activar", expiredOn: "Expiró el", expiresIn: "Expira en",
      days: "días", expires: "Expira", payNow: "Pagar $1.00", relist: "Relistar ($1.00)",
      view: "Ver", analytics: "Analíticas", payment: "Pago", listingFee: "Tarifa de listado",
      duration: "Duración", total: "Total", confirmPayment: "Confirmar pago",
      clicksByCountry: "Clics por país", clicksByHour: "Clics por hora del día",
      clicksLast30Days: "Clics (últimos 30 días)", clicks: "clics",
      noAnalytics: "No hay datos de analíticas disponibles", cardFooter: "Pie de tarjeta", hoverState: "Estado hover",
    },
    payment: {
      processing: "Procesando tu pago...", success: "¡Pago exitoso!",
      successMessage: "Tu Yubbox ha sido activado y estará activo durante 14 días.",
      failed: "Pago fallido", cancelled: "Pago cancelado",
      cancelledMessage: "Tu pago fue cancelado. No se realizaron cargos.",
      backToDashboard: "Volver al panel", viewDashboard: "Ver panel",
      backToAd: "Volver al anuncio", redirecting: "Redirigiendo al panel en unos segundos...",
    },
    admin: {
      dashboard: "Panel de administración", manageContent: "Gestionar categorías, industrias y tipos de productos",
      categories: "Categorías", industries: "Industrias", productTypes: "Tipos de productos",
      manageCategories: "Gestionar categorías de productos/servicios",
      manageIndustries: "Gestionar clasificaciones de industrias",
      manageProductTypes: "Gestionar tipos de servicios y productos físicos",
      backToAdmin: "Volver al panel de administración", backToDashboard: "Volver al panel",
      manageItems: "Crear, editar y gestionar elementos", addNew: "Añadir nuevo",
      name: "Nombre", type: "Tipo", order: "Orden", status: "Estado", actions: "Acciones",
      noItems: "No se encontraron elementos", active: "Activo", inactive: "Inactivo",
      edit: "Editar", delete: "Eliminar", editItem: "Editar elemento", addItem: "Añadir nuevo elemento",
      description: "Descripción", service: "Servicio", physical: "Físico", create: "Crear",
      confirmDelete: "¿Estás seguro de que deseas eliminar este elemento?",
    },
    validation: {
      titleRequired: "El título es obligatorio", descriptionRequired: "La descripción es obligatoria",
      descriptionMinLength: "La descripción debe tener al menos 50 caracteres",
      descriptionMaxLength: "La descripción no puede exceder los 500 caracteres",
      webLinkRequired: "El enlace web es obligatorio", categoryRequired: "La categoría es obligatoria",
      industryRequired: "La industria es obligatoria", productTypeRequired: "El tipo de producto es obligatorio",
    },
    errors: {
      loginError: "Ocurrió un error durante el inicio de sesión",
      registrationError: "Ocurrió un error durante el registro",
      uploadError: "Error al subir la imagen",
    },
  },

  fr: {
    ad: {
      optional: "(Optionnel)", uploadImage: "Télécharger une image", currentImage: "Image actuelle :",
      uploadingImage: "Téléchargement en cours...", shareProduct: "Partagez votre produit ou service avec un public mondial",
      pleaseUploadImage: "Veuillez télécharger une image", noImage: "Pas d'image", anonymous: "Anonyme",
      excellent: "Excellent", veryGood: "Très bien", good: "Bien", fair: "Passable", poor: "Mauvais",
      commentPlaceholder: "Partagez vos impressions...", yourName: "Votre nom (optionnel)",
      star: "étoile", stars: "étoiles", unpaid: "Non payé", expired: "Expiré", active: "Actif",
      paymentRequired: "Paiement requis pour activer", expiredOn: "Expiré le", expiresIn: "Expire dans",
      days: "jours", expires: "Expire", payNow: "Payer 1,00 $", relist: "Republier (1,00 $)",
      view: "Voir", analytics: "Analytiques", payment: "Paiement", listingFee: "Frais d'annonce",
      duration: "Durée", total: "Total", confirmPayment: "Confirmer le paiement",
      clicksByCountry: "Clics par pays", clicksByHour: "Clics par heure de la journée",
      clicksLast30Days: "Clics (30 derniers jours)", clicks: "clics",
      noAnalytics: "Aucune donnée analytique disponible", cardFooter: "Pied de carte", hoverState: "État survol",
    },
    payment: {
      processing: "Traitement de votre paiement...", success: "Paiement réussi !",
      successMessage: "Votre Yubbox a été activé et sera en ligne pendant 14 jours.",
      failed: "Paiement échoué", cancelled: "Paiement annulé",
      cancelledMessage: "Votre paiement a été annulé. Aucun frais n'a été prélevé.",
      backToDashboard: "Retour au tableau de bord", viewDashboard: "Voir le tableau de bord",
      backToAd: "Retour à l'annonce", redirecting: "Redirection vers le tableau de bord dans quelques secondes...",
    },
    admin: {
      dashboard: "Tableau de bord admin", manageContent: "Gérer les catégories, industries et types de produits",
      categories: "Catégories", industries: "Industries", productTypes: "Types de produits",
      manageCategories: "Gérer les catégories de produits/services",
      manageIndustries: "Gérer les classifications d'industries",
      manageProductTypes: "Gérer les types de services et produits physiques",
      backToAdmin: "Retour au panneau admin", backToDashboard: "Retour au tableau de bord",
      manageItems: "Créer, modifier et gérer les éléments", addNew: "Ajouter nouveau",
      name: "Nom", type: "Type", order: "Ordre", status: "Statut", actions: "Actions",
      noItems: "Aucun élément trouvé", active: "Actif", inactive: "Inactif",
      edit: "Modifier", delete: "Supprimer", editItem: "Modifier l'élément", addItem: "Ajouter un nouvel élément",
      description: "Description", service: "Service", physical: "Physique", create: "Créer",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    },
    validation: {
      titleRequired: "Le titre est obligatoire", descriptionRequired: "La description est obligatoire",
      descriptionMinLength: "La description doit contenir au moins 50 caractères",
      descriptionMaxLength: "La description ne peut pas dépasser 500 caractères",
      webLinkRequired: "Le lien web est obligatoire", categoryRequired: "La catégorie est obligatoire",
      industryRequired: "L'industrie est obligatoire", productTypeRequired: "Le type de produit est obligatoire",
    },
    errors: {
      loginError: "Une erreur s'est produite lors de la connexion",
      registrationError: "Une erreur s'est produite lors de l'inscription",
      uploadError: "Échec du téléchargement de l'image",
    },
  },

  de: {
    ad: {
      optional: "(Optional)", uploadImage: "Bild hochladen", currentImage: "Aktuelles Bild:",
      uploadingImage: "Bild wird hochgeladen...", shareProduct: "Teilen Sie Ihr Produkt oder Ihren Service mit einem globalen Publikum",
      pleaseUploadImage: "Bitte laden Sie ein Bild hoch", noImage: "Kein Bild", anonymous: "Anonym",
      excellent: "Ausgezeichnet", veryGood: "Sehr gut", good: "Gut", fair: "Befriedigend", poor: "Schlecht",
      commentPlaceholder: "Teilen Sie Ihre Gedanken...", yourName: "Ihr Name (optional)",
      star: "Stern", stars: "Sterne", unpaid: "Unbezahlt", expired: "Abgelaufen", active: "Aktiv",
      paymentRequired: "Zahlung erforderlich zur Aktivierung", expiredOn: "Abgelaufen am", expiresIn: "Läuft ab in",
      days: "Tage", expires: "Läuft ab", payNow: "1,00 $ bezahlen", relist: "Neu listen (1,00 $)",
      view: "Ansehen", analytics: "Analysen", payment: "Zahlung", listingFee: "Listungsgebühr",
      duration: "Dauer", total: "Gesamt", confirmPayment: "Zahlung bestätigen",
      clicksByCountry: "Klicks nach Land", clicksByHour: "Klicks nach Tageszeit",
      clicksLast30Days: "Klicks (letzte 30 Tage)", clicks: "Klicks",
      noAnalytics: "Noch keine Analysedaten verfügbar", cardFooter: "Kartenfußzeile", hoverState: "Hover-Zustand",
    },
    payment: {
      processing: "Ihre Zahlung wird verarbeitet...", success: "Zahlung erfolgreich!",
      successMessage: "Ihr Yubbox wurde aktiviert und ist 14 Tage lang aktiv.",
      failed: "Zahlung fehlgeschlagen", cancelled: "Zahlung abgebrochen",
      cancelledMessage: "Ihre Zahlung wurde abgebrochen. Es wurden keine Gebühren erhoben.",
      backToDashboard: "Zurück zum Dashboard", viewDashboard: "Dashboard anzeigen",
      backToAd: "Zurück zur Anzeige", redirecting: "Weiterleitung zum Dashboard in einigen Sekunden...",
    },
    admin: {
      dashboard: "Admin-Dashboard", manageContent: "Kategorien, Branchen und Produkttypen verwalten",
      categories: "Kategorien", industries: "Branchen", productTypes: "Produkttypen",
      manageCategories: "Produkt-/Dienstleistungskategorien verwalten",
      manageIndustries: "Branchenklassifikationen verwalten",
      manageProductTypes: "Dienstleistungs- und physische Produkttypen verwalten",
      backToAdmin: "Zurück zum Admin-Panel", backToDashboard: "Zurück zum Dashboard",
      manageItems: "Elemente erstellen, bearbeiten und verwalten", addNew: "Neu hinzufügen",
      name: "Name", type: "Typ", order: "Reihenfolge", status: "Status", actions: "Aktionen",
      noItems: "Keine Elemente gefunden", active: "Aktiv", inactive: "Inaktiv",
      edit: "Bearbeiten", delete: "Löschen", editItem: "Element bearbeiten", addItem: "Neues Element hinzufügen",
      description: "Beschreibung", service: "Dienst", physical: "Physisch", create: "Erstellen",
      confirmDelete: "Sind Sie sicher, dass Sie dieses Element löschen möchten?",
    },
    validation: {
      titleRequired: "Titel ist erforderlich", descriptionRequired: "Beschreibung ist erforderlich",
      descriptionMinLength: "Beschreibung muss mindestens 50 Zeichen enthalten",
      descriptionMaxLength: "Beschreibung darf 500 Zeichen nicht überschreiten",
      webLinkRequired: "Weblink ist erforderlich", categoryRequired: "Kategorie ist erforderlich",
      industryRequired: "Branche ist erforderlich", productTypeRequired: "Produkttyp ist erforderlich",
    },
    errors: {
      loginError: "Beim Anmelden ist ein Fehler aufgetreten",
      registrationError: "Bei der Registrierung ist ein Fehler aufgetreten",
      uploadError: "Bild konnte nicht hochgeladen werden",
    },
  },

  ar: {
    ad: {
      optional: "(اختياري)", uploadImage: "رفع صورة", currentImage: "الصورة الحالية:",
      uploadingImage: "جاري رفع الصورة...", shareProduct: "شارك منتجك أو خدمتك مع جمهور عالمي",
      pleaseUploadImage: "يرجى رفع صورة", noImage: "لا توجد صورة", anonymous: "مجهول",
      excellent: "ممتاز", veryGood: "جيد جداً", good: "جيد", fair: "مقبول", poor: "ضعيف",
      commentPlaceholder: "شارك أفكارك...", yourName: "اسمك (اختياري)",
      star: "نجمة", stars: "نجوم", unpaid: "غير مدفوع", expired: "منتهي الصلاحية", active: "نشط",
      paymentRequired: "الدفع مطلوب للتفعيل", expiredOn: "انتهى في", expiresIn: "ينتهي في",
      days: "أيام", expires: "ينتهي", payNow: "ادفع $1.00", relist: "إعادة النشر ($1.00)",
      view: "عرض", analytics: "التحليلات", payment: "الدفع", listingFee: "رسوم الإدراج",
      duration: "المدة", total: "المجموع", confirmPayment: "تأكيد الدفع",
      clicksByCountry: "النقرات حسب الدولة", clicksByHour: "النقرات حسب ساعة اليوم",
      clicksLast30Days: "النقرات (آخر 30 يوم)", clicks: "نقرات",
      noAnalytics: "لا تتوفر بيانات تحليلية بعد", cardFooter: "تذييل البطاقة", hoverState: "حالة التحويم",
    },
    payment: {
      processing: "جاري معالجة دفعتك...", success: "تمت عملية الدفع بنجاح!",
      successMessage: "تم تفعيل Yubbox الخاص بك وسيكون نشطاً لمدة 14 يوماً.",
      failed: "فشلت عملية الدفع", cancelled: "تم إلغاء الدفع",
      cancelledMessage: "تم إلغاء دفعتك. لم يتم إجراء أي تحصيل.",
      backToDashboard: "العودة إلى لوحة التحكم", viewDashboard: "عرض لوحة التحكم",
      backToAd: "العودة إلى الإعلان", redirecting: "إعادة التوجيه إلى لوحة التحكم خلال ثوانٍ...",
    },
    admin: {
      dashboard: "لوحة تحكم المشرف", manageContent: "إدارة الفئات والصناعات وأنواع المنتجات",
      categories: "الفئات", industries: "الصناعات", productTypes: "أنواع المنتجات",
      manageCategories: "إدارة فئات المنتجات/الخدمات",
      manageIndustries: "إدارة تصنيفات الصناعات",
      manageProductTypes: "إدارة أنواع الخدمات والمنتجات المادية",
      backToAdmin: "العودة إلى لوحة المشرف", backToDashboard: "العودة إلى لوحة التحكم",
      manageItems: "إنشاء العناصر وتعديلها وإدارتها", addNew: "إضافة جديد",
      name: "الاسم", type: "النوع", order: "الترتيب", status: "الحالة", actions: "الإجراءات",
      noItems: "لم يتم العثور على عناصر", active: "نشط", inactive: "غير نشط",
      edit: "تعديل", delete: "حذف", editItem: "تعديل العنصر", addItem: "إضافة عنصر جديد",
      description: "الوصف", service: "خدمة", physical: "مادي", create: "إنشاء",
      confirmDelete: "هل أنت متأكد أنك تريد حذف هذا العنصر؟",
    },
    validation: {
      titleRequired: "العنوان مطلوب", descriptionRequired: "الوصف مطلوب",
      descriptionMinLength: "يجب أن يحتوي الوصف على 50 حرفاً على الأقل",
      descriptionMaxLength: "لا يمكن أن يتجاوز الوصف 500 حرف",
      webLinkRequired: "الرابط الإلكتروني مطلوب", categoryRequired: "الفئة مطلوبة",
      industryRequired: "الصناعة مطلوبة", productTypeRequired: "نوع المنتج مطلوب",
    },
    errors: {
      loginError: "حدث خطأ أثناء تسجيل الدخول",
      registrationError: "حدث خطأ أثناء التسجيل",
      uploadError: "فشل في رفع الصورة",
    },
  },

  ja: {
    ad: {
      optional: "（任意）", uploadImage: "画像をアップロード", currentImage: "現在の画像：",
      uploadingImage: "画像をアップロード中...", shareProduct: "あなたの製品やサービスを世界中のオーディエンスと共有しましょう",
      pleaseUploadImage: "画像をアップロードしてください", noImage: "画像なし", anonymous: "匿名",
      excellent: "優秀", veryGood: "とても良い", good: "良い", fair: "普通", poor: "不良",
      commentPlaceholder: "ご意見をお聞かせください...", yourName: "お名前（任意）",
      star: "星", stars: "星", unpaid: "未払い", expired: "期限切れ", active: "アクティブ",
      paymentRequired: "有効化には支払いが必要です", expiredOn: "期限切れ日：", expiresIn: "残り",
      days: "日", expires: "有効期限", payNow: "$1.00を支払う", relist: "再掲載（$1.00）",
      view: "表示", analytics: "分析", payment: "お支払い", listingFee: "掲載料",
      duration: "期間", total: "合計", confirmPayment: "支払いを確認",
      clicksByCountry: "国別クリック数", clicksByHour: "時間帯別クリック数",
      clicksLast30Days: "クリック数（過去30日間）", clicks: "クリック",
      noAnalytics: "まだ分析データがありません", cardFooter: "カードフッター", hoverState: "ホバー状態",
    },
    payment: {
      processing: "お支払いを処理中...", success: "お支払いが完了しました！",
      successMessage: "Yubboxが有効化され、14日間掲載されます。",
      failed: "お支払いに失敗しました", cancelled: "お支払いがキャンセルされました",
      cancelledMessage: "お支払いがキャンセルされました。料金は発生していません。",
      backToDashboard: "ダッシュボードに戻る", viewDashboard: "ダッシュボードを表示",
      backToAd: "広告に戻る", redirecting: "数秒後にダッシュボードにリダイレクトします...",
    },
    admin: {
      dashboard: "管理ダッシュボード", manageContent: "カテゴリ、業界、製品タイプの管理",
      categories: "カテゴリ", industries: "業界", productTypes: "製品タイプ",
      manageCategories: "製品/サービスカテゴリの管理",
      manageIndustries: "業界分類の管理",
      manageProductTypes: "サービスおよび物理製品タイプの管理",
      backToAdmin: "管理パネルに戻る", backToDashboard: "ダッシュボードに戻る",
      manageItems: "アイテムの作成、編集、管理", addNew: "新規追加",
      name: "名前", type: "タイプ", order: "順序", status: "ステータス", actions: "アクション",
      noItems: "アイテムが見つかりません", active: "アクティブ", inactive: "非アクティブ",
      edit: "編集", delete: "削除", editItem: "アイテムを編集", addItem: "新しいアイテムを追加",
      description: "説明", service: "サービス", physical: "物理的", create: "作成",
      confirmDelete: "このアイテムを削除してもよろしいですか？",
    },
    validation: {
      titleRequired: "タイトルは必須です", descriptionRequired: "説明は必須です",
      descriptionMinLength: "説明は50文字以上必要です",
      descriptionMaxLength: "説明は500文字を超えることはできません",
      webLinkRequired: "ウェブリンクは必須です", categoryRequired: "カテゴリは必須です",
      industryRequired: "業界は必須です", productTypeRequired: "製品タイプは必須です",
    },
    errors: {
      loginError: "ログイン中にエラーが発生しました",
      registrationError: "登録中にエラーが発生しました",
      uploadError: "画像のアップロードに失敗しました",
    },
  },

  zh: {
    ad: {
      optional: "（可选）", uploadImage: "上传图片", currentImage: "当前图片：",
      uploadingImage: "正在上传图片...", shareProduct: "与全球受众分享您的产品或服务",
      pleaseUploadImage: "请上传图片", noImage: "无图片", anonymous: "匿名",
      excellent: "优秀", veryGood: "非常好", good: "良好", fair: "一般", poor: "较差",
      commentPlaceholder: "分享您的想法...", yourName: "您的姓名（可选）",
      star: "星", stars: "星", unpaid: "未付款", expired: "已过期", active: "活跃",
      paymentRequired: "需要付款以激活", expiredOn: "过期于", expiresIn: "剩余",
      days: "天", expires: "到期", payNow: "支付 $1.00", relist: "重新发布（$1.00）",
      view: "查看", analytics: "分析", payment: "付款", listingFee: "刊登费",
      duration: "持续时间", total: "总计", confirmPayment: "确认付款",
      clicksByCountry: "按国家点击量", clicksByHour: "按时段点击量",
      clicksLast30Days: "点击量（最近30天）", clicks: "点击",
      noAnalytics: "暂无分析数据", cardFooter: "卡片底部", hoverState: "悬停状态",
    },
    payment: {
      processing: "正在处理您的付款...", success: "付款成功！",
      successMessage: "您的 Yubbox 已激活，将在 14 天内保持活跃。",
      failed: "付款失败", cancelled: "付款已取消",
      cancelledMessage: "您的付款已取消，未产生任何费用。",
      backToDashboard: "返回仪表盘", viewDashboard: "查看仪表盘",
      backToAd: "返回广告", redirecting: "几秒后将跳转至仪表盘...",
    },
    admin: {
      dashboard: "管理仪表盘", manageContent: "管理类别、行业和产品类型",
      categories: "类别", industries: "行业", productTypes: "产品类型",
      manageCategories: "管理产品/服务类别",
      manageIndustries: "管理行业分类",
      manageProductTypes: "管理服务和实体产品类型",
      backToAdmin: "返回管理面板", backToDashboard: "返回仪表盘",
      manageItems: "创建、编辑和管理项目", addNew: "新增",
      name: "名称", type: "类型", order: "顺序", status: "状态", actions: "操作",
      noItems: "未找到项目", active: "活跃", inactive: "非活跃",
      edit: "编辑", delete: "删除", editItem: "编辑项目", addItem: "添加新项目",
      description: "描述", service: "服务", physical: "实体", create: "创建",
      confirmDelete: "确定要删除此项目吗？",
    },
    validation: {
      titleRequired: "标题为必填项", descriptionRequired: "描述为必填项",
      descriptionMinLength: "描述至少需要 50 个字符",
      descriptionMaxLength: "描述不能超过 500 个字符",
      webLinkRequired: "网址为必填项", categoryRequired: "类别为必填项",
      industryRequired: "行业为必填项", productTypeRequired: "产品类型为必填项",
    },
    errors: {
      loginError: "登录时发生错误",
      registrationError: "注册时发生错误",
      uploadError: "图片上传失败",
    },
  },
};

// ── Deep merge helper ─────────────────────────────────────────────────────────
function deepMerge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    out[k] = (v && typeof v === 'object' && !Array.isArray(v))
      ? deepMerge(out[k] ?? {}, v)
      : v;
  }
  return out;
}

// ── Patch each file ───────────────────────────────────────────────────────────
let totalAdded = 0;
for (const [lang, patch] of Object.entries(patches)) {
  const file = path.join(dir, `${lang}.json`);
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  const merged   = deepMerge(existing, patch);
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  // Count added keys
  const added = JSON.stringify(patch).match(/\"[^\"]+\":/g)?.length ?? 0;
  totalAdded += added;
  console.log(`✓ ${lang}.json — added ~${added} keys`);
}
console.log(`\nDone. Total keys added: ${totalAdded}`);
