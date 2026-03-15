import { useState, useEffect } from 'react'

interface WeatherData {
  temperature: number      // °C
  weatherCode: number      // WMO code
  description: string      // Human-readable
  icon: string             // Emoji
  city: string             // "Jakarta" or detected
  isLoading: boolean
}

// WMO Weather interpretation codes → emoji + description
const WMO_MAP: Record<number, { icon: string; en: string; id: string; zh: string; ar: string; ja: string; ko: string; ru: string; fr: string; de: string; es: string; nl: string; hi: string }> = {
  0:  { icon: '☀️',  en: 'Clear sky',              id: 'Cerah',                  zh: '晴天',         ar: 'صافٍ',               ja: '快晴',             ko: '맑음',           ru: 'Ясно',                    fr: 'Ciel dégagé',          de: 'Klarer Himmel',         es: 'Despejado',               nl: 'Heldere hemel',       hi: 'साफ आसमान' },
  1:  { icon: '🌤️', en: 'Mainly clear',            id: 'Cerah berawan',          zh: '大致晴朗',     ar: 'صافٍ جزئياً',        ja: 'ほぼ晴れ',         ko: '대체로 맑음',    ru: 'В основном ясно',         fr: 'Principalement dégagé', de: 'Überwiegend klar',      es: 'Principalmente despejado', nl: 'Overwegend helder',  hi: 'अधिकतर साफ' },
  2:  { icon: '⛅',  en: 'Partly cloudy',           id: 'Berawan sebagian',       zh: '部分多云',     ar: 'غائم جزئياً',        ja: '一部曇り',         ko: '부분적으로 흐림', ru: 'Переменная облачность',   fr: 'Partiellement nuageux', de: 'Teilweise bewölkt',     es: 'Parcialmente nublado',    nl: 'Gedeeltelijk bewolkt', hi: 'आंशिक बादल' },
  3:  { icon: '☁️',  en: 'Overcast',               id: 'Mendung',                zh: '阴天',         ar: 'غائم',               ja: '曇り',             ko: '흐림',           ru: 'Пасмурно',                fr: 'Couvert',               de: 'Bedeckt',               es: 'Nublado',                 nl: 'Bewolkt',             hi: 'बादल छाए' },
  45: { icon: '🌫️', en: 'Foggy',                   id: 'Berkabut',               zh: '有雾',         ar: 'ضبابي',              ja: '霧',               ko: '안개',           ru: 'Туман',                   fr: 'Brouillard',            de: 'Neblig',                es: 'Niebla',                  nl: 'Mistig',              hi: 'कोहरा' },
  48: { icon: '🌫️', en: 'Icy fog',                 id: 'Kabut es',               zh: '结冰雾',       ar: 'ضباب جليدي',         ja: '着氷霧',           ko: '결빙 안개',      ru: 'Ледяной туман',           fr: 'Brouillard givrant',    de: 'Gefrierender Nebel',    es: 'Niebla helada',           nl: 'IJsmist',             hi: 'बर्फीला कोहरा' },
  51: { icon: '🌦️', en: 'Light drizzle',           id: 'Gerimis ringan',         zh: '小毛毛雨',     ar: 'رذاذ خفيف',          ja: '小雨',             ko: '가벼운 이슬비',  ru: 'Лёгкая морось',           fr: 'Bruine légère',         de: 'Leichter Nieselregen',  es: 'Llovizna ligera',         nl: 'Lichte motregen',     hi: 'हल्की बूंदाबांदी' },
  53: { icon: '🌦️', en: 'Moderate drizzle',        id: 'Gerimis',                zh: '中等毛毛雨',   ar: 'رذاذ متوسط',         ja: '霧雨',             ko: '보통 이슬비',    ru: 'Умеренная морось',        fr: 'Bruine modérée',        de: 'Mäßiger Nieselregen',   es: 'Llovizna moderada',       nl: 'Matige motregen',     hi: 'मध्यम बूंदाबांदी' },
  55: { icon: '🌧️', en: 'Dense drizzle',           id: 'Gerimis lebat',          zh: '浓毛毛雨',     ar: 'رذاذ كثيف',          ja: '濃い霧雨',         ko: '짙은 이슬비',    ru: 'Сильная морось',          fr: 'Bruine dense',          de: 'Starker Nieselregen',   es: 'Llovizna densa',          nl: 'Dichte motregen',     hi: 'घनी बूंदाबांदी' },
  61: { icon: '🌧️', en: 'Slight rain',             id: 'Hujan ringan',           zh: '小雨',         ar: 'مطر خفيف',           ja: '弱い雨',           ko: '약한 비',        ru: 'Небольшой дождь',         fr: 'Pluie faible',          de: 'Leichter Regen',        es: 'Lluvia débil',            nl: 'Lichte regen',        hi: 'हल्की बारिश' },
  63: { icon: '🌧️', en: 'Moderate rain',           id: 'Hujan',                  zh: '中雨',         ar: 'مطر معتدل',          ja: '中程度の雨',       ko: '보통 비',        ru: 'Умеренный дождь',         fr: 'Pluie modérée',         de: 'Mäßiger Regen',         es: 'Lluvia moderada',         nl: 'Matige regen',        hi: 'मध्यम बारिश' },
  65: { icon: '🌧️', en: 'Heavy rain',              id: 'Hujan lebat',            zh: '大雨',         ar: 'مطر غزير',           ja: '大雨',             ko: '강한 비',        ru: 'Сильный дождь',           fr: 'Pluie forte',           de: 'Starker Regen',         es: 'Lluvia intensa',          nl: 'Zware regen',         hi: 'भारी बारिश' },
  71: { icon: '🌨️', en: 'Slight snow',             id: 'Salju ringan',           zh: '小雪',         ar: 'ثلج خفيف',           ja: '弱い雪',           ko: '약한 눈',        ru: 'Небольшой снег',          fr: 'Neige faible',          de: 'Leichter Schneefall',   es: 'Nieve ligera',            nl: 'Lichte sneeuw',       hi: 'हल्की बर्फ' },
  73: { icon: '🌨️', en: 'Moderate snow',           id: 'Salju',                  zh: '中雪',         ar: 'ثلج معتدل',          ja: '中程度の雪',       ko: '보통 눈',        ru: 'Умеренный снег',          fr: 'Neige modérée',         de: 'Mäßiger Schneefall',    es: 'Nieve moderada',          nl: 'Matige sneeuw',       hi: 'मध्यम बर्फ' },
  75: { icon: '❄️',  en: 'Heavy snow',              id: 'Salju lebat',            zh: '大雪',         ar: 'ثلج كثيف',           ja: '大雪',             ko: '강한 눈',        ru: 'Сильный снег',            fr: 'Neige forte',           de: 'Starker Schneefall',    es: 'Nieve intensa',           nl: 'Zware sneeuw',        hi: 'भारी बर्फ' },
  80: { icon: '🌦️', en: 'Rain showers',            id: 'Hujan singkat',          zh: '阵雨',         ar: 'زخات مطرية',         ja: 'にわか雨',         ko: '소나기',         ru: 'Ливень',                  fr: 'Averses',               de: 'Regenschauer',          es: 'Chubascos',               nl: 'Regenbuien',          hi: 'बौछारें' },
  81: { icon: '🌧️', en: 'Moderate showers',        id: 'Hujan sedang',           zh: '中阵雨',       ar: 'زخات معتدلة',        ja: '中程度のにわか雨', ko: '보통 소나기',    ru: 'Умеренный ливень',        fr: 'Averses modérées',      de: 'Mäßige Schauer',        es: 'Chubascos moderados',     nl: 'Matige buien',        hi: 'मध्यम बौछारें' },
  82: { icon: '⛈️',  en: 'Violent showers',         id: 'Hujan deras',            zh: '暴阵雨',       ar: 'زخات عنيفة',         ja: '激しいにわか雨',   ko: '강한 소나기',    ru: 'Сильный ливень',          fr: 'Averses violentes',     de: 'Starke Schauer',        es: 'Chubascos violentos',     nl: 'Zware buien',         hi: 'तेज बौछारें' },
  95: { icon: '⛈️',  en: 'Thunderstorm',            id: 'Badai petir',            zh: '雷暴',         ar: 'عاصفة رعدية',        ja: '雷雨',             ko: '뇌우',           ru: 'Гроза',                   fr: 'Orage',                 de: 'Gewitter',              es: 'Tormenta',                nl: 'Onweer',              hi: 'आंधी-तूफान' },
  96: { icon: '⛈️',  en: 'Thunderstorm w/ hail',   id: 'Badai petir & hujan es', zh: '雷暴夹冰雹',   ar: 'عاصفة رعدية مع برد', ja: '雷雨（ひょう混じり）', ko: '우박 동반 뇌우', ru: 'Гроза с градом',          fr: 'Orage avec grêle',      de: 'Gewitter mit Hagel',    es: 'Tormenta con granizo',    nl: 'Onweer met hagel',    hi: 'ओलों के साथ तूफान' },
  99: { icon: '⛈️',  en: 'Severe thunderstorm',    id: 'Badai petir hebat',      zh: '强雷暴',       ar: 'عاصفة رعدية شديدة',  ja: '激しい雷雨',       ko: '강한 뇌우',      ru: 'Сильная гроза',           fr: 'Orage violent',         de: 'Schweres Gewitter',     es: 'Tormenta severa',         nl: 'Zwaar onweer',        hi: 'भीषण तूफान' },
}

