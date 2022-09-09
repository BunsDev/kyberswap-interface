import { CurrencyAmount, Token } from '@kyberswap/ks-sdk-core'
import { Pool, Position } from '@kyberswap/ks-sdk-elastic'
import { Trans, t } from '@lingui/macro'
import { BigNumber } from 'ethers'
import { rgba } from 'polished'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit2, Minus, Plus } from 'react-feather'
import { Link } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonLight, ButtonOutlined, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CopyHelper from 'components/Copy'
import CurrencyLogo from 'components/CurrencyLogo'
import Divider from 'components/Divider'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import HoverDropdown from 'components/HoverDropdown'
import HoverInlineText from 'components/HoverInlineText'
import Deposit from 'components/Icons/Deposit'
import Harvest from 'components/Icons/Harvest'
import Withdraw from 'components/Icons/Withdraw'
import InfoHelper from 'components/InfoHelper'
import Modal from 'components/Modal'
import { MouseoverTooltip, MouseoverTooltipDesktopOnly } from 'components/Tooltip'
import { ELASTIC_BASE_FEE_UNIT, ZERO_ADDRESS } from 'constants/index'
import { VERSION } from 'constants/v2'
import { useActiveWeb3React } from 'hooks'
import { useToken, useTokens } from 'hooks/Tokens'
import { useProAmmNFTPositionManagerContract } from 'hooks/useContract'
import useParsedQueryString from 'hooks/useParsedQueryString'
import useTheme from 'hooks/useTheme'
import { Dots } from 'pages/Pool/styleds'
import { useWalletModalToggle } from 'state/application/hooks'
import { useRewardTokenPrices } from 'state/farms/hooks'
import { useFailedNFTs, useFarmAction, useProMMFarmTVL } from 'state/farms/promm/hooks'
import { ProMMFarm } from 'state/farms/promm/types'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'
import { ExternalLink } from 'theme'
import { shortenAddress } from 'utils'
import { getFormattedTimeFromSecond } from 'utils/formatTime'
import { formatDollarAmount } from 'utils/numbers'

import { ModalContentWrapper } from './ProMMFarmModals/styled'
import {
  ActionButton,
  ClickableText,
  InfoRow,
  ProMMFarmTableHeader,
  ProMMFarmTableRow,
  ProMMFarmTableRowMobile,
  RewardMobileArea,
} from './styleds'

const BtnPrimary = styled(ButtonPrimary)`
  font-size: 14px;
  :disabled {
    background: ${({ theme }) => theme.buttonGray};
    cursor: not-allowed;
    opacity: 0.4;
  }
`

const FarmContent = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 20px;
  overflow: hidden;
`

const FarmRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  padding: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  `}
`

const ButtonGroupContainerOnMobile = styled.div`
  display: flex;
  margin-top: 1.25rem;
  gap: 16px;

  /* this is to make sure all buttons (including those with tooltips) take up even space */
  > * {
    flex: 1;
  }
`

const BtnLight = styled(ButtonLight)`
  padding: 8px 12px;
  width: fit-content;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 8px;
  `};
`

const Reward = ({ token: address, amount }: { token: string; amount?: BigNumber }) => {
  const token = useToken(address)

  const tokenAmout = token && CurrencyAmount.fromRawAmount(token, amount?.toString() || '0')

  return (
    <Flex alignItems="center" sx={{ gap: '4px' }}>
      <HoverInlineText text={tokenAmout?.toSignificant(6) || '0'} maxCharacters={10}></HoverInlineText>
      <MouseoverTooltip placement="top" text={token?.symbol} width="fit-content">
        <CurrencyLogo currency={token} size="16px" />
      </MouseoverTooltip>
    </Flex>
  )
}

// const FeeTargetWrapper = styled.div<{ fullUnlock: boolean }>`
//   border-radius: 999px;
//   display: flex;
//   font-size: 12px;
//   background: ${({ theme, fullUnlock }) => (fullUnlock ? theme.primary : theme.subText)};
//   position: relative;
//   color: ${({ theme }) => theme.textReverse};
//   height: 20px;
//   align-items: center;
//   min-width: 120px;
// `

// const FeeArchive = styled.div<{ width: number }>`
//   width: ${({ width }) => `${width}%`};
//   height: 100%;
//   background: ${({ theme, width }) => (width === 100 ? theme.primary : theme.warning)};
//   border-radius: 999px;
// `
// const FeeText = styled.div`
//   position: absolute;
//   left: 50%;
//   transform: translateX(-50%);
// `

// const FeeTarget = ({ percent }: { percent: string }) => {
//   const p = Number(percent) * 100
//   return (
//     <FeeTargetWrapper fullUnlock={Number(percent) >= 1}>
//       <FeeArchive width={p}></FeeArchive>
//       <FeeText>{p.toFixed(2)}%</FeeText>
//     </FeeTargetWrapper>
//   )
// }

