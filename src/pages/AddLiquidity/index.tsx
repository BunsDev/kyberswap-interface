import { Fraction, WETH } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import JSBI from 'jsbi'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'

import LiquidityProviderMode from 'components/LiquidityProviderMode'
import { AddRemoveTabs, LiquidityAction } from 'components/NavigationTabs'
import { MinimalPositionCard } from 'components/PositionCard'
import { TutorialType } from 'components/Tutorial'
import { PairState } from 'data/Reserves'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import { useDerivedMintInfo } from 'state/mint/hooks'
import { useCurrencyConvertedToNative } from 'utils/dmm'

import TokenPair from './TokenPair'
import ZapIn from './ZapIn'
import { Container, LiquidityProviderModeWrapper, PageWrapper, PoolName, TopBar } from './styled'

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB, pairAddress },
  },
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string; pairAddress: string }>) {
  const { chainId } = useActiveWeb3React()
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const nativeA = useCurrencyConvertedToNative(currencyA || undefined)
  const nativeB = useCurrencyConvertedToNative(currencyB || undefined)

  const currencyAIsWETH = !!(chainId && currencyA && currencyA.equals(WETH[chainId]))
  const currencyBIsWETH = !!(chainId && currencyB && currencyB.equals(WETH[chainId]))

  const oneCurrencyIsWETH = currencyBIsWETH || currencyAIsWETH

  const { pair, pairState, noLiquidity } = useDerivedMintInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
    pairAddress,
  )
  const amp = pair?.amp || JSBI.BigInt(0)
  const [activeTab, setActiveTab] = useState(0)

  const { mixpanelHandler } = useMixpanel()
  useEffect(() => {
    mixpanelHandler(MIXPANEL_TYPE.ADD_LIQUIDITY_INITIATED, {
      token_1: nativeA?.symbol,
      token_2: nativeB?.symbol,
      amp: new Fraction(amp).divide(JSBI.BigInt(10000)).toSignificant(5),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <PageWrapper>
        <Container>
          <AddRemoveTabs action={LiquidityAction.ADD} tutorialType={TutorialType.CLASSIC_ADD_LIQUIDITY} />

          <TopBar>
            <LiquidityProviderModeWrapper>
              <LiquidityProviderMode
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                singleTokenInfo={t`Add liquidity to the pool by supplying a single token (either token from the token pair). We will automatically create LP tokens for you and add them to the liquidity pool - all in a single transaction`}
              />
            </LiquidityProviderModeWrapper>
            <PoolName>
              {nativeA?.symbol} - {nativeB?.symbol} <Trans>pool</Trans>
            </PoolName>
          </TopBar>

          {activeTab === 0 ? (
            <TokenPair currencyIdA={currencyIdA} currencyIdB={currencyIdB} pairAddress={pairAddress} />
          ) : (
            <ZapIn currencyIdA={currencyIdA} currencyIdB={currencyIdB} pairAddress={pairAddress} />
          )}
        </Container>

        {pair && !noLiquidity && pairState !== PairState.INVALID ? (
          <Container style={{ marginTop: '24px', padding: '0' }}>
            <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
          </Container>
        ) : null}
      </PageWrapper>
    </>
  )
}
