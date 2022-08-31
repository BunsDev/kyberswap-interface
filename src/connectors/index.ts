import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@namgold/ks-sdk-core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

// import { InjectedConnector } from '@pangolindex/web3-react-injected-connector'
import { EVM_NETWORK, EVM_NETWORKS, NETWORKS_INFO, WALLET_CONNECT_SUPPORTED_CHAIN_IDS } from 'constants/networks'

import { NetworkConnector } from './NetworkConnector'

const NETWORK_URL = NETWORKS_INFO[ChainId.MAINNET].rpcUrl

export const NETWORK_CHAIN_ID = 1

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL },
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

const injectedConnectorParam = {
  supportedChainIds: EVM_NETWORKS,
}
export const injected = new InjectedConnector(injectedConnectorParam)

export const coin98InjectedConnector = new InjectedConnector(injectedConnectorParam)

export const braveInjectedConnector = new InjectedConnector(injectedConnectorParam)

export const NETWORK_URLS: {
  [chainId in EVM_NETWORK]: string
} = EVM_NETWORKS.reduce(
  (acc, val) => {
    acc[val] = NETWORKS_INFO[val].rpcUrl
    return acc
  },
  {} as {
    [chainId in EVM_NETWORK]: string
  },
)

export const walletconnect = new WalletConnectConnector({
  supportedChainIds: WALLET_CONNECT_SUPPORTED_CHAIN_IDS,
  rpc: NETWORK_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
})

export const walletlink = new WalletLinkConnector({
  // TODO: check this later=> walletlink connect maybe failed becauseof this
  url: NETWORK_URL,
  appName: 'KyberSwap',
  appLogoUrl: 'https://kyberswap.com/favicon.ico',
})

export const ledger = new LedgerConnector({
  chainId: NETWORK_CHAIN_ID,
  url: NETWORK_URL,
  pollingInterval: 15000,
})

export const trezor = new TrezorConnector({
  chainId: NETWORK_CHAIN_ID,
  url: NETWORK_URL,
  manifestEmail: 'andrew@kyber.network',
  manifestAppUrl: 'https://kyberswap.com',
  pollingInterval: 15000,
})
