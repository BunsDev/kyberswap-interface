/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import { ethers } from 'ethers'
import { MaxUint256 } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { useMedia } from 'react-use'

import { ChainId, Fraction, JSBI, Token, TokenAmount, ZERO } from '@dynamic-amm/sdk'
import {
  AMP_HINT,
  DMM_ANALYTICS_URL,
  FARMING_POOLS_CHAIN_STAKING_LINK,
  MAX_ALLOW_APY,
  OUTSIDE_FAIRLAUNCH_ADDRESSES
} from '../../constants'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { Dots } from 'components/swap/styleds'
import { ButtonOutlined, ButtonPrimary } from 'components/Button'
import { AutoRow } from 'components/Row'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { Farm, Reward } from 'state/farms/types'
import { useActiveWeb3React } from 'hooks'
import { useToken } from 'hooks/Tokens'
import useTokenBalance from 'hooks/useTokenBalance'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useFairLaunch from 'hooks/useFairLaunch'
import useStakedBalance from 'hooks/useStakedBalance'
import { useAppDispatch } from 'state/hooks'
import { setAttemptingTxn, setShowConfirm, setTxHash, setYieldPoolsError } from 'state/farms/actions'
import { formattedNum, isAddressString } from 'utils'
import { formatTokenBalance, getFullDisplayBalance } from 'utils/formatBalance'
import { getTradingFeeAPR, useFarmApr, useFarmRewards, useFarmRewardsUSD } from 'utils/dmm'
import { ExternalLink } from 'theme'
import { currencyIdFromAddress } from 'utils/currencyId'
import { t, Trans } from '@lingui/macro'
import InfoHelper from 'components/InfoHelper'
import {
  APY,
  BalanceInfo,
  DataText,
  DataTitle,
  ExpandedContent,
  ExpandedSection,
  GetLP,
  GreyText,
  GridItem,
  LPInfoAndVestingDurationContainer,
  LPInfoContainer,
  RewardBalanceWrapper,
  Seperator,
  StakeGroup,
  StyledItemCard,
  TableRow
} from './styleds'
import CurrencyLogo from 'components/CurrencyLogo'
import useTheme from 'hooks/useTheme'
import { getFormattedTimeFromSecond } from 'utils/formatTime'
import IconLock from 'assets/svg/icon_lock.svg'

const fixedFormatting = (value: BigNumber, decimals: number) => {
  const fraction = new Fraction(value.toString(), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)))

  if (fraction.equalTo(ZERO)) {
    return '0'
  }

  return fraction.toFixed(18).replace(/\.?0+$/, '')
}

interface ListItemProps {
  farm: Farm
  oddRow?: boolean
}

