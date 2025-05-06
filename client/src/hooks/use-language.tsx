import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "./use-toast";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
];

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  getLanguageName: (code: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// Traduzioni per elementi UI statici
export const translations: Record<string, Record<string, string>> = {
  // Navbar e navigazione
  "Home": {
    "en": "Home",
    "it": "Home",
    "es": "Inicio",
    "fr": "Accueil",
    "de": "Startseite",
    "ja": "ホーム",
    "zh": "首页"
  },
  
  // Auth page specific
  "Logging in...": {
    "en": "Logging in...",
    "it": "Accesso in corso...",
    "es": "Iniciando sesión...",
    "fr": "Connexion en cours...",
    "de": "Anmeldung läuft...",
    "ja": "ログイン中...",
    "zh": "登录中..."
  },
  "Creating account...": {
    "en": "Creating account...",
    "it": "Creazione account...",
    "es": "Creando cuenta...",
    "fr": "Création du compte...",
    "de": "Account wird erstellt...",
    "ja": "アカウント作成中...",
    "zh": "创建账户中..."
  },
  "Create account": {
    "en": "Create account",
    "it": "Crea account",
    "es": "Crear cuenta",
    "fr": "Créer un compte",
    "de": "Account erstellen",
    "ja": "アカウント作成",
    "zh": "创建账户"
  },
  "Confirm Password": {
    "en": "Confirm Password",
    "it": "Conferma Password",
    "es": "Confirmar Contraseña",
    "fr": "Confirmer le mot de passe",
    "de": "Passwort bestätigen",
    "ja": "パスワードを確認",
    "zh": "确认密码"
  },
  "Don't have an account?": {
    "en": "Don't have an account?",
    "it": "Non hai un account?",
    "es": "¿No tienes una cuenta?",
    "fr": "Vous n'avez pas de compte ?",
    "de": "Noch kein Konto?",
    "ja": "アカウントをお持ちでない方",
    "zh": "没有账户？"
  },
  "Already have an account?": {
    "en": "Already have an account?",
    "it": "Hai già un account?",
    "es": "¿Ya tienes una cuenta?",
    "fr": "Vous avez déjà un compte ?",
    "de": "Bereits ein Konto?",
    "ja": "すでにアカウントをお持ちの方",
    "zh": "已有账户？"
  },
  "Sign up": {
    "en": "Sign up",
    "it": "Registrati",
    "es": "Registrarse",
    "fr": "S'inscrire",
    "de": "Registrieren",
    "ja": "新規登録",
    "zh": "注册"
  },
  "Log in": {
    "en": "Log in",
    "it": "Accedi",
    "es": "Iniciar sesión",
    "fr": "Se connecter",
    "de": "Anmelden",
    "ja": "ログイン",
    "zh": "登录"
  },
  "Share your dreams and connect with others who had similar experiences": {
    "en": "Share your dreams and connect with others who had similar experiences",
    "it": "Condividi i tuoi sogni e connettiti con altri che hanno avuto esperienze simili",
    "es": "Comparte tus sueños y conéctate con otros que tuvieron experiencias similares",
    "fr": "Partagez vos rêves et connectez-vous avec d'autres qui ont eu des expériences similaires",
    "de": "Teilen Sie Ihre Träume und verbinden Sie sich mit anderen, die ähnliche Erfahrungen gemacht haben",
    "ja": "あなたの夢を共有し、同様の経験をした人々とつながりましょう",
    "zh": "分享你的梦境，与有相似经历的人建立联系"
  },
  
  "Explore": {
    "en": "Explore",
    "it": "Esplora",
    "es": "Explorar",
    "fr": "Explorer",
    "de": "Entdecken",
    "ja": "探索",
    "zh": "探索"
  },
  "Matches": {
    "en": "Matches",
    "it": "Corrispondenze",
    "es": "Coincidencias",
    "fr": "Correspondances",
    "de": "Übereinstimmungen",
    "ja": "マッチ",
    "zh": "匹配"
  },
  "Chat": {
    "en": "Chat",
    "it": "Chat",
    "es": "Chat",
    "fr": "Chat",
    "de": "Chat",
    "ja": "チャット",
    "zh": "聊天"
  },
  "Settings": {
    "en": "Settings",
    "it": "Impostazioni",
    "es": "Configuración",
    "fr": "Paramètres",
    "de": "Einstellungen",
    "ja": "設定",
    "zh": "设置"
  },
  "Logout": {
    "en": "Logout",
    "it": "Esci",
    "es": "Cerrar sesión",
    "fr": "Déconnexion",
    "de": "Abmelden",
    "ja": "ログアウト",
    "zh": "登出"
  },

  // Form elementi
  "Username": {
    "en": "Username",
    "it": "Nome utente",
    "es": "Nombre de usuario",
    "fr": "Nom d'utilisateur",
    "de": "Benutzername",
    "ja": "ユーザー名",
    "zh": "用户名"
  },
  "Password": {
    "en": "Password",
    "it": "Password",
    "es": "Contraseña",
    "fr": "Mot de passe",
    "de": "Passwort",
    "ja": "パスワード",
    "zh": "密码"
  },
  "Login": {
    "en": "Login",
    "it": "Accedi",
    "es": "Iniciar sesión",
    "fr": "Connexion",
    "de": "Anmelden",
    "ja": "ログイン",
    "zh": "登录"
  },
  "Register": {
    "en": "Register",
    "it": "Registrati",
    "es": "Registrarse",
    "fr": "S'inscrire",
    "de": "Registrieren",
    "ja": "登録",
    "zh": "注册"
  },
  "Submit": {
    "en": "Submit",
    "it": "Invia",
    "es": "Enviar",
    "fr": "Soumettre",
    "de": "Absenden",
    "ja": "送信",
    "zh": "提交"
  },
  "Cancel": {
    "en": "Cancel",
    "it": "Annulla",
    "es": "Cancelar",
    "fr": "Annuler",
    "de": "Abbrechen",
    "ja": "キャンセル",
    "zh": "取消"
  },

  // Dream posts elementi
  "Add Comment": {
    "en": "Add Comment",
    "it": "Aggiungi commento",
    "es": "Añadir comentario",
    "fr": "Ajouter un commentaire",
    "de": "Kommentar hinzufügen",
    "ja": "コメントを追加",
    "zh": "添加评论"
  },
  "Share your thoughts about this dream": {
    "en": "Share your thoughts about this dream",
    "it": "Condividi i tuoi pensieri su questo sogno",
    "es": "Comparte tus pensamientos sobre este sueño",
    "fr": "Partagez vos pensées sur ce rêve",
    "de": "Teilen Sie Ihre Gedanken zu diesem Traum",
    "ja": "この夢についてあなたの考えを共有してください",
    "zh": "分享你对这个梦的想法"
  },
  "Translate": {
    "en": "Translate",
    "it": "Traduci",
    "es": "Traducir",
    "fr": "Traduire",
    "de": "Übersetzen",
    "ja": "翻訳",
    "zh": "翻译"
  },
  "Original": {
    "en": "Original",
    "it": "Originale",
    "es": "Original",
    "fr": "Original",
    "de": "Original",
    "ja": "元の文",
    "zh": "原文"
  },
  "Dream Settings": {
    "en": "Dream Settings",
    "it": "Impostazioni Sogno",
    "es": "Configuración del Sueño",
    "fr": "Paramètres du Rêve",
    "de": "Traum-Einstellungen",
    "ja": "夢の設定",
    "zh": "梦境设置"
  },
  
  // Pagine
  "Recent Dreams": {
    "en": "Recent Dreams",
    "it": "Sogni Recenti",
    "es": "Sueños Recientes",
    "fr": "Rêves Récents",
    "de": "Aktuelle Träume",
    "ja": "最近の夢",
    "zh": "最近的梦"
  },
  "Your Dream Matches": {
    "en": "Your Dream Matches",
    "it": "Corrispondenze dei tuoi Sogni",
    "es": "Coincidencias de tus Sueños",
    "fr": "Correspondances de vos Rêves",
    "de": "Ihre Traum-Übereinstimmungen",
    "ja": "あなたの夢のマッチ",
    "zh": "你的梦境匹配"
  },
  "Explore Dreams": {
    "en": "Explore Dreams",
    "it": "Esplora Sogni",
    "es": "Explorar Sueños",
    "fr": "Explorer les Rêves",
    "de": "Träume Entdecken",
    "ja": "夢を探索",
    "zh": "探索梦境"
  },
  "Language": {
    "en": "Language",
    "it": "Lingua",
    "es": "Idioma",
    "fr": "Langue",
    "de": "Sprache",
    "ja": "言語",
    "zh": "语言"
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [language, setLanguageState] = useState<string>(() => {
    // Ottieni la lingua dal localStorage o usa l'impostazione predefinita
    const savedLang = localStorage.getItem("language");
    return savedLang || navigator.language.split('-')[0] || "en";
  });

  const getLanguageName = (code: string): string => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : "English";
  };

  const setLanguage = (lang: string) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
      lang = "en"; // Fallback a inglese se la lingua non è supportata
    }
    
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    
    toast({
      title: translations["Language"][lang || "en"],
      description: getLanguageName(lang),
      duration: 2000,
    });
  };

  // Salva la lingua nel localStorage quando cambia
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getLanguageName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Utility per tradurre testo
export function t(key: string, language: string = "en"): string {
  if (!translations[key]) {
    return key; // Ritorna la chiave se non ci sono traduzioni
  }
  
  return translations[key][language] || translations[key]["en"] || key;
}