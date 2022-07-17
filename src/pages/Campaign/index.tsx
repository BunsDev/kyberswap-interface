import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import { Flex, Text } from 'rebass'
import { Trans } from '@lingui/macro'
import useTheme from 'hooks/useTheme'
import { Button, HideMedium, MediumOnly } from 'theme'
import { BarChart, ChevronDown, Clock, Share2, Star, Users } from 'react-feather'
import { ButtonEmpty, ButtonLight } from 'components/Button'
import { formatNumberWithPrecisionRange } from 'utils'
import { useActiveWeb3React } from 'hooks'
import {
  useSelectCampaignModalToggle,
  useToggleModal,
  useToggleYourCampaignTransactionsModal,
  useWalletModalToggle,
} from 'state/application/hooks'
import Divider from 'components/Divider'
import LeaderboardLayout from 'pages/Campaign/LeaderboardLayout'
import ModalSelectCampaign from './ModalSelectCampaign'
import CampaignListAndSearch from 'pages/Campaign/CampaignListAndSearch'
import { ApplicationModal } from 'state/application/actions'
import ShareModal from 'components/ShareModal'
import { CampaignData, setSelectedCampaign } from 'state/campaigns/actions'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { getFormattedTimeFromSecond } from 'utils/formatTime'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import { useHistory } from 'react-router-dom'
import { stringify } from 'qs'
import oembed2iframe from 'utils/oembed2iframe'
import { useMedia } from 'react-use'
import EnterNowButton from 'pages/Campaign/EnterNowButton'
import useInterval from 'hooks/useInterval'
import { SWR_KEYS } from 'constants/index'
import { useSWRConfig } from 'swr'
import { Loading } from 'pages/ProAmmPool/ContentLoader'
import { useAppDispatch } from 'state/hooks'
import YourCampaignTransactionsModal from 'components/YourCampaignTransactionsModal'
import axios from 'axios'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from 'state/transactions/hooks'
import useSendTransactionCallback from 'hooks/useSendTransactionCallback'
import { BigNumber } from '@ethersproject/bignumber'
import LocalLoader from 'components/LocalLoader'

const LoaderParagraphs = () => (
  <>
    <Loading style={{ height: '50px', marginBottom: '20px' }} />
    <Loading style={{ height: '100px', marginBottom: '20px' }} />
    <Loading style={{ height: '100px', marginBottom: '20px' }} />
  </>
)