const ListItem = ({ farm }: ListItemProps) => {
  const { account, chainId } = useActiveWeb3React()
  const [expand, setExpand] = useState<boolean>(false)
  const breakpoint = useMedia('(min-width: 992px)')
  const dispatch = useAppDispatch()

  const currency0 = useToken(farm.token0?.id) as Token
  const currency1 = useToken(farm.token1?.id) as Token

  const poolAddressChecksum = isAddressString(farm.id)
  const { value: userTokenBalance, decimals: lpTokenDecimals } = useTokenBalance(poolAddressChecksum)

  const outsideFarm = OUTSIDE_FAIRLAUNCH_ADDRESSES[farm.fairLaunchAddress]

  const userStakedBalance = farm.userData?.stakedBalance
    ? BigNumber.from(farm.userData?.stakedBalance)
    : BigNumber.from(0)

  const farmRewards = useFarmRewards([farm])

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

  const userToken0Balance = parseFloat(lpUserLPBalanceRatio.toSignificant(6)) * parseFloat(farm.reserve0)
  const userToken1Balance = parseFloat(lpUserLPBalanceRatio.toSignificant(6)) * parseFloat(farm.reserve1)

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

  const userStakedToken0Balance = parseFloat(lpUserStakedTokenRatio.toSignificant(6)) * parseFloat(farm.reserve0)
  const userStakedToken1Balance = parseFloat(lpUserStakedTokenRatio.toSignificant(6)) * parseFloat(farm.reserve1)

  const userLPBalanceUSD = parseFloat(lpUserLPBalanceRatio.toSignificant(6)) * parseFloat(farm.reserveUSD)
  const userStakedBalanceUSD = parseFloat(lpUserStakedTokenRatio.toSignificant(6)) * parseFloat(farm.reserveUSD)

  const liquidity = parseFloat(lpTokenRatio.toSignificant(6)) * parseFloat(farm.reserveUSD)

  const farmAPR = useFarmApr(farm, liquidity.toString())

  const tradingFee = farm?.oneDayFeeUSD ? farm?.oneDayFeeUSD : farm?.oneDayFeeUntracked

  const tradingFeeAPR = getTradingFeeAPR(farm?.reserveUSD, tradingFee)

  let apr = farmAPR
  if (tradingFeeAPR < MAX_ALLOW_APY) apr += tradingFeeAPR

  const amp = farm.amp / 10000

  const pairSymbol = `${farm.token0.symbol}-${farm.token1.symbol} LP`
  const [depositValue, setDepositValue] = useState('')
  const [withdrawValue, setWithdrawValue] = useState('')
  const pairAddressChecksum = isAddressString(farm.id)
  const balance = useTokenBalance(pairAddressChecksum)
  const staked = useStakedBalance(farm.fairLaunchAddress, farm.pid)
  const rewardUSD = useFarmRewardsUSD(farmRewards)

  const [approvalState, approve] = useApproveCallback(
    new TokenAmount(
      new Token(chainId || 1, pairAddressChecksum, balance.decimals, pairSymbol, ''),
      MaxUint256.toString()
    ),
    !!chainId ? farm.fairLaunchAddress : undefined
  )

  let isStakeInvalidAmount

  try {
    isStakeInvalidAmount =
      depositValue === '' ||
      parseFloat(depositValue) === 0 ||
      ethers.utils.parseUnits(depositValue || '0', balance.decimals).gt(balance.value) // This causes error if number of decimals > 18
  } catch (err) {
    isStakeInvalidAmount = true
  }

  const isStakeDisabled = isStakeInvalidAmount

  let isUnstakeInvalidAmount

  try {
    isUnstakeInvalidAmount =
      withdrawValue === '' ||
      parseFloat(withdrawValue) === 0 ||
      ethers.utils.parseUnits(withdrawValue || '0', staked.decimals).gt(staked.value) // This causes error if number of decimals > 18
  } catch (err) {
    isUnstakeInvalidAmount = true
  }

  const isUnstakeDisabled = isUnstakeInvalidAmount

  const canHarvest = (rewards: Reward[]): boolean => {
    return rewards.some(reward => reward?.amount.gt(BigNumber.from('0')))
  }

  const isHarvestDisabled = !canHarvest(farmRewards)

  const { deposit, withdraw, harvest } = useFairLaunch(farm.fairLaunchAddress)

  const handleStake = async (pid: number) => {
    if (!chainId || !account) {
      return
    }

    dispatch(setShowConfirm(true))
    dispatch(setAttemptingTxn(true))
    dispatch(setTxHash(''))

    try {
      const txHash = await deposit(pid, ethers.utils.parseUnits(depositValue, balance.decimals), pairSymbol, false)
      dispatch(setTxHash(txHash))
    } catch (err) {
      console.error(err)
      dispatch(setYieldPoolsError((err as Error).message))
    }

    dispatch(setAttemptingTxn(false))
  }

  const handleUnstake = async (pid: number) => {
    if (!chainId || !account) {
      return
    }

    dispatch(setShowConfirm(true))
    dispatch(setAttemptingTxn(true))
    dispatch(setTxHash(''))

    try {
      const txHash = await withdraw(pid, ethers.utils.parseUnits(withdrawValue, staked.decimals), pairSymbol)
      dispatch(setTxHash(txHash))
    } catch (err) {
      console.error(err)
      dispatch(setYieldPoolsError((err as Error).message))
    }

    dispatch(setAttemptingTxn(false))
  }

  const handleHarvest = async (pid: number) => {
    if (!chainId || !account) {
      return
    }

    dispatch(setShowConfirm(true))
    dispatch(setAttemptingTxn(true))
    dispatch(setTxHash(''))

    try {
      const txHash = await harvest(pid, pairSymbol)
      dispatch(setTxHash(txHash))
    } catch (err) {
      console.error(err)
      dispatch(setYieldPoolsError((err as Error).message))
    }

    dispatch(setAttemptingTxn(false))
  }

  const theme = useTheme()

  return breakpoint ? (
    <>
      <TableRow isExpanded={expand} onClick={() => setExpand(!expand)}>
        <DataText grid-area="pools">
          <div>
            <Flex alignItems="center">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={16} margin={true} />
              <span>
                {farm.token0?.symbol} - {farm.token1?.symbol}
              </span>
            </Flex>
            <Text marginLeft="36px" marginTop="4px" color={theme.subText} fontSize={12}>
              AMP = {amp}
            </Text>
          </div>
        </DataText>
        <DataText grid-area="liq">{formattedNum(liquidity.toString(), true)}</DataText>
        <DataText grid-area="end" align="left" style={{ textAlign: 'left' }}>
          {farm.time}
        </DataText>
        <APY grid-area="apy" align="right">
          {apr.toFixed(2)}%
          {apr !== 0 && (
            <InfoHelper
              text={
                tradingFeeAPR < MAX_ALLOW_APY
                  ? t`${tradingFeeAPR.toFixed(2)}% LP Fee + ${farmAPR.toFixed(2)}% Rewards`
                  : `${farmAPR.toFixed(2)}% Rewards`
              }
            />
          )}
        </APY>
        <DataText
          grid-area="reward"
          align="right"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
        >
          {farmRewards.map(reward => {
            return (
              <div key={reward.token.address} style={{ marginTop: '2px' }}>
                <Flex alignItems="center">
                  {getFullDisplayBalance(reward.amount, reward.token.decimals)}
                  {chainId && reward.token.address && (
                    <CurrencyLogo currency={reward.token} size="16px" style={{ marginLeft: '3px' }} />
                  )}
                </Flex>
              </div>
            )
          })}
        </DataText>
        <DataText grid-area="staked_balance" align="right">
          {formattedNum(userStakedBalanceUSD.toString(), true)}
        </DataText>
        <ExpandableSectionButton expanded={expand} />
      </TableRow>

      {expand && (
        <ExpandedSection>
          <ExpandedContent>
            {approvalState === ApprovalState.APPROVED && (
              <StakeGroup>
                <div grid-area="stake">
                  <BalanceInfo>
                    <Text fontSize={12} fontWeight={500}>
                      <Trans>AVAILABLE BALANCE: </Trans>
                    </Text>
                    <GreyText>{formattedNum(userLPBalanceUSD.toString(), true)}</GreyText>
                  </BalanceInfo>
                  <Text textAlign="right" fontSize="0.75rem" color={theme.subText} marginTop="0.25rem">
                    {formatTokenBalance(userToken0Balance)} {farm.token0?.symbol} -{' '}
                    {formatTokenBalance(userToken1Balance)} {farm.token1?.symbol}
                  </Text>
                </div>
                <div grid-area="unstake">
                  <BalanceInfo>
                    <Text fontSize={12} fontWeight={500}>
                      <Trans>STAKED BALANCE: </Trans>
                    </Text>
                    <GreyText>{formattedNum(userStakedBalanceUSD.toString(), true)}</GreyText>
                  </BalanceInfo>
                  <Text textAlign="right" fontSize="0.75rem" color={theme.subText} marginTop="0.25rem">
                    {formatTokenBalance(userStakedToken0Balance)} {farm.token0?.symbol} -{' '}
                    {formatTokenBalance(userStakedToken1Balance)} {farm.token1?.symbol}
                  </Text>
                </div>
                <BalanceInfo grid-area="harvest">
                  <Text fontSize={12} fontWeight={500}>
                    <Trans>REWARD:</Trans>
                  </Text>
                  <GreyText>{rewardUSD ? formattedNum(rewardUSD.toString(), true) : '$0'}</GreyText>
                </BalanceInfo>
              </StakeGroup>
            )}
            <StakeGroup>
              <>
                {approvalState === ApprovalState.UNKNOWN && <Dots></Dots>}
                {(approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) && (
                  <ButtonPrimary
                    color="blue"
                    disabled={approvalState === ApprovalState.PENDING}
                    onClick={approve}
                    padding="12px"
                  >
                    {approvalState === ApprovalState.PENDING ? (
                      <Dots>
                        <Trans>Approving </Trans>
                      </Dots>
                    ) : (
                      <Trans>Approve</Trans>
                    )}
                  </ButtonPrimary>
                )}
                {approvalState === ApprovalState.APPROVED && (
                  <>
                    <AutoRow justify="space-between">
                      {chainId && (
                        <>
                          <CurrencyInputPanel
                            value={depositValue}
                            onUserInput={value => {
                              setDepositValue(value)
                            }}
                            onMax={() => {
                              setDepositValue(fixedFormatting(balance.value, balance.decimals))
                            }}
                            showMaxButton={true}
                            currency={new Token(chainId, farm.id, balance.decimals, `${pairSymbol}`, `${pairSymbol}`)}
                            id="stake-lp-input"
                            disableCurrencySelect
                            positionMax="top"
                            hideLogo={true}
                            fontSize="14px"
                            customCurrencySelect={
                              <ButtonPrimary
                                disabled={isStakeDisabled}
                                padding="8px 12px"
                                width="max-content"
                                style={{ minWidth: '80px' }}
                                onClick={() => handleStake(farm.pid)}
                              >
                                {depositValue && isStakeInvalidAmount ? 'Invalid Amount' : 'Stake'}
                              </ButtonPrimary>
                            }
                          />
                        </>
                      )}
                    </AutoRow>
                    <AutoRow justify="space-between">
                      {chainId && (
                        <>
                          <CurrencyInputPanel
                            value={withdrawValue}
                            onUserInput={value => {
                              setWithdrawValue(value)
                            }}
                            onMax={() => {
                              setWithdrawValue(fixedFormatting(staked.value, staked.decimals))
                            }}
                            showMaxButton={true}
                            currency={new Token(chainId, farm.id, balance.decimals, `${pairSymbol}`, `${pairSymbol}`)}
                            id="unstake-lp-input"
                            disableCurrencySelect
                            customBalanceText={`${fixedFormatting(staked.value, staked.decimals)}`}
                            positionMax="top"
                            hideLogo={true}
                            fontSize="14px"
                            customCurrencySelect={
                              <ButtonPrimary
                                disabled={isUnstakeDisabled}
                                padding="8px 12px"
                                width="max-content"
                                style={{ minWidth: '80px' }}
                                onClick={() => handleUnstake(farm.pid)}
                              >
                                {withdrawValue && isUnstakeInvalidAmount ? 'Invalid Amount' : 'Unstake'}
                              </ButtonPrimary>
                            }
                          />
                        </>
                      )}
                    </AutoRow>

                    <AutoRow justify="space-between" align="flex-start" style={{ flexDirection: 'column' }}>
                      <RewardBalanceWrapper>
                        {farmRewards.map(reward => {
                          return (
                            <div key={reward.token.address}>
                              <Flex alignItems="center">
                                {getFullDisplayBalance(reward.amount, reward.token.decimals)}
                                {chainId && reward.token.address && (
                                  <CurrencyLogo currency={reward.token} size="16px" style={{ marginLeft: '3px' }} />
                                )}
                              </Flex>
                            </div>
                          )
                        })}
                      </RewardBalanceWrapper>
                      <Flex marginTop="1rem" width="100%" sx={{ gap: '12px' }}>
                        <ButtonPrimary
                          disabled={isHarvestDisabled}
                          padding="8px 12px"
                          style={{ flex: 1 }}
                          onClick={() => handleHarvest(farm.pid)}
                        >
                          <Trans>Harvest</Trans>
                        </ButtonPrimary>
                        {!!FARMING_POOLS_CHAIN_STAKING_LINK[farm.id.toLowerCase()] && (
                          <ButtonOutlined
                            style={{ flex: 1 }}
                            padding="8px 12px"
                            as={ExternalLink}
                            href={`${FARMING_POOLS_CHAIN_STAKING_LINK[farm.id.toLowerCase()]}`}
                          >
                            <GetLP style={{ display: '-webkit-inline-box' }}>
                              <Trans>Earn More!</Trans> ↗
                            </GetLP>
                          </ButtonOutlined>
                        )}
                      </Flex>
                    </AutoRow>
                  </>
                )}
              </>
            </StakeGroup>
            <LPInfoAndVestingDurationContainer>
              <LPInfoContainer>
                <ExternalLink
                  href={
                    outsideFarm ? outsideFarm.poolInfoLink : `${DMM_ANALYTICS_URL[chainId as ChainId]}/pool/${farm.id}`
                  }
                >
                  <GetLP>
                    <Trans>Get pool {outsideFarm ? `(${outsideFarm.name})` : ''} info</Trans> ↗
                  </GetLP>
                </ExternalLink>
                {outsideFarm ? (
                  <ExternalLink href={outsideFarm.getLPTokenLink}>
                    <GetLP>
                      <Trans>
                        Get {farm.token0?.symbol}-{farm.token1?.symbol} {outsideFarm ? `(${outsideFarm.name})` : ''} LP
                        ↗
                      </Trans>
                    </GetLP>
                  </ExternalLink>
                ) : (
                  <Link
                    to={`/add/${currencyIdFromAddress(farm.token0?.id, chainId)}/${currencyIdFromAddress(
                      farm.token1?.id,
                      chainId
                    )}/${farm.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <GetLP>
                      <Trans>
                        Get {farm.token0?.symbol}-{farm.token1?.symbol} LP ↗
                      </Trans>
                    </GetLP>
                  </Link>
                )}
              </LPInfoContainer>
              {farm.vestingDuration && (
                <Flex style={{ gap: '4px' }}>
                  <img src={IconLock} alt="icon_lock" />
                  <Text fontSize="14px" color={theme.subText}>
                    {getFormattedTimeFromSecond(farm.vestingDuration, true)}
                  </Text>
                </Flex>
              )}
            </LPInfoAndVestingDurationContainer>
          </ExpandedContent>
        </ExpandedSection>
      )}
    </>
  ) : (
    <>
      <StyledItemCard onClick={() => setExpand(!expand)}>
        <GridItem style={{ gridColumn: '1 / span 2' }}>
          <DataTitle>
            <span>Pool | AMP</span>
            <InfoHelper text={AMP_HINT} size={12} />
          </DataTitle>
          <DataText grid-area="pools">
            <Flex alignItems="center">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={16} margin={true} />
              <span>
                {farm.token0?.symbol} - {farm.token1?.symbol} (AMP = {amp})
              </span>
            </Flex>
          </DataText>

          <span style={{ position: 'absolute', top: '0', right: '0' }}>
            <ExpandableSectionButton expanded={expand} />
          </span>
        </GridItem>

        <GridItem>
          <DataTitle>
            <span>
              <Trans>Staked TVL</Trans>
            </span>
          </DataTitle>
          <DataText grid-area="liq">
            <div>{formattedNum(liquidity.toString(), true)}</div>
          </DataText>
        </GridItem>
        <GridItem>
          <DataTitle>
            <span>
              <Trans>APR</Trans>
            </span>
            <InfoHelper
              text={'Once a farm has ended, you will continue to receive returns through LP Fees'}
              size={12}
            />
          </DataTitle>
          <DataText grid-area="apy">
            <APY grid-area="apy">{apr.toFixed(2)}%</APY>
            {apr !== 0 && <InfoHelper text={t`${tradingFeeAPR.toFixed(2)}% LP Fee + ${farmAPR.toFixed(2)}% Rewards`} />}
          </DataText>
        </GridItem>

        <GridItem>
          <DataTitle>
            <Trans>My Rewards</Trans>
          </DataTitle>
          <DataText style={{ display: 'flex', flexDirection: 'column' }}>
            {farmRewards.map(reward => {
              return (
                <div key={reward.token.address} style={{ marginTop: '2px' }}>
                  <Flex style={{ alignItems: 'center' }}>
                    {getFullDisplayBalance(reward?.amount)}
                    {chainId && reward.token.address && (
                      <CurrencyLogo currency={reward.token} size="20px" style={{ marginLeft: '3px' }} />
                    )}
                  </Flex>
                </div>
              )
            })}
          </DataText>
        </GridItem>

        <GridItem>
          <DataTitle>
            <Trans>My Deposit</Trans>
          </DataTitle>
          <DataText>{formattedNum(userStakedBalanceUSD.toString(), true)}</DataText>
        </GridItem>

        <GridItem noBorder>
          <DataTitle>
            <span>
              <Trans>Ending In</Trans>
            </span>
          </DataTitle>
        </GridItem>

        <GridItem noBorder>
          <DataText>{farm.time}</DataText>
        </GridItem>
      </StyledItemCard>

      {expand && (
        <ExpandedContent>
          <StakeGroup style={{ marginBottom: '14px' }}>
            {approvalState === ApprovalState.UNKNOWN && <Dots></Dots>}
            {(approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) && (
              <div className="px-4">
                <ButtonPrimary color="blue" disabled={approvalState === ApprovalState.PENDING} onClick={approve}>
                  {approvalState === ApprovalState.PENDING ? (
                    <Dots>
                      <Trans>Approving </Trans>
                    </Dots>
                  ) : (
                    <Trans>Approve</Trans>
                  )}
                </ButtonPrimary>
              </div>
            )}
            {approvalState === ApprovalState.APPROVED && (
              <>
                <div grid-area="stake">
                  <BalanceInfo>
                    <Text fontSize={12} fontWeight={500}>
                      <Trans>AVAILABLE BALANCE:</Trans>
                    </Text>
                    <GreyText>{formattedNum(userLPBalanceUSD.toString(), true)}</GreyText>
                  </BalanceInfo>
                  <Text textAlign="right" fontSize="0.75rem" color={theme.subText} marginTop="0.25rem">
                    {formatTokenBalance(userToken0Balance)} {farm.token0?.symbol} -{' '}
                    {formatTokenBalance(userToken1Balance)} {farm.token1?.symbol}
                  </Text>
                </div>
                <AutoRow justify="space-between">
                  {chainId && (
                    <>
                      <CurrencyInputPanel
                        value={depositValue}
                        onUserInput={value => {
                          setDepositValue(value)
                        }}
                        onMax={() => {
                          setDepositValue(fixedFormatting(balance.value, balance.decimals))
                        }}
                        showMaxButton={true}
                        currency={new Token(chainId, farm.id, balance.decimals, `${pairSymbol}`, `${pairSymbol}`)}
                        id="stake-lp-input"
                        disableCurrencySelect
                        positionMax="top"
                        hideLogo={true}
                        fontSize="14px"
                        customCurrencySelect={
                          <ButtonPrimary
                            disabled={isStakeDisabled}
                            padding="8px 12px"
                            width="max-content"
                            style={{ minWidth: '80px' }}
                            onClick={() => handleStake(farm.pid)}
                          >
                            {depositValue && isStakeInvalidAmount ? 'Invalid Amount' : 'Stake'}
                          </ButtonPrimary>
                        }
                      />
                    </>
                  )}
                </AutoRow>
              </>
            )}

            {approvalState === ApprovalState.APPROVED && (
              <>
                <Seperator />
                <div grid-area="unstake">
                  <BalanceInfo>
                    <Text fontSize={12} fontWeight="500">
                      <Trans>STAKED BALANCE: </Trans>
                    </Text>
                    <GreyText>{formattedNum(userStakedBalanceUSD.toString(), true)}</GreyText>
                  </BalanceInfo>

                  <Text textAlign="right" fontSize="0.75rem" color={theme.subText} marginTop="0.25rem">
                    {formatTokenBalance(userStakedToken0Balance)} {farm.token0?.symbol} -{' '}
                    {formatTokenBalance(userStakedToken1Balance)} {farm.token1?.symbol}
                  </Text>
                </div>

                <AutoRow justify="space-between">
                  {chainId && (
                    <>
                      <CurrencyInputPanel
                        value={withdrawValue}
                        onUserInput={value => {
                          setWithdrawValue(value)
                        }}
                        onMax={() => {
                          setWithdrawValue(fixedFormatting(staked.value, staked.decimals))
                        }}
                        showMaxButton={true}
                        currency={new Token(chainId, farm.id, balance.decimals, `${pairSymbol}`, `${pairSymbol}`)}
                        customBalanceText={`${fixedFormatting(staked.value, staked.decimals)}`}
                        positionMax="top"
                        id="unstake-lp-input"
                        disableCurrencySelect
                        hideLogo={true}
                        fontSize="14px"
                        customCurrencySelect={
                          <ButtonPrimary
                            disabled={isUnstakeDisabled}
                            padding="8px 12px"
                            width="max-content"
                            style={{ minWidth: '80px' }}
                            onClick={() => handleUnstake(farm.pid)}
                          >
                            {withdrawValue && isUnstakeInvalidAmount ? 'Invalid Amount' : 'Unstake'}
                          </ButtonPrimary>
                        }
                      />
                    </>
                  )}
                </AutoRow>
              </>
            )}

            {approvalState === ApprovalState.APPROVED && (
              <>
                <Seperator />
                <BalanceInfo grid-area="harvest">
                  <Text fontSize={12} fontWeight={500}>
                    <Trans>REWARD:</Trans>
                  </Text>
                  <GreyText>{rewardUSD ? formattedNum(rewardUSD.toString(), true) : '$0'}</GreyText>
                </BalanceInfo>

                <AutoRow justify="space-between" align="flex-start" style={{ flexDirection: 'column' }}>
                  <RewardBalanceWrapper>
                    {farmRewards?.map(reward => {
                      return (
                        <div key={reward.token.address} style={{ marginTop: '2px' }}>
                          <Flex style={{ alignItems: 'center' }}>
                            {getFullDisplayBalance(reward?.amount)}
                            {chainId && reward.token.address && (
                              <CurrencyLogo currency={reward.token} size="16px" style={{ marginLeft: '3px' }} />
                            )}
                          </Flex>
                        </div>
                      )
                    })}
                  </RewardBalanceWrapper>
                  <Flex marginTop="0.75rem" width="100%" sx={{ gap: '12px' }}>
                    <ButtonPrimary
                      disabled={isHarvestDisabled}
                      padding="8px 12px"
                      style={{ flex: 1 }}
                      onClick={() => handleHarvest(farm.pid)}
                    >
                      <Trans>Harvest</Trans>
                    </ButtonPrimary>
                    {!!FARMING_POOLS_CHAIN_STAKING_LINK[farm.id.toLowerCase()] && (
                      <ButtonOutlined
                        style={{ flex: 1 }}
                        padding="8px 12px"
                        as={ExternalLink}
                        href={`${FARMING_POOLS_CHAIN_STAKING_LINK[farm.id.toLowerCase()]}`}
                      >
                        <GetLP style={{ display: '-webkit-inline-box' }}>
                          <Trans>Earn More!</Trans> ↗
                        </GetLP>
                      </ButtonOutlined>
                    )}
                  </Flex>
                </AutoRow>
              </>
            )}

            <Seperator />
            <LPInfoAndVestingDurationContainer>
              <LPInfoContainer>
                <ExternalLink
                  href={
                    outsideFarm ? outsideFarm.poolInfoLink : `${DMM_ANALYTICS_URL[chainId as ChainId]}/pool/${farm.id}`
                  }
                >
                  <GetLP>
                    <Trans>Get pool {outsideFarm ? `(${outsideFarm.name})` : ''} info</Trans> ↗
                  </GetLP>
                </ExternalLink>
                {outsideFarm ? (
                  <ExternalLink href={outsideFarm.getLPTokenLink}>
                    <GetLP>
                      <Trans>
                        Get {farm.token0?.symbol}-{farm.token1?.symbol} {outsideFarm ? `(${outsideFarm.name})` : ''} LP
                        ↗
                      </Trans>
                    </GetLP>
                  </ExternalLink>
                ) : (
                  <Link
                    to={`/add/${currencyIdFromAddress(farm.token0?.id, chainId)}/${currencyIdFromAddress(
                      farm.token1?.id,
                      chainId
                    )}/${farm.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <GetLP>
                      <Trans>
                        Get {farm.token0?.symbol}-{farm.token1?.symbol} LP ↗
                      </Trans>
                    </GetLP>
                  </Link>
                )}
              </LPInfoContainer>
              {farm.vestingDuration && (
                <Flex style={{ gap: '4px' }}>
                  <img src={IconLock} alt="icon_lock" />
                  <Text fontSize="14px" color={theme.subText}>
                    {getFormattedTimeFromSecond(farm.vestingDuration, true)}
                  </Text>
                </Flex>
              )}
            </LPInfoAndVestingDurationContainer>
          </StakeGroup>
        </ExpandedContent>
      )}
    </>
  )
}

export default ListItem
