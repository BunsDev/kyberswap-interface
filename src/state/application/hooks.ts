import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ChainId, NativeCurrency, Token } from '@kyberswap/ks-sdk-core'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDeepCompareEffect } from 'react-use'

import { ETH_PRICE, PROMM_ETH_PRICE, TOKEN_DERIVED_ETH } from 'apollo/queries'
import { NETWORKS_INFO } from 'constants/networks'
import { VERSION } from 'constants/v2'
import { getBlockFromTimestamp, getPercentChange } from 'utils'

import { KNC, OUTSITE_FARM_REWARDS_QUERY, ZERO_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import {
  ApplicationModal,
  PopupContent,
  PopupContentSimple,
  PopupContentTxn,
  PopupType,
  addPopup,
  removePopup,
  setOpenModal,
  updateETHPrice,
  updateKNCPrice,
  updatePrommETHPrice,
} from './actions'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NETWORK)
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useToggleTransactionSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.TRANSACTION_SETTINGS)
}

export function useShowClaimPopup(): boolean {
  return useModalOpen(ApplicationModal.CLAIM_POPUP)
}

export function useToggleShowClaimPopup(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_POPUP)
}

export function useToggleSelfClaimModal(): () => void {
  return useToggleModal(ApplicationModal.SELF_CLAIM)
}

export function useToggleDelegateModal(): () => void {
  return useToggleModal(ApplicationModal.DELEGATE)
}

export function useToggleYourCampaignTransactionsModal(): () => void {
  return useToggleModal(ApplicationModal.YOUR_CAMPAIGN_TRANSACTIONS)
}

export function useToggleVoteModal(): () => void {
  return useToggleModal(ApplicationModal.VOTE)
}

export function usePoolDetailModalToggle(): () => void {
  return useToggleModal(ApplicationModal.POOL_DETAIL)
}

export function useTrendingSoonSortingModalToggle(): () => void {
  return useToggleModal(ApplicationModal.TRENDING_SOON_SORTING)
}

export function useSelectCampaignModalToggle(): () => void {
  return useToggleModal(ApplicationModal.SELECT_CAMPAIGN)
}

export function useRegisterCampaignModalToggle(): () => void {
  return useToggleModal(ApplicationModal.REGISTER_CAMPAIGN)
}

export function useTrueSightNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.TRUESIGHT_NETWORK)
}

export function useTrendingSoonTokenDetailModalToggle(): () => void {
  return useToggleModal(ApplicationModal.TRENDING_SOON_TOKEN_DETAIL)
}

export function useTrueSightUnsubscribeModalToggle(): () => void {
  return useToggleModal(ApplicationModal.UNSUBSCRIBE_TRUESIGHT)
}

// returns a function that allows adding a popup
function useAddPopup(): (
  content: PopupContent,
  popupType: PopupType,
  key?: string,
  removeAfterMs?: number | null,
) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, popupType: PopupType, key?: string, removeAfterMs?: number | null) => {
      dispatch(addPopup({ content, key, popupType, removeAfterMs }))
    },
    [dispatch],
  )
}

export enum NotificationType {
  SUCCESS,
  ERROR,
  WARNING,
}
// simple notify with text and description
export const useNotify = () => {
  const addPopup = useAddPopup()
  return useCallback(
    (data: PopupContentSimple, removeAfterMs = 4000) => {
      addPopup(data, PopupType.SIMPLE, data.title, removeAfterMs)
    },
    [addPopup],
  )
}

// popup notify transaction
export const useTransactionNotify = () => {
  const addPopup = useAddPopup()
  return useCallback(
    (data: PopupContentTxn) => {
      addPopup(data, PopupType.TRANSACTION, data.hash)
    },
    [addPopup],
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch],
  )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter(item => item.show), [list])
}

/**
 * Gets the current price  of ETH, 24 hour price, and % change between them
 */
const getEthPrice = async (chainId: ChainId, apolloClient: ApolloClient<NormalizedCacheObject>) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, chainId)
    const result = await apolloClient.query({
      query: ETH_PRICE(),
      fetchPolicy: 'network-only',
    })

    const resultOneDay = await apolloClient.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'network-only',
    })
    const currentPrice = result?.data?.bundles[0]?.ethPrice
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice

    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

const getPrommEthPrice = async (chainId: ChainId, apolloClient: ApolloClient<NormalizedCacheObject>) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, chainId)
    const result = await apolloClient.query({
      query: PROMM_ETH_PRICE(),
      fetchPolicy: 'network-only',
    })

    const resultOneDay = await apolloClient.query({
      query: PROMM_ETH_PRICE(oneDayBlock),
      fetchPolicy: 'network-only',
    })
    const currentPrice = result?.data?.bundles[0]?.ethPriceUSD
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPriceUSD

    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

