import { Trans, t } from '@lingui/macro'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ChevronLeft } from 'react-feather'
import { useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'
import styled from 'styled-components'

import WrongNetworkModal from 'components/WrongNetworkModal'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import checkForBraveBrowser from 'utils/checkForBraveBrowser'

import { ReactComponent as Close } from '../../assets/images/x.svg'
import { braveInjectedConnector, coin98InjectedConnector, fortmatic, injected, portis } from '../../connectors'
import { OVERLAY_READY } from '../../connectors/Fortmatic'
import { SUPPORTED_WALLETS } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { ExternalLink } from '../../theme'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'
import InstallBraveNote from './InstallBraveNote'
import Option from './Option'
import PendingView from './PendingView'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 16px;
  padding: 8px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div<{ padding?: string }>`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: ${({ padding }) => padding ?? '1.5rem 2rem 0 2rem'};
  font-weight: 500;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1.5rem 1rem 1rem;
  `};
`

const ContentWrapper = styled.div<{ padding?: string }>`
  padding: ${({ padding }) => padding ?? '2rem'};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const TermAndCondition = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 32px 2rem 0px 2rem;
  font-weight: 500;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
  accent-color: ${({ theme }) => theme.primary};
`

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 18px;
  :hover {
    cursor: pointer;
  }
`