const Row = ({
  isApprovedForAll,
  fairlaunchAddress,
  farm,
  onOpenModal,
  onHarvest,
  onUpdateDepositedInfo,
  isUserAffectedByFarmIssue,
}: {
  isUserAffectedByFarmIssue: boolean
  isApprovedForAll: boolean
  fairlaunchAddress: string
  farm: ProMMFarm
  onOpenModal: (modalType: 'deposit' | 'withdraw' | 'stake' | 'unstake', pid?: number) => void
  onHarvest: () => void
  onUpdateDepositedInfo: (input: {
    poolAddress: string
    usdValue: number
    token0Amount: CurrencyAmount<Token>
    token1Amount: CurrencyAmount<Token>
  }) => void
}) => {
  const theme = useTheme()
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const above1000 = useMedia('(min-width: 1000px)')
  const qs = useParsedQueryString()
  const tab = qs.type || 'active'

  const token0 = useToken(farm.token0)
  const token1 = useToken(farm.token1)

  const { tvl, farmAPR, poolAPY } = useProMMFarmTVL(fairlaunchAddress, farm.pid)

  const prices = useRewardTokenPrices([token0?.wrapped, token1?.wrapped], VERSION.ELASTIC)

  const pool = useMemo(() => {
    if (token0 && token1)
      return new Pool(
        token0.wrapped,
        token1.wrapped,
        farm.feeTier,
        farm.sqrtP.toString(),
        farm.baseL.toString(),
        farm.reinvestL.toString(),
        farm.currentTick,
      )
    return null
  }, [token0, token1, farm])

  const position: {
    token0Amount: CurrencyAmount<Token>
    token1Amount: CurrencyAmount<Token>
    amountUsd: number
    rewardAmounts: BigNumber[]
    token0Staked: CurrencyAmount<Token>
    token1Staked: CurrencyAmount<Token>
    stakedUsd: number
  } | null = useMemo(() => {
    if (pool && token0 && token1) {
      let token0Amount = CurrencyAmount.fromRawAmount(token0.wrapped, '0')
      let token1Amount = CurrencyAmount.fromRawAmount(token1.wrapped, '0')

      let token0Staked = CurrencyAmount.fromRawAmount(token0.wrapped, '0')
      let token1Staked = CurrencyAmount.fromRawAmount(token1.wrapped, '0')

      const rewardAmounts = farm.rewardTokens.map(_item => BigNumber.from('0'))

      farm.userDepositedNFTs.forEach(item => {
        const pos = new Position({
          pool,
          liquidity: item.liquidity.toString(),
          tickLower: item.tickLower,
          tickUpper: item.tickUpper,
        })

        token0Amount = token0Amount.add(pos.amount0)
        token1Amount = token1Amount.add(pos.amount1)

        item.rewardPendings.forEach((rw, index) => (rewardAmounts[index] = rewardAmounts[index].add(rw)))
      })

      const amount0Usd = prices[0] * parseFloat(token0Amount.toExact())
      const amount1Usd = prices[1] * parseFloat(token1Amount.toExact())

      farm.userDepositedNFTs.forEach(item => {
        const pos = new Position({
          pool,
          liquidity: item.stakedLiquidity.toString(),
          tickLower: item.tickLower,
          tickUpper: item.tickUpper,
        })

        token0Staked = token0Staked.add(pos.amount0)
        token1Staked = token1Staked.add(pos.amount1)
      })

      const amount0StakedUsd = prices[0] * parseFloat(token0Staked.toExact())
      const amount1StakedUsd = prices[1] * parseFloat(token1Staked.toExact())

      return {
        token1Amount,
        amountUsd: amount0Usd + amount1Usd,
        token0Amount,
        rewardAmounts,
        token0Staked,
        token1Staked,
        stakedUsd: amount0StakedUsd + amount1StakedUsd,
      }
    }
    return null
  }, [pool, token0, token1, prices, farm])

  const canHarvest = farm.userDepositedNFTs.some(pos => !!pos.rewardPendings.length)
  const canUnstake = farm.userDepositedNFTs.some(pos => pos.stakedLiquidity.gt(0))
  const isFarmStarted = farm.startTime <= currentTimestamp

  useEffect(() => {
    if (position)
      onUpdateDepositedInfo({
        poolAddress: farm.poolAddress,
        usdValue: position.amountUsd || 0,
        token0Amount: position.token0Amount,
        token1Amount: position.token1Amount,
      })
  }, [position, farm.poolAddress, onUpdateDepositedInfo])

  // TODO: this is temporary hide target volume, an ad-hoc request from Product team. will enable soon if we have this kind of farm

  // const contract = useProMMFarmContract(fairlaunchAddress)

  // const [targetPercent, setTargetPercent] = useState('')
  // const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   const getFeeTargetInfos = async () => {
  //     if (!contract) return
  //     setLoading(true)
  //     const res = await Promise.all(
  //       farm.userDepositedNFTs.map(async pos => {
  //         const res = await contract.getRewardCalculationData(pos.tokenId, farm.pid)
  //         return new Fraction(res.vestingVolume.toString(), BigNumber.from(1e12).toString())
  //       }),
  //     )

  //     const totalLiquidity = farm.userDepositedNFTs.reduce(
  //       (acc, cur) => acc.add(cur.stakedLiquidity),
  //       BigNumber.from(0),
  //     )
  //     const targetLiqid = farm.userDepositedNFTs.reduce(
  //       (acc, cur, index) => acc.add(res[index].multiply(cur.stakedLiquidity.toString())),
  //       new Fraction(0, 1),
  //     )

  //     if (totalLiquidity.gt(0)) {
  //       const targetPercent = targetLiqid.divide(totalLiquidity.toString())
  //       setTargetPercent(targetPercent.toFixed(2))
  //     }
  //     setLoading(false)
  //   }
  //   getFeeTargetInfos()
  // }, [contract, farm])

  const [showTargetVolInfo, setShowTargetVolInfo] = useState(false)

  const amountCanStaked = (position?.amountUsd || 0) - (position?.stakedUsd || 0)

  if (!above1000) {
    const renderStakeButtonOnMobile = () => {
      if (isUserAffectedByFarmIssue) {
        return (
          <MouseoverTooltip
            text={t`This farm is currently under maintenance. You can deposit your liquidity into the new farms instead. Your withdrawals are not affected.`}
            placement="top"
            width="300px"
          >
            <ButtonPrimary
              style={{
                cursor: 'not-allowed',
                backgroundColor: theme.buttonGray,
                color: theme.border,
                height: '36px',
                width: '100%',
              }}
            >
              <Text fontSize={14}>
                <Trans>Stake</Trans>
              </Text>
            </ButtonPrimary>
          </MouseoverTooltip>
        )
      }

      return (
        <ButtonPrimary
          disabled={!isApprovedForAll || tab === 'ended' || !isFarmStarted}
          style={{ height: '36px', flex: 1 }}
          onClick={() => onOpenModal('stake', farm.pid)}
        >
          <Text fontSize={14}>
            <Trans>Stake</Trans>
          </Text>
        </ButtonPrimary>
      )
    }

    return (
      <>
        <Modal onDismiss={() => setShowTargetVolInfo(false)} isOpen={showTargetVolInfo}>
          <ModalContentWrapper>
            <Text fontSize="12px" marginBottom="24px" lineHeight={1.5}>
              <Trans>
                Some farms have a target trading volume (represented by the progress bar) that your liquidity positions
                need to fully unlock to start earning maximum farming rewards. This target volume ensures that your
                liquidity positions are supporting the pools trading volume.
                <br />
                <br />
                Based on the progress of your target volume, you will still earn partial farming rewards. But once you
                fully unlock your target volume, your liquidity position(s) will start earning maximum rewards.
                Adjusting your liquidity position(s) staked in the farm will recalculate this volume target.
              </Trans>
            </Text>

            <ButtonPrimary
              as={ExternalLink}
              href="https://docs.kyberswap.com/guides/farming-mechanisms"
              style={{ color: theme.textReverse }}
            >
              <Trans>Learn More</Trans>
            </ButtonPrimary>
          </ModalContentWrapper>
        </Modal>

        <ProMMFarmTableRowMobile>
          <Flex alignItems="center" marginBottom="20px">
            <DoubleCurrencyLogo currency0={token0} currency1={token1} size={20} />
            <Text fontSize={20} fontWeight="500">
              {token0?.symbol} - {token1?.symbol}
            </Text>

            {/* farm.startTime > currentTimestamp && (
              <MouseoverTooltip
                text={'Starting In ' + getFormattedTimeFromSecond(farm.startTime - currentTimestamp)}
                width="fit-content"
                placement="top"
              >
                <Clock size={14} style={{ marginLeft: '6px' }} />
              </MouseoverTooltip>
             ) */}
          </Flex>

          <Flex
            marginTop="0.5rem"
            alignItems="center"
            sx={{ gap: '4px' }}
            fontSize="12px"
            color={theme.subText}
            width="max-content"
          >
            <Text>Fee = {(farm.feeTier * 100) / ELASTIC_BASE_FEE_UNIT}%</Text>
            <Text color={theme.subText}>|</Text>

            <Flex alignItems="center">
              <Text>{shortenAddress(farm.poolAddress, 2)}</Text>
              <CopyHelper toCopy={farm.poolAddress} />
            </Flex>
          </Flex>

          {/*
          <InfoRow>
            <Text color={theme.subText} display="flex" sx={{ gap: '4px' }} onClick={() => setShowTargetVolInfo(true)}>
              <Trans>Target volume</Trans>
              <Info size={12} />
            </Text>
            {farm.feeTarget.gt(0) ? loading ? <Loader /> : <FeeTarget percent={targetPercent} /> : '--'}
          </InfoRow>
          */}

          <InfoRow>
            <Text color={theme.subText}>
              <Trans>Staked TVL</Trans>
            </Text>
            <Text>{formatDollarAmount(tvl)}</Text>
          </InfoRow>

          <InfoRow>
            <Text color={theme.subText}>
              <Trans>AVG APR</Trans>
              <InfoHelper
                text={
                  qs.type === 'active'
                    ? t`Average estimated return based on yearly fees and bonus rewards of the pool`
                    : t`Average estimated return based on yearly fees of the pool plus bonus rewards from the farm`
                }
              />
            </Text>
            <Text color={theme.apr}>
              {(farmAPR + poolAPY).toFixed(2)}%
              <InfoHelper text={`${poolAPY.toFixed(2)}% Fee + ${farmAPR.toFixed(2)}% Rewards`} />
            </Text>
          </InfoRow>

          <InfoRow>
            <Text color={theme.subText}>
              <Trans>Vesting</Trans>
              <InfoHelper
                text={t`After harvesting, your rewards will unlock linearly over the indicated time period`}
              />
            </Text>
            <Text>{getFormattedTimeFromSecond(farm.vestingDuration, true)}</Text>
          </InfoRow>

          <InfoRow>
            <Text color={theme.subText}>
              <Trans>Ending In</Trans>
              <InfoHelper text={t`Once a farm has ended, you will continue to receive returns through LP Fees`} />
            </Text>

            <Flex flexDirection="column" alignItems="flex-end" justifyContent="center" sx={{ gap: '8px' }}>
              {farm.startTime > currentTimestamp ? (
                <>
                  <Text color={theme.subText} fontSize="12px">
                    <Trans>New phase will start in</Trans>
                  </Text>
                  {getFormattedTimeFromSecond(farm.startTime - currentTimestamp)}
                </>
              ) : farm.endTime > currentTimestamp ? (
                <>
                  <Text color={theme.subText} fontSize="12px">
                    <Trans>Current phase will end in</Trans>
                  </Text>
                  {getFormattedTimeFromSecond(farm.endTime - currentTimestamp)}
                </>
              ) : (
                <Trans>ENDED</Trans>
              )}
            </Flex>
          </InfoRow>

          <InfoRow>
            <Text color={theme.subText}>
              <Trans>My Deposit</Trans>
            </Text>

            <Flex justifyContent="flex-end" color={!!amountCanStaked ? theme.warning : theme.text}>
              {!!position?.amountUsd ? formatDollarAmount(position.amountUsd) : '--'}
              {!!amountCanStaked && (
                <InfoHelper
                  color={theme.warning}
                  text={t`You still have ${formatDollarAmount(
                    amountCanStaked,
                  )} liquidity to stake to earn more rewards`}
                />
              )}
            </Flex>
          </InfoRow>

          <InfoRow>
            <Text color={theme.subText}>
              <Trans>My Rewards</Trans>
            </Text>
          </InfoRow>

          <RewardMobileArea>
            <Flex justifyContent="center" alignItems="center" marginBottom="8px" sx={{ gap: '4px' }}>
              {farm.rewardTokens.map((token, idx) => {
                return (
                  <React.Fragment key={token}>
                    <Reward key={token} token={token} amount={position?.rewardAmounts[idx]} />
                    {idx !== farm.rewardTokens.length - 1 && <Text color={theme.subText}>|</Text>}
                  </React.Fragment>
                )
              })}
            </Flex>

            <ButtonLight onClick={onHarvest} disabled={!canHarvest} style={{ height: '32px' }}>
              <Harvest color={theme.primary} />{' '}
              <Text marginLeft="8px" fontSize="14px">
                <Trans>Harvest</Trans>
              </Text>
            </ButtonLight>
          </RewardMobileArea>

          <ButtonGroupContainerOnMobile>
            {renderStakeButtonOnMobile()}
            <ButtonOutlined
              style={{ height: '36px', flex: 1 }}
              onClick={() => onOpenModal('unstake', farm.pid)}
              disabled={!canUnstake}
            >
              <Text fontSize={14}>
                <Trans>Unstake</Trans>
              </Text>
            </ButtonOutlined>
          </ButtonGroupContainerOnMobile>
        </ProMMFarmTableRowMobile>
      </>
    )
  }

  const renderStakeButton = () => {
    if (isUserAffectedByFarmIssue) {
      return (
        <MouseoverTooltip
          text={t`This farm is currently under maintenance. You can deposit your liquidity into the new farms instead. Your withdrawals are not affected.`}
          placement="top"
          width="300px"
        >
          <ActionButton
            style={{
              cursor: 'not-allowed',
              backgroundColor: theme.buttonGray,
              opacity: 0.4,
            }}
          >
            <Plus color={theme.subText} size={16} style={{ minWidth: '16px' }} />
          </ActionButton>
        </MouseoverTooltip>
      )
    }

    return !isApprovedForAll || tab === 'ended' || !isFarmStarted ? (
      <MouseoverTooltip text={!isFarmStarted ? t`Farm has not started` : ''} placement="top" width="fit-content">
        <ActionButton
          style={{
            cursor: 'not-allowed',
            backgroundColor: theme.buttonGray,
            opacity: 0.4,
          }}
        >
          <Plus color={theme.subText} size={16} style={{ minWidth: '16px' }} />
        </ActionButton>
      </MouseoverTooltip>
    ) : (
      <ActionButton onClick={() => onOpenModal('stake', farm.pid)}>
        <MouseoverTooltip text={t`Stake`} placement="top" width="fit-content">
          <Plus color={theme.primary} size={16} />
        </MouseoverTooltip>
      </ActionButton>
    )
  }

  return (
    <ProMMFarmTableRow>
      <div>
        <Flex alignItems="center">
          <DoubleCurrencyLogo currency0={token0} currency1={token1} />
          <Link
            to={`/pools?search=${farm.poolAddress}&tab=elastic`}
            style={{
              textDecoration: 'none',
            }}
          >
            <Text fontSize={14} fontWeight={500}>
              {token0?.symbol} - {token1?.symbol}
            </Text>
          </Link>
        </Flex>

        <Flex
          marginTop="0.5rem"
          alignItems="center"
          sx={{ gap: '3px' }}
          fontSize="12px"
          color={theme.subText}
          width="max-content"
        >
          <Text>Fee = {(farm.feeTier * 100) / ELASTIC_BASE_FEE_UNIT}%</Text>
          <Text color={theme.subText}>|</Text>

          <Flex alignItems="center">
            <Text>{shortenAddress(farm.poolAddress, 2)}</Text>
            <CopyHelper toCopy={farm.poolAddress} />
          </Flex>
        </Flex>
      </div>
      {/*
        {farm.feeTarget.gt(0) ? loading ? <Loader /> : <FeeTarget percent={targetPercent} /> : '--'}
        */}
      <Text textAlign="right">{formatDollarAmount(tvl)}</Text>
      <Text textAlign="end" color={theme.apr}>
        {(farmAPR + poolAPY).toFixed(2)}%
        <InfoHelper text={`${poolAPY.toFixed(2)}% Fee + ${farmAPR.toFixed(2)}% Rewards`} />
      </Text>
      {/*<Text textAlign="end">{getFormattedTimeFromSecond(farm.vestingDuration, true)}</Text>*/}
      <Flex flexDirection="column" alignItems="flex-end" justifyContent="center" sx={{ gap: '8px' }}>
        {farm.startTime > currentTimestamp ? (
          <>
            <Text color={theme.subText} fontSize="12px">
              <Trans>New phase will start in</Trans>
            </Text>
            {getFormattedTimeFromSecond(farm.startTime - currentTimestamp)}
          </>
        ) : farm.endTime > currentTimestamp ? (
          <>
            <Text color={theme.subText} fontSize="12px">
              <Trans>Current phase will end in</Trans>
            </Text>
            {getFormattedTimeFromSecond(farm.endTime - currentTimestamp)}
          </>
        ) : (
          <Trans>ENDED</Trans>
        )}
      </Flex>

      <Flex justifyContent="flex-end" color={!!amountCanStaked ? theme.warning : theme.text}>
        {!!position?.amountUsd ? formatDollarAmount(position.amountUsd) : '--'}
        {!!amountCanStaked && (
          <InfoHelper
            color={theme.warning}
            text={t`You still have ${formatDollarAmount(amountCanStaked)} liquidity to stake to earn more rewards`}
          />
        )}
      </Flex>

      <Flex flexDirection="column" alignItems="flex-end" sx={{ gap: '8px' }}>
        {farm.rewardTokens.map((token, idx) => (
          <Reward key={token} token={token} amount={position?.rewardAmounts[idx]} />
        ))}
      </Flex>
      <Flex justifyContent="flex-end" sx={{ gap: '4px' }}>
        {renderStakeButton()}

        <ActionButton
          disabled={!canUnstake}
          backgroundColor={theme.subText + '33'}
          onClick={() => onOpenModal('unstake', farm.pid)}
        >
          <MouseoverTooltip text={t`Unstake`} placement="top" width="fit-content">
            <Minus color={theme.subText} size={16} />
          </MouseoverTooltip>
        </ActionButton>

        <ActionButton backgroundColor={theme.buttonBlack + '66'} onClick={onHarvest} disabled={!canHarvest}>
          <MouseoverTooltip text={t`Harvest`} placement="top" width="fit-content">
            <Harvest color={theme.subText} />
          </MouseoverTooltip>
        </ActionButton>
      </Flex>
    </ProMMFarmTableRow>
  )
}

