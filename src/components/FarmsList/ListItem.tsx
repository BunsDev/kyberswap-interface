import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'

import { ChainId, Fraction, JSBI, Token } from 'libs/sdk/src'
import { KNC } from '../../constants'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Farm } from 'state/farms/types'
import { formattedNum, isAddressString, shortenAddress } from 'utils'
import { useFarmClaimModalToggle, useFarmStakeModalToggle, useKNCPrice } from 'state/application/hooks'
import InputGroup from './InputGroup'
import { useActiveWeb3React } from 'hooks'
import { useToken } from 'hooks/Tokens'
import useTokenBalance from 'hooks/useTokenBalance'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { getFarmApr } from 'utils/dmm'

const TableRow = styled.div<{ fade?: boolean; isExpanded?: boolean }>`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
  grid-template-areas: 'pools liq apy reward staked_balance';
  padding: 15px 36px 13px 26px;
  font-size: 14px;
  align-items: center;
  height: fit-content;
  position: relative;
  opacity: ${({ fade }) => (fade ? '0.6' : '1')};
  background-color: ${({ theme }) => theme.bg15};
  border: 1px solid transparent;
  border-bottom: 1px solid ${({ theme, isExpanded }) => (isExpanded ? 'transparent' : theme.advancedBorder)};

  &:hover {
    cursor: pointer;
  }
`

const ExpandedSection = styled.div`
  background-color: ${({ theme }) => theme.bg15};
  padding: 0 36px;
`

export const ExpandedContent = styled.div`
  border-radius: 10px;
  background-color: ${({ theme }) => theme.bg6};
  font-size: 14px;
  font-weight: 500;
  padding: 16px 24px;
`

const StakeGroup = styled.div`
  display: grid;
  grid-gap: 1.5rem;
  grid-template-columns: 3fr 3fr 2fr;
  grid-template-areas: 'stake unstake harvest';
  margin-bottom: 8px;
`

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
`

const GreyText = styled.div`
  color: ${({ theme }) => theme.primaryText2};
  margin-bottom: 8px;
`

const LPInfoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`

const LPInfo = styled.div`
  margin-right: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #08a1e7;
  line-height: 2;
`

const GetLP = styled.span`
  font-size: 14px;
  font-weight: 600;
`

const StyledItemCard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 4px;
  border-radius: 10px;
  margin-bottom: 0;
  padding: 8px 20px 4px 20px;
  background-color: ${({ theme }) => theme.bg6};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 20px;
  `}
`

const DataText = styled(Flex)`
  color: ${({ theme }) => theme.text7};
  flex-direction: column;
`

interface ListItemProps {
  farm: Farm
  oddRow?: boolean
}

export const ItemCard = ({ farm }: ListItemProps) => {
  return (
    <div>
      <StyledItemCard>{farm.id}</StyledItemCard>
    </div>
  )
}

