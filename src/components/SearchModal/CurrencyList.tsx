import { Currency, CurrencyAmount, Token } from '@kyberswap/ks-sdk-core'
import { rgba } from 'polished'
import React, { CSSProperties, memo, useCallback } from 'react'
import { Star, Trash } from 'react-feather'
import InfiniteScroll from 'react-infinite-scroll-component'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { useActiveWeb3React } from 'hooks'
import { useBridgeState } from 'state/bridge/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
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
    symbol: currency.isNative ? currency.symbol : currency?.wrapped?.symbol || currency.symbol,
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
  showFavoriteIcon = true,
  showBalance = true,
  customName,
}: {
  isImportedTab?: boolean
  showBalance?: boolean
  showFavoriteIcon?: boolean
  currency: Currency
  currencyBalance: CurrencyAmount<Currency>
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
  handleClickFavorite?: (e: React.MouseEvent, currency: Currency) => void
  removeImportedToken?: (token: Token) => void
  customName?: string
}) {
  const { chainId, account } = useActiveWeb3React()

  const nativeCurrency = useCurrencyConvertedToNative(currency || undefined)
  // only show add or remove buttons if not on selected list

  const { favoriteTokens } = useUserFavoriteTokens(chainId)
  const onClickRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeImportedToken?.(currency as Token)
  }

  const isFavorite = (() => {
    if (!chainId || !favoriteTokens) {
      return false
    }

    if (currency.isNative) {
      return !!favoriteTokens.includeNativeToken
    }

    if (currency.isToken) {
      const addr = (currency as Token).address ?? ''
      const addresses = favoriteTokens?.addresses ?? []
      return !!addresses?.includes(addr) || !!addresses?.includes(addr.toLowerCase())
    }

    return false
  })()
  const balanceComponent = currencyBalance ? <Balance balance={currencyBalance} /> : account ? <Loader /> : null
  const { symbol } = getDisplayTokenInfo(currency)
  return (
    <CurrencyRowWrapper style={style} onClick={() => onSelect()} data-selected={isSelected || otherSelected}>
      <Flex alignItems="center" style={{ gap: 8 }}>
        <CurrencyLogo currency={currency} size={'24px'} />
        <Column>
          <Text title={currency.name} fontWeight={500}>
            {customName || symbol}
          </Text>
          <DescText>{isImportedTab ? balanceComponent : nativeCurrency?.name}</DescText>
        </Column>
      </Flex>

      <RowFixed style={{ justifySelf: 'flex-end', gap: 15 }}>
        {isImportedTab ? <DeleteButton onClick={onClickRemove} /> : showBalance && balanceComponent}
        {showFavoriteIcon && (
          <FavoriteButton onClick={e => handleClickFavorite?.(e, currency)} data-active={isFavorite} />
        )}
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

function CurrencyList({
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
  hasMore,
}: {
  isImportedTab: boolean
  hasMore: boolean
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  showImportView: () => void
  setImportToken: (token: Token) => void
  handleClickFavorite: (e: React.MouseEvent, currency: Currency) => void
  removeImportedToken: (token: Token) => void
  loadMoreRows: () => Promise<void>
}) {
  const { account } = useActiveWeb3React()
  const currencyBalances = useCurrencyBalances(account || undefined, currencies)

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
      hasMore={hasMore}
      loader={
        <Flex justifyContent={'center'} fontSize={13} marginBottom={10}>
          <Text>loading...</Text>
        </Flex>
      }
      endMessage={null}
      scrollableTarget="currency-list-wrapper"
    >
      {currencies.map((item, index) => (
        <Row
          key={index}
          index={index}
          currency={item}
          currencyBalance={currencyBalances[index]}
          style={{ height: 56 }}
        />
      ))}
    </InfiniteScroll>
  )
}
export default memo(CurrencyList)
interface TokenRowPropsBridge {
  currency: WrappedTokenInfo | undefined
  currencyBalance: CurrencyAmount<Currency>
  index: number
  style: CSSProperties
}
function CurrencyListV2({
  currencies,
  onCurrencySelect,
  showBalance,
}: {
  currencies: WrappedTokenInfo[]
  onCurrencySelect: (currency: WrappedTokenInfo) => void
  showBalance: boolean
}) {
  const { account } = useActiveWeb3React()
  const [{ tokenIn, tokenOut }] = useBridgeState()
  const currencyBalances = useCurrencyBalances(account || undefined, showBalance ? currencies : [])

  const Row: any = useCallback(
    function TokenRow({ style, currency, currencyBalance }: TokenRowPropsBridge) {
      if (!currency) return
      const isSelected =
        tokenIn?.address?.toLowerCase() === currency?.address?.toLowerCase() ||
        tokenOut?.sortId === currency?.multichainInfo?.sortId
      const handleSelect = () => currency && onCurrencySelect(currency)
      const { symbol } = getDisplayTokenInfo(currency)
      const { sortId, type } = currency?.multichainInfo || { sortId: undefined, type: '' }
      return (
        <CurrencyRow
          showBalance={showBalance}
          showFavoriteIcon={false}
          style={style}
          currency={currency}
          currencyBalance={currencyBalance}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={false}
          customName={
            sortId !== undefined
              ? `${symbol} ${['swapin', 'swapout'].includes(type ?? '') ? ' (Bridge)' : ` (Router ${sortId})`}`
              : ''
          }
        />
      )
    },
    [onCurrencySelect, tokenIn, showBalance, tokenOut?.sortId],
  )

  return (
    <div style={{ height: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height + 100}
            width={width}
            itemSize={56}
            itemCount={currencies.length}
            itemData={currencies}
          >
            {({ data, index, style }) => (
              <Row
                index={index}
                currency={data[index]}
                key={data[index]?.address || index}
                currencyBalance={currencyBalances[index]}
                style={style}
              />
            )}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  )
}
export const CurrencyListBridge = memo(CurrencyListV2)
