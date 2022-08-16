import { ChainId, Fraction } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import { BigNumber } from 'ethers'
import JSBI from 'jsbi'
import { useEffect, useMemo, useState } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonPrimary } from 'components/Button'
import Logo from 'components/Logo'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import { NETWORKS_INFO } from 'constants/networks'
import { nativeOnChain } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks'
import { useAllTokens } from 'hooks/Tokens'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { ApplicationModal } from 'state/application/actions'
import {
  NotificationType,
  useModalOpen,
  useNotify,
  useToggleModal,
  useWalletModalToggle,
} from 'state/application/hooks'
import { CloseIcon } from 'theme'
import { getTokenLogoURL, isAddress, shortenAddress } from 'utils'
import { filterTokens } from 'utils/filtering'

const AddressWrapper = styled.div`
  background: ${({ theme }) => theme.buttonBlack};
  border-radius: 8px;
  padding: 12px;
  overflow: hidden;
  p {
    margin: 12px 0 0 0;
    font-size: 24px;
    line-height: 28px;
    font-weight: 500;
    color: ${({ theme }) => theme.disableText};
  }
`

const getFullDisplayBalance = (balance: BigNumber, decimals = 18, significant = 6): string => {
  const amount = new Fraction(balance.toString(), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)))
  if (amount.lessThan(new Fraction('1'))) {
    return amount.toSignificant(significant)
  }

  return amount.toFixed(0)
}

function FaucetModal() {
  const { chainId, account } = useActiveWeb3React()
  const open = useModalOpen(ApplicationModal.FAUCET_POPUP)
  const toggle = useToggleModal(ApplicationModal.FAUCET_POPUP)
  const theme = useTheme()
  const [rewardData, setRewardData] = useState<{ amount: BigNumber; tokenAddress: string; program: number }>()
  const notify = useNotify()
  const toggleWalletModal = useWalletModalToggle()
  const { mixpanelHandler } = useMixpanel()
  const allTokens = useAllTokens()
  const token = useMemo(() => {
    if (!chainId || !account) return
    const nativeToken = nativeOnChain(chainId as ChainId)
    if (rewardData) {
      if (rewardData.tokenAddress === '0') return nativeToken
      if (isAddress(rewardData.tokenAddress)) return filterTokens(Object.values(allTokens), rewardData.tokenAddress)[0]
    }
    return nativeToken
  }, [rewardData, chainId, account, allTokens])
  const tokenLogo = useMemo(() => {
    if (!chainId || !token) return
    if (token.isNative) return NETWORKS_INFO[chainId].nativeToken.logo
    return getTokenLogoURL(token.address, chainId)
  }, [chainId, token])
  const tokenSymbol = useMemo(() => {
    if (token?.isNative && chainId) return NETWORKS_INFO[chainId].nativeToken.name
    return token?.symbol
  }, [token, chainId])
  const claimRewardCallBack = async () => {
    if (!rewardData) return
    try {
      const rawResponse = await fetch(process.env.REACT_APP_REWARD_SERVICE_API + '/rewards/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet: account, program: rewardData.program }),
      })
      const content = await rawResponse.json()
      if (content) {
        notify({
          title: t`Request to Faucet - Submitted`,
          type: NotificationType.SUCCESS,
          summary: t`You will receive ${
            rewardData?.amount ? getFullDisplayBalance(rewardData?.amount, token?.decimals) : 0
          } ${tokenSymbol} soon!`,
        })
        setRewardData(rw => {
          if (rw) {
            rw.amount = BigNumber.from(0)
          }
          return rw
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    if (!chainId || !account) return
    const getRewardAmount = async () => {
      try {
        const { data } = await fetch(
          `${process.env.REACT_APP_REWARD_SERVICE_API}/faucets?wallet=${account}&chainId=${chainId}`,
        ).then(res => res.json())
        if (data[0])
          setRewardData({
            amount: BigNumber.from(data[0].amount),
            tokenAddress: data[0].token,
            program: data[0].programId,
          })
      } catch (err) {
        console.log(err)
      }
    }
    getRewardAmount()
  }, [chainId, account])
  const modalContent = () => (
    <Flex flexDirection={'column'} padding="26px 24px" style={{ gap: '25px' }}>
      <RowBetween>
        <Text fontSize={20} fontWeight={500} color={theme.text}>
          <Trans>Faucet</Trans>
        </Text>
        <CloseIcon onClick={toggle} />
      </RowBetween>

      <AddressWrapper>
        <Text color={theme.subText} fontSize={12}>
          <Trans>Your wallet address</Trans>
        </Text>
        <p>{account && shortenAddress(account, 9)}</p>
      </AddressWrapper>
      <Text fontSize={16} lineHeight="24px" color={theme.text}>
        <Trans>
          If your wallet is eligible, you will be able to request for some {tokenSymbol} tokens for free below. Each
          wallet can only request for the tokens once. You can claim:
        </Trans>
      </Text>
      <Text fontSize={32} lineHeight="38px" fontWeight={500}>
        {token && (
          <>
            {tokenLogo && (
              <Logo
                srcs={[tokenLogo]}
                alt={`${tokenSymbol ?? 'token'} logo`}
                style={{ width: '28px', paddingRight: '8px' }}
              />
            )}{' '}
            {rewardData?.amount ? getFullDisplayBalance(rewardData?.amount, token?.decimals) : 0} {tokenSymbol}
          </>
        )}
      </Text>
      {account ? (
        <ButtonPrimary
          disabled={!rewardData?.amount || rewardData?.amount.eq(0)}
          onClick={() => {
            claimRewardCallBack()
            mixpanelHandler(MIXPANEL_TYPE.FAUCET_REQUEST_INITIATED)
            toggle()
          }}
          style={{ borderRadius: '24px', height: '44px' }}
        >
          <Trans>Request</Trans>
        </ButtonPrimary>
      ) : (
        <ButtonPrimary
          onClick={() => {
            toggleWalletModal()
          }}
          style={{ borderRadius: '24px', height: '44px' }}
        >
          <Trans>Connect Wallet</Trans>
        </ButtonPrimary>
      )}
    </Flex>
  )

  return (
    <Modal
      isOpen={open}
      onDismiss={() => {
        toggle()
      }}
      maxHeight={90}
    >
      {modalContent()}
    </Modal>
  )
}

export default FaucetModal