export function useETHPrice(version: string = VERSION.CLASSIC): AppState['application']['ethPrice'] {
  const dispatch = useDispatch()
  const { chainId } = useActiveWeb3React()
  const apolloClient = NETWORKS_INFO[chainId || ChainId.MAINNET].classicClient

  const ethPrice = useSelector((state: AppState) =>
    version === VERSION.ELASTIC ? state.application.prommEthPrice : state.application.ethPrice,
  )

  useEffect(() => {
    const apolloProMMClient = NETWORKS_INFO[chainId || ChainId.MAINNET].elasticClient

    async function checkForEthPrice() {
      const [newPrice, oneDayBackPrice, pricePercentChange] = await (version === VERSION.ELASTIC && apolloProMMClient
        ? getPrommEthPrice(chainId as ChainId, apolloProMMClient)
        : getEthPrice(chainId as ChainId, apolloClient))

      // if (!newPrice && apolloProMMClient) {
      //   ;[newPrice, oneDayBackPrice, pricePercentChange] = await getPrommEthPrice(chainId as ChainId, apolloProMMClient)
      // }

      dispatch(
        version === VERSION.ELASTIC
          ? updatePrommETHPrice({
              currentPrice: (newPrice ? newPrice : 0).toString(),
              oneDayBackPrice: (oneDayBackPrice ? oneDayBackPrice : 0).toString(),
              pricePercentChange,
            })
          : updateETHPrice({
              currentPrice: (newPrice ? newPrice : 0).toString(),
              oneDayBackPrice: (oneDayBackPrice ? oneDayBackPrice : 0).toString(),
              pricePercentChange,
            }),
      )
    }
    checkForEthPrice()
  }, [dispatch, chainId, apolloClient, version])

  return ethPrice
}

/**
 * Gets the current price of KNC by ETH
 */
const getKNCPriceByETH = async (chainId: ChainId, apolloClient: ApolloClient<NormalizedCacheObject>) => {
  let kncPriceByETH = 0

  try {
    const result = await apolloClient.query({
      query: TOKEN_DERIVED_ETH(KNC[chainId as ChainId].address),
      fetchPolicy: 'no-cache',
    })

    const derivedETH = result?.data?.tokens[0]?.derivedETH

    kncPriceByETH = parseFloat(derivedETH) || 0
  } catch (e) {
    console.log(e)
  }

  return kncPriceByETH
}

export function useKNCPrice(): AppState['application']['kncPrice'] {
  const dispatch = useDispatch()
  const ethPrice = useETHPrice()
  const { chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const apolloClient = NETWORKS_INFO[chainId || ChainId.MAINNET].classicClient

  const kncPrice = useSelector((state: AppState) => state.application.kncPrice)

  useEffect(() => {
    async function checkForKNCPrice() {
      const kncPriceByETH = await getKNCPriceByETH(chainId as ChainId, apolloClient)
      const kncPrice = ethPrice.currentPrice && kncPriceByETH * parseFloat(ethPrice.currentPrice)
      dispatch(updateKNCPrice(kncPrice?.toString()))
    }
    checkForKNCPrice()
  }, [kncPrice, dispatch, ethPrice.currentPrice, chainId, blockNumber, apolloClient])

  return kncPrice
}

/**
 * Gets the current price of KNC by ETH
 */
const getTokenPriceByETH = async (tokenAddress: string, apolloClient: ApolloClient<NormalizedCacheObject>) => {
  let tokenPriceByETH = 0

  try {
    const result = await apolloClient.query({
      query: TOKEN_DERIVED_ETH(tokenAddress),
      fetchPolicy: 'no-cache',
    })

    const derivedETH = result?.data?.tokens[0]?.derivedETH

    tokenPriceByETH = parseFloat(derivedETH)

    const temp = OUTSITE_FARM_REWARDS_QUERY[tokenAddress]
    if (temp) {
      const res = await fetch(temp.subgraphAPI, {
        method: 'POST',
        body: JSON.stringify({
          query: temp.query,
        }),
      }).then(res => res.json())

      const derivedETH = res?.data?.tokens[0]?.derivedBNB

      tokenPriceByETH = parseFloat(derivedETH)
    }
  } catch (e) {
    console.log(e)
  }

  return tokenPriceByETH
}

const cache: { [key: string]: number } = {}

export function useTokensPrice(tokens: (Token | NativeCurrency | null | undefined)[], version?: string): number[] {
  const ethPrice = useETHPrice(version)

  const { chainId } = useActiveWeb3React()
  const [prices, setPrices] = useState<number[]>([])
  const apolloClient = NETWORKS_INFO[chainId || ChainId.MAINNET].classicClient

  const client = version !== VERSION.ELASTIC ? apolloClient : NETWORKS_INFO[chainId || ChainId.MAINNET].elasticClient

  useDeepCompareEffect(() => {
    async function checkForTokenPrice() {
      const tokensPrice = tokens.map(async token => {
        if (!token) {
          return 0
        }

        if (!ethPrice?.currentPrice) {
          return 0
        }

        if (token.isNative || token?.address === ZERO_ADDRESS) {
          return parseFloat(ethPrice.currentPrice)
        }

        const key = `${token.address}_${chainId}_${version}`
        if (cache[key]) return cache[key]

        const tokenPriceByETH = await getTokenPriceByETH(token?.address, client)
        const tokenPrice = tokenPriceByETH * parseFloat(ethPrice.currentPrice)

        if (tokenPrice) cache[key] = tokenPrice

        return tokenPrice || 0
      })

      const result = await Promise.all(tokensPrice)

      setPrices(result)
    }

    checkForTokenPrice()
  }, [ethPrice.currentPrice, chainId, tokens, version])

  return prices
}
