import { Pair } from '@kyberswap/ks-sdk-classic'
import { Currency, Token } from '@kyberswap/ks-sdk-core'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PairState, usePair } from 'data/Reserves'

import { AppDispatch, AppState } from '../index'
import { Field, selectCurrency } from './actions'

export function usePairState(): AppState['pair'] {
  return useSelector<AppState, AppState['pair']>(state => state.pair)
}

export function usePairActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency.isNative ? 'ETH' : '',
        }),
      )
    },
    [dispatch],
  )

  return {
    onCurrencySelection,
  }
}

export function useDerivedPairInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  currencies: { [field in Field]?: Currency }
  pairs: [PairState, Pair | null, boolean?][]
} {
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined,
    }),
    [currencyA, currencyB],
  )
  const pairs = usePair(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B])
  return {
    currencies,
    pairs,
  }
}