const ToSText = styled.span`
  color: ${({ theme }) => theme.text9};
  font-weight: 500;
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useWeb3React()
  const theme = useTheme()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<boolean>()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)
  const isDarkMode = useIsDarkMode()

  const [isAccepted, setIsAccepted] = useState(true)

  const isWrongNetwork = error instanceof UnsupportedChainIdError
  const location = useLocation()
  const { mixpanelHandler } = useMixpanel()

  // need to call this inside a Component as there's an async call in `checkForBraveBrowser`
  const isBraveBrowser = checkForBraveBrowser()

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      if (location.pathname.startsWith('/campaigns')) {
        mixpanelHandler(MIXPANEL_TYPE.CAMPAIGN_WALLET_CONNECTED)
      }
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen, location.pathname, mixpanelHandler])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])
  const [, setIsUserManuallyDisconnect] = useLocalStorage('user-manually-disconnect')

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    if (connector === braveInjectedConnector && !isBraveBrowser) {
      // we just want the loading indicator, so return here
      return
    }

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined
    }

    if (connector) {
      await activate(connector, undefined, true)
        .then(() => {
          setIsUserManuallyDisconnect(false)
        })
        .catch(error => {
          if (error instanceof UnsupportedChainIdError) {
            activate(connector)
          } else {
            setPendingError(true)
          }
        })
    }
  }

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal()
    })
  }, [toggleWalletModal])

  const handleAccept = () => {
    setIsAccepted(!isAccepted)
  }

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask

    return Object.keys(SUPPORTED_WALLETS)
      .map(key => {
        const option = SUPPORTED_WALLETS[key]
        // check for mobile options
        if (isMobile) {
          //disable portis on mobile for now
          if (option.connector === portis) {
            return null
          }

          if (
            (!window.web3 && !window.ethereum && option.mobile) ||
            // add this condition below for Brave browser. In Brave, window.ethereum is not undefined
            // the above condition fails and there are no wallet options to choose
            (option.mobile && isBraveBrowser)
          ) {
            return (
              <Option
                onClick={() => {
                  option.connector !== connector && !option.href && tryActivation(option.connector)
                }}
                id={`connect-${key}`}
                key={key}
                active={option.connector && option.connector === connector}
                color={option.color}
                link={option.href}
                header={option.name}
                subheader={null}
                icon={require(`../../assets/images/${isDarkMode ? '' : 'light-'}${option.iconName}`).default}
              />
            )
          }

          return null
        }
        // overwrite injected when needed
        if (option.connector === injected) {
          // don't show injected if there's no injected provider
          if (!(window.web3 || window.ethereum?.isMetaMask)) {
            if (option.name === 'MetaMask') {
              return (
                <Option
                  id={`connect-${key}`}
                  key={key}
                  color={'#E8831D'}
                  header={'Install Metamask'}
                  subheader={null}
                  link={'https://metamask.io/'}
                  icon={require(`../../assets/images/${isDarkMode ? '' : 'light-'}${option.iconName}`).default}
                />
              )
            } else {
              return null //dont want to return install twice
            }
          }
          // don't return metamask if injected provider isn't metamask
          else if (option.name === 'MetaMask' && !isMetamask) {
            return null
          }
          // likewise for generic
          else if (option.name === 'Injected' && isMetamask) {
            return null
          }
        }

        if (option.connector === coin98InjectedConnector) {
          if (!(window.web3 || window.ethereum?.isCoin98)) {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Coin98'}
                link={'https://coin98.com/'}
                icon={require(`../../assets/images/${isDarkMode ? '' : 'light-'}${option.iconName}`).default}
              />
            )
          }
        }

        // return rest of options
        return (
          !isMobile &&
          !option.mobileOnly && (
            <Option
              clickable={isAccepted}
              id={`connect-${key}`}
              onClick={() => {
                option.connector === connector
                  ? setWalletView(WALLET_VIEWS.ACCOUNT)
                  : !option.href && tryActivation(option.connector)
              }}
              key={key}
              active={option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null} //use option.descriptio to bring back multi-line
              icon={require(`../../assets/images/${isDarkMode ? '' : 'light-'}${option.iconName}`).default}
            />
          )
        )
      })
      .filter(Boolean)
  }

  function getModalContent() {
    if (error) {
      return (
        <>
          {isWrongNetwork ? (
            <WrongNetworkModal />
          ) : (
            <UpperSection>
              <CloseIcon onClick={toggleWalletModal}>
                <CloseColor />
              </CloseIcon>
              <HeaderRow padding="1rem">{'Error connecting'}</HeaderRow>
              <ContentWrapper padding="1rem 1.5rem 1.5rem">
                {t`Error connecting. Try refreshing the page.`}
              </ContentWrapper>
            </UpperSection>
          )}
        </>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      )
    }

    const shouldShowInstallBrave = !isBraveBrowser && pendingWallet === braveInjectedConnector
    const walletOptionKey = Object.keys(SUPPORTED_WALLETS).find(key => {
      const wallet = SUPPORTED_WALLETS[key]
      return wallet.connector === connector
    })

    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow>
            <HoverText
              onClick={() => {
                setPendingError(false)
                setWalletView(WALLET_VIEWS.ACCOUNT)
              }}
            >
              <ChevronLeft color={theme.primary} />
              <Trans>Back</Trans>
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>
              <Trans>Connect your Wallet</Trans>
            </HoverText>
          </HeaderRow>
        )}
        <TermAndCondition>
          <input type="checkbox" checked={isAccepted} onChange={handleAccept} style={{ marginRight: '12px' }} />
          <ToSText>
            <Trans>Accept</Trans>{' '}
            <ExternalLink href="/15022022KyberSwapTermsofUse.pdf">
              <Trans>Terms of Use</Trans>
            </ExternalLink>{' '}
            <Trans>and</Trans>{' '}
            <ExternalLink href="http://files.dmm.exchange/privacy.pdf">
              <Trans>Privacy Policy</Trans>
            </ExternalLink>
          </ToSText>
        </TermAndCondition>
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              walletOptionKey={walletOptionKey}
              hasError={pendingError}
              renderHelperText={() => {
                if (shouldShowInstallBrave) {
                  return <InstallBraveNote />
                }
                return null
              }}
              onClickTryAgain={() => {
                setPendingError(false)
                connector && tryActivation(connector)
              }}
            />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={toggleWalletModal}
      minHeight={false}
      maxHeight={90}
      maxWidth={account && walletView === WALLET_VIEWS.ACCOUNT ? 544 : 512}
    >
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
