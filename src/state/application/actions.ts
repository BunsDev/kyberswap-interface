import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { ChainId } from '@dynamic-amm/sdk'

export type PopupContent =
  | {
      txn: {
        hash: string
        success: boolean
        type?: string
        summary?: string
      }
    }
  | {
      listUpdate: {
        listUrl: string
        oldList: TokenList
        newList: TokenList
        auto: boolean
      }
    }

export enum ApplicationModal {
  NETWORK,
  WALLET,
  SETTINGS,
  TRANSACTION_SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  DELEGATE,
  VOTE,
  PRICE_RANGE,
  POOL_DETAIL,
  FARM_HISTORY,
  MOBILE_LIVE_CHART,
  MOBILE_TRADE_ROUTES,
  REFERRAL_NETWORK
}

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>(
  'application/addPopup'
)
export const removePopup = createAction<{ key: string }>('application/removePopup')
export const updateETHPrice = createAction<{
  currentPrice: string
  oneDayBackPrice: string
  pricePercentChange: number
}>('application/updateETHPrice')

export const updateKNCPrice = createAction<string | undefined>('application/updateKNCPrice')

export const updateChainIdWhenNotConnected = createAction<ChainId>('application/updateChainIdWhenNotConnected')

export const setExchangeSubgraphClient = createAction<{ [key: string]: ApolloClient<NormalizedCacheObject> }>(
  'application/setExchangeSubgraphClient'
)
export const setGasPrice = createAction<{ [key: string]: string } | undefined>('application/setGasPrice')