const ListItem = ({ farm }: ListItemProps) => {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const kncPrice = useKNCPrice()
  const [expand, setExpand] = useState<boolean>(false)
  const toggleFarmClaimModal = useFarmClaimModalToggle()
  const toggleFarmStakeModal = useFarmStakeModalToggle()

  const currency0 = useToken(farm.token0?.id) as Token
  const currency1 = useToken(farm.token1?.id) as Token

  const poolAddressChecksum = isAddressString(farm.id)
  const { value: userTokenBalance, decimals: lpTokenDecimals } = useTokenBalance(poolAddressChecksum)
  const userStakedBalance = farm.userData?.stakedBalance
    ? BigNumber.from(farm.userData?.stakedBalance)
    : BigNumber.from(0)
  const userEarning = farm.userData?.earnings ? BigNumber.from(farm.userData?.earnings) : BigNumber.from(0)
  const rewardUSD =
    userEarning && kncPrice && (parseFloat(kncPrice) * parseFloat(getFullDisplayBalance(userEarning))).toString()

  // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
  const lpTokenRatio = new Fraction(
    farm.totalStake.toString(),
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(lpTokenDecimals))
  ).divide(
    new Fraction(
      ethers.utils.parseUnits(farm.totalSupply, lpTokenDecimals).toString(),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(lpTokenDecimals))
    )
  )

  // Ratio in % of user's LP tokens balance, vs the total number in circulation
  const lpUserLPBalanceRatio = new Fraction(
    userTokenBalance.toString(),
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(lpTokenDecimals))
  ).divide(
    new Fraction(
      ethers.utils.parseUnits(farm.totalSupply, lpTokenDecimals).toString(),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(lpTokenDecimals))
    )
  )

  // Ratio in % of LP tokens that user staked, vs the total number in circulation
  const lpUserStakedTokenRatio = new Fraction(
    userStakedBalance.toString(),
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(lpTokenDecimals))
  ).divide(
    new Fraction(
      ethers.utils.parseUnits(farm.totalSupply, lpTokenDecimals).toString(),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(lpTokenDecimals))
    )
  )

  const userLPBalanceUSD = parseFloat(lpUserLPBalanceRatio.toSignificant(6)) * parseFloat(farm.reserveUSD)
  const userStakedBalanceUSD = parseFloat(lpUserStakedTokenRatio.toSignificant(6)) * parseFloat(farm.reserveUSD)

  const liquidity = parseFloat(lpTokenRatio.toSignificant(6)) * parseFloat(farm.reserveUSD)

  const apr = kncPrice ? getFarmApr(KNC[chainId as ChainId], farm.rewardPerBlock, kncPrice, liquidity.toString()) : 0

  const amp = farm.amp / 10000

  const handleClickHarvest = () => {
    toggleFarmClaimModal()
  }

  const handleClickStake = () => {
    toggleFarmStakeModal()
  }

  return (
    <>
      <TableRow isExpanded={expand} onClick={() => setExpand(!expand)}>
        <DataText grid-area="pools">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {amp === 1 ? (
              <>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={16} margin={true} />
                <span>
                  {farm.token0?.symbol} - {farm.token1?.symbol} (AMP = {amp})
                </span>
              </>
            ) : (
              <div />
            )}
          </div>
        </DataText>
        <DataText grid-area="liq">{formattedNum(liquidity.toString(), true)}</DataText>
        <DataText grid-area="apy" style={{ color: 'rgba(137, 255, 120, 0.67)' }}>
          {apr.toFixed(2)}%
        </DataText>
        <DataText grid-area="reward">{`${getFullDisplayBalance(userEarning)} KNC`}</DataText>
        <DataText grid-area="staked_balance">{formattedNum(userStakedBalanceUSD.toString(), true)}</DataText>
      </TableRow>

      {expand && (
        <ExpandedSection>
          <ExpandedContent>
            <StakeGroup style={{ marginBottom: '14px' }}>
              <BalanceInfo grid-area="stake">
                <GreyText>
                  Balance: {getFullDisplayBalance(userTokenBalance, lpTokenDecimals)} {farm.token0?.symbol}-
                  {farm.token1?.symbol} LP
                </GreyText>
                <GreyText>{formattedNum(userLPBalanceUSD.toString(), true)}</GreyText>
              </BalanceInfo>
              <BalanceInfo grid-area="unstake">
                <GreyText>
                  Deposit: {getFullDisplayBalance(userStakedBalance, lpTokenDecimals)} {farm.token0?.symbol}-
                  {farm.token1?.symbol} LP
                </GreyText>
                <GreyText>{formattedNum(userStakedBalanceUSD.toString(), true)}</GreyText>
              </BalanceInfo>
              <div grid-area="harvest">
                <GreyText>KNC Reward</GreyText>
                <div>{`${getFullDisplayBalance(userEarning)} KNC`}</div>
                <div>{rewardUSD && formattedNum(rewardUSD, true)}</div>
              </div>
            </StakeGroup>
            <StakeGroup>
              <InputGroup
                pid={farm.pid}
                pairAddress={farm.id}
                pairSymbol={`${farm.token0.symbol}-${farm.token1.symbol} LP`}
                token0Address={farm.token0.id}
                token1Address={farm.token1.id}
              />
              {/* <div grid-area="stake">
                <ButtonPrimary padding="12px" onClick={handleClickStake}>
                  Stake
                </ButtonPrimary>
              </div>
              <div grid-area="unstake">
                <ButtonPrimary padding="12px" onClick={handleClickStake}>
                  Unstake
                </ButtonPrimary>
              </div>
              <div grid-area="harvest">
                <ButtonPrimary padding="12px" onClick={handleClickHarvest}>
                  Harvest
                </ButtonPrimary>
              </div> */}
            </StakeGroup>
            <LPInfoContainer>
              <LPInfo>{shortenAddress(farm.id)}</LPInfo>
              <Link to={`/add/${farm.token0?.id}/${farm.token1?.id}/${farm.id}`} style={{ textDecoration: 'none' }}>
                <GetLP>
                  Get {farm.token0?.symbol}-{farm.token1?.symbol} LP ↗
                </GetLP>
              </Link>
            </LPInfoContainer>
          </ExpandedContent>
        </ExpandedSection>
      )}
    </>
  )
}

export default ListItem
