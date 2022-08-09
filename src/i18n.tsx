import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { PluralCategory, en, ko, tr, vi, zh } from 'make-plural/plurals'
import { ReactNode, useEffect, useState } from 'react'

import { SupportedLocale } from 'constants/locales'
import { useActiveLocale, useSetLocaleFromUrl } from 'hooks/useActiveLocale'

type LocalePlural = {
  [key in SupportedLocale]: (n: number | string, ord?: boolean) => PluralCategory
}

const plurals: LocalePlural = {
  'en-US': en,
  'ko-KR': ko,
  'tr-TR': tr,
  'vi-VN': vi,
  'zh-CN': zh,
}

async function dynamicActivate(locale: SupportedLocale) {
  const { messages } = await import(`@lingui/loader!./locales/${locale}.po`)
  i18n.loadLocaleData(locale, { plurals: () => plurals[locale] })
  i18n.load(locale, messages)
  i18n.activate(locale)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  useSetLocaleFromUrl()
  const locale = useActiveLocale()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    dynamicActivate(locale)
      .then(() => {
        setLoaded(true)
      })
      .catch(error => {
        console.error('Failed to activate locale', locale, error)
      })
  }, [locale])

  // prevent the app from rendering with placeholder text before the locale is loaded
  if (!loaded) return null

  return (
    <I18nProvider forceRenderOnLocaleChange={false} i18n={i18n}>
      {children}
    </I18nProvider>
  )
}
