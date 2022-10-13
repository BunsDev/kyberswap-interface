import { Currency } from '@namgold/ks-sdk-core'
import { FeeAmount, computePoolAddress } from '@namgold/ks-sdk-elastic'
import { useMemo } from 'react'

import { EVMNetworkInfo } from 'constants/networks/type'
import { useActiveWeb3React } from 'hooks'

export function useProAmmPoolInfos(
  currencyA: Currency | null | undefined,
  currencyB: Currency | null | undefined,
  feeAmount: (FeeAmount | undefined)[],
): string[] {
  const { isEVM, networkInfo } = useActiveWeb3React()
  const proAmmCoreFactoryAddress = isEVM && (networkInfo as EVMNetworkInfo).elastic.coreFactory
  return useMemo(
    () =>
      feeAmount.map(fee => {
        return proAmmCoreFactoryAddress && currencyA && currencyB && fee && !currencyA.wrapped.equals(currencyB.wrapped)
          ? computePoolAddress({
              factoryAddress: proAmmCoreFactoryAddress,
              tokenA: currencyA?.wrapped,
              tokenB: currencyB?.wrapped,
              fee: fee,
              initCodeHashManualOverride: (networkInfo as EVMNetworkInfo).elastic.initCodeHash,
            })
          : ''
      }),
    [currencyA, currencyB, proAmmCoreFactoryAddress, feeAmount, networkInfo],
  )
}

export default function useProAmmPoolInfo(
  currencyA: Currency | null | undefined,
  currencyB: Currency | null | undefined,
  feeAmount: FeeAmount | undefined,
): string {
  return useProAmmPoolInfos(currencyA, currencyB, [feeAmount])[0]
}
