import { Pair, Trade } from '@kyberswap/ks-sdk-classic'
import { Currency, CurrencyAmount, Token, TradeType } from '@kyberswap/ks-sdk-core'
import { useMemo, useEffect, useState, useCallback } from 'react'
import { ZERO_ADDRESS } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { useActiveWeb3React } from './index'
import useDebounce from './useDebounce'
import { Aggregator } from '../utils/aggregator'
import { AggregationComparer } from '../state/swap/types'
import useParsedQueryString from './useParsedQueryString'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useAllCurrencyCombinations } from './useAllCurrencyCombinations'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { isAddress } from 'utils'
import { useSwapState } from 'state/swap/hooks'
import { NETWORKS_INFO } from 'constants/networks'

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): Pair[][] {
  const allPairCombinations = useAllCurrencyCombinations(currencyA, currencyB)

  const allPairs = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      allPairs.reduce<Pair[][]>((res, poolArray) => {
        const t = Object.values(
          poolArray
            .filter((result): result is [PairState.EXISTS, Pair] =>
              Boolean(result[0] === PairState.EXISTS && result[1]),
            )
            .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
              memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
              return memo
            }, {}),
        )
        res.push(t)
        return res
      }, []),
    [allPairs],
  )
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  currencyAmountIn?: CurrencyAmount<Currency>,
  currencyOut?: Currency,
): Trade<Currency, Currency, TradeType> | null {
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut).filter(item => item.length > 0)
  const [trade, setTrade] = useState<Trade<Currency, Currency, TradeType> | null>(null)

  useEffect(() => {
    let timeout: any
    const fn = async function() {
      timeout = setTimeout(() => {
        if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
          if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
            console.log('trade amount: ', currencyAmountIn.toSignificant(10))
          }

          setTrade(
            Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
              maxHops: 3,
              maxNumResults: 1,
            })[0] ?? null,
          )
        } else setTrade(null)
      }, 100)
    }
    fn()
    return () => {
      clearTimeout(timeout)
    }
  }, [currencyAmountIn?.toSignificant(10), currencyAmountIn?.currency, currencyOut, allowedPairs.length])

  return trade
  // return useMemo(() => {
  //   if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
  //     return (
  //       Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 3, maxNumResults: 1 })[0] ?? null
  //     )
  //   }
  //   return null
  // }, [allowedPairs, currencyAmountIn, currencyOut])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount<Currency>,
): Trade<Currency, Currency, TradeType> | null {
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency).filter(item => item.length > 0)
  const [trade, setTrade] = useState<Trade<Currency, Currency, TradeType> | null>(null)
  useEffect(() => {
    let timeout: any
    const fn = async function() {
      timeout = setTimeout(() => {
        if (currencyAmountOut && currencyIn && allowedPairs.length > 0) {
          if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
            console.log('trade amount: ', currencyAmountOut.toSignificant(10))
          }
          setTrade(
            Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
              maxHops: 3,
              maxNumResults: 1,
            })[0] ?? null,
          )
        } else setTrade(null)
      }, 100)
    }
    fn()
    return () => {
      clearTimeout(timeout)
    }
  }, [currencyAmountOut?.toSignificant(10), currencyAmountOut?.currency, currencyIn, allowedPairs.length])
  return trade
  // return useMemo(() => {
  //   if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
  //     return (
  //       Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 3, maxNumResults: 1 })[0] ??
  //       null
  //     )
  //   }
  //   return null
  // }, [allowedPairs, currencyIn, currencyAmountOut])
}

let controller = new AbortController()
/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactInV2(
  currencyAmountIn: CurrencyAmount<Currency> | undefined,
  currencyOut: Currency | undefined,
  saveGas: boolean,
  recipient: string | null,
  allowedSlippage: number,
): {
  trade: Aggregator | null
  comparer: AggregationComparer | null
  onUpdateCallback: (resetRoute?: boolean) => void
  loading: boolean
} {
  const { account, chainId } = useActiveWeb3React()
  const parsedQs: { dexes?: string } = useParsedQueryString()

  const [trade, setTrade] = useState<Aggregator | null>(null)
  const [comparer, setComparer] = useState<AggregationComparer | null>(null)
  const [loading, setLoading] = useState(false)

  const debounceCurrencyAmountIn = useDebounce(currencyAmountIn, 300)

  const routerApi = useMemo((): string => {
    return (chainId && NETWORKS_INFO[chainId].routerUri) || ''
  }, [chainId])

  const gasPrice = useSelector((state: AppState) => state.application.gasPrice)
  const deadline = useTransactionDeadline()

  const { feeConfig } = useSwapState()

  const onUpdateCallback = useCallback(
    async (resetRoute = false) => {
      if (
        debounceCurrencyAmountIn &&
        currencyOut &&
        (debounceCurrencyAmountIn.currency as Token)?.address !== (currencyOut as Token)?.address
      ) {
        if (resetRoute) setTrade(null)
        controller.abort()

        controller = new AbortController()
        const signal = controller.signal

        let isCancelSetLoading = false

        setTimeout(() => {
          if (!isCancelSetLoading) setLoading(true)
        }, 1000)

        const to = (isAddress(recipient) ? (recipient as string) : account) ?? ZERO_ADDRESS

        const [state, comparedResult] = await Promise.all([
          Aggregator.bestTradeExactIn(
            routerApi,
            debounceCurrencyAmountIn,
            currencyOut,
            saveGas,
            gasPrice,
            parsedQs.dexes,
            allowedSlippage,
            deadline,
            to,
            feeConfig,
            signal,
          ),
          Aggregator.compareDex(
            routerApi,
            debounceCurrencyAmountIn,
            currencyOut,
            allowedSlippage,
            deadline,
            to,
            feeConfig,
            signal,
          ),
        ])
        if (!signal.aborted) {
          setTrade(state)
          setComparer(comparedResult)
        }
        isCancelSetLoading = true
        setLoading(false)
      } else {
        setTrade(null)
        setComparer(null)
      }
    },
    [
      debounceCurrencyAmountIn,
      currencyOut,
      routerApi,
      saveGas,
      parsedQs.dexes,
      gasPrice,
      allowedSlippage,
      deadline,
      recipient,
      account,
      feeConfig,
    ],
  )

  useEffect(() => {
    onUpdateCallback()
  }, [onUpdateCallback])

  return {
    trade,
    comparer,
    onUpdateCallback,
    loading,
  }
}
