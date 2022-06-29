import { Web3Provider } from '@ethersproject/providers'
// import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { FortmaticConnector } from './Fortmatic'
import { NetworkConnector } from './NetworkConnector'
import { ChainId } from '@kyberswap/ks-sdk-core'

import { InjectedConnector } from '@pangolindex/web3-react-injected-connector'

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID

// export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1')
export const NETWORK_CHAIN_ID = 1

if (typeof NETWORK_URL === 'undefined') {
  throw new Error('REACT_APP_NETWORK_URL must be a defined environment variable')
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL },
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

const injectedConnectorParam = {
  supportedChainIds: [
    1,
    3,
    4,
    5,
    42,
    80001,
    137,
    56,
    97,
    43113,
    43114,
    250,
    25,
    338,
    ChainId.BTTC,
    ChainId.ARBITRUM,
    ChainId.ARBITRUM_TESTNET,
    ChainId.AURORA,
    ChainId.VELAS,
    ChainId.OASIS,
  ],
}
export const injected = new InjectedConnector(injectedConnectorParam)

export const coin98InjectedConnector = new InjectedConnector(injectedConnectorParam)

const SUPPORTED_CHAIN_IDS: ChainId[] = [
  ChainId.MAINNET,
  ChainId.ROPSTEN,
  ChainId.MUMBAI,
  ChainId.MATIC,
  ChainId.BSCTESTNET,
  ChainId.BSCMAINNET,
  ChainId.AVAXTESTNET,
  ChainId.AVAXMAINNET,
  ChainId.FANTOM,
  ChainId.CRONOSTESTNET,
  ChainId.CRONOS,
  ChainId.BTTC,
  ChainId.ARBITRUM,
  ChainId.ARBITRUM_TESTNET,
  ChainId.AURORA,
  ChainId.VELAS,
  ChainId.OASIS,
]

export const NETWORK_URLS: {
  [chainId in ChainId]: string
} = {
  [ChainId.MAINNET]: `https://proxy.kyberengineering.io/ethereum`,
  [ChainId.RINKEBY]: `https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
  [ChainId.ROPSTEN]: `https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
  [ChainId.GÖRLI]: `https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
  [ChainId.KOVAN]: `https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
  [ChainId.MUMBAI]: `https://rpc-mumbai.maticvigil.com`,
  [ChainId.MATIC]: `https://polygon-rpc.com/v1/mainnet/geth?appId=prod-dmm`,
  [ChainId.BSCTESTNET]: `https://data-seed-prebsc-1-s1.binance.org:8545`,
  // [ChainId.BSCMAINNET]: `https://bsc.dmm.exchange/v1/mainnet/geth?appId=prod-dmm-interface`,
  [ChainId.BSCMAINNET]: `https://bscrpc.com`,
  [ChainId.AVAXTESTNET]: `https://api.avax-test.network/ext/bc/C/rpc`,
  [ChainId.AVAXMAINNET]: `https://avalanche.dmm.exchange/v1/mainnet/geth?appId=prod-dmm`,
  [ChainId.FANTOM]: `https://rpc.ftm.tools`,
  [ChainId.CRONOSTESTNET]: `https://cronos-testnet-3.crypto.org:8545`,
  [ChainId.CRONOS]: `https://evm-cronos.crypto.org`,
  [ChainId.BTTC]: `https://rpc.bt.io`,
  // [ChainId.BTTC]: `https://bttc.dev.kyberengineering.io`,
  [ChainId.ARBITRUM]: `https://arb-mainnet.g.alchemy.com/v2/PGAWvp9KLZbqjvap-iingGj-Id7HM_Yn`,
  [ChainId.ARBITRUM_TESTNET]: `https://rinkeby.arbitrum.io/rpc`,
  [ChainId.VELAS]: 'https://evmexplorer.velas.com/rpc',
  [ChainId.AURORA]: `https://mainnet.aurora.dev/GvfzNcGULXzWqaVahC8WPTdqEuSmwNCu3Nu3rtcVv9MD`,
  [ChainId.OASIS]: `https://emerald.oasis.dev`,
}

export const walletconnect = new WalletConnectConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
  rpc: NETWORK_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
})

export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: NETWORK_CHAIN_ID,
})

export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [NETWORK_CHAIN_ID],
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
  manifestAppUrl: 'https://dmm.exchange',
  pollingInterval: 15000,
})
