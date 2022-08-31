import { Trans, t } from '@lingui/macro'
import { Trade } from '@namgold/ks-sdk-classic'
import { ChainId, Currency, TradeType } from '@namgold/ks-sdk-core'
import styled from 'styled-components'

import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { DMM_ANALYTICS_URL } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import { Field } from 'state/swap/actions'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { ExternalLink, TYPE } from 'theme'
import { useCurrencyConvertedToNative } from 'utils/dmm'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from 'utils/prices'

import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'
import { SectionBreak } from './styleds'

const InfoLink = styled(ExternalLink)`
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.advancedBorder};
  padding: 12px 6px;
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.text10};
`

function TradeSummary({
  trade,
  allowedSlippage,
}: {
  trade: Trade<Currency, Currency, TradeType>
  allowedSlippage: number
}) {
  const theme = useTheme()
  const { priceImpactWithoutFee, realizedLPFee, accruedFeePercent } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const nativeInput = useCurrencyConvertedToNative(trade.inputAmount.currency)
  const nativeOutput = useCurrencyConvertedToNative(trade.outputAmount.currency)
  return (
    <>
      <AutoColumn style={{ padding: '0 20px' }}>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {isExactIn ? t`Minimum Received` : t`Maximum Sold`}
            </TYPE.black>
            <QuestionHelper
              text={t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed`}
            />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text} fontSize={14}>
              {isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${nativeOutput?.symbol}` ?? '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${nativeInput?.symbol}` ?? '-'}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              <Trans>Price Impact</Trans>
            </TYPE.black>
            <QuestionHelper
              text={t`The difference between the market price and your price due to trade size. Adjust the price impact tolerance in the top right configuration`}
            />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              <Trans>Liquidity Provider Fee</Trans>
            </TYPE.black>
            <QuestionHelper
              text={t`A portion of each trade (${accruedFeePercent.toSignificant(
                6,
              )}%) goes to liquidity providers as a protocol incentive`}
            />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.text}>
            {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${nativeInput?.symbol}` : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade<Currency, Currency, TradeType>
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()

  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <AutoColumn gap="md">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <SectionBreak />
              <AutoColumn style={{ padding: '0 24px' }}>
                <RowFixed>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                    <Trans>Route</Trans>
                  </TYPE.black>
                  <QuestionHelper text={t`Routing through these tokens resulted in the best price for your trade`} />
                </RowFixed>
                <SwapRoute trade={trade} />
              </AutoColumn>
            </>
          )}
          <AutoColumn style={{ padding: '0 24px' }}>
            <InfoLink
              href={`${DMM_ANALYTICS_URL[chainId as ChainId]}/pool/${trade?.route.pairs[0].liquidityToken.address}`}
              target="_blank"
            >
              <Trans>Token pool analytics →</Trans>
            </InfoLink>
          </AutoColumn>
        </>
      )}
    </AutoColumn>
  )
}
