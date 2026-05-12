/**
 * Minimal message catalogue bundled with @ulam/calamansi for demo and
 * testing purposes. Shows the initI18n / setLocale / getT pattern without
 * requiring any app-specific locale data.
 *
 * Keys: greeting, farewell, language
 */
const DEMO_MESSAGES = {
  en:    { greeting: 'Hello',       farewell: 'Goodbye',    language: 'English'    },
  tl:    { greeting: 'Kamusta',     farewell: 'Paalam',     language: 'Filipino'   },
  es:    { greeting: 'Hola',        farewell: 'Adiós',      language: 'Español'    },
  fr:    { greeting: 'Bonjour',     farewell: 'Au revoir',  language: 'Français'   },
  de:    { greeting: 'Hallo',       farewell: 'Tschüss',    language: 'Deutsch'    },
  ja:    { greeting: 'こんにちは',  farewell: 'さようなら', language: '日本語'     },
  zh:    { greeting: '你好',        farewell: '再见',        language: '中文'       },
  ar:    { greeting: 'مرحبا',       farewell: 'وداعاً',     language: 'العربية'    },
  hi:    { greeting: 'नमस्ते',     farewell: 'अलविदा',     language: 'हिन्दी'    },
  ko:    { greeting: '안녕하세요',  farewell: '안녕히 가세요', language: '한국어'  },
  pt:    { greeting: 'Olá',         farewell: 'Adeus',      language: 'Português'  },
  'pt-BR': { greeting: 'Oi',        farewell: 'Tchau',      language: 'Português (BR)' },
}

export default DEMO_MESSAGES
