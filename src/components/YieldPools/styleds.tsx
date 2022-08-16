import { rgba } from 'polished'
import { Flex, Text } from 'rebass'
import styled, { css } from 'styled-components'

import { ReactComponent as Down } from 'assets/svg/down.svg'
import { ButtonEmpty, ButtonLight } from 'components/Button'
import { AutoColumn } from 'components/Column'

export const PageWrapper = styled(AutoColumn)`
  padding: 32px 24px 50px;
  width: 100%;
  max-width: 1500px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 24px 16px 100px;
  `}
`

export const ProMMFarmGuideWrapper = styled.div`
  padding: 1rem 0;
  font-size: 12px;
  color: ${({ theme }) => theme.subText};
  line-height: 1.5;
  border-top: 1px solid ${({ theme }) => theme.border};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`

export const ProMMFarmGuide = styled.div`
  font-size: 12px;
`

export const ShowGuideBtn = styled.button<{ show: boolean }>`
  border: none;
  outline: none;
  line-height: 0;
  background: transparent;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transform: rotate(${({ show }) => (show ? '-180deg' : 0)});
  transition: transform 0.2s;
`

export const GuideWrapper = styled.div<{ show?: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr;
  margin-top: ${({ show }) => (show ? '1rem' : 0)};
  height: ${({ show }) => (show ? 'auto' : 0)};
  max-height: ${({ show }) => (show ? '1000px' : 0)};
  transition: height 0.2s ease, margin 0.2s ease;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    gap: 8px;

    ${ChevronRight} {
      display: none;
    }
  `}
`
export const GuideItem = styled.div`
  padding: 1rem;
  font-size: 12px;
  color: ${({ theme }) => theme.subText};
  border-radius: 20px;
  background: ${({ theme }) => theme.background};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    background: transparent;
    padding: 0;
  `}
`

export const ChevronRight = styled(Down)`
  transform: rotate(-90deg);
  margin: auto;
  color: ${({ theme }) => theme.primary};
`

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
`

export const TabContainer = styled.div`
  display: flex;
  margin-bottom: 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

export const TabWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Tab = styled(ButtonEmpty)<{ isActive: boolean }>`
  width: fit-content;
  margin-right: 1.5rem;
  font-weight: 500;
  padding: 0;
  font-size: 1rem;
  padding-bottom: 4px;
  color: ${({ theme, isActive }) => (isActive ? theme.primary : theme.subText)};
  border-radius: 0;

  &:hover {
    text-decoration: none;
  }

  &:focus {
    text-decoration: none;
  }

  &:last-child {
    margin-right: 0;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-right: 12px;
  `}
`

export const PoolTitleContainer = styled.div`
  display: flex;
  align-items: center;
`

export const UpcomingPoolsWrapper = styled.div`
  position: relative;
  margin-right: 4px;
`

export const NewText = styled.div`
  position: absolute;
  top: -10px;
  right: -12px;
  font-size: 10px;
  font-weight: 500;
  color: #ff537b;
`

export const StakedOnlyToggleWrapper = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 20px;
  `}
`

export const StakedOnlyToggleText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.subText};
  margin-right: 8px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-left: 4px;
  `}
`

export const AdContainer = styled.div`
  margin-bottom: 1.75rem;
  border-radius: 0.5rem;
  position: relative;
`

export const LearnMoreBtn = styled.a`
  outline: none;
  border: none;
  text-decoration: none;
  background-color: #244641;
  color: ${({ theme }) => theme.primary};
  position: absolute;
  bottom: 0.25rem;
  right: 0;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-top-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;

  :hover {
    text-decoration: underline;
  }
`

export const HeadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 0;
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-start;
  `}
`
export const HeadingRight = styled.div`
  display: flex;
  gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: flex;
    flex-direction: column-reverse;
    gap: 0;
  `}
`
export const TotalRewardsContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  border-radius: 4px;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  background-color: ${({ theme }) => theme.apr};
  color: ${({ theme }) => theme.textReverse};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    justify-content: space-between
  `};

  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${({ theme }) => theme.buttonGray};
      color: ${({ theme }) => theme.disableText};
      cursor: not-allowed;
    `};
`

export const HarvestAllButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: flex-start;
  `}
`

export const HarvestAllInstruction = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  font-weight: 500;
  color: ${({ theme }) => theme.text7};
  background-color: ${({ theme }) => theme.buttonBlack};
  padding: 20px;
  border-radius: 8px;
`

export const RewardNumberContainer = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${({ theme }) => theme.text11};
  margin-right: 12px;
`

export const RewardToken = styled.span`
  @media (min-width: 1200px) {
    display: block;
    margin-bottom: 4px;
  }
`

export const HistoryButton = styled.div`
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.subText};
  padding: 10px 14px;
  border-radius: 4px;
  margin-left: auto;
  cursor: pointer;
  white-space: nowrap;

  svg {
    vertical-align: bottom;
    margin-right: 8px;
  }
`

export const FairLaunchPoolsWrapper = styled.div`
  background-color: ${({ theme }) => theme.background};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.04);
  :last-child {
    border-bottom-left-radius: 1.25rem;
    border-bottom-right-radius: 1.25rem;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 1.25rem;
    margin-bottom: 1.5rem;
  `};
`

export const FairLaunchPoolsTitle = styled.div<{ justify?: string }>`
  padding: 12px 24px;
  display: flex;
  justify-content: ${({ justify }) => justify || 'space-between'};
  align-items: center;
  background-color: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  gap: 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    align-items: flex-end;
    padding: 16px;
  `}
