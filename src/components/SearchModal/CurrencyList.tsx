import { Currency, CurrencyAmount, Token } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import { rgba } from 'polished'
import React, { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { Star } from 'react-feather'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'

import TokenListLogo from 'assets/svg/tokenlist.svg'
import { ButtonEmpty } from 'components/Button'
import { LightGreyCard } from 'components/Card'
import QuestionHelper from 'components/QuestionHelper'
import { useActiveWeb3React } from 'hooks'
import { useIsUserAddedToken } from 'hooks/Tokens'
import useTheme from 'hooks/useTheme'
import { useCombinedActiveList } from 'state/lists/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { useUserFavoriteTokens } from 'state/user/hooks'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { TYPE } from 'theme'
import { isAddress, isTokenOnList } from 'utils'
import { useCurrencyConvertedToNative } from 'utils/dmm'

import Column from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import Loader from '../Loader'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip } from '../Tooltip'
import ImportRow from './ImportRow'

function currencyKey(currency: Currency): string {
  return currency?.isNative ? 'ETHER' : currency?.address || ''
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const FavoriteButton = styled(ButtonEmpty)`
  width: 32px;
  height: 100%;

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;

  padding: 0px;

  background: transparent;
  border-radius: 8px;

  white-space: nowrap;
  vertical-align: middle;
  outline: none;

  appearance: none;
  user-select: none;

  color: ${({ theme }) => theme.text};

  :hover {
    color: ${({ theme }) => theme.primary};
  }

  &[data-active='true'] {
    color: ${({ theme }) => theme.primary};
    svg {
      fill: currentColor;
    }
  }
`

const CurrencyRowWrapper = styled(RowBetween)`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: 24px auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
  cursor: pointer;

  &[data-selected='true'] {
    background: ${({ theme }) => rgba(theme.bg8, 0.15)};
  }

  @media (hover: hover) {
    :hover {
      background: ${({ theme }) => theme.buttonBlack};
    }
  }
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(10)}</StyledBalanceText>
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const TokenListLogoWrapper = styled.img`
  height: 20px;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  currencyBalance,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Currency
  currencyBalance: CurrencyAmount<Currency>
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const { chainId, account } = useActiveWeb3React()
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  // const balance = useCurrencyBalance(account ?? undefined, currency)
  const balance = currencyBalance

  // const showCurrency = currency === ETHER && !!chainId && [137, 800001].includes(chainId) ? WETH[chainId] : currency
  const nativeCurrency = useCurrencyConvertedToNative(currency || undefined)
  // only show add or remove buttons if not on selected list

  const { favoriteTokens, toggleFavoriteToken } = useUserFavoriteTokens(chainId)

  const isFavorite = (() => {
    if (!chainId || !favoriteTokens) {
      return false
    }

    if (currency.isNative) {
      return !!favoriteTokens.includeNativeToken
    }

    if (currency.isToken) {
      const addr = (currency as Token).address
      return !!favoriteTokens.addresses?.includes(addr)
    }

    return false
  })()

  const handleClickFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    if (!chainId) {
      return
    }

    if (currency.isNative) {
      toggleFavoriteToken({
        chainId,
        isNative: true,
      })
      return
    }

    if (currency.isToken) {
      toggleFavoriteToken({
        chainId,
        address: (currency as Token).address,
      })
    }
  }

  return (
    <CurrencyRowWrapper style={style} onClick={() => onSelect()} data-selected={isSelected || otherSelected}>
      <FavoriteButton onClick={handleClickFavorite} data-active={isFavorite}>
        <Star width={'18px'} height="18px" />
      </FavoriteButton>
      <CurrencyLogo currency={currency} size={'24px'} />
      <Column>
        <Text title={currency.name} fontWeight={500}>
          {nativeCurrency?.symbol}
        </Text>
        <TYPE.darkGray ml="0px" fontSize={'12px'} fontWeight={300}>
          {nativeCurrency?.name} {!isOnSelectedList && customAdded && t`• Added by user`}
        </TYPE.darkGray>
      </Column>
      <TokenTags currency={currency} />
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
      </RowFixed>
    </CurrencyRowWrapper>
  )
}

interface TokenRowProps {
  data: {
    currencies: Array<Currency | Token | undefined>
    currencyBalances: Array<CurrencyAmount<Currency>>
  }
  index: number
  style: CSSProperties
}

export default function CurrencyList({
  height,
  currencies,
  inactiveTokens,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showImportView,
  setImportToken,
  breakIndex,
}: {
  height: number
  currencies: Currency[]
  inactiveTokens: Token[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showImportView: () => void
  setImportToken: (token: Token) => void
  breakIndex: number | undefined
}) {
  const { account } = useActiveWeb3React()
  const itemCurrencies: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = currencies
    if (breakIndex !== undefined) {
      formatted = [...formatted.slice(0, breakIndex), undefined, ...formatted.slice(breakIndex, formatted.length)]
    }
    return formatted
  }, [breakIndex, currencies])
  const itemCurrencyBalances = useCurrencyBalances(account || undefined, itemCurrencies)
  const itemData = useMemo(
    () => ({ currencies: itemCurrencies, currencyBalances: itemCurrencyBalances }),
    [itemCurrencies, itemCurrencyBalances],
  )

  const theme = useTheme()

  // TODO(viet-nv): check typescript for this
  const Row: any = useCallback(
    function TokenRow({ data, index, style }: TokenRowProps) {
      const currency: Currency | undefined = data.currencies[index]
      const currencyBalance: CurrencyAmount<Currency> = data.currencyBalances[index]
      const isSelected = Boolean(selectedCurrency && currency && selectedCurrency.equals(currency))
      const otherSelected = Boolean(otherCurrency && currency && otherCurrency.equals(currency))
      const handleSelect = () => currency && onCurrencySelect(currency)

      const token = currency?.wrapped

      const showImport =
        inactiveTokens.length &&
        token &&
        inactiveTokens.map(inactiveToken => inactiveToken.address).includes(isAddress(token.address) || token.address)

      if (index === breakIndex || !data) {
        return (
          <FixedContentRow style={style}>
            <LightGreyCard padding="8px 12px" borderRadius="8px">
              <RowBetween>
                <RowFixed>
                  <TokenListLogoWrapper src={TokenListLogo} />
                  <TYPE.main ml="6px" fontSize="12px" color={theme.text}>
                    <Trans>Expanded results from inactive Token Lists</Trans>
                  </TYPE.main>
                </RowFixed>
                <QuestionHelper
                  text={t`Tokens from inactive lists. Import specific tokens below or click 'Manage' to activate more lists`}
                />
              </RowBetween>
            </LightGreyCard>
          </FixedContentRow>
        )
      }

      if (showImport && token) {
        return (
          <ImportRow
            style={style}
            token={token}
            showImportView={showImportView}
            setImportToken={setImportToken}
            dim={true}
          />
        )
      }

      if (currency) {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            currencyBalance={currencyBalance}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
          />
        )
      }

      return null
    },
    [
      inactiveTokens,
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
      breakIndex,
      theme.text,
    ],
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data.currencies[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.currencies.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
