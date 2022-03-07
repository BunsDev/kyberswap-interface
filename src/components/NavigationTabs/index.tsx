import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { NavLink, useHistory } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import { t, Trans } from '@lingui/macro'
import { Flex } from 'rebass'
import { ButtonEmpty } from 'components/Button'
import { RowBetween } from '../Row'
import QuestionHelper from '../QuestionHelper'
import TransactionSettings from 'components/TransactionSettings'
import ShareModal from 'components/ShareModal'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const Wrapper = styled(RowBetween)`
  padding: 1rem 0 4px;

  @media only screen and (min-width: 768px) {
    padding: 1rem 0;
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text)};
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text};
`

const ButtonBack = styled(ButtonEmpty)`
  justify-content: flex-start;
  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.buttonBlack};
  }
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        <Trans>Swap</Trans>
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
        <Trans>Pool</Trans>
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  const history = useHistory()

  const goBack = () => {
    history.goBack()
  }

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem' }}>
        <ButtonEmpty width="fit-content" padding="0" onClick={goBack}>
          <StyledArrowLeft />
        </ButtonEmpty>
        <ActiveText>
          <Trans>Import Pool</Trans>
        </ActiveText>
        <QuestionHelper text={t`Use this tool to find pairs that don't automatically appear in the interface.`} />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  const history = useHistory()

  const goBack = () => {
    history.goBack()
  }

  return (
    <Tabs>
      <Wrapper>
        <ButtonBack width="fit-content" padding="0" onClick={goBack}>
          <StyledArrowLeft />
        </ButtonBack>
        <Flex>
          <ActiveText>{creating ? t`Create a new pool` : adding ? t`Add Liquidity` : t`Remove Liquidity`}</ActiveText>
          <QuestionHelper
            text={
              adding
                ? t`Add liquidity and receive pool tokens representing your pool share. You will earn dynamic fees on trades for this token pair, proportional to your pool share. Fees earned are automatically claimed when you withdraw your liquidity.`
                : t`Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.`
            }
          />
        </Flex>
        <Flex style={{ gap: '8px' }}>
          <TransactionSettings />
          <ShareModal />
        </Flex>
      </Wrapper>
    </Tabs>
  )
}

export function MigrateTab() {
  const history = useHistory()

  const goBack = () => {
    history.goBack()
  }

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 0' }}>
        <ButtonBack width="fit-content" padding="0" onClick={goBack}>
          <StyledArrowLeft />
        </ButtonBack>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ActiveText>
            <Trans>Migrate Liquidity</Trans>
          </ActiveText>
          <QuestionHelper
            text={t`Converts your liquidity position on Sushiswap into underlying tokens at the current rate. Tokens are deposited into the basic AMP=1 pool on the KyberSwap and you will be given DMM-LP tokens representing your new pool share. If rates are different between the two platforms, some tokens may be refunded to your address.`}
          />
        </div>
        <TransactionSettings />
      </RowBetween>
    </Tabs>
  )
}
