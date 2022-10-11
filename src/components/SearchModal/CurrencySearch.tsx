import { ChainId, Currency, Token } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import { TokenInfo } from '@uniswap/token-lists'
import axios from 'axios'
import { rgba } from 'polished'
import { stringify } from 'querystring'
import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Trash } from 'react-feather'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import InfoHelper from 'components/InfoHelper'
import { KS_SETTING_API } from 'constants/env'
import { nativeOnChain } from 'constants/tokens'
import { AllTokenType, useAllTokens, useToken } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import usePrevious from 'hooks/usePrevious'
import useTheme from 'hooks/useTheme'
import useToggle from 'hooks/useToggle'
import { useBridgeState } from 'state/bridge/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { useRemoveUserAddedToken, useUserAddedTokens, useUserFavoriteTokens } from 'state/user/hooks'
import { filterTokens } from 'utils/filtering'

import { useActiveWeb3React } from '../../hooks'
import { ButtonText, CloseIcon, TYPE } from '../../theme'
import { filterTruthy, isAddress } from '../../utils'
import Column from '../Column'
import { RowBetween } from '../Row'
import CommonBases from './CommonBases'
import CurrencyList, { CurrencyListBridge } from './CurrencyList'
import { useTokenComparator } from './sorting'
import { PaddedColumn, SearchIcon, SearchInput, SearchWrapper, Separator } from './styleds'

enum Tab {
  All,
  Imported,
}

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
  padding-bottom: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom: 0px;
  `};
`

const TabButton = styled(ButtonText)`
  height: 32px;
  color: ${({ theme }) => theme.text};
  &[data-active='true'] {
    color: ${({ theme }) => theme.primary};
  }

  :focus {
    text-decoration: none;
  }
`

const ButtonClear = styled.div`
  border-radius: 24px;
  background-color: ${({ theme }) => rgba(theme.subText, 0.2)};
  display: flex;
  align-items: center;
  padding: 5px 10px;
  gap: 5px;
  cursor: pointer;
`
const MAX_FAVORITE_PAIR = 12

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showManageView: () => void
  showImportView: () => void
  setImportToken: (token: Token) => void
  customChainId?: ChainId
}

export type TokenResponse = Token & { isWhitelisted: boolean }

const cacheTokens: AllTokenType = {}

const fetchTokenByAddress = async (address: string, chainId: ChainId) => {
  const findToken = cacheTokens[address] || cacheTokens[address.toLowerCase()]
  if (findToken) return findToken
  const url = `${KS_SETTING_API}/v1/tokens?query=${address}&chainIds=${chainId}`
  const response = await axios.get(url)
  const token = response.data.data.tokens[0]
  if (token) cacheTokens[address] = token
  return token
}

const formatAndCacheToken = (tokenResponse: TokenResponse) => {
  try {
    const tokenInfo = new WrappedTokenInfo(tokenResponse as TokenInfo)
    cacheTokens[tokenResponse.address] = tokenInfo
    return tokenInfo
  } catch (e) {
    return null
  }
}

const PAGE_SIZE = 20

const fetchTokens = async (
  search: string | undefined,
  page: number,
  chainId: ChainId | undefined,
): Promise<{ tokens: TokenResponse[] }> => {
  try {
    const params: { query: string; isWhitelisted?: boolean; pageSize: number; page: number; chainIds: string } = {
      query: search ?? '',
      chainIds: chainId?.toString() ?? '',
      page,
      pageSize: PAGE_SIZE,
    }
    if (!search) {
      params.isWhitelisted = true
    }
    const url = `${KS_SETTING_API}/v1/tokens?${stringify(params)}`

    const response = await axios.get(url)
    const { tokens } = response.data.data
    return { tokens }
  } catch (error) {
    return { tokens: [] }
  }
}

