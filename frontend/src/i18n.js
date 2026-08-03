import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "architecture": "Architecture",
        "login": "Log In",
        "register": "Get Started",
        "logout": "Log Out"
      },
      "hero": {
        "badge": "ENTERPRISE SECURITY SUITE v1.0",
        "title_part1": "Secure your workforce",
        "title_part2": "before the breach.",
        "subtitle": "The all-in-one Mission Control for password auditing, entropy analysis, and breach monitoring. Protect your company with real-time intelligence.",
        "btn_register": "Create Company Account",
        "btn_global": "View Global Intelligence"
      },
      "features": {
        "auditor_title": "Password Auditor",
        "auditor_desc": "Check against 800M+ leaked credentials securely.",
        "monitor_title": "Email Monitor",
        "monitor_desc": "Scan corporate domains for dark web exposure.",
        "portal_title": "Company Portal",
        "portal_desc": "Login to Mission Control to manage campaigns."
      },
      "about": {
        "title": "The Architecture.",
        "subtitle": "notSafe is a high-performance security auditing tool designed to demonstrate modern API architecture, secure hashing implementation, and real-time analytics.",
        "backend_title": "Backend Core",
        "backend_desc": "RESTful API design using Blueprints for modular routing. Implements strict rate-limiting via Flask-Limiter to prevent brute-force attacks.",
        "performance_title": "Performance",
        "performance_desc": "Volatile data structure used to cache external API responses (HIBP) within the application instance, reducing latency for repeated checks during the same session.",
        "data_title": "Data & Analytics",
        "data_desc": "NoSQL document storage for anonymous usage logs. Aggregation pipelines calculate global breach statistics in real-time.",
        "security_title": "Security",
        "security_desc": "We never send your full password. Only the first 5 characters of the SHA-1 hash are transmitted, ensuring mathematical privacy.",
        "footer": "Built by"
      },
      "auth": {
        "restricted": "Restricted",
        "authorized_only": "AUTHORIZED PERSONNEL ONLY",
        "email_label": "EMAIL IDENTITY",
        "password_label": "ACCESS CODE",
        "btn_login": "ACCESS DASHBOARD",
        "btn_authenticating": "AUTHENTICATING...",
        "terminate": "← TERMINATE SESSION",
        "register_new": "REGISTER NEW ID →",
        "forgot_password": "Forgot your access code?",
        "register_title": "Recruitment",
        "register_subtitle": "CREATE NEW OPERATOR IDENTITY",
        "company_label": "COMPANY DESIGNATION",
        "btn_register": "INITIALIZE ACCOUNT",
        "btn_initializing": "INITIALIZING...",
        "back_to_login": "← RETURN TO BASE",
        "forgot_title": "Forgot Password",
        "forgot_desc": "Enter your work email to receive a secure access link.",
        "forgot_sent": "A secure link has been dispatched to your email.",
        "forgot_expiry": "The link expires in 1 hour.",
        "btn_send": "DISPATCH LINK",
        "reset_title": "Reset Access Code",
        "new_password_label": "NEW ACCESS CODE",
        "confirm_password_label": "CONFIRM ACCESS CODE",
        "btn_reset": "REPROGRAM ACCESS",
        "reset_success": "Access code reprogrammed successfully."
      },
      "dashboard": {
        "hq": "HQ",
        "risk_assessment": "DEPARTMENTAL RISK ASSESSMENT",
        "total_checks": "TOTAL CHECKS",
        "breaches_found": "BREACHES FOUND",
        "safety_score": "SAFETY SCORE",
        "portal_link": "EMPLOYEE PORTAL LINK",
        "copy_link": "COPY LINK",
        "copied": "COPIED!",
        "manage_depts": "MANAGE DEPARTMENTS",
        "add_dept_placeholder": "e.g. Finance",
        "no_depts": "No departments yet. Add one above.",
        "risk_by_dept": "RISK BY DEPARTMENT",
        "no_data": "NO DATA YET. SHARE THE PORTAL LINK TO GATHER INTELLIGENCE.",
        "global_intel": "GLOBAL INTELLIGENCE",
        "telemetry": "LIVE THREAT TELEMETRY",
        "exit": "EXIT DASHBOARD",
        "global_score": "Global Safety Score",
        "total_scans": "TOTAL SCANS",
        "threats_detected": "THREATS DETECTED",
        "passwords_audited": "PASSWORDS AUDITED",
        "activity_30d": "30-DAY ACTIVITY",
        "risk_ratio": "EMAIL RISK RATIO",
        "complexity": "PASSWORD COMPLEXITY DISTRIBUTION"
      },
      "tools": {
        "audit_title": "Password Auditor",
        "audit_subtitle": "Analyze entropy & check global breach databases.",
        "audit_placeholder": "Enter a password...",
        "audit_score": "Security Score",
        "audit_crack_time": "Time to Crack",
        "audit_breach_status": "Breach Database Status",
        "audit_safe": "SAFE: No matches found in known leaks.",
        "audit_breached": "COMPROMISED: Found in leaked databases!",
        "monitor_title": "Email Monitor",
        "monitor_subtitle": "Search the dark web for compromised corporate identities.",
        "monitor_placeholder": "target@company.com",
        "monitor_btn": "SCAN DATABASE",
        "monitor_status": "TARGET STATUS",
        "monitor_risk": "RISK SCORE",
        "monitor_no_leaks": "No Public Leaks Found",
        "monitor_leaks_found": "Leaked Data Identified",
        "portal_loading": "LOADING PORTAL...",
        "portal_select_dept": "SELECT YOUR DEPARTMENT",
        "portal_verify": "VERIFY CREDENTIAL STRENGTH",
        "portal_verify_placeholder": "Enter password to test...",
        "portal_verify_desc": "Your password is never stored. We use K-Anonymity for secure verification."
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "architecture": "Architecture",
        "login": "Connexion",
        "register": "S'inscrire",
        "logout": "Déconnexion"
      },
      "hero": {
        "badge": "SUITE DE SÉCURITÉ ENTREPRISE v1.0",
        "title_part1": "Sécurisez votre personnel",
        "title_part2": "avant la faille.",
        "subtitle": "Le centre de contrôle tout-en-un pour l'audit des mots de passe, l'analyse d'entropie et la surveillance des brèches. Protégez votre entreprise avec une intelligence en temps réel.",
        "btn_register": "Créer un compte entreprise",
        "btn_global": "Voir l'intelligence globale"
      },
      "features": {
        "auditor_title": "Auditeur de mots de passe",
        "auditor_desc": "Vérifiez plus de 800M de codes d'accès divulgués en toute sécurité.",
        "monitor_title": "Moniteur d'e-mails",
        "monitor_desc": "Analysez les domaines d'entreprise pour l'exposition au dark web.",
        "portal_title": "Portail d'entreprise",
        "portal_desc": "Connectez-vous au centre de contrôle pour gérer les campagnes."
      },
      "about": {
        "title": "L'Architecture.",
        "subtitle": "notSafe est un outil d'audit de sécurité haute performance conçu pour démontrer l'architecture API moderne, l'implémentation de hachage sécurisé et les analyses en temps réel.",
        "backend_title": "Cœur du Backend",
        "backend_desc": "Conception d'API RESTful utilisant des Blueprints pour un routage modulaire. Implémente une limitation de débit stricte via Flask-Limiter pour prévenir les attaques par force brute.",
        "performance_title": "Performance",
        "performance_desc": "Structure de données volatile utilisée pour mettre en cache les réponses des API externes (HIBP) au sein de l'instance de l'application, réduisant la latence pour les vérifications répétées au cours d'une même session.",
        "data_title": "Données & Analyses",
        "data_desc": "Stockage de documents NoSQL pour les journaux d'utilisation anonymes. Les pipelines d'agrégation calculent les statistiques globales de violation en temps réel.",
        "security_title": "Sécurité",
        "security_desc": "Nous n'envoyons jamais votre mot de passe complet. Seuls les 5 premiers caractères du hachage SHA-1 sont transmis, garantissant une confidentialité mathématique.",
        "footer": "Développé par"
      },
      "auth": {
        "restricted": "Accès Restreint",
        "authorized_only": "PERSONNEL AUTORISÉ UNIQUEMENT",
        "email_label": "IDENTITÉ E-MAIL",
        "password_label": "CODE D'ACCÈS",
        "btn_login": "ACCÉDER AU TABLEAU DE BORD",
        "btn_authenticating": "AUTHENTIFICATION...",
        "terminate": "← TERMINER LA SESSION",
        "register_new": "ENREGISTRER NOUVEL ID →",
        "forgot_password": "Code d'accès oublié ?",
        "register_title": "Recrutement",
        "register_subtitle": "CRÉER UNE NOUVELLE IDENTITÉ OPÉRATEUR",
        "company_label": "DÉSIGNATION DE L'ENTREPRISE",
        "btn_register": "INITIALISER LE COMPTE",
        "btn_initializing": "INITIALISATION...",
        "back_to_login": "← RETOUR À LA BASE",
        "forgot_title": "Mot de passe oublié",
        "forgot_desc": "Entrez votre e-mail professionnel pour recevoir un lien d'accès sécurisé.",
        "forgot_sent": "Un lien sécurisé a été envoyé à votre e-mail.",
        "forgot_expiry": "Le lien expire dans 1 heure.",
        "btn_send": "ENVOYER LE LIEN",
        "reset_title": "Réinitialiser le code d'accès",
        "new_password_label": "NOUVEAU CODE D'ACCÈS",
        "confirm_password_label": "CONFIRMER LE CODE D'ACCÈS",
        "btn_reset": "REPROGRAMMER L'ACCÈS",
        "reset_success": "Code d'accès reprogrammé avec succès."
      },
      "dashboard": {
        "hq": "HQ",
        "risk_assessment": "ÉVALUATION DES RISQUES PAR DÉPARTEMENT",
        "total_checks": "TOTAL VÉRIFICATIONS",
        "breaches_found": "FAILLES TROUVÉES",
        "safety_score": "SCORE DE SÉCURITÉ",
        "portal_link": "LIEN PORTAIL EMPLOYÉ",
        "copy_link": "COPIER LE LIEN",
        "copied": "COPIÉ !",
        "manage_depts": "GÉRER LES DÉPARTEMENTS",
        "add_dept_placeholder": "ex: Finances",
        "no_depts": "Aucun département. Ajoutez-en un ci-dessus.",
        "risk_by_dept": "RISQUE PAR DÉPARTEMENT",
        "no_data": "PAS ENCORE DE DONNÉES. PARTAGEZ LE LIEN POUR RECUEILLIR DES INFOS.",
        "global_intel": "INTELLIGENCE GLOBALE",
        "telemetry": "TÉLÉMÉTRIE DES MENACES EN DIRECT",
        "exit": "QUITTER LE TABLEAU",
        "global_score": "Score de sécurité global",
        "total_scans": "TOTAL SCANS",
        "threats_detected": "MENACES DÉTECTÉES",
        "passwords_audited": "MOTS DE PASSE AUDITÉS",
        "activity_30d": "ACTIVITÉ SUR 30 JOURS",
        "risk_ratio": "RATIO DE RISQUE E-MAIL",
        "complexity": "DISTRIBUTION DE LA COMPLEXITÉ"
      },
      "tools": {
        "audit_title": "Auditeur de Mots de Passe",
        "audit_subtitle": "Analysez l'entropie et vérifiez les bases de données mondiales.",
        "audit_placeholder": "Entrez un mot de passe...",
        "audit_score": "Score de Sécurité",
        "audit_crack_time": "Temps de Craquage",
        "audit_breach_status": "Statut de la Base de Données",
        "audit_safe": "SÛR : Aucune correspondance trouvée.",
        "audit_breached": "COMPROMIS : Trouvé dans les fuites !",
        "monitor_title": "Moniteur d'E-mails",
        "monitor_subtitle": "Recherchez les identités compromises sur le dark web.",
        "monitor_placeholder": "cible@entreprise.com",
        "monitor_btn": "SCANNER LA BASE",
        "monitor_status": "STATUT DE LA CIBLE",
        "monitor_risk": "SCORE DE RISQUE",
        "monitor_no_leaks": "Aucune fuite publique trouvée",
        "monitor_leaks_found": "Données fuitées identifiées",
        "portal_loading": "CHARGEMENT DU PORTAIL...",
        "portal_select_dept": "SÉLECTIONNEZ VOTRE DÉPARTEMENT",
        "portal_verify": "VÉRIFIER LA FORCE DES IDENTIFIANTS",
        "portal_verify_placeholder": "Entrez le mot de passe...",
        "portal_verify_desc": "Votre mot de passe n'est jamais stocké. Nous utilisons le K-Anonymat."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;