import React, { useRef, useState } from 'react'
import { CampaignData, CampaignLeaderboardReward } from 'state/campaigns/actions'
import { t } from '@lingui/macro'
import { ReactComponent as ChevronDown } from 'assets/svg/down.svg'
import styled, { css } from 'styled-components'
import useTheme from 'hooks/useTheme'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { OptionsContainer } from 'pages/TrueSight/styled'
import { ChainId } from '@kyberswap/ks-sdk-core'
import { NETWORKS_INFO } from 'constants/networks'
import { Flex, Text } from 'rebass'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import { useActiveWeb3React } from 'hooks'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useTransactionAdder } from 'state/transactions/hooks'
import useSendTransactionCallback from 'hooks/useSendTransactionCallback'
import axios from 'axios'
import { BigNumber } from '@ethersproject/bignumber'
import { useActiveNetwork } from 'hooks/useActiveNetwork'
import { ButtonPrimary } from 'components/Button'
import { BIG_INT_ZERO, DEFAULT_SIGNIFICANT } from 'constants/index'

export default function CampaignButtonWithOptions({
  campaign,
  disabled = false,
  type,
}: {
  campaign: CampaignData | undefined
  disabled?: boolean
  type: 'enter_now' | 'claim_rewards'
}) {
  const theme = useTheme()
  const [isShowNetworks, setIsShowNetworks] = useState(false)
  const { changeNetwork } = useActiveNetwork()
  const containerRef = useRef<HTMLButtonElement>(null)
  useOnClickOutside(containerRef, () => setIsShowNetworks(false))
  const { mixpanelHandler } = useMixpanel()

  const chainIds: ChainId[] = campaign
    ? campaign[type === 'enter_now' ? 'chainIds' : 'rewardChainIds'].split(',').map(Number)
    : []

  const { account, library } = useActiveWeb3React()

  const selectedCampaign = useSelector((state: AppState) => state.campaigns.selectedCampaign)
  const selectedCampaignLeaderboard = useSelector((state: AppState) => state.campaigns.selectedCampaignLeaderboard)

  const addTransactionWithType = useTransactionAdder()
  const sendTransaction = useSendTransactionCallback()
  const claimRewards = async (claimChainId: ChainId) => {
    if (!account || !library || !selectedCampaign || !selectedCampaignLeaderboard) return

    const url = process.env.REACT_APP_REWARD_SERVICE_API + '/rewards/claim'

    const refs: string[] = []
    if (selectedCampaignLeaderboard && selectedCampaignLeaderboard.rewards) {
      selectedCampaignLeaderboard.rewards.forEach(reward => {
        if (!reward.claimed && reward.rewardAmount.greaterThan(BIG_INT_ZERO)) {
          refs.push(reward.ref)
        }
      })
    }
    const data = {
      wallet: account.toLowerCase(),
      chainId: selectedCampaign.rewardChainIds,
      clientCode: 'campaign',
      ref: refs.join(','),
    }
    let response: any
    try {
      response = await axios({
        method: 'POST',
        url,
        data,
      })
    } catch (err) {
      console.error(err)
    }

    if (response?.data?.code === 200000) {
      const rewardContractAddress = response.data.data.ContractAddress
      const encodedData = response.data.data.EncodedData
      try {
        await sendTransaction(rewardContractAddress, encodedData, BigNumber.from(0), transactionResponse => {
          const accumulatedUnclaimedRewards = selectedCampaignLeaderboard.rewards
            .filter(reward => !reward.claimed)
            .reduce((acc: { [p: string]: CampaignLeaderboardReward }, value) => {
              const key = value.token.chainId + '_' + value.token.address
              if (acc[key] === undefined) {
                acc[key] = value
              } else {
                acc[key] = {
                  ...value,
                  rewardAmount: value.rewardAmount.add(acc[key].rewardAmount),
                }
              }
              return acc
            }, {})
          const rewardString = Object.values(accumulatedUnclaimedRewards)
            .map(reward => reward.rewardAmount.toSignificant(DEFAULT_SIGNIFICANT) + ' ' + reward.token.symbol)
            .join(' ' + t`and` + ' ')
          addTransactionWithType(transactionResponse, {
            type: 'Claim',
            desiredChainId: claimChainId,
            summary: `${rewardString} from campaign "${selectedCampaign.name}"`,
          })
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <StyledCampaignButtonWithOptions
      onClick={e => {
        e.stopPropagation()
        setIsShowNetworks(prev => !prev)
      }}
      disabled={disabled}
      ref={containerRef}
    >
      {type === 'enter_now' ? t`Enter now` : t`Claim Rewards`}
      <ChevronDown style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)' }} />
      {isShowNetworks && (
        <OptionsContainer style={{ margin: '0 12px', width: 'calc(100% - 24px)' }}>
          {chainIds.map(chainId => {
            return (
              <Flex
                key={chainId}
                alignItems="center"
                onClick={async () => {
                  if (type === 'enter_now') {
                    mixpanelHandler(MIXPANEL_TYPE.CAMPAIGN_ENTER_NOW_CLICKED, { campaign_name: campaign?.name })
                    window.open(campaign?.enterNowUrl + '?networkId=' + chainId)
                  } else {
                    mixpanelHandler(MIXPANEL_TYPE.CAMPAIGN_CLAIM_REWARDS_CLICKED, { campaign_name: campaign?.name })
                    await changeNetwork(chainId, () => claimRewards(chainId))
                  }
                }}
              >
                <img src={NETWORKS_INFO[chainId].icon} alt="Network" style={{ minWidth: '16px', width: '16px' }} />
                <Text marginLeft="4px" color={theme.subText} fontSize="12px" fontWeight={500} minWidth="fit-content">
                  {type === 'enter_now'
                    ? t`Swap on ${NETWORKS_INFO[chainId].name}`
                    : t`Claim on ${NETWORKS_INFO[chainId].name}`}
                </Text>
              </Flex>
            )
          })}
        </OptionsContainer>
      )}
    </StyledCampaignButtonWithOptions>
  )
}

const StyledCampaignButtonWithOptions = styled(ButtonPrimary)`
  position: relative;
  font-size: 14px;
  padding: 12px 48px;
  min-width: fit-content;
  height: 44px;
  font-weight: 500;
  color: ${({ theme }) => theme.textReverse};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    ${css`
      flex: 1;
    `}
  `};
`