export default function Campaign() {
  const { account, library } = useActiveWeb3React()
  const theme = useTheme()

  const toggleYourCampaignTransactionModal = useToggleYourCampaignTransactionsModal()

  const [activeTab, setActiveTab] = useState<'how_to_win' | 'rewards' | 'leaderboard' | 'lucky_winners'>('how_to_win')

  const toggleWalletModal = useWalletModalToggle()
  const toggleShareModal = useToggleModal(ApplicationModal.SHARE)

  const selectedCampaign = useSelector((state: AppState) => state.campaigns.selectedCampaign)
  const selectedCampaignLeaderboard = useSelector((state: AppState) => state.campaigns.selectedCampaignLeaderboard)

  const rules = selectedCampaign?.rules ?? ''
  const termsAndConditions = selectedCampaign?.termsAndConditions ?? ''
  const otherDetails = selectedCampaign?.otherDetails ?? ''
  const rewardDetails = selectedCampaign?.rewardDetails ?? ''

  const [showRules, setShowRules] = useState(true)
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false)
  const [showOtherDetails, setShowOtherDetails] = useState(false)

  const { mixpanelHandler } = useMixpanel()

  const above768 = useMedia('(min-width: 768px)')

  const campaignDetailImageRef = useRef<HTMLImageElement>(null)
  const [campaignDetailMediaLoadedMap, setCampaignDetailMediaLoadedMap] = useState<{ [id: string]: boolean }>({})
  const isSelectedCampaignMediaLoaded = selectedCampaign && campaignDetailMediaLoadedMap[selectedCampaign.id]

  useEffect(() => {
    if (selectedCampaign?.status === 'Ongoing' || selectedCampaign?.status === 'Ended') {
      setActiveTab('leaderboard')
    }
  }, [selectedCampaign])

  useEffect(() => {
    if (selectedCampaign === undefined) return

    if (campaignDetailMediaLoadedMap[selectedCampaign.id]) {
      if (campaignDetailImageRef && campaignDetailImageRef.current) {
        campaignDetailImageRef.current.style.display = 'unset'
      }
    } else {
      if (campaignDetailImageRef && campaignDetailImageRef.current) {
        campaignDetailImageRef.current.style.display = 'none'
      }
    }
  }, [campaignDetailMediaLoadedMap, selectedCampaign])

  const TabHowToWinContent = useMemo(
    // eslint-disable-next-line react/display-name
    () => () => (
      <Flex flexDirection="column">
        <Flex
          justifyContent="space-between"
          alignItems="center"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowRules(prev => !prev)}
          padding="0 0 20px 0"
        >
          <Text fontSize={16} fontWeight={500}>
            <Trans>Rules</Trans>
          </Text>
          <ButtonEmpty width="fit-content" style={{ padding: '0' }}>
            <ChevronDown size={24} color={theme.subText} />
          </ButtonEmpty>
        </Flex>
        {showRules ? (
          isSelectedCampaignMediaLoaded ? (
            <HTMLWrapper dangerouslySetInnerHTML={{ __html: oembed2iframe(rules) }} />
          ) : (
            <LoaderParagraphs />
          )
        ) : null}
        <Divider />
        <Flex
          justifyContent="space-between"
          alignItems="center"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowTermsAndConditions(prev => !prev)}
          padding="20px 0"
        >
          <Text fontSize={16} fontWeight={500}>
            <Trans>Terms and Conditions</Trans>
          </Text>
          <ButtonEmpty width="fit-content" style={{ padding: '0' }}>
            <ChevronDown size={24} color={theme.subText} />
          </ButtonEmpty>
        </Flex>
        {showTermsAndConditions ? (
          isSelectedCampaignMediaLoaded ? (
            <HTMLWrapper dangerouslySetInnerHTML={{ __html: oembed2iframe(termsAndConditions) }} />
          ) : (
            <LoaderParagraphs />
          )
        ) : null}
        <Divider />
        <Flex
          justifyContent="space-between"
          alignItems="center"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowOtherDetails(prev => !prev)}
          padding="20px 0"
        >
          <Text fontSize={16} fontWeight={500}>
            <Trans>Other Details</Trans>
          </Text>
          <ButtonEmpty width="fit-content" style={{ padding: '0' }}>
            <ChevronDown size={24} color={theme.subText} />
          </ButtonEmpty>
        </Flex>
        {showOtherDetails ? (
          isSelectedCampaignMediaLoaded ? (
            <HTMLWrapper dangerouslySetInnerHTML={{ __html: oembed2iframe(otherDetails) }} />
          ) : (
            <LoaderParagraphs />
          )
        ) : null}
        <Divider />
      </Flex>
    ),
    [
      isSelectedCampaignMediaLoaded,
      otherDetails,
      rules,
      showOtherDetails,
      showRules,
      showTermsAndConditions,
      termsAndConditions,
      theme.subText,
    ],
  )

  const TabRewardsContent = useMemo(
    // eslint-disable-next-line react/display-name
    () => () => (
      <Flex flexDirection="column" style={{ gap: '20px' }}>
        <Text fontSize={16} fontWeight={500}>
          <Trans>Rewards</Trans>
        </Text>
        {isSelectedCampaignMediaLoaded ? (
          <HTMLWrapper dangerouslySetInnerHTML={{ __html: oembed2iframe(rewardDetails) }} />
        ) : (
          <LoaderParagraphs />
        )}
      </Flex>
    ),
    [isSelectedCampaignMediaLoaded, rewardDetails],
  )

  const toggleSelectCampaignModal = useSelectCampaignModalToggle()

  const history = useHistory()
  const onSelectCampaign = (campaign: CampaignData) => {
    history.replace({
      search: stringify({ selectedCampaignId: campaign.id }),
    })
  }

  const now = Date.now()

  const campaigns = useSelector((state: AppState) => state.campaigns.data)
  const loadingCampaignData = useSelector((state: AppState) => state.campaigns.loadingCampaignData)
  const loadingCampaignDataError = useSelector((state: AppState) => state.campaigns.loadingCampaignDataError)

  const MINUTE_TO_REFRESH = 5
  const [campaignsRefreshIn, setCampaignsRefreshIn] = useState(MINUTE_TO_REFRESH * 60)
  const { mutate } = useSWRConfig()
  const dispatch = useAppDispatch()
  useInterval(
    () => {
      if (selectedCampaign && selectedCampaign.status === 'Upcoming' && selectedCampaign.startTime < now + 1000) {
        dispatch(setSelectedCampaign({ campaign: { ...selectedCampaign, status: 'Ongoing' } }))
      }
      if (selectedCampaign && selectedCampaign.status === 'Ongoing' && selectedCampaign.endTime < now + 1000) {
        dispatch(setSelectedCampaign({ campaign: { ...selectedCampaign, status: 'Ended' } }))
      }
      setCampaignsRefreshIn(prev => {
        if (prev === 0) {
          return MINUTE_TO_REFRESH * 60
        }
        return prev - 1
      })
    },
    1000,
    true,
  )

  const selectedCampaignLeaderboardPageNumber = useSelector(
    (state: AppState) => state.campaigns.selectedCampaignLeaderboardPageNumber,
  )
  const selectedCampaignLeaderboardLookupAddress = useSelector(
    (state: AppState) => state.campaigns.selectedCampaignLeaderboardLookupAddress,
  )
  useEffect(() => {
    if (campaignsRefreshIn === 0 && selectedCampaign) {
      mutate([
        SWR_KEYS.getLeaderboard(selectedCampaign.id),
        selectedCampaignLeaderboardPageNumber,
        selectedCampaignLeaderboardLookupAddress,
        account,
      ])
    }
  }, [
    mutate,
    campaignsRefreshIn,
    selectedCampaign,
    selectedCampaignLeaderboardPageNumber,
    selectedCampaignLeaderboardLookupAddress,
    account,
  ])

  const addTransactionWithType = useTransactionAdder()
  const onClaimRewardSuccess = (response: TransactionResponse) => {
    addTransactionWithType(response, {
      type: 'Claim',
      summary: 'campaign reward',
    })
    return response.hash
  }

  const sendTransaction = useSendTransactionCallback()
  const claimReward = async () => {
    if (!account || !library || !selectedCampaign) return

    const url = process.env.REACT_APP_REWARD_SERVICE_API + '/rewards/claim'
    const data = {
      wallet: account,
      chainId: selectedCampaign.rewardChainIds,
      clientCode: 'campaign',
    }
    const response = await axios({
      method: 'POST',
      url,
      data,
    })
    if (response.data.code === 200000) {
      const rewardContractAddress = response.data.data.ContractAddress
      const encodedData = response.data.data.EncodedData
      try {
        await sendTransaction(rewardContractAddress, encodedData, BigNumber.from(0), onClaimRewardSuccess)
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (loadingCampaignDataError) {
    return (
      <div style={{ margin: '10%', fontSize: '20px' }}>
        <Trans>There is an error while loading campaigns.</Trans>
      </div>
    )
  }

  if (loadingCampaignData) {
    return <LocalLoader />
  }

  if (!campaigns.length && !loadingCampaignData)
    return (
      <div style={{ margin: '10%', fontSize: '20px' }}>
        <Trans>Currently, there is no campaign.</Trans>
      </div>
    )

  return (
    <>
      <PageWrapper>
        <CampaignContainer>
          <HideMedium style={{ maxWidth: '400px' }}>
            <CampaignListAndSearch onSelectCampaign={onSelectCampaign} />
          </HideMedium>

          <CampaignDetail>
            <MediumOnly>
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="20px" lineHeight="24px" fontWeight={500}>
                  <Trans>Campaigns</Trans>
                </Text>
                <ButtonEmpty
                  style={{ padding: '9px 9px', background: theme.background, width: 'fit-content' }}
                  onClick={toggleSelectCampaignModal}
                >
                  <BarChart
                    size={16}
                    strokeWidth={3}
                    color={theme.subText}
                    style={{ transform: 'rotate(90deg) scaleX(-1)' }}
                  />
                </ButtonEmpty>
                <ModalSelectCampaign />
              </Flex>
            </MediumOnly>

            <CampaignDetailImageContainer>
              <Loading style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
              <CampaignDetailImage
                src={above768 ? selectedCampaign?.desktopBanner : selectedCampaign?.mobileBanner}
                alt="campaign-image"
                ref={campaignDetailImageRef}
                onLoad={() => {
                  setTimeout(() => {
                    if (selectedCampaign)
                      setCampaignDetailMediaLoadedMap(prev => ({ ...prev, [selectedCampaign.id]: true }))
                  }, 500)
                }}
                onError={() => {
                  if (selectedCampaign)
                    setCampaignDetailMediaLoadedMap(prev => ({ ...prev, [selectedCampaign.id]: true }))
                  if (campaignDetailImageRef && campaignDetailImageRef.current) {
                    campaignDetailImageRef.current.style.display = 'none'
                  }
                }}
              />
            </CampaignDetailImageContainer>
            <CampaignDetailHeader>
              <Text fontSize="20px" fontWeight={500}>
                {selectedCampaign?.name}
              </Text>
              <EnterNowAndShareContainer>
                {/* TODO: new logic */}
                {selectedCampaign && selectedCampaign.status === 'Ended' ? (
                  account && (
                    <Button
                      style={{ color: theme.textReverse, fontWeight: 500, padding: '12px 24px' }}
                      onClick={claimReward}
                    >
                      <Trans>Claim Reward</Trans>
                    </Button>
                  )
                ) : (
                  <EnterNowButton campaign={selectedCampaign} />
                )}
                <ButtonLight
                  borderRadius="50%"
                  style={{ padding: '8px', flex: 0, minWidth: '44px', minHeight: '44px' }}
                  onClick={toggleShareModal}
                >
                  <Share2 size={20} color={theme.primary} style={{ minWidth: '20px', minHeight: '20px' }} />
                </ButtonLight>
                <ShareModal
                  url={window.location.href}
                  onShared={() =>
                    mixpanelHandler(MIXPANEL_TYPE.CAMPAIGN_SHARE_TRADING_CONTEST_CLICKED, {
                      campaign_name: selectedCampaign?.name,
                    })
                  }
                />
              </EnterNowAndShareContainer>
            </CampaignDetailHeader>
            <CampaignDetailBoxGroup>
              <CampaignDetailBoxGroupItem>
                <Text fontSize={14} fontWeight={500} color={theme.subText}>
                  <Trans>
                    {selectedCampaign?.status === 'Upcoming'
                      ? 'Starting In'
                      : selectedCampaign?.status === 'Ongoing'
                      ? 'Ending In'
                      : 'Ended In'}
                  </Trans>
                </Text>
                <Clock size={20} color={theme.subText} />
                {isSelectedCampaignMediaLoaded ? (
                  <Text fontSize={20} fontWeight={500} style={{ gridColumn: '1 / -1' }}>
                    {selectedCampaign
                      ? selectedCampaign.status === 'Upcoming'
                        ? getFormattedTimeFromSecond((selectedCampaign.startTime - now) / 1000)
                        : selectedCampaign.status === 'Ongoing'
                        ? getFormattedTimeFromSecond((selectedCampaign.endTime - now) / 1000)
                        : 'ENDED'
                      : '--'}
                  </Text>
                ) : (
                  <Loading style={{ height: '24px' }} />
                )}
              </CampaignDetailBoxGroupItem>
              <CampaignDetailBoxGroupItem>
                <Text fontSize={14} fontWeight={500} color={theme.subText}>
                  <Trans>Participants</Trans>
                </Text>
                <Users size={20} color={theme.subText} />
                {isSelectedCampaignMediaLoaded ? (
                  <Text fontSize={20} fontWeight={500} style={{ gridColumn: '1 / -1' }}>
                    {selectedCampaignLeaderboard?.numberOfParticipants
                      ? formatNumberWithPrecisionRange(selectedCampaignLeaderboard.numberOfParticipants, 0, 0)
                      : '--'}
                  </Text>
                ) : (
                  <Loading style={{ height: '24px' }} />
                )}
              </CampaignDetailBoxGroupItem>
              <CampaignDetailBoxGroupItem>
                <Text fontSize={14} fontWeight={500} color={theme.subText}>
                  <Trans>Your Rank</Trans>
                </Text>
                <Star size={20} color={theme.subText} />
                {isSelectedCampaignMediaLoaded ? (
                  account ? (
                    <Flex justifyContent="space-between" alignItems="center" style={{ gridColumn: '1 / -1' }}>
                      <Text fontSize={20} fontWeight={500}>
                        {selectedCampaignLeaderboard?.userRank || '--'}
                      </Text>
                      <YourTransactionButton onClick={toggleYourCampaignTransactionModal}>
                        {above768 ? <Trans>Your Transactions</Trans> : <Trans>History</Trans>}
                      </YourTransactionButton>
                    </Flex>
                  ) : (
                    <ButtonLight
                      style={{ gridColumn: '1 / -1', padding: '8px', margin: '0', borderRadius: '18px' }}
                      onClick={toggleWalletModal}
                    >
                      <Trans>Connect Wallet</Trans>
                    </ButtonLight>
                  )
                ) : (
                  <Loading style={{ height: '24px' }} />
                )}
              </CampaignDetailBoxGroupItem>
            </CampaignDetailBoxGroup>

            <CampaignDetailTabRow>
              <CampaignDetailTab active={activeTab === 'how_to_win'} onClick={() => setActiveTab('how_to_win')}>
                <Trans>How to win</Trans>
              </CampaignDetailTab>
              <CampaignDetailTab active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}>
                <Trans>Rewards</Trans>
              </CampaignDetailTab>
              <CampaignDetailTab active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')}>
                <Trans>Leaderboard</Trans>
              </CampaignDetailTab>
              {/*<CampaignDetailTab active={activeTab === 'lucky_winners'} onClick={() => setActiveTab('lucky_winners')}>*/}
              {/*  <Trans>Lucky Winners</Trans>*/}
              {/*</CampaignDetailTab>*/}
            </CampaignDetailTabRow>

            <CampaignDetailContent>
              {activeTab === 'how_to_win' && <TabHowToWinContent />}
              {activeTab === 'rewards' && <TabRewardsContent />}
              {activeTab === 'leaderboard' && <LeaderboardLayout refreshIn={campaignsRefreshIn} />}
              {activeTab === 'lucky_winners' && <LeaderboardLayout refreshIn={campaignsRefreshIn} />}
            </CampaignDetailContent>
          </CampaignDetail>
        </CampaignContainer>
      </PageWrapper>
      <YourCampaignTransactionsModal />
    </>
  )
}

const CampaignDetailContent = styled.div`
  padding: 28px 24px;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  flex: 1;
  overflow: auto;
`

const CampaignDetailTab = styled(ButtonEmpty)<{ active: boolean }>`
  padding: 0 0 4px 0;
  color: ${({ theme }) => theme.subText};
  border-radius: 0;
  cursor: pointer;
  width: fit-content;
  min-width: fit-content;

  &:hover {
    opacity: 0.72;
  }

  ${({ theme, active }) =>
    active &&
    css`
      color: ${theme.text};
      border-bottom: 1px solid ${theme.primary};
    `}
`

const CampaignDetailTabRow = styled.div`
  display: flex;
  gap: 24px;
  overflow: auto;
`

const CampaignDetailBoxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  ${({ theme }) => theme.mediaWidth.upToLarge`${css`
    gap: 16px;
  `}  
  `}
`

const CampaignDetailBoxGroupItem = styled.div`
  flex: 1;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 16px;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    &:first-of-type {
      min-width: 100%;
    } 
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    &:first-of-type {
      min-width: unset;
    } 
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    &:first-of-type {
      min-width: 100%;
    } 
  `}
`

const CampaignDetailHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
  justify-content: space-between;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
    align-items: center;
    
    & > *:first-child {
      text-align: center;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    align-items: center;
    
    & > *:first-child {
      text-align: left;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: center;
    
    & > *:first-child {
      text-align: center;
    }
  `}
`

const EnterNowAndShareContainer = styled.div`
  gap: 12px;
  min-width: fit-content;
  display: flex;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    ${css`
      min-width: 100%;
    `}
  `}
`

const PageWrapper = styled.div`
  padding: 24px 64px;
  width: 100%;
  max-width: 1440px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  ${css`
    padding: 24px 16px;
  `}
  `}
`

const CampaignContainer = styled.div`
  display: flex;
  gap: 24px;
  //height: calc(100vh - 84.34px - 24px - 24px - 62px);
  min-height: calc(100vh - 84.34px - 24px - 24px - 62px);
  overflow: auto;
`

const CampaignDetail = styled.div`
  flex: 2;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const CampaignDetailImageContainer = styled.div`
  position: relative;
  border-radius: 8px;
  width: 100%;
  padding-bottom: 25%; // 200 / 800
  height: 0;

  ${({ theme }) =>
    theme.mediaWidth.upToSmall`${css`
      padding-bottom: 38.48%; // 132 / 343
    `}`}
`

const CampaignDetailImage = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 8px;
`

const HTMLWrapper = styled.div`
  padding-bottom: 20px;
  word-break: break-word;
  line-height: 1.5;

  p,
  li,
  span,
  div {
    font-size: 14px;
  }
`

const YourTransactionButton = styled(ButtonLight)`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  padding: 2px 8px;
  width: fit-content;
`