const NoResult = () => {
  const theme = useTheme()
  return (
    <Column style={{ padding: '20px', height: '100%' }}>
      <TYPE.main color={theme.text3} textAlign="center" mb="20px">
        <Trans>No results found.</Trans>
      </TYPE.main>
    </Column>
  )
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  showImportView,
  setImportToken,
  customChainId,
}: CurrencySearchProps) {
  const { chainId: web3ChainId } = useActiveWeb3React()
  const chainId = customChainId || web3ChainId
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>(Tab.All)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const { favoriteTokens, toggleFavoriteToken } = useUserFavoriteTokens(chainId)

  const defaultTokens = useAllTokens()

  const tokenImports = useUserAddedTokens()
  const [pageCount, setPageCount] = useState(0)
  const [fetchedTokens, setFetchedTokens] = useState<Token[]>(Object.values(defaultTokens))

  const tokenComparator = useTokenComparator(false)

  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery)
  const searchToken = useToken(debouncedQuery)

  const [commonTokens, setCommonTokens] = useState<(Token | Currency)[]>([])
  const [loadingCommon, setLoadingCommon] = useState(true)

  const showETH: boolean = useMemo(() => {
    const nativeToken = chainId && nativeOnChain(chainId)
    const s = debouncedQuery.toLowerCase().trim()
    return !!nativeToken?.symbol?.toLowerCase().startsWith(s)
  }, [debouncedQuery, chainId])

  const tokenImportsFiltered = useMemo(() => {
    return (debouncedQuery ? filterTokens(tokenImports, debouncedQuery) : tokenImports).sort(tokenComparator)
  }, [debouncedQuery, tokenImports, tokenComparator])

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken.wrapped] : []
    return fetchedTokens
  }, [isAddressSearch, searchToken, fetchedTokens])

  const filteredCommonTokens: Token[] = useMemo(() => {
    return filterTokens(commonTokens as Token[], debouncedQuery)
  }, [commonTokens, debouncedQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (!debouncedQuery) {
      // only sort whitelist token,  token search we don't sort
      const sorted = filteredTokens.sort(tokenComparator)
      const symbolMatch = debouncedQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(s => s.length > 0)
      if (symbolMatch.length > 1) return sorted
      return [
        // sort any exact symbol matches first
        ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
        ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0]),
      ]
    }
    return filteredTokens
  }, [filteredTokens, debouncedQuery, tokenComparator])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect],
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>(null)

  // clear the input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      inputRef.current?.focus()
    }
  }, [isOpen])

  const listTokenRef = useRef<HTMLInputElement>(null)

  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const checksumInput = isAddress(input)
    setSearchQuery(checksumInput || input)
    if (listTokenRef?.current) listTokenRef.current.scrollTop = 0
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim()
        if (s === 'eth') {
          handleCurrencySelect(nativeOnChain(chainId as ChainId))
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery, chainId],
  )

  const handleClickFavorite = useCallback(
    (e: React.MouseEvent, currency: any) => {
      e.stopPropagation()

      const address = currency?.wrapped?.address || currency.address
      if (!address) return

      const currentList = favoriteTokens?.addresses || []
      const isAddFavorite = currency.isNative
        ? !favoriteTokens?.includeNativeToken
        : !currentList.find(el => el === address) // else remove favorite
      const curTotal =
        currentList.filter(address => !!cacheTokens[address] || !!defaultTokens[address]).length +
        (favoriteTokens?.includeNativeToken ? 1 : 0)
      if (!chainId || (isAddFavorite && curTotal === MAX_FAVORITE_PAIR)) return

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
          address,
        })
      }
    },
    [chainId, favoriteTokens, toggleFavoriteToken, defaultTokens],
  )

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  const fetchFavoriteTokenFromAddress = useCallback(async () => {
    try {
      if (!Object.keys(cacheTokens).length && !Object.keys(defaultTokens).length) return
      setLoadingCommon(true)
      const promises: Promise<any>[] = []
      const result: (Token | Currency)[] = []
      if (favoriteTokens?.includeNativeToken && chainId) {
        result.push(nativeOnChain(chainId))
      }
      favoriteTokens?.addresses.forEach(address => {
        if (defaultTokens[address]) {
          result.push(defaultTokens[address])
          return
        }
        if (cacheTokens[address]) {
          result.push(cacheTokens[address])
          return
        }
        if (chainId) {
          promises.push(fetchTokenByAddress(address, chainId))
        }
      })
      if (promises.length) {
        const data = await Promise.allSettled(promises)
        data.forEach(el => {
          if (el.status !== 'fulfilled') return
          const tokenResponse = el.value
          if (!tokenResponse) return
          const formattedToken = formatAndCacheToken(tokenResponse)
          if (formattedToken) result.push(formattedToken)
        })
      }
      setCommonTokens(result)
    } catch (error) {
      console.log('err', error)
    }
    setLoadingCommon(false)
  }, [chainId, favoriteTokens, defaultTokens])

  useEffect(() => {
    fetchFavoriteTokenFromAddress()
  }, [fetchFavoriteTokenFromAddress])

  const fetchListTokens = useCallback(
    async (page?: number) => {
      const nextPage = (page ?? pageCount) + 1
      let tokens = []
      if (debouncedQuery) {
        const data = await fetchTokens(debouncedQuery, nextPage, chainId)
        tokens = data.tokens
      } else {
        tokens = Object.values(defaultTokens) as WrappedTokenInfo[]
      }
      const parsedTokenList = filterTruthy(tokens.map(formatAndCacheToken))
      setPageCount(nextPage)
      setFetchedTokens(current => (nextPage === 1 ? [] : current).concat(parsedTokenList))
      setHasMoreToken(parsedTokenList.length === PAGE_SIZE && !!debouncedQuery)
    },
    [chainId, debouncedQuery, defaultTokens, pageCount],
  )

  const [hasMoreToken, setHasMoreToken] = useState(false)
  const prevQuery = usePrevious(debouncedQuery)
  useEffect(() => {
    if (!isAddressSearch && prevQuery !== debouncedQuery) {
      fetchListTokens(0)
    }
    // need call api when only debouncedQuery change
  }, [debouncedQuery, prevQuery, fetchListTokens, isAddressSearch])

  useEffect(() => {
    if (Object.keys(defaultTokens).length) fetchFavoriteTokenFromAddress()
    // call once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const combinedTokens = useMemo(() => {
    const currencies: Currency[] = filteredSortedTokens
    if (showETH && chainId && !currencies.find(e => e.isNative)) currencies.unshift(nativeOnChain(chainId))
    return currencies
  }, [showETH, chainId, filteredSortedTokens])

  const visibleCurrencies: Currency[] = useMemo(() => {
    return activeTab === Tab.Imported ? tokenImportsFiltered : combinedTokens
  }, [activeTab, combinedTokens, tokenImportsFiltered])

  const removeToken = useRemoveUserAddedToken()

  const removeImportedToken = useCallback(
    (token: Token) => {
      if (!chainId) return
      removeToken(chainId, token.address)
      if (favoriteTokens?.addresses.includes(token.address))
        // remove in favorite too
        toggleFavoriteToken({
          chainId,
          address: token.address,
        })
    },
    [chainId, toggleFavoriteToken, removeToken, favoriteTokens?.addresses],
  )

  const removeAllImportToken = () => {
    if (tokenImports) {
      tokenImports.forEach(removeImportedToken)
    }
  }
  const isImportedTab = activeTab === Tab.Imported

  return (
    <ContentWrapper>
      <PaddedColumn gap="14px">
        <RowBetween>
          <Text fontWeight={500} fontSize={20} display="flex">
            <Trans>Select a token</Trans>
            <InfoHelper
              size={16}
              text={
                <Trans>
                  Find a token by searching for its name or symbol or by pasting its address below
                  <br />
                  <br />
                  You can select and trade any token on KyberSwap.
                </Trans>
              }
            />
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <Text style={{ color: theme.subText, fontSize: 12 }}>
          <Trans>
            You can search and select <span style={{ color: theme.text }}>any token</span> on KyberSwap
          </Trans>
        </Text>

        <SearchWrapper>
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={t`Search by token name, token symbol or address`}
            value={searchQuery}
            ref={inputRef}
            onChange={handleInput}
            onKeyDown={handleEnter}
            autoComplete="off"
          />
          <SearchIcon size={18} color={theme.border} />
        </SearchWrapper>

        {showCommonBases && (
          <CommonBases
            chainId={chainId}
            tokens={filteredCommonTokens}
            handleToggleFavorite={handleClickFavorite}
            onSelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
          />
        )}
        {loadingCommon && (
          <Flex justifyContent={'center'}>
            <Text fontSize={12} color={theme.subText}>
              Loading ...
            </Text>
          </Flex>
        )}
        <RowBetween>
          <Flex
            sx={{
              columnGap: '24px',
            }}
          >
            <TabButton data-active={activeTab === Tab.All} onClick={() => setActiveTab(Tab.All)}>
              <Text as="span" fontSize={14} fontWeight={500}>
                <Trans>All</Trans>
              </Text>
            </TabButton>

            <TabButton data-active={isImportedTab} onClick={() => setActiveTab(Tab.Imported)}>
              <Text as="span" fontSize={14} fontWeight={500}>
                <Trans>Imported</Trans>
              </Text>
            </TabButton>
          </Flex>
        </RowBetween>
      </PaddedColumn>

      <Separator />

      {isImportedTab && visibleCurrencies.length > 0 && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          style={{ color: theme.subText, fontSize: 12, padding: '15px 20px 10px 20px' }}
        >
          <div>
            <Trans>{visibleCurrencies.length} Custom Tokens</Trans>
          </div>
          <ButtonClear onClick={removeAllImportToken}>
            <Trash size={13} />
            <Trans>Clear All</Trans>
          </ButtonClear>
        </Flex>
      )}

      {visibleCurrencies?.length > 0 ? (
        <div ref={listTokenRef} id="currency-list-wrapper" style={{ height: '100%', overflowY: 'scroll' }}>
          <CurrencyList
            removeImportedToken={removeImportedToken}
            currencies={visibleCurrencies}
            isImportedTab={isImportedTab}
            handleClickFavorite={handleClickFavorite}
            onCurrencySelect={handleCurrencySelect}
            otherCurrency={otherSelectedCurrency}
            selectedCurrency={selectedCurrency}
            showImportView={showImportView}
            setImportToken={setImportToken}
            loadMoreRows={fetchListTokens}
            hasMore={hasMoreToken}
          />
        </div>
      ) : (
        <NoResult />
      )}
    </ContentWrapper>
  )
}

