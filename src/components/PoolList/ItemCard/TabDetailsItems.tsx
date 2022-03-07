import ItemCardInfoRow, { ItemCardInfoRowPriceRange } from 'components/PoolList/ItemCard/ItemCardInfoRow'
import { t } from '@lingui/macro'
import { AMP_LIQUIDITY_HINT, SUBGRAPH_AMP_MULTIPLIER, FEE_OPTIONS } from 'constants/index'
import { feeRangeCalc } from 'utils/dmm'
import React from 'react'
import { SubgraphPoolData } from 'state/pools/hooks'
import { formattedNum } from 'utils'
import { Fraction, JSBI } from '@dynamic-amm/sdk'
import { useActiveWeb3React } from 'hooks'

export default function TabDetailsItems({ poolData }: { poolData: SubgraphPoolData }) {
  const { chainId } = useActiveWeb3React()
  const amp = new Fraction(poolData.amp).divide(JSBI.BigInt(SUBGRAPH_AMP_MULTIPLIER))
  const ampLiquidity = formattedNum(`${parseFloat(amp.toSignificant(5)) * parseFloat(poolData.reserveUSD)}`, true)

  const isWithoutDynamicFee = chainId && FEE_OPTIONS[chainId]

  return (
    <>
      <ItemCardInfoRow name={t`AMP Liquidity`} value={ampLiquidity as string} infoHelperText={AMP_LIQUIDITY_HINT} />
      <ItemCardInfoRowPriceRange poolData={poolData} />
      <ItemCardInfoRow
        infoHelperText={
          chainId && FEE_OPTIONS[chainId]
            ? t`Liquidity providers will earn this trading fee for each trade that uses this pool`
            : undefined
        }
        name={isWithoutDynamicFee ? t`Fee` : t`Fee Range`}
        value={isWithoutDynamicFee ? poolData.fee / 100 + '%' : feeRangeCalc(+amp.toSignificant(5))}
      />
    </>
  )
}
