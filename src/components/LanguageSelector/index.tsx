import { stringify } from 'querystring'
import { isMobile } from 'react-device-detect'
import { ArrowLeft, Check } from 'react-feather'
import { useHistory, useLocation } from 'react-router'
import styled from 'styled-components'

import { ButtonEmpty } from 'components/Button'
import { LOCALE_LABEL, SupportedLocale } from 'constants/locales'
import useParsedQueryString from 'hooks/useParsedQueryString'
import useTheme from 'hooks/useTheme'
import { useUserLocale } from 'state/user/hooks'

const StyledLanguageSelector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`

const OptionTitle = styled.div<{ isSelected?: boolean }>`
  color: ${({ theme, isSelected }) => (isSelected ? theme.primary : theme.subText)};
  font-size: 14px;
`

const GridWrapper = styled.div`
  display: grid;
  grid-gap: 1rem 3rem;
  grid-template-columns: 1fr ${isMobile ? '1fr' : ''};
  width: 100%;
`

export default function LanguageSelector({
  setIsSelectingLanguage,
}: {
  setIsSelectingLanguage: (isSelectingLanguage: boolean) => void
}) {
  const theme = useTheme()
  const history = useHistory()
  const location = useLocation()
  const qs = useParsedQueryString()
  const userLocale = useUserLocale()

  const handleSelectLanguage = (locale: SupportedLocale) => {
    const target = {
      ...location,
      search: stringify({ ...qs, lng: locale }),
    }

    history.push(target)
    setIsSelectingLanguage(false)
  }

  return (
    <StyledLanguageSelector>
      <ButtonEmpty
        width="fit-content"
        padding="0"
        onClick={() => setIsSelectingLanguage(false)}
        style={{ textDecoration: 'none', color: theme.text, marginBottom: '24px' }}
      >
        <ArrowLeft />
      </ButtonEmpty>
      <GridWrapper>
        {Object.entries(LOCALE_LABEL).map(([locale, label], index) => {
          const isLastItem = index + 1 === Object.keys(LOCALE_LABEL).length

          return (
            <ButtonEmpty
              key={locale}
              padding="0"
              onClick={() => handleSelectLanguage(locale as SupportedLocale)}
              style={{
                textDecoration: 'none',
                marginBottom: isLastItem ? '0' : '16px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <OptionTitle isSelected={locale === userLocale}>{label}</OptionTitle>

              {locale === userLocale && <Check color={theme.primary}></Check>}
            </ButtonEmpty>
          )
        })}
      </GridWrapper>
    </StyledLanguageSelector>
  )
}
