import { Trans, t } from '@lingui/macro'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { darken, lighten } from 'polished'
import { useMemo } from 'react'
import { Activity } from 'react-feather'
import { useMedia } from 'react-use'
import styled from 'styled-components'

import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import useENSName from 'hooks/useENSName'
import { useHasSocks } from 'hooks/useSocksBalance'
import { useWalletModalToggle } from 'state/application/hooks'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { shortenAddress } from 'utils'

import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import FortmaticIcon from '../../assets/images/fortmaticIcon.png'
import PortisIcon from '../../assets/images/portisIcon.png'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import {
  braveInjectedConnector,
  coin98InjectedConnector,
  fortmatic,
  injected,
  portis,
  walletconnect,
  walletlink,
} from '../../connectors'
import { NetworkContextName } from '../../constants'
import { ButtonLight, ButtonSecondary } from '../Button'
import Identicon from '../Identicon'
import Loader from '../Loader'
import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 10px 12px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary : theme.buttonGray)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary : theme.buttonGray)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.subText)};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ pending, theme }) =>
      pending ? darken(0.05, theme.primary) : lighten(0.05, theme.buttonGray)};

    :focus {
      border: 1px solid
        ${({ pending, theme }) => (pending ? darken(0.1, theme.primary) : darken(0.1, theme.buttonGray))};
    }
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const SOCK = (
  <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
    🧦
  </span>
)

function StatusIcon({ connector }: { connector: AbstractConnector }) {
  switch (connector) {
    case injected:
    case coin98InjectedConnector:
    case braveInjectedConnector: {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      )
    }

    case walletconnect: {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={'wallet connect'} />
        </IconWrapper>
      )
    }

    case walletlink: {
      return (
        <IconWrapper size={16}>
          <img src={CoinbaseWalletIcon} alt={'coinbase wallet'} />
        </IconWrapper>
      )
    }

    case fortmatic: {
      return (
        <IconWrapper size={16}>
          <img src={FortmaticIcon} alt={'fortmatic wallet'} />
        </IconWrapper>
      )
    }

    case portis: {
      return (
        <IconWrapper size={16}>
          <img src={PortisIcon} alt={'portis wallet'} />
        </IconWrapper>
      )
    }

    default: {
      return null
    }
  }
}

function Web3StatusInner() {
  const { account, connector, error } = useWeb3React()

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)

  const hasPendingTransactions = !!pending.length
  const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()

  const above369 = useMedia('(min-width: 369px)')

  if (account) {
    return (
      <Web3StatusConnected
        id={TutorialIds.BUTTON_ADDRESS_WALLET}
        onClick={toggleWalletModal}
        pending={hasPendingTransactions}
      >
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>
              <Trans>{pending?.length} Pending</Trans>
            </Text>{' '}
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            {hasSocks ? SOCK : null}
            <Text>{ENSName || shortenAddress(account, above369 ? undefined : 2)}</Text>
          </>
        )}
        {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
      </Web3StatusConnected>
    )
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>{error instanceof UnsupportedChainIdError ? t`Wrong Network` : t`Error`}</Text>
      </Web3StatusError>
    )
  } else {
    return (
      <ButtonLight onClick={toggleWalletModal} padding="10px 12px" id={TutorialIds.BUTTON_CONNECT_WALLET}>
        <Trans>Connect Wallet</Trans>
      </ButtonLight>
    )
  }
}

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
