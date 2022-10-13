import { ChainId } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import { stringify } from 'qs'
import { X } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonEmpty } from 'components/Button'
import Modal from 'components/Modal'
import { MouseoverTooltip } from 'components/Tooltip'
import { Z_INDEXS } from 'constants/styles'
import { useActiveWeb3React } from 'hooks'
import { useActiveNetwork } from 'hooks/useActiveNetwork'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useNetworkModalToggle } from 'state/application/hooks'
import { useIsDarkMode } from 'state/user/hooks'

import { MAINNET_NETWORKS, NETWORKS_INFO, SUPPORTED_NETWORKS } from '../../constants/networks'

export const Wrapper = styled.div`
  width: 100%;
  padding: 20px;
`

export const NetworkList = styled.div`
  display: grid;
  grid-gap: 1.25rem;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  margin-top: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 1fr;
  `}
`

export const NetworkLabel = styled.span`
  color: ${({ theme }) => theme.text13};
`

export const ListItem = styled.div<{ selected?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 12px;
  border-radius: 999px;
  ${({ theme, selected }) =>
    selected
      ? `
        background-color: ${theme.primary};
        & ${NetworkLabel} {
          color: ${theme.background};
        }
      `
      : `
        background-color : ${theme.buttonBlack};
      `}
`

export const SelectNetworkButton = styled(ButtonEmpty)<{ disabled?: boolean }>`
  background-color: transparent;
  color: ${({ theme }) => theme.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  filter: ${({ disabled }) => disabled && 'grayscale(1)'};
  &:focus {
    text-decoration: none;
  }
  &:hover {
    text-decoration: none;
    border: 1px solid ${({ theme }) => theme.primary};
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: not-allowed;
  }
`
const SHOW_NETWORKS = process.env.NODE_ENV === 'production' ? MAINNET_NETWORKS : SUPPORTED_NETWORKS
export default function NetworkModal({
  activeChainIds,
  selectedId,
  customOnSelectNetwork,
  isOpen,
  customToggleModal,
}: {
  activeChainIds?: ChainId[]
  selectedId?: ChainId | undefined
  isOpen?: boolean
  customOnSelectNetwork?: (chainId: ChainId) => void
  customToggleModal?: () => void
}): JSX.Element | null {
  const { chainId } = useActiveWeb3React()
  const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
  const toggleNetworkModalGlobal = useNetworkModalToggle()
  const { changeNetwork } = useActiveNetwork()
  const isDarkMode = useIsDarkMode()
  const history = useHistory()
  const qs = useParsedQueryString()

  const toggleNetworkModal = () => {
    if (customToggleModal) customToggleModal()
    else toggleNetworkModalGlobal()
  }

  const onSelect = (chainId: ChainId) => {
    toggleNetworkModal()
    if (customOnSelectNetwork) {
      customOnSelectNetwork(chainId)
    } else {
      changeNetwork(chainId, () => {
        const { networkId, inputCurrency, outputCurrency, ...rest } = qs
        history.replace({
          search: stringify(rest),
        })
      })
    }
  }
  const isItemActive = (key: ChainId) => (!selectedId && chainId === key) || (selectedId && selectedId === key)
  const sortedNetwork = activeChainIds
    ? SHOW_NETWORKS.sort((x, y) => {
        if (isItemActive(x) && !isItemActive(y)) return -1
        if (!isItemActive(x) && isItemActive(y)) return 1
        return activeChainIds?.includes(x) ? -1 : 1
      })
    : SHOW_NETWORKS

  return (
    <Modal
      zindex={Z_INDEXS.MODAL}
      isOpen={isOpen !== undefined ? isOpen : networkModalOpen}
      onDismiss={toggleNetworkModal}
      maxWidth={624}
    >
      <Wrapper>
        <Flex alignItems="center" justifyContent="space-between">
          <Text fontWeight="500" fontSize={20}>
            <Trans>Select a Network</Trans>
          </Text>

          <Flex sx={{ cursor: 'pointer' }} role="button" onClick={toggleNetworkModal}>
            <X />
          </Flex>
        </Flex>
        <NetworkList>
          {sortedNetwork.map((key: ChainId, i: number) => {
            const { iconDark, icon, name } = NETWORKS_INFO[key as ChainId]
            const iconSrc = isDarkMode && iconDark ? iconDark : icon
            if (isItemActive(key)) {
              return (
                <SelectNetworkButton key={i} padding="0">
                  <ListItem selected>
                    <img src={iconSrc} alt="Switch Network" style={{ width: '24px', marginRight: '8px' }} />
                    <NetworkLabel>{NETWORKS_INFO[key].name}</NetworkLabel>
                  </ListItem>
                </SelectNetworkButton>
              )
            }
            const disabled = activeChainIds ? !activeChainIds?.includes(key) : false
            return (
              <MouseoverTooltip
                style={{ zIndex: Z_INDEXS.MODAL + 1 }}
                key={key}
                text={disabled ? t`The token cannot be bridged to this chain` : ''}
              >
                <SelectNetworkButton key={key} disabled={disabled} padding="0" onClick={() => onSelect(key)}>
                  <ListItem>
                    <img src={iconSrc} alt="Switch Network" style={{ width: '24px', marginRight: '8px' }} />
                    <NetworkLabel>{name}</NetworkLabel>
                  </ListItem>
                </SelectNetworkButton>
              </MouseoverTooltip>
            )
          })}
        </NetworkList>
      </Wrapper>
    </Modal>
  )
}