interface CurrencySearchBridgeProps {
  isOpen: boolean
  onDismiss: () => void
  isOutput?: boolean
  onCurrencySelect: (currency: WrappedTokenInfo) => void
}

export function CurrencySearchBridge({ isOutput, onCurrencySelect, onDismiss, isOpen }: CurrencySearchBridgeProps) {
  const theme = useTheme()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const [{ listTokenIn, listTokenOut }] = useBridgeState()

  const fetchedTokens = isOutput ? listTokenOut : listTokenIn
  const tokenComparator = useTokenComparator(false, true)

  const isAddressSearch = isAddress(debouncedQuery)

  const filteredTokens: WrappedTokenInfo[] = useMemo(() => {
    if (isAddressSearch) {
      const find = fetchedTokens.find(e => e?.address?.toLowerCase() === debouncedQuery.toLowerCase())
      return find ? [find] : []
    }
    return filterTokens(fetchedTokens, debouncedQuery)
  }, [isAddressSearch, fetchedTokens, debouncedQuery])

  const visibleCurrencies: WrappedTokenInfo[] = useMemo(() => {
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = debouncedQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0]),
    ]
  }, [filteredTokens, debouncedQuery, tokenComparator])

  const handleCurrencySelect = useCallback(
    (currency: WrappedTokenInfo) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect],
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>(null)

  // clear the input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const checksumInput = isAddress(input)
    setSearchQuery(checksumInput || input)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === 'Enter' &&
        visibleCurrencies.length > 0 &&
        (visibleCurrencies[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
          visibleCurrencies.length === 1)
      ) {
        handleCurrencySelect(visibleCurrencies[0])
      }
    },
    [visibleCurrencies, handleCurrencySelect, searchQuery],
  )

  // menu ui
  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    <ContentWrapper>
      <PaddedColumn gap="14px">
        <RowBetween>
          <Text fontWeight={500} fontSize={20} display="flex">
            <Trans>Select a token</Trans>
            <InfoHelper
              size={16}
              text={<Trans>Find a token by searching for its name or symbol or by pasting its address below</Trans>}
            />
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>

        <SearchWrapper>
          <SearchInput
            type="text"
            id="token-search-input"
            placeholder={t`Search by token name, token symbol or address`}
            value={searchQuery}
            ref={inputRef}
            onChange={handleInput}
            onKeyDown={handleEnter}
            autoComplete="off"
          />
          <SearchIcon size={18} color={theme.border} />
        </SearchWrapper>
      </PaddedColumn>

      <Separator />

      {visibleCurrencies?.length ? (
        <div id="scrollableDiv" style={{ flex: '1', overflow: 'auto' }}>
          <CurrencyListBridge
            showBalance={!isOutput}
            currencies={visibleCurrencies}
            onCurrencySelect={handleCurrencySelect}
          />
        </div>
      ) : (
        <NoResult />
      )}
    </ContentWrapper>
  )
}
