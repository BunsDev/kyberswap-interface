import { Currency, CurrencyAmount, Pair, Token, Trade } from '@dynamic-amm/sdk'
import { useMemo, useEffect, useState, useCallback } from 'react'
import { BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { useActiveWeb3React } from './index'
import { routerUri } from '../apollo/client'
import useDebounce from './useDebounce'
import { Aggregator } from '../utils/aggregator'
import { AggregationComparer } from '../state/swap/types'
import useParsedQueryString from './useParsedQueryString'
import { useSelector } from 'react-redux'
import { AppState } from 'state'

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): Pair[][] {
  const { chainId } = useActiveWeb3React()

  const bases: Token[] = chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  // const basePairs: [Token, Token][] = useMemo(
  //   () =>
  //     flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase])).filter(
  //       ([t0, t1]) => t0.address !== t1.address
  //     ),
  //   [bases]
  // )

  const basePairs: [Token, Token][] = useMemo(() => {
    const res: [Token, Token][] = []
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        res.push([bases[i], bases[j]])
      }
    }
    return res
  }, [bases])

  const AAgainstAllBase = useMemo(
    () =>
      tokenA && bases.filter(base => base.address === tokenA?.address).length <= 0
        ? bases.map((base): [Token, Token] => [tokenA, base])
        : [],
    [bases, tokenA]
  )

  const BAgainstAllBase = useMemo(
    () =>
      tokenB && bases.filter(base => base.address === tokenB?.address).length <= 0
        ? bases.map((base): [Token, Token] => [tokenB, base])
        : [],
    [bases, tokenB]
  )
  const directPair = useMemo(
    () =>
      tokenA &&
      tokenB &&
      bases.filter(base => base.address === tokenA?.address).length <= 0 &&
      bases.filter(base => base.address === tokenB?.address).length <= 0
        ? [[tokenA, tokenB]]
        : [],
    [bases, tokenA, tokenB]
  )
  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            ...directPair,
            // token A against all bases
            ...AAgainstAllBase,
            // token B against all bases
            ...BAgainstAllBase,
            // each base against all bases
            ...basePairs
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]
              if (!customBases) return true

              const customBasesA: Token[] | undefined = customBases[tokenA.address]
              const customBasesB: Token[] | undefined = customBases[tokenB.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find(base => tokenB.equals(base))) return false
              if (customBasesB && !customBasesB.find(base => tokenA.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  )

  const allPairs = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      allPairs.reduce<Pair[][]>((res, poolArray) => {
        const t = Object.values(
          poolArray
            .filter((result): result is [PairState.EXISTS, Pair] =>
              Boolean(result[0] === PairState.EXISTS && result[1])
            )
            .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
              memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
              return memo
            }, {})
        )
        res.push(t)
        return res
      }, []),
    [allPairs]
  )
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): Trade | null {
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut).filter(item => item.length > 0)
  const [trade, setTrade] = useState<Trade | null>(null)
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
              maxNumResults: 1
            })[0] ?? null
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
export function useTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): Trade | null {
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency).filter(item => item.length > 0)
  const [trade, setTrade] = useState<Trade | null>(null)
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
              maxNumResults: 1
            })[0] ?? null
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
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  saveGas?: boolean
): {
  trade: Aggregator | null
  comparer: AggregationComparer | null
  onUpdateCallback: (resetRoute?: boolean) => void
  loading: boolean
} {
  const { chainId } = useActiveWeb3React()
  const parsedQs: { dexes?: string } = useParsedQueryString()

  const [trade, setTrade] = useState<Aggregator | null>(null)
  const [comparer, setComparer] = useState<AggregationComparer | null>(null)
  const [loading, setLoading] = useState(false)

  const debounceCurrencyAmountIn = useDebounce(currencyAmountIn, 300)

  const routerApi = useMemo((): string => {
    return (chainId && routerUri[chainId]) || ''
  }, [chainId])

  const gasPrice = useSelector((state: AppState) => state.application.gasPrice)
  const onUpdateCallback = useCallback(
    async (resetRoute = true) => {
      if (
        debounceCurrencyAmountIn &&
        currencyOut &&
        (debounceCurrencyAmountIn.currency as Token)?.address !== (currencyOut as Token)?.address
      ) {
        if (resetRoute) setTrade(null)
        controller.abort()

        controller = new AbortController()
        const signal = controller.signal

        setLoading(true)

        const [state, comparedResult] = await Promise.all([
          Aggregator.bestTradeExactIn(
            routerApi,
            debounceCurrencyAmountIn,
            currencyOut,
            saveGas,
            parsedQs.dexes,
            gasPrice,
            signal
          ),
          Aggregator.compareDex(routerApi, debounceCurrencyAmountIn, currencyOut, signal)
        ])
        setTrade(state)
        setComparer(comparedResult)
        setLoading(false)
      } else {
        setTrade(null)
        setComparer(null)
      }
    },
    [debounceCurrencyAmountIn, currencyOut, routerApi, saveGas, gasPrice, parsedQs.dexes]
  )

  useEffect(() => {
    onUpdateCallback()
  }, [onUpdateCallback])

  return {
    trade,
    comparer,
    onUpdateCallback,
    loading
  }
}
