import { ChainId } from '@namgold/ks-sdk-core'

import FTM from 'assets/networks/fantom-network.png'
import { AGGREGATOR_API, KS_SETTING_API } from 'constants/env'
import { EVMNetworkInfo } from 'constants/networks/type'
import { createClient } from 'utils/client'

const EMPTY = ''
const EMPTY_ARRAY: any[] = []
const NOT_SUPPORT = null

const fantomInfo: EVMNetworkInfo = {
  chainId: ChainId.FANTOM,
  route: 'fantom',
  name: 'Fantom',
  icon: FTM,
  iconDark: NOT_SUPPORT,
  iconSelected: NOT_SUPPORT,
  iconDarkSelected: NOT_SUPPORT,
  classicClient: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-fantom'),
  elasticClient: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-fantom'),
  blockClient: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/fantom-blocks'),
  etherscanUrl: 'https://ftmscan.com',
  etherscanName: 'Ftmscan',
  tokenListUrl: `${KS_SETTING_API}/v1/tokens?chainIds=${ChainId.FANTOM}&isWhitelisted=${true}`,
  bridgeURL: 'https://multichain.xyz',
  nativeToken: {
    symbol: 'FTM',
    name: 'FTM',
    logo: FTM,
    decimal: 18,
  },
  rpcUrl: 'https://fantom.kyberengineering.io',
  routerUri: `${AGGREGATOR_API}/fantom/route/encode`,
  multicall: '0x878dFE971d44e9122048308301F540910Bbd934c',
  classic: {
    static: {
      zap: '0x2abE8750e4a65584d7452316356128C936273e0D',
      router: '0x5649B4DD00780e99Bab7Abb4A3d581Ea1aEB23D0',
      factory: '0x1c758aF0688502e49140230F6b0EBd376d429be5',
    },
    oldStatic: NOT_SUPPORT,
    dynamic: {
      zap: '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
      router: '0x5d5A5a0a465129848c2549669e12cDC2f8DE039A',
      factory: '0x78df70615ffc8066cc0887917f2Cd72092C86409',
    },
    claimReward: NOT_SUPPORT,
    fairlaunch: EMPTY_ARRAY,
    fairlaunchV2: EMPTY_ARRAY,
  },
  elastic: {
    coreFactory: '0x5F1dddbf348aC2fbe22a163e30F99F9ECE3DD50a',
    nonfungiblePositionManager: '0x2B1c7b41f6A8F2b2bc45C3233a5d5FB3cD6dC9A8',
    tickReader: '0x165c68077ac06c83800d19200e6E2B08D02dE75D',
    initCodeHash: '0xc597aba1bb02db42ba24a8878837965718c032f8b46be94a6e46452a9f89ca01',
    quoter: '0x0D125c15D54cA1F8a813C74A81aEe34ebB508C1f',
    routers: '0xC1e7dFE73E1598E3910EF4C7845B68A9Ab6F4c83',
  },
  averageBlockTimeInSeconds: 1,
  coingeckoNetworkId: 'fantom',
  coingeckoNativeTokenId: 'fantom',
  deBankSlug: 'ftm',
  trueSightId: 'fantom',
}

export default fantomInfo
