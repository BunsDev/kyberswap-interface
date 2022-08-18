import { parseUnits } from '@ethersproject/units'
import { Trade } from '@kyberswap/ks-sdk-classic'
import { ChainId, Currency, CurrencyAmount, TradeType } from '@kyberswap/ks-sdk-core'
import { t } from '@lingui/macro'
import JSBI from 'jsbi'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { BAD_RECIPIENT_ADDRESSES, DEFAULT_OUTPUT_TOKEN_BY_CHAIN } from 'constants/index'
import { nativeOnChain } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { useTradeExactIn } from 'hooks/Trades'
import useENS from 'hooks/useENS'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { FeeConfig } from 'hooks/useSwapV2Callback'
import { AppDispatch, AppState } from 'state/index'
import {
  Field,
  chooseToSaveGas,
  replaceSwapState,
  resetSelectCurrency,
  selectCurrency,
  setRecipient,
  switchCurrencies,
  switchCurrenciesV2,
  typeInput,
} from 'state/swap/actions'
import { SwapState } from 'state/swap/reducer'
import { useExpertModeManager, useUserSlippageTolerance } from 'state/user/hooks'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { isAddress } from 'utils'
import { computeSlippageAdjustedAmounts } from 'utils/prices'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>(state => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onSwitchTokensV2: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
  onChooseToSaveGas: (saveGas: boolean) => void
  onResetSelectCurrency: (field: Field) => void
} {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isNative ? (nativeOnChain(chainId as number).symbol as string) : currency.address,
        }),
      )
    },
    [dispatch, chainId],
  )
  const [expertMode] = useExpertModeManager()

  useEffect(() => {
    if (expertMode) dispatch(setRecipient({ recipient: null }))
  }, [expertMode, dispatch])

  const onResetSelectCurrency = useCallback(
    (field: Field) => {
      dispatch(
        resetSelectCurrency({
          field,
        }),
      )
    },
    [dispatch],
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onSwitchTokensV2 = useCallback(() => {
    dispatch(switchCurrenciesV2())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch],
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch],
  )

  const onChooseToSaveGas = useCallback(
    (saveGas: boolean) => {
      dispatch(chooseToSaveGas({ saveGas }))
    },
    [dispatch],
  )

  return {
    onSwitchTokens,
    onSwitchTokensV2,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onChooseToSaveGas,
    onResetSelectCurrency, // deselect token in select input: (use cases: remove "imported token")
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount<T extends Currency>(
  value?: string,
  currency?: T,
  shouldParse = true,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = shouldParse ? parseUnits(value, currency.decimals).toString() : value
    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade<Currency, Currency, TradeType>, checksummedAddress: string): boolean {
  return (
    trade.route.path.some(token => token.address === checksummedAddress) ||
    trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  v2Trade: Trade<Currency, Currency, TradeType> | undefined
  inputError?: string
} {
  const { account } = useActiveWeb3React()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency]),
  )

  const isExactIn = useMemo(() => independentField === Field.INPUT, [independentField])
  const parsedAmount = useMemo(
    () => tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue],
  )

  const currencyAmountIn = useMemo(() => (isExactIn ? parsedAmount : undefined), [isExactIn, parsedAmount])
  const currencyOut = useMemo(() => outputCurrency ?? undefined, [outputCurrency])
  const bestTradeExactIn = useTradeExactIn(currencyAmountIn, currencyOut)

  const v2Trade = bestTradeExactIn

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = useMemo(() => {
    return {
      [Field.INPUT]: inputCurrency ?? undefined,
      [Field.OUTPUT]: outputCurrency ?? undefined,
    }
  }, [inputCurrency, outputCurrency])

  let inputError: string | undefined
  if (!account) {
    inputError = t`Connect wallet`
  }

  if (!parsedAmount) {
    if (typedValue) inputError = inputError ?? t`Invalid amount`
    else inputError = inputError ?? t`Enter an amount`
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? t`Select a token`
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? t`Enter a recipient`
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo))
    ) {
      inputError = inputError ?? t`Invalid recipient`
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = t`Insufficient ${amountIn.currency.symbol} balance`
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
  }
}

function parseCurrencyFromURLParameter(urlParam: any, chainId: ChainId): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    return nativeOnChain(chainId).symbol as string
  }
  return nativeOnChain(chainId).symbol ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs, chainId: ChainId): Omit<SwapState, 'saveGas'> {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency, chainId)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency, chainId)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)
  const feePercent = parseInt(parsedQs?.['fee_bip']?.toString() || '0')
  const feeConfig: FeeConfig | undefined =
    parsedQs.referral && isAddress(parsedQs.referral) && parsedQs['fee_bip'] && !isNaN(feePercent)
      ? {
          chargeFeeBy: 'currency_in',
          feeReceiver: parsedQs.referral.toString(),
          isInBps: true,
          feeAmount: feePercent < 1 ? '1' : feePercent > 10 ? '10' : feePercent.toString(),
        }
      : undefined
  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
    feeConfig,
  }
}

const getCurrencySymbolOrAddress = (currency: Currency | undefined): string | undefined => {
  if (!currency) return ''
  return currency.isNative ? currency.symbol : currency.address
}

// updates the swap state to use the defaults for a given network
export const useDefaultsFromURLSearch = ():
  | {
      inputCurrencyId?: string
      outputCurrencyId?: string
    }
  | undefined => {
  // TODO: this hook is called more than 100 times just on startup, need to check

  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch()

  // this is already memo-ed
  const parsedQs = useParsedQueryString()

  const [result, setResult] = useState<
    | {
        inputCurrencyId?: string
        outputCurrencyId?: string
      }
    | undefined
  >()

  const { currencies } = useDerivedSwapInfo()

  const currenciesRef = useRef(currencies)
  currenciesRef.current = currencies

  useEffect(() => {
    if (!chainId) {
      return
    }

    const parsed = queryParametersToSwapState(parsedQs, chainId)

    const outputCurrencyAddress = DEFAULT_OUTPUT_TOKEN_BY_CHAIN[chainId]?.address || ''

    // symbol or address of the input
    const storedInputValue = getCurrencySymbolOrAddress(currenciesRef.current[Field.INPUT])
    const storedOutputValue = getCurrencySymbolOrAddress(currenciesRef.current[Field.OUTPUT])

    const parsedInputValue = parsed[Field.INPUT].currencyId // default inputCurrency is the native token
    const parsedOutputValue = parsed[Field.OUTPUT].currencyId || outputCurrencyAddress

    // priority order
    // 1. address on url (inputCurrency, outputCurrency)
    // 2. previous currency (to not reset default pair when back to swap page)
    // 3. default pair
    const inputCurrencyId = parsedQs.inputCurrency ? parsedInputValue : storedInputValue || parsedInputValue
    const outputCurrencyId = parsedQs.outputCurrency ? parsedOutputValue : storedOutputValue || parsedOutputValue

    dispatch(
      replaceSwapState({
        field: parsed.independentField,
        inputCurrencyId,
        outputCurrencyId,
        recipient: parsed.recipient,
        feeConfig: parsed.feeConfig,
      }),
    )

    setResult({
      inputCurrencyId,
      outputCurrencyId,
    })

    // TODO: can not add `currencies` as dependency here because it will retrigger replaceSwapState => got some issue when we have in/outputCurrency on URL
  }, [dispatch, chainId, parsedQs])

  return result
}
