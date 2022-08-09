import { Trans } from '@lingui/macro'
import React, { CSSProperties } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import Divider from 'components/Divider'
import AddressButton from 'pages/TrueSight/components/AddressButton'
import ButtonWithOptions from 'pages/TrueSight/components/ButtonWithOptions'
import Chart from 'pages/TrueSight/components/Chart'
import CommunityButton, { StyledCommunityButton } from 'pages/TrueSight/components/CommunityButton'
import Tags from 'pages/TrueSight/components/Tags'
import { FormattedCoinGeckoChartData } from 'pages/TrueSight/hooks/useGetCoinGeckoChartData'
import { TrueSightTokenData } from 'pages/TrueSight/hooks/useGetTrendingSoonData'
import { TrueSightChartCategory, TrueSightFilter, TrueSightTimeframe } from 'pages/TrueSight/index'
import { ExternalLink } from 'theme'
import { formattedNumLong } from 'utils'

const TrendingSoonTokenDetail = ({
  tokenData,
  chartData,
  isChartDataLoading,
  chartCategory,
  setChartCategory,
  chartTimeframe,
  setChartTimeframe,
  setFilter,
  style,
}: {
  tokenData: TrueSightTokenData
  isChartDataLoading: boolean
  chartData: FormattedCoinGeckoChartData
  chartCategory: TrueSightChartCategory
  setChartCategory: React.Dispatch<React.SetStateAction<TrueSightChartCategory>>
  chartTimeframe: TrueSightTimeframe
  setChartTimeframe: React.Dispatch<React.SetStateAction<TrueSightTimeframe>>
  setFilter?: React.Dispatch<React.SetStateAction<TrueSightFilter>>
  style?: CSSProperties
}) => {
  return (
    <Flex height="100%" flexDirection="column" style={{ ...style, gap: '24px' }}>
      <LogoNameSwapContainer>
        <LogoNameContainer>
          <img
            src={tokenData.logo_url}
            style={{ minWidth: '36px', width: '36px', minHeight: '36px', height: '36px', borderRadius: '50%' }}
            alt="logo"
          />
          <Text fontWeight={500} style={{ textTransform: 'uppercase' }}>
            {tokenData.name}
          </Text>
        </LogoNameContainer>
        <ButtonWithOptions platforms={tokenData.platforms} tokenData={tokenData} />
      </LogoNameSwapContainer>
      <TagWebsiteCommunityAddressContainer>
        <Tags tags={tokenData.tags} setFilter={setFilter} />
        <WebsiteCommunityAddressContainer>
          <StyledCommunityButton
            as={ExternalLink}
            href={tokenData.official_web}
            target="_blank"
            style={{ fontWeight: 400 }}
          >
            Website ↗
          </StyledCommunityButton>
          <CommunityButton communityOption={tokenData.social_urls} />
          <AddressButton platforms={tokenData.platforms} />
        </WebsiteCommunityAddressContainer>
      </TagWebsiteCommunityAddressContainer>

      <Divider />

      <TokenStatisticsContainer>
        <TokenStatisticsFieldName style={{ textAlign: 'left' }}>
          <Trans>Trading Volume (24H)</Trans>
        </TokenStatisticsFieldName>
        <TokenStatisticsFieldName>
          <Trans>Market Cap</Trans>
        </TokenStatisticsFieldName>
        <TokenStatisticsFieldName>
          <Trans>Holders</Trans>
        </TokenStatisticsFieldName>
        <TokenStatisticsFieldName>
          <Trans>Price</Trans>
        </TokenStatisticsFieldName>
        <TokenStatisticsValue style={{ textAlign: 'left' }}>
          {formattedNumLong(tokenData.trading_volume, true)}
        </TokenStatisticsValue>
        <TokenStatisticsValue>
          {tokenData.market_cap <= 0 ? '--' : formattedNumLong(tokenData.market_cap, true)}
        </TokenStatisticsValue>
        <TokenStatisticsValue>
          {tokenData.number_holders <= 0 ? '--' : formattedNumLong(tokenData.number_holders, false)}
        </TokenStatisticsValue>
        <TokenStatisticsValue>{formattedNumLong(tokenData.price, true)}</TokenStatisticsValue>
      </TokenStatisticsContainer>
      <Chart
        chartData={chartData}
        isLoading={isChartDataLoading}
        chartCategory={chartCategory}
        setChartCategory={setChartCategory}
        chartTimeframe={chartTimeframe}
        setChartTimeframe={setChartTimeframe}
      />
    </Flex>
  )
}

const LogoNameSwapContainer = styled(Flex)`
  justify-content: space-between;
  align-items: center;
`

const LogoNameContainer = styled(Flex)`
  align-items: center;
  gap: 8px;
`

export const TagWebsiteCommunityAddressContainer = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`

export const WebsiteCommunityAddressContainer = styled(Flex)`
  align-items: center;
  gap: 8px;
`

const TokenStatisticsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 4px;
`

const TokenStatisticsFieldName = styled(Text)`
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  text-align: right;
`

const TokenStatisticsValue = styled(Text)`
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  text-align: right;
`

export default TrendingSoonTokenDetail