type WmoLangKey = 'en' | 'id' | 'zh' | 'ar' | 'ja' | 'ko' | 'ru' | 'fr' | 'de' | 'es' | 'nl' | 'hi'
const SUPPORTED_LANGS = new Set<string>(['en','id','zh','ar','ja','ko','ru','fr','de','es','nl','hi'])

function getWeatherInfo(code: number, lang: string): { icon: string; description: string } {
  const entry = WMO_MAP[code] ?? WMO_MAP[0]!
  const key = (SUPPORTED_LANGS.has(lang) ? lang : 'en') as WmoLangKey
  return { icon: entry.icon, description: entry[key] }
}

// Jakarta fallback coordinates
const JAKARTA_LAT = -6.2088
const JAKARTA_LON = 106.8456

/**
 * Fetches current weather using Open-Meteo API (free, no API key).
 * Detects user location via Geolocation API; falls back to Jakarta.
 */
export function useWeather(lang = 'en'): WeatherData {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    weatherCode: 0,
    description: '',
    icon: '',
    city: '',
    isLoading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function fetchWeather(lat: number, lon: number, cityName: string) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
        )
        const data = await res.json()
        if (cancelled) return

        const cw = data.current_weather
        const info = getWeatherInfo(cw.weathercode, lang)

        setWeather({
          temperature: Math.round(cw.temperature),
          weatherCode: cw.weathercode,
          description: info.description,
          icon: info.icon,
          city: cityName,
          isLoading: false,
        })
      } catch {
        if (!cancelled) {
          setWeather((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    // Reverse geocode city name from coordinates
    async function getCityName(lat: number, lon: number): Promise<string> {
      try {
        // Use nominatim for reverse geocoding (free, no API key)
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
        )
        const nomData = await nomRes.json()
        return (
          nomData.address?.city ??
          nomData.address?.town ??
          nomData.address?.county ??
          nomData.address?.state ??
          'Unknown'
        )
      } catch {
        return 'Unknown'
      }
    }

    // Try geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const city = await getCityName(latitude, longitude)
          fetchWeather(latitude, longitude, city)
        },
        () => {
          // Permission denied or error → fallback to Jakarta
          fetchWeather(JAKARTA_LAT, JAKARTA_LON, 'Jakarta')
        },
        { timeout: 5000 },
      )
    } else {
      fetchWeather(JAKARTA_LAT, JAKARTA_LON, 'Jakarta')
    }

    return () => {
      cancelled = true
    }
  }, [lang])

  return weather
}
