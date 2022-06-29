import { transparentize } from 'polished'
import React, { useContext, useState } from 'react'
import styled, { ThemeContext, css } from 'styled-components'
import { Text, Flex } from 'rebass'

import { ButtonEmpty } from 'components/Button'
import { AutoColumn } from '../Column'
import { errorFriendly } from 'utils/dmm'
import { ReactComponent as Alert } from '../../assets/images/alert.svg'
import Modal, { ModalProps } from 'components/Modal'
import { Z_INDEXS } from 'styles'

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 0px 0px 0px;
  gap: 16px;
  width: 100%;
  height: calc(100vh - 84px); // 100% - header (trigger sticky form)
  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding: 24px 0px 24px 0px;
    min-height: calc(100vh - 215px); // 100% - header - footer
    height: unset;
`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 24px;
    min-height: calc(100vh - 250px); // 100% - header - footer
    padding: 24px 16px;
`}
`

export const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media only screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`

export const TabWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media only screen and (min-width: 768px) {
    margin-bottom: 0;
  }
`

export const Tab = styled(ButtonEmpty)<{ isActive: boolean }>`
  width: fit-content;
  margin-right: 1.5rem;
  font-weight: 400;
  padding: 0;
  padding-bottom: 4px;
  color: ${({ theme, isActive }) => (isActive ? theme.text : theme.subText)};
  border-radius: 0;
  border-bottom: ${({ theme, isActive }) => (isActive ? `2px solid ${theme.primary}` : 'none')};

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

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  gap: 28px;
  flex: 1;
  @media only screen and (min-width: 1000px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }

  & > div:first-child {
    width: 100%;
  }
`

export const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  background: ${({ theme }) => theme.background};
`

export const AggregatorStatsContainer = styled.div`
  width: 100%;
  margin: auto;
  display: flex;
  gap: 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 24px;
    gap: 16px;
  `}
`

export const AggregatorStatsItem = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  border-radius: 4px;
  background-color: ${({ theme }) => `${theme.buttonGray}33`};
`

export const AggregatorStatsItemTitle = styled.span`
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.text};
`

export const AggregatorStatsItemValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin-left: 4px;
`

export const ArrowWrapper = styled.div<{ clickable: boolean; rotated?: boolean }>`
  padding: 2px;

  transform: rotate(${({ rotated }) => (rotated ? '180deg' : '0')});
  transition: transform 300ms;

  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
`

export const BottomGrouping = styled.div`
  margin-top: 28px;
`

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.red1
      : severity === 2
      ? theme.yellow2
      : severity === 1
      ? theme.text
      : theme.green1};
`

export const StyledBalanceMaxMini = styled.button`
  height: 22px;
  width: 22px;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.25rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text2};
  display: flex;
  justify-content: center;
  align-items: center;
  float: right;

  :hover {
    background-color: ${({ theme }) => theme.bg3};
  }
  :focus {
    background-color: ${({ theme }) => theme.bg3};
    outline: none;
  }
`

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  width: 220px;
  overflow: hidden;
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  margin-top: 36px;
  padding: 8px 20px 8px 8px;
  background-color: ${({ theme }) => `${theme.bg12}66`};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

export function SwapCallbackError({ error }: { error: string }) {
  const theme = useContext(ThemeContext)
  const [showDetail, setShowDetail] = useState<boolean>(false)
  return (
    <SwapCallbackErrorInner>
      <Alert style={{ marginBottom: 'auto' }} />
      <AutoColumn style={{ flexBasis: '100%', margin: '10px 0 auto 8px' }}>
        <Text fontSize="16px" fontWeight="500" color={theme.red} lineHeight={'24px'}>
          {errorFriendly(error)}
        </Text>
        {error !== errorFriendly(error) && (
          <Text
            color={theme.primary}
            fontSize="12px"
            sx={{ cursor: `pointer` }}
            onClick={() => setShowDetail(!showDetail)}
          >
            Show more details
          </Text>
        )}
        {showDetail && (
          <Text color={theme.text} fontSize="10px" margin={'10px 0 4px 0'} lineHeight={'16px'}>
            {error}
          </Text>
        )}
      </AutoColumn>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.9, theme.primary)};
  color: ${({ theme }) => theme.primary};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`

export const GroupButtonReturnTypes = styled.div`
  display: flex;
  margin-top: 28px;
  border-radius: 999px;
  background: ${({ theme }) => theme.buttonBlack};
`

export const ButtonReturnType = styled.div<{ active?: boolean }>`
  border-radius: 999px;
  flex: 1;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, active }) => (active ? theme.primary : theme.buttonBlack)};
  color: ${({ theme, active }) => (active ? theme.textReverse : theme.subText)};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
`

export const SwapFormActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const KyberTag = styled.div`
  position: absolute;
  align-items: center;
  display: flex;
  top: 28px;
  left: 6px;
  font-weight: 500;
  border-bottom-right-radius: 0.25rem;
  border-top-left-radius: 0.25rem;
  background: ${({ theme }) => `${theme.primary}33`};
  padding: 0.375rem;
  color: ${({ theme }) => theme.primary};
  font-size: 0.75rem;
  z-index: 2;
`

export const PriceImpactHigh = styled.div<{ veryHigh?: boolean }>`
  border-radius: 4px;
  padding 12px 16px;
  background: ${({ theme, veryHigh }) => (veryHigh ? `${theme.red}66` : `${theme.warning}66`)};
  margin-top: 28px;
  display: flex;
  align-items: center;
  font-size: 12px;
`

export const LiveChartWrapper = styled.div<{ borderBottom?: boolean }>`
  width: 600px;
  height: 510px;
  display: none;
  margin-bottom: 30px;
  border-bottom: ${({ theme, borderBottom }) => (borderBottom ? `1px solid ${theme.border}` : 'none')};
  @media screen and (min-width: 1100px) {
    display: block;
  }
  @media screen and (min-width: 1240px) {
    width: 700px;
  }
  @media screen and (min-width: 1320px) {
    width: 772px;
  }
  @media screen and (min-width: 1500px) {
    width: 940px;
  }
`

export const RoutesWrapper = styled(LiveChartWrapper)<{ isOpenChart: boolean; borderBottom?: boolean }>`
  height: auto;
  margin-top: 4px;
  padding-bottom: 25px;
  border-bottom: ${({ theme, borderBottom }) => (borderBottom ? `1px solid ${theme.border}` : 'none')};
`

export const TokenInfoWrapper = styled(LiveChartWrapper)`
  display: block;
  height: auto;
  border-bottom: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%; 
  `}
`

export const MobileModalWrapper = styled((props: ModalProps) => <Modal {...props} zIndex={Z_INDEXS.MOBILE_MODAL} />)<{
  height?: string
}>`
  &[data-reach-dialog-content] {
    width: 100vw;
    max-width: 100vw;
    ${({ height }) => height && `height: ${height};`}
    min-height: 50vh;
  }
`

export const StyledFlex = styled(Flex)`
  gap: 48px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 25px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 15px;
`}
`

export const StyledActionButtonSwapForm = styled.button<{ active?: boolean }>`
  position: relative;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  width: 35px;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.buttonBlack};
  }

  ${({ active }) =>
    active
      ? css`
          cursor: pointer;
          outline: none;
          background-color: ${({ theme }) => theme.buttonBlack};
        `
      : ''}

  svg {
    margin-top: 2px;
  }
`

export const IconButton = styled(StyledActionButtonSwapForm)<{ enableClickToRefresh: boolean }>`
  transition: background 0.2s;

  // off click
  &:hover {
    cursor: default;
    background-color: transparent;
  }
`
