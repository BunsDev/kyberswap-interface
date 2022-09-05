import { Fraction } from '@kyberswap/ks-sdk-core'
import axios from 'axios'
import JSBI from 'jsbi'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'

import { CAMPAIGN_LEADERBOARD_ITEM_PER_PAGE, SWR_KEYS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { AppPaths } from 'pages/App'
import {
  CampaignData,
  CampaignLeaderboard,
  CampaignLeaderboardRanking,
  CampaignLeaderboardReward,
  CampaignLuckyWinner,
  CampaignState,
  RewardDistribution,
  setCampaignData,
  setLoadingCampaignData,
  setLoadingCampaignDataError,
  setLoadingSelectedCampaignLeaderboard,
  setLoadingSelectedCampaignLuckyWinners,
  setSelectedCampaign,
  setSelectedCampaignLeaderboard,
  setSelectedCampaignLuckyWinners,
} from 'state/campaigns/actions'
import { AppState } from 'state/index'
import { SerializedToken } from 'state/user/actions'
import { getCampaignIdFromSlug, getSlugUrlCampaign } from 'utils/campaign'

const MAXIMUM_ITEMS_PER_REQUEST = 10000

export default function CampaignsUpdater(): null {
  const dispatch = useDispatch()
  const { account } = useActiveWeb3React()
  const { pathname } = useLocation()
  const isCampaignPage = pathname.startsWith(AppPaths.CAMPAIGN)

  /**********************CAMPAIGN DATA**********************/

  const {
    data: campaignData,
    isValidating: isLoadingCampaignData,
    error: loadingCampaignDataError,
  } = useSWR<CampaignData[]>(isCampaignPage ? SWR_KEYS.getListCampaign : null, async (url: string) => {
    const response = await axios({
      method: 'GET',
      url,
      params: {
        limit: MAXIMUM_ITEMS_PER_REQUEST,
        offset: 0,
      },
    })
    const now = Date.now()
    const campaigns: [] = response.data.data
      .map((item: any) => ({ ...item, startTime: item.startTime * 1000, endTime: item.endTime * 1000 }))
      .sort((a: any, b: any) => {
        const a_status = a.endTime <= now ? 'Ended' : a.startTime >= now ? 'Upcoming' : 'Ongoing'
        const b_status = b.endTime <= now ? 'Ended' : b.startTime >= now ? 'Upcoming' : 'Ongoing'
        const STATUS_PRIORITY = ['Ongoing', 'Upcoming', 'Ended']
        const a_status_index = STATUS_PRIORITY.indexOf(a_status)
        const b_status_index = STATUS_PRIORITY.indexOf(b_status)
        if (a_status_index !== b_status_index) return a_status_index - b_status_index
        if (a.startTime !== b.startTime) return b.startTime - a.startTime
        return b.endTime - a.endTime
      })
    const formattedCampaigns: CampaignData[] = campaigns.map((campaign: any) => {
      const rewardDistribution: RewardDistribution[] = []
      if (campaign.rewardDistribution.single) {
        campaign.rewardDistribution.single.forEach(
          ({ amount, rank, token }: { amount: string; rank: number; token: SerializedToken }) => {
            rewardDistribution.push({
              type: 'Single',
              amount,
              rank,
              token,
            })
          },
        )
      }
      if (campaign.rewardDistribution.range) {
        campaign.rewardDistribution.range.forEach(
          ({ from, to, amount, token }: { from: number; to: number; amount: string; token: SerializedToken }) => {
            rewardDistribution.push({
              type: 'Range',
              from,
              to,
              amount,
              token,
            })
          },
        )
      }
      if (campaign.rewardDistribution.random) {
        campaign.rewardDistribution.random.forEach(
          ({
            from,
            to,
            amount,
            numberOfWinners,
            token,
          }: {
            from: number
            to: number
            amount: string
            numberOfWinners: number
            token: SerializedToken
          }) => {
            rewardDistribution.push({
              type: 'Random',
              from,
              to,
              amount,
              nWinners: numberOfWinners,
              token,
            })
          },
        )
      }
      const { startTime, endTime } = campaign
      return {
        id: campaign.id,
        name: campaign.name,
        startTime,
        endTime,
        desktopBanner: campaign.desktopBanner,
        mobileBanner: campaign.mobileBanner,
        status: endTime <= now ? 'Ended' : startTime >= now ? 'Upcoming' : 'Ongoing',
        rules: campaign.rules,
        termsAndConditions: campaign.termsAndConditions,
        otherDetails: campaign.otherDetails,
        rewardDetails: campaign.rewardDetails,
        isRewardShown: campaign.isRewardShown,
        enterNowUrl: campaign.enterNowUrl,
        rewardDistribution,
        campaignState: campaign.campaignState,
        chainIds: campaign.chainIds,
        rewardChainIds: campaign.rewardChainIds,
        tradingVolumeRequired: campaign.tradingVolumeRequired,
        eligibleTokens: campaign.eligibleTokens.map(
          ({ chainId, name, symbol, address, logoURI, decimals }: any): SerializedToken => {
            return {
              chainId,
              name,
              symbol,
              address,
              logoURI,
              decimals,
            }
          },
        ),
      }
    })
    return formattedCampaigns
  })

  const slug = pathname.replace(AppPaths.CAMPAIGN, '')
  const qs = useParsedQueryString()
  const selectedCampaignId = qs.selectedCampaignId || getCampaignIdFromSlug(slug)

  const history = useHistory()
  useEffect(() => {
    dispatch(setCampaignData({ campaigns: campaignData ?? [] }))
    if (campaignData && campaignData.length) {
      if (selectedCampaignId === undefined) {
        history.push(getSlugUrlCampaign(campaignData[0]))
      } else {
        const selectedCampaign = campaignData.find(campaign => campaign.id.toString() === selectedCampaignId)
        if (selectedCampaign) {
          dispatch(setSelectedCampaign({ campaign: selectedCampaign }))
        } else {
          history.push(getSlugUrlCampaign(campaignData[0]))
        }
      }
    }
  }, [campaignData, dispatch, selectedCampaignId, history])

  useEffect(() => {
    dispatch(setLoadingCampaignData(isLoadingCampaignData))
  }, [dispatch, isLoadingCampaignData])

  useEffect(() => {
    dispatch(setLoadingCampaignDataError(loadingCampaignDataError))
  }, [dispatch, loadingCampaignDataError])

  const selectedCampaign = useSelector((state: AppState) => state.campaigns.selectedCampaign)

  /**********************CAMPAIGN LEADERBOARD**********************/

  const selectedCampaignLeaderboardPageNumber = useSelector(
    (state: AppState) => state.campaigns.selectedCampaignLeaderboardPageNumber,
  )
  const selectedCampaignLeaderboardLookupAddress = useSelector(
    (state: AppState) => state.campaigns.selectedCampaignLeaderboardLookupAddress,
  )
  const { data: leaderboard, isValidating: isLoadingLeaderboard } = useSWRImmutable(
    selectedCampaign
      ? [
          SWR_KEYS.getLeaderboard(selectedCampaign.id),
          selectedCampaignLeaderboardPageNumber,
          selectedCampaignLeaderboardLookupAddress,
          account,
        ]
      : null,
    async () => {
      if (selectedCampaign === undefined)
        return {
          userRank: 0,
          numberOfParticipants: 0,
          rankings: [],
          rewards: [],
          isParticipated: false,
        }

      try {
        const response = await axios({
          method: 'GET',
          url: SWR_KEYS.getLeaderboard(selectedCampaign.id),
          params: {
            pageSize: CAMPAIGN_LEADERBOARD_ITEM_PER_PAGE,
            pageNumber: selectedCampaignLeaderboardPageNumber,
            userAddress: account?.toLowerCase() ?? '',
            lookupAddress: selectedCampaignLeaderboardLookupAddress.toLowerCase(),
          },
        })
        const data = response.data.data
        const leaderboard: CampaignLeaderboard = {
          numberOfParticipants: data.NumberOfParticipants,
          userRank: data.UserRank,
          rankings: data.Rankings
            ? data.Rankings.map(
                (item: any): CampaignLeaderboardRanking => ({
                  userAddress: item.UserAddress,
                  totalPoint: item.TotalPoint,
                  rankNo: item.RankNo,
                  rewardAmount: new Fraction(
                    item.RewardAmount,
                    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(item?.Token?.decimals ?? 18)),
                  ),
                  token: item.Token,
                }),
              )
            : [],
          rewards: data.Rewards
            ? data.Rewards.map(
                (item: any): CampaignLeaderboardReward => ({
                  rewardAmount: new Fraction(
                    item.RewardAmount,
                    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(item?.Token?.decimals ?? 18)),
                  ),
                  ref: item.Ref,
                  claimed: item.Claimed,
                  token: item.Token,
                }),
              )
            : [],
          isParticipated: data.IsParticipated,
        }
        return leaderboard
      } catch (err) {
        console.error(err)
        const res: CampaignLeaderboard = {
          userRank: 0,
          numberOfParticipants: 0,
          rankings: [],
          rewards: [],
          isParticipated: false,
        }
        return res
      }
    },
  )

  useEffect(() => {
    if (leaderboard) {
      dispatch(setSelectedCampaignLeaderboard({ leaderboard }))
    }
  }, [dispatch, leaderboard])

  useEffect(() => {
    dispatch(setLoadingSelectedCampaignLeaderboard(isLoadingLeaderboard))
  }, [dispatch, isLoadingLeaderboard])

  /**********************CAMPAIGN LUCKY WINNERS**********************/

  const selectedCampaignLuckyWinnersPageNumber = useSelector(
    (state: AppState) => state.campaigns.selectedCampaignLeaderboardPageNumber,
  )
  const selectedCampaignLuckyWinnersLookupAddress = useSelector(
    (state: AppState) => state.campaigns.selectedCampaignLuckyWinnersLookupAddress,
  )
  const { data: luckyWinners, isValidating: isLoadingLuckyWinners } = useSWRImmutable(
    selectedCampaign
      ? [
          SWR_KEYS.getLuckyWinners(selectedCampaign.id),
          selectedCampaignLuckyWinnersPageNumber,
          selectedCampaignLuckyWinnersLookupAddress,
        ]
      : null,
    async () => {
      if (selectedCampaign === undefined || selectedCampaign.campaignState === CampaignState.CampaignStateReady)
        return []

      try {
        const response = await axios({
          method: 'GET',
          url: SWR_KEYS.getLuckyWinners(selectedCampaign.id),
          params: {
            pageSize: CAMPAIGN_LEADERBOARD_ITEM_PER_PAGE,
            pageNumber: selectedCampaignLuckyWinnersPageNumber,
            lookupAddress: selectedCampaignLuckyWinnersLookupAddress.toLowerCase(),
          },
        })
        const data = response.data.data
        const luckyWinners: CampaignLuckyWinner[] = data.map(
          (item: any): CampaignLuckyWinner => ({
            userAddress: item.userAddress,
            rewardAmount: new Fraction(
              item.rewardAmount,
              JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(item?.token?.decimals ?? 18)),
            ),
            token: item.token,
          }),
        )
        return luckyWinners
      } catch (err) {
        console.error(err)
        return []
      }
    },
  )

  useEffect(() => {
    if (luckyWinners !== undefined) {
      dispatch(setSelectedCampaignLuckyWinners({ luckyWinners: luckyWinners }))
    }
  }, [dispatch, luckyWinners])

  useEffect(() => {
    dispatch(setLoadingSelectedCampaignLuckyWinners(isLoadingLuckyWinners))
  }, [dispatch, isLoadingLuckyWinners])

  return null
}
