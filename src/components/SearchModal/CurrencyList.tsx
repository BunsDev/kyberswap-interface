import { Currency, CurrencyAmount, Token } from '@kyberswap/ks-sdk-core'
import { rgba } from 'polished'
import React, { CSSProperties, useCallback, useMemo } from 'react'
import { Star, Trash } from 'react-feather'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { useActiveWeb3React } from 'hooks'
import { useUserAddedTokens, useUserFavoriteTokens } from 'state/user/hooks'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { useCurrencyConvertedToNative } from 'utils/dmm'

import Column from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import Loader from '../Loader'
import { RowBetween, RowFixed } from '../Row'
import { TokenResponse } from './CurrencySearch'
import ImportRow from './ImportRow'

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const FavoriteButton = styled(Star)`
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.subText};

  :hover {
    color: ${({ theme }) => theme.primary};
  }

  &[data-active='true'] {
    color: ${({ theme }) => theme.primary};
    fill: currentColor;
  }
`
const DeleteButton = styled(Trash)`
  width: 16px;
  height: 20px;
  fill: currentColor;
  color: ${({ theme }) => theme.subText};
  :hover {
    color: ${({ theme }) => theme.text};
  }
`

const CurrencyRowWrapper = styled(RowBetween)`
  padding: 4px 20px;
  height: 56px;
  display: flex;
  gap: 16px;
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

function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(10)}</StyledBalanceText>
}

const DescText = styled.div`
  margin-left: 0;
  font-size: 12px;
  font-weight: 300;
  color: ${({ theme }) => theme.subText};
`
export const getDisplayTokenInfo = (currency: any) => {
  return {
    symbol: currency.isNative ? currency.symbol : currency.wrapped.symbol,
  }
}
function CurrencyRow({
  currency,
  isImportedTab,
  currencyBalance,
  onSelect,
  isSelected,
  otherSelected,
  style,
  handleClickFavorite,
  removeImportedToken,
}: {
  isImportedTab: boolean
  currency: Currency
  currencyBalance: CurrencyAmount<Currency>
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
  handleClickFavorite: (e: React.MouseEvent, currency: Currency) => void
  removeImportedToken: (token: Token) => void
}) {
  const { chainId, account } = useActiveWeb3React()
  const balance = currencyBalance

  const nativeCurrency = useCurrencyConvertedToNative(currency || undefined)
  // only show add or remove buttons if not on selected list

  const { favoriteTokens } = useUserFavoriteTokens(chainId)
  const onClickRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeImportedToken(currency as Token)
  }

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
  const balanceComponent = balance ? <Balance balance={balance} /> : account ? <Loader /> : null
  const { symbol } = getDisplayTokenInfo(currency)
  return (
    <CurrencyRowWrapper style={style} onClick={() => onSelect()} data-selected={isSelected || otherSelected}>
      <Flex alignItems="center" style={{ gap: 8 }}>
        <CurrencyLogo currency={currency} size={'24px'} />
        <Column>
          <Text title={currency.name} fontWeight={500}>
            {symbol}
          </Text>
          <DescText>{isImportedTab ? balanceComponent : nativeCurrency?.name}</DescText>
        </Column>
      </Flex>
      <RowFixed style={{ justifySelf: 'flex-end', gap: 15 }}>
        {isImportedTab ? <DeleteButton onClick={onClickRemove} /> : balanceComponent}
        <FavoriteButton onClick={e => handleClickFavorite(e, currency)} data-active={isFavorite} />
      </RowFixed>
    </CurrencyRowWrapper>
  )
}

interface TokenRowProps {
  currency: Currency | undefined
  currencyBalance: CurrencyAmount<Currency>
  index: number
  style: CSSProperties
}

export default function CurrencyList({
  currencies,
  selectedCurrency,
  isImportedTab,
  onCurrencySelect,
  otherCurrency,
  showImportView,
  setImportToken,
  handleClickFavorite,
  removeImportedToken,
  loadMoreRows,
  totalItems,
}: {
  isImportedTab: boolean
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  showImportView: () => void
  setImportToken: (token: Token) => void
  handleClickFavorite: (e: React.MouseEvent, currency: Currency) => void
  removeImportedToken: (token: Token) => void
  loadMoreRows: () => Promise<void>
  totalItems: number
}) {
  const { account } = useActiveWeb3React()
  const itemCurrencies: (Currency | undefined)[] = currencies
  const itemCurrencyBalances = useCurrencyBalances(account || undefined, itemCurrencies)
  const itemData = useMemo(
    () => ({ currencies: itemCurrencies, currencyBalances: itemCurrencyBalances }),
    [itemCurrencies, itemCurrencyBalances],
  )
  const Row: any = useCallback(
    function TokenRow({ style, currency, currencyBalance }: TokenRowProps) {
      const isSelected = Boolean(selectedCurrency && currency && selectedCurrency.equals(currency))
      const otherSelected = Boolean(otherCurrency && currency && otherCurrency.equals(currency))
      const handleSelect = () => currency && onCurrencySelect(currency)

      const token = currency?.wrapped
      const extendCurrency = currency as TokenResponse
      const tokenImports = useUserAddedTokens()
      const showImport =
        token &&
        !extendCurrency?.isWhitelisted &&
        !tokenImports.find(importedToken => importedToken.address === token.address) &&
        !currency.isNative

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
        // whitelist
        return (
          <CurrencyRow
            isImportedTab={isImportedTab}
            handleClickFavorite={handleClickFavorite}
            removeImportedToken={removeImportedToken}
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
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      setImportToken,
      showImportView,
      handleClickFavorite,
      isImportedTab,
      removeImportedToken,
    ],
  )
  if (currencies.length === 1 && currencies[0].isNative) return null
  return (
    <InfiniteScroll
      dataLength={currencies.length}
      next={loadMoreRows}
      hasMore={currencies.length < totalItems}
      height={'auto'}
      loader={<h4>Loading...</h4>}
      scrollableTarget="scrollableDiv"
    >
      {itemData.currencies.map((item, index) => (
        <Row
          key={index}
          index={index}
          currency={item}
          currencyBalance={itemData.currencyBalances[index]}
          style={{ height: 56 }}
        />
      ))}
    </InfiniteScroll>
  )
}