function ProMMFarmGroup({
  address,
  onOpenModal,
  farms,
}: {
  address: string
  onOpenModal: (
    modalType: 'forcedWithdraw' | 'harvest' | 'deposit' | 'withdraw' | 'stake' | 'unstake',
    pid?: number,
  ) => void
  farms: ProMMFarm[]
}) {
  const theme = useTheme()
  const { account } = useActiveWeb3React()
  const above768 = useMedia('(min-width: 768px)')
  const above1000 = useMedia('(min-width: 1000px)')

  const [userPoolFarmInfo, setUserPoolFarmInfo] = useState<{
    [pid: number]: {
      usdValue: number
      token0Amount: CurrencyAmount<Token>
      token1Amount: CurrencyAmount<Token>
    }
  }>({})

  const rewardAddresses = useMemo(() => {
    const rws = farms.reduce((acc, cur) => [...acc, ...cur.rewardTokens], [] as string[])
    return [...new Set(rws)]
  }, [farms])

  const rwTokenMap = useTokens(rewardAddresses)

  const rwTokens = useMemo(() => Object.values(rwTokenMap), [rwTokenMap])
  const prices = useRewardTokenPrices(rwTokens, VERSION.ELASTIC)

  const priceMap: { [key: string]: number } = useMemo(
    () =>
      prices?.reduce(
        (acc, cur, index) => ({
          ...acc,
          [rwTokens[index]?.isToken ? rwTokens[index].address : ZERO_ADDRESS]: cur,
        }),
        {},
      ),
    [prices, rwTokens],
  )

  const totalUserReward: { totalUsdValue: number; amounts: CurrencyAmount<Token>[] } = useMemo(() => {
    const temp: { [address: string]: BigNumber } = {}
    farms.forEach(farm => {
      const tks = farm.rewardTokens

      farm.userDepositedNFTs.forEach(pos => {
        pos.rewardPendings.forEach((amount, index) => {
          const tkAddress = tks[index]
          if (temp[tkAddress]) temp[tkAddress] = temp[tkAddress].add(amount)
          else temp[tkAddress] = amount
        })
      })
    })

    let usd = 0
    const amounts: CurrencyAmount<Token>[] = []

    Object.keys(temp).forEach((key: string) => {
      const token = rwTokenMap[key]
      const price = priceMap[key]

      if (token) {
        const amount = CurrencyAmount.fromRawAmount(token, temp[key].toString())
        usd += price * parseFloat(amount.toExact())
        if (amount.greaterThan(0)) amounts.push(amount)
      }
    })

    return {
      totalUsdValue: usd,
      amounts,
    }
  }, [farms, rwTokenMap, priceMap])

  const depositedUsd = Object.values(userPoolFarmInfo).reduce((acc, cur) => acc + cur.usdValue, 0)

  const userDepositedTokenAmounts = Object.values(userPoolFarmInfo).reduce<{
    [address: string]: CurrencyAmount<Token>
  }>((result, info) => {
    const address0 = info.token0Amount.currency.address
    const address1 = info.token1Amount.currency.address

    if (!result[address0]) result[address0] = info.token0Amount
    else result[address0] = result[address0].add(info.token0Amount)

    if (!result[address1]) result[address1] = info.token1Amount
    else result[address1] = result[address1].add(info.token1Amount)

    return result
  }, {})

  const failedNFTs = useFailedNFTs()
  const userNFTs = farms.map(farm => farm.userDepositedNFTs.map(item => item.tokenId.toString())).flat()
  const hasAffectedByFarmIssue = userNFTs.some(id => failedNFTs.includes(id))

  const toggleWalletModal = useWalletModalToggle()
  const posManager = useProAmmNFTPositionManagerContract()

  const res = useSingleCallResult(posManager, 'isApprovedForAll', [account || ZERO_ADDRESS, address])
  const isApprovedForAll = res?.result?.[0]

  const { approve } = useFarmAction(address)
  const [approvalTx, setApprovalTx] = useState('')

  const isApprovalTxPending = useIsTransactionPending(approvalTx)

  const handleApprove = async () => {
    if (!isApprovedForAll) {
      const tx = await approve()
      setApprovalTx(tx)
    }
  }

  const aggregateDepositedInfo = useCallback(
    ({
      poolAddress,
      usdValue,
      token0Amount,
      token1Amount,
    }: {
      poolAddress: string | number
      usdValue: number
      token0Amount: CurrencyAmount<Token>
      token1Amount: CurrencyAmount<Token>
    }) => {
      setUserPoolFarmInfo(prev => ({
        ...prev,
        [poolAddress]: {
          usdValue,
          token0Amount,
          token1Amount,
        },
      }))
    },
    [],
  )

  const qs = useParsedQueryString()
  const tab = qs.type || 'active'

  if (!farms) return null

  const canHarvest = farms.some(farm => farm.userDepositedNFTs.some(pos => !!pos.rewardPendings.length))
  const canWithdraw = farms.some(farms => farms.userDepositedNFTs.length)

  const renderDepositButton = () => {
    if (!isApprovedForAll || tab === 'ended') {
      return (
        <BtnLight disabled>
          <Deposit width={20} height={20} />
          {above768 && (
            <Text fontSize="14px" marginLeft="4px">
              <Trans>Deposit</Trans>
            </Text>
          )}
        </BtnLight>
      )
    }

    return (
      <MouseoverTooltip text={t`Deposit your liquidity (the NFT tokens that represent your liquidity position)`}>
        <BtnLight onClick={() => onOpenModal('deposit')} disabled={tab === 'ended'}>
          <Deposit width={20} height={20} />
          {above768 && (
            <Text fontSize="14px" marginLeft="4px">
              <Trans>Deposit</Trans>
            </Text>
          )}
        </BtnLight>
      </MouseoverTooltip>
    )
  }

  const renderWithdrawButton = () => {
    if (!canWithdraw || !isApprovedForAll) {
      return (
        <ButtonOutlined padding={above768 ? '8px 12px' : '8px'} disabled>
          <Withdraw width={20} height={20} />
          {above768 && (
            <Text fontSize="14px" marginLeft="4px">
              <Trans>Withdraw</Trans>
            </Text>
          )}
        </ButtonOutlined>
      )
    }

    return (
      <MouseoverTooltipDesktopOnly
        text={t`Withdraw your liquidity (the NFT tokens that represent your liquidity position)`}
      >
        <ButtonOutlined padding={above768 ? '8px 12px' : '8px'} onClick={() => onOpenModal('withdraw')}>
          <Withdraw width={20} height={20} />
          {above768 && (
            <Text fontSize="14px" marginLeft="4px">
              <Trans>Withdraw</Trans>
            </Text>
          )}
        </ButtonOutlined>
      </MouseoverTooltipDesktopOnly>
    )
  }

  const renderForceWithdrawButton = () => {
    if (hasAffectedByFarmIssue && above768) {
      return (
        <BtnPrimary
          style={{ color: theme.red, border: `1px solid ${theme.red}`, background: theme.red + '33' }}
          width="fit-content"
          padding={above768 ? '8px 12px' : '8px'}
          onClick={() => onOpenModal('forcedWithdraw')}
        >
          <Withdraw width={20} height={20} />
          <Text fontSize="14px" marginLeft="4px">
            <Trans>Force Withdraw</Trans>
          </Text>
        </BtnPrimary>
      )
    }

    return null
  }

  const renderTopButtons = () => {
    if (!account) {
      return (
        <BtnLight onClick={toggleWalletModal}>
          <Trans>Connect Wallet</Trans>
        </BtnLight>
      )
    }

    if (!isApprovedForAll && res?.loading) {
      return <Dots />
    }

    return (
      <Flex sx={{ gap: '12px' }} alignItems="center">
        {isApprovedForAll ? null : (
          <BtnLight onClick={handleApprove} disabled={isApprovalTxPending || tab === 'ended'}>
            <Edit2 size={16} />
            <Text fontSize="14px" marginLeft="4px">
              {approvalTx && isApprovalTxPending ? (
                <Dots>
                  <Trans>Approving</Trans>
                </Dots>
              ) : (
                <Trans>Approve</Trans>
              )}
            </Text>
          </BtnLight>
        )}
        {(!!isApprovedForAll || above768) && (
          <>
            {renderDepositButton()}
            {renderWithdrawButton()}
          </>
        )}
        {renderForceWithdrawButton()}
      </Flex>
    )
  }

  return (
    <FarmContent>
      {above1000 && (
        <ProMMFarmTableHeader>
          <Flex grid-area="token_pairs" alignItems="center" justifyContent="flex-start">
            <ClickableText>
              <Trans>Pool</Trans>
            </ClickableText>
          </Flex>

          <Flex grid-area="liq" alignItems="center" justifyContent="flex-end">
            <ClickableText>
              <Trans>Staked TVL</Trans>
            </ClickableText>
          </Flex>

          <Flex grid-area="apy" alignItems="center" justifyContent="flex-end">
            <ClickableText>
              <Trans>AVG APR</Trans>
            </ClickableText>
            <InfoHelper
              text={t`Average estimated return based on yearly fees of the pool and if it's still active, plus bonus rewards of the pool`}
            />
          </Flex>

          <Flex grid-area="end" alignItems="center" justifyContent="flex-end">
            <ClickableText>
              <Trans>Ending In</Trans>
            </ClickableText>
            <InfoHelper text={t`Once a farm has ended, you will continue to receive returns through LP Fees`} />
          </Flex>

          <Flex grid-area="staked_balance" alignItems="center" justifyContent="flex-end">
            <ClickableText>
              <Trans>My Deposit</Trans>
            </ClickableText>
          </Flex>

          <Flex grid-area="reward" alignItems="center" justifyContent="flex-end">
            <ClickableText>
              <Trans>My Rewards</Trans>
            </ClickableText>
          </Flex>

          <Flex grid-area="action" alignItems="center" justifyContent="flex-end">
            <ClickableText>
              <Trans>Actions</Trans>
            </ClickableText>
          </Flex>
        </ProMMFarmTableHeader>
      )}

      <FarmRow>
        {hasAffectedByFarmIssue && !above768 && (
          <BtnPrimary
            style={{ color: theme.red, border: `1px solid ${theme.red}`, background: theme.red + '33' }}
            padding={'12px'}
            onClick={() => onOpenModal('forcedWithdraw')}
          >
            <Withdraw width={20} height={20} />
            <Text fontSize="14px" marginLeft="4px">
              <Trans>Force Withdraw</Trans>
            </Text>
          </BtnPrimary>
        )}

        <Flex
          sx={{ gap: '20px' }}
          alignItems="center"
          justifyContent={above768 ? 'flex-start' : 'space-between'}
          width={above768 ? undefined : '100%'}
        >
          <Flex flexDirection="column">
            <Text fontSize="12px" color={theme.subText}>
              <Trans>Deposited Liquidity</Trans>
              <InfoHelper
                text={t`Total value of the liquidity positions you've deposited. NFT tokens represent your liquidity positions`}
              ></InfoHelper>
            </Text>

            <HoverDropdown
              style={{ padding: '8px 0' }}
              content={formatDollarAmount(depositedUsd)}
              dropdownContent={
                Object.values(userDepositedTokenAmounts).some(amount => amount.greaterThan(0)) ? (
                  <AutoColumn gap="sm">
                    {Object.values(userDepositedTokenAmounts).map(
                      amount =>
                        amount.greaterThan(0) && (
                          <Flex alignItems="center" key={amount.currency.address}>
                            <CurrencyLogo currency={amount.currency} size="16px" />
                            <Text fontSize="12px" marginLeft="4px">
                              {amount.toSignificant(8)}
                            </Text>
                          </Flex>
                        ),
                    )}
                  </AutoColumn>
                ) : (
                  ''
                )
              }
            />
          </Flex>

          {renderTopButtons()}
        </Flex>

        {!above768 && <Divider style={{ width: '100%' }} />}

        <Flex
          alignItems="center"
          sx={{ gap: '24px' }}
          justifyContent={above768 ? 'flex-start' : 'space-between'}
          width={above768 ? undefined : '100%'}
        >
          <Flex flexDirection="column">
            <Text fontSize="12px" color={theme.subText}>
              <Trans>My Total Rewards</Trans>
            </Text>

            <HoverDropdown
              style={{ padding: '8px 0' }}
              content={formatDollarAmount(totalUserReward.totalUsdValue)}
              dropdownContent={
                totalUserReward.amounts.length ? (
                  <AutoColumn gap="sm">
                    {totalUserReward.amounts.map(
                      amount =>
                        amount.greaterThan(0) && (
                          <Flex alignItems="center" key={amount.currency.address}>
                            <CurrencyLogo currency={amount.currency} size="16px" />
                            <Text fontSize="12px" marginLeft="4px">
                              {amount.toSignificant(8)}
                            </Text>
                          </Flex>
                        ),
                    )}
                  </AutoColumn>
                ) : (
                  ''
                )
              }
            />
          </Flex>

          <BtnPrimary
            padding="10px 12px"
            width="fit-content"
            onClick={() => onOpenModal('harvest')}
            disabled={!canHarvest}
          >
            <Harvest />
            <Text marginLeft="4px">
              <Trans>Harvest All</Trans>
            </Text>
          </BtnPrimary>
        </Flex>
      </FarmRow>
      <Divider />

      {farms.map((farm, index) => {
        return (
          <Row
            isUserAffectedByFarmIssue={hasAffectedByFarmIssue}
            isApprovedForAll={isApprovedForAll}
            farm={farm}
            key={farm.poolAddress + '_' + index}
            onOpenModal={onOpenModal}
            onUpdateDepositedInfo={aggregateDepositedInfo}
            fairlaunchAddress={address}
            onHarvest={() => {
              onOpenModal('harvest', farm.pid)
            }}
          />
        )
      })}
    </FarmContent>
  )
}

export default ProMMFarmGroup
