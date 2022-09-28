import { ChainId } from '@kyberswap/ks-sdk-core'

import EthereumLogo from 'assets/images/ethereum-logo.png'
import ARBITRUM from 'assets/networks/arbitrum-network.svg'
import { createClient } from 'utils/client'

import { NetworkInfo } from '../type'

const EMPTY = ''
const EMPTY_ARRAY: any[] = []
const NOT_SUPPORT = null

const arbitrumTestnetInfo: NetworkInfo = {
  chainId: ChainId.ARBITRUM_TESTNET,
  route: 'arbitrum-testnet',
  name: 'Arbitrum Testnet',
  icon: ARBITRUM,
  classicClient: createClient('https://api.thegraph.com/subgraphs/name/viet-nv/kyberswap-arbitrum-rinkeby'),
  elasticClient: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-arbitrum-one'),
  blockClient: createClient('https://api.thegraph.com/subgraphs/name/viet-nv/arbitrum-rinkeby-blocks'),
  etherscanUrl: 'https://testnet.arbiscan.io',
  etherscanName: 'Arbiscan',
  tokenListUrl: `${process.env.REACT_APP_KS_SETTING_API}/v1/tokens?chainId=${ChainId.ARBITRUM_TESTNET}`,
  bridgeURL: 'https://bridge.arbitrum.io',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681',
    logo: EthereumLogo,
    decimal: 18,
  },
  rpcUrl: 'https://rinkeby.arbitrum.io/rpc',
  routerUri: EMPTY,
  classic: {
    static: {
      zap: '0xfa33723F6fA00a35F69F8aCd72A5BE9AF3c8Bd25',
      router: '0x78Ad9A49327D73C6E3B9881eCD653232cF3E480C',
      factory: '0x9D4ffbf49cc21372c2115Ae4C155a1e5c0aACf36',
    },
    oldStatic: NOT_SUPPORT,
    dynamic: NOT_SUPPORT,
    claimReward: EMPTY,
    fairlaunch: EMPTY_ARRAY,
    fairlaunchV2: EMPTY_ARRAY,
  },
  elastic: {
    coreFactory: '0x5F1dddbf348aC2fbe22a163e30F99F9ECE3DD50a',
    nonfungiblePositionManager: '0x2B1c7b41f6A8F2b2bc45C3233a5d5FB3cD6dC9A8',
    tickReader: '0xe3AC3fd66EB31cAf4EE0831b262D837c479FFCe5',
    initCodeHash: '0xc597aba1bb02db42ba24a8878837965718c032f8b46be94a6e46452a9f89ca01',
    quoter: '0x0D125c15D54cA1F8a813C74A81aEe34ebB508C1f',
    routers: '0xC1e7dFE73E1598E3910EF4C7845B68A9Ab6F4c83',
  },
  averageBlockTimeInSeconds: 1, // TODO: check these info
  coingeckoNetworkId: EMPTY,
  coingeckoNativeTokenId: 'ethereum',
  deBankSlug: EMPTY,
}

export default arbitrumTestnetInfo
