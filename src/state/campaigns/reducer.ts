import { createReducer } from '@reduxjs/toolkit'

import {
  CampaignData,
  CampaignLeaderboard,
  CampaignLuckyWinner,
  setCampaignData,
  setLoadingCampaignData,
  setLoadingCampaignDataError,
  setLoadingSelectedCampaignLeaderboard,
  setLoadingSelectedCampaignLuckyWinners,
  setSelectedCampaign,
  setSelectedCampaignLeaderboard,
  setSelectedCampaignLeaderboardLookupAddress,
  setSelectedCampaignLeaderboardPageNumber,
  setSelectedCampaignLuckyWinners,
  setSelectedCampaignLuckyWinnersLookupAddress,
  setSelectedCampaignLuckyWinnersPageNumber,
} from './actions'

export interface CampaignsState {
  readonly data: CampaignData[]
  readonly loadingCampaignData: boolean
  readonly loadingCampaignDataError: Error | undefined

  readonly selectedCampaign: CampaignData | undefined

  readonly selectedCampaignLeaderboard: CampaignLeaderboard | undefined
  readonly loadingCampaignLeaderboard: boolean
  readonly selectedCampaignLeaderboardPageNumber: number
  readonly selectedCampaignLeaderboardLookupAddress: string

  readonly selectedCampaignLuckyWinners: CampaignLuckyWinner[]
  readonly loadingCampaignLuckyWinners: boolean
  readonly selectedCampaignLuckyWinnersPageNumber: number
  readonly selectedCampaignLuckyWinnersLookupAddress: string
}

const initialState: CampaignsState = {
  data: [],
  loadingCampaignData: false,
  loadingCampaignDataError: undefined,

  selectedCampaign: undefined,

  selectedCampaignLeaderboard: undefined,
  loadingCampaignLeaderboard: false,
  selectedCampaignLeaderboardPageNumber: 0,
  selectedCampaignLeaderboardLookupAddress: '',

  selectedCampaignLuckyWinners: [],
  loadingCampaignLuckyWinners: false,
  selectedCampaignLuckyWinnersPageNumber: 0,
  selectedCampaignLuckyWinnersLookupAddress: '',
}

export default createReducer<CampaignsState>(initialState, builder =>
  builder
    .addCase(setCampaignData, (state, { payload: { campaigns } }) => {
      return {
        ...state,
        data: campaigns,
      }
    })
    .addCase(setLoadingCampaignData, (state, { payload: loading }) => {
      return {
        ...state,
        loadingCampaignData: loading,
      }
    })
    .addCase(setLoadingCampaignDataError, (state, { payload: error }) => {
      return {
        ...state,
        loadingCampaignDataError: error,
      }
    })
    .addCase(setSelectedCampaign, (state, { payload: { campaign } }) => {
      return { ...state, selectedCampaign: campaign }
    })
    .addCase(setSelectedCampaignLeaderboard, (state, { payload: { leaderboard } }) => {
      return {
        ...state,
        selectedCampaignLeaderboard: leaderboard,
      }
    })
    .addCase(setLoadingSelectedCampaignLeaderboard, (state, { payload: loading }) => {
      return {
        ...state,
        loadingCampaignLeaderboard: loading,
      }
    })
    .addCase(setSelectedCampaignLeaderboardPageNumber, (state, { payload: pageNumber }) => {
      return {
        ...state,
        selectedCampaignLeaderboardPageNumber: pageNumber,
      }
    })
    .addCase(setSelectedCampaignLeaderboardLookupAddress, (state, { payload: lookupAddress }) => {
      return {
        ...state,
        selectedCampaignLeaderboardLookupAddress: lookupAddress,
      }
    })
    .addCase(setSelectedCampaignLuckyWinners, (state, { payload: { luckyWinners } }) => {
      return {
        ...state,
        selectedCampaignLuckyWinners: luckyWinners,
      }
    })
    .addCase(setLoadingSelectedCampaignLuckyWinners, (state, { payload: loading }) => {
      return {
        ...state,
        loadingCampaignLuckyWinners: loading,
      }
    })
    .addCase(setSelectedCampaignLuckyWinnersPageNumber, (state, { payload: pageNumber }) => {
      return {
        ...state,
        selectedCampaignLuckyWinnersPageNumber: pageNumber,
      }
    })
    .addCase(setSelectedCampaignLuckyWinnersLookupAddress, (state, { payload: lookupAddress }) => {
      return {
        ...state,
        selectedCampaignLuckyWinnersLookupAddress: lookupAddress,
      }
    }),
)