`

export const ListItemWrapper = styled.div`
  padding: 0 24px 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
  `};
`

export const TableHeader = styled.div<{ fade?: boolean; oddRow?: boolean }>`
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 1.5fr 1fr 0.75fr 1fr 1.5fr 1fr 1fr;
  grid-template-areas: 'pools liq apy vesting_duration reward staked_balance expand action';
  padding: 16px 20px;
  font-size: 12px;
  align-items: center;
  height: fit-content;
  position: relative;
  opacity: ${({ fade }) => (fade ? '0.6' : '1')};
  background-color: ${({ theme }) => theme.tableHeader};
  border-top-left-radius: 1.25rem;
  border-top-right-radius: 1.25rem;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.04);

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-gap: 1rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-gap: 1.5rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-gap: 1.5rem;
  `};
`

export const ProMMFarmTableHeader = styled(TableHeader)`
  grid-template-columns: 200px 0.5fr 0.75fr 1fr 0.5fr 0.75fr 0.75fr;
  grid-template-areas: 'token_pairs staked_tvl apr ending_in my_deposit reward action';
  grid-gap: 2rem;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 170px 0.5fr 0.75fr 1fr 0.5fr 0.75fr 0.75fr;
    grid-gap: 1rem;
  `};
`

export const ProMMFarmTableRow = styled(ProMMFarmTableHeader)`
  font-size: 14px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 0;
  :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`

export const ClickableText = styled(Text)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.subText};
  user-select: none;
  text-transform: uppercase;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

export const MenuFlyout = styled.span`
  min-width: 14rem;
  background-color: ${({ theme }) => theme.background};
  filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.2));
  border-radius: 5px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  position: absolute;
  top: 2.5rem !important;
  left: 0 !important;
  z-index: 10000;
`

export const Tag = styled.div<{ tag?: string }>`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: ${({ tag }) => (tag === 'active' ? '#1f292e' : 'inherit')};
  background-color: ${({ theme, tag }) => (tag === 'active' ? '#4aff8c' : theme.bg11)};
  box-sizing: border-box;
  @media screen and (max-width: 500px) {
    box-shadow: none;
  }
`

export const TableRow = styled.div<{ fade?: boolean; isExpanded?: boolean }>`
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 1.5fr 1fr 0.75fr 1fr 1.5fr 1fr 1fr;
  grid-template-areas: 'pools liq end apy vesting_duration reward staked_balance expand';
  padding: 15px 0 13px;
  font-size: 14px;
  align-items: center;
  height: fit-content;
  position: relative;
  opacity: ${({ fade }) => (fade ? '0.6' : '1')};
  background-color: ${({ theme }) => theme.background};
  border: 1px solid transparent;
  border-bottom: 1px solid ${({ theme, isExpanded }) => (isExpanded ? 'transparent' : theme.border)};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-gap: 1rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-gap: 1.5rem;
  `};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-gap: 1.5rem;
  `};

  &:hover {
    cursor: pointer;
  }
`

export const GetLP = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
`

export const StyledItemCard = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border}`};
  margin-bottom: 24px;
  padding: 16px;
  background-color: ${({ theme }) => theme.background};

  :last-child {
    border-bottom: none;
    border-radius: 1rem;
  }
`

export const RewardBalanceWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 1.25rem;
  gap: 8px;
  background-color: ${({ theme }) => theme.buttonBlack};
  margin-top: 0.75rem;
  margin-bottom: 1rem;
`

export const PoolRewardUSD = styled.div`
  color: ${({ theme }) => theme.subText};
`

export const DataText = styled(Flex)<{ align?: string }>`
  color: ${({ theme }) => theme.text};
  justify-content: ${({ align }) => (align === 'right' ? 'flex-end' : 'flex-start')};
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 14px;
  `}
`

export const APY = styled(DataText)`
  color: ${({ theme }) => theme.apr};
`

export const GridItem = styled.div<{ noBorder?: boolean }>`
  position: relative;
  margin-top: 8px;
  margin-bottom: 8px;
  border-bottom: ${({ theme, noBorder }) => (noBorder ? 'none' : `1px dashed ${theme.border}`)};
  padding-bottom: 12px;
`

export const DataTitle = styled.div`
  display: flex;
  align-items: flex-start;
  color: ${({ theme }) => theme.subText};
  &:hover {
    opacity: 0.6;
  }
  user-select: none;
  text-transform: uppercase;
  margin-bottom: 4px;
  font-size: 12px;
`

export const SearchContainer = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 999px;
  width: 320px;
  font-size: 12px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;

  > svg {
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 100%;
  `}
`

export const SearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};

  :placeholder {
    color: ${({ theme }) => theme.disableText};
  }
`

export const ProMMFarmTableRowMobile = styled.div`
  background: ${({ theme }) => theme.background};
  padding: 24px 16px;
  :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
`

export const RewardMobileArea = styled.div`
  background: ${({ theme }) => theme.buttonBlack};
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`

export const ActionButton = styled(ButtonLight)<{ backgroundColor?: string }>`
  background-color: ${({ theme, backgroundColor }) => backgroundColor || theme.primary + '33'};
  width: 28px;
  height: 28px;

  :disabled {
    background: ${({ theme }) => theme.buttonGray};
    cursor: not-allowed;
    opacity: 0.4;
  }
`
