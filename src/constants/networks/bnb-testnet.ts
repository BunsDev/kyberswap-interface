import { ChainId } from '@kyberswap/ks-sdk-core'

import BnbLogo from 'assets/images/bnb-logo.png'
import BSC from 'assets/networks/bsc-network.png'
import { createClient } from 'utils/client'

import { NetworkInfo } from '../type'

const EMPTY = ''
const EMPTY_ARRAY: any[] = []
const NOT_SUPPORT = null

const bnbTestnetInfo: NetworkInfo = {
  chainId: ChainId.BSCTESTNET,
  route: 'bnb-testnet',
  name: 'BNB Testnet',
  icon: BSC,
  classicClient: createClient('https://api.thegraph.com/subgraphs/name/ducquangkstn/dynamic-amm-bsc-staging'),
  elasticClient: createClient('https://api.thegraph.com/subgraphs/name/viet-nv/promm-bsc-testnet'),
  blockClient: createClient('https://api.thegraph.com/subgraphs/name/ducquangkstn/ethereum-blocks-bsctestnet'),
  etherscanUrl: 'https://testnet.bscscan.com',
  etherscanName: 'BscScan',
  tokenListUrl: `${process.env.REACT_APP_KS_SETTING_API}/v1/tokens?chainId=${ChainId.BSCTESTNET}`,
  bridgeURL: 'https://www.binance.org/en/bridge',
  nativeToken: {
    symbol: 'BNB',
    name: 'BNB (Wrapped)',
    address: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
    logo: BnbLogo,
    decimal: 18,
  },
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  routerUri: EMPTY,
  classic: {
    static: {
      zap: EMPTY,
      router: EMPTY,
      factory: EMPTY,
    },
    oldStatic: NOT_SUPPORT,
    dynamic: {
      zap: '0x0ff512d940F390Cd76D95304fC4493170e0B42DE',
      router: '0x19395624C030A11f58e820C3AeFb1f5960d9742a',
      factory: '0x7900309d0b1c8D3d665Ae40e712E8ba4FC4F5453',
    },
    claimReward: EMPTY,
    fairlaunch: [
      '0xf0fb5bD9EB287A902Bd45b57AE4CF5F9DcEBe550',
      '0xC4ad1e43c755F3437b890eeCE2E55cA7b14D1F15',
      '0x7B731e53B16694cF5dEb87d4C84bA2b4F4EcB4eB',
      '0x35D1b10fA26cd0FbC52Fd22dd58E2d9d22FC631F',
    ],
    fairlaunchV2: EMPTY_ARRAY,
  },
  elastic: {
    coreFactory: '0x2D2B8D5093d0288Da2473459545FE7a2f057bd7D',
    nonfungiblePositionManager: '0xe0a4C2a9343A79A1F5b1505C036d033C8A178F90',
    tickReader: '0xe3AC3fd66EB31cAf4EE0831b262D837c479FFCe5',
    initCodeHash: '0xc597aba1bb02db42ba24a8878837965718c032f8b46be94a6e46452a9f89ca01',
    quoter: '0xF4117D3c57BFe20fB2600eaE4028FB12bF99Ac10',
    routers: '0x785b8893342dfEf9B5D565f67be971b859d34a15',
  },
  averageBlockTimeInSeconds: 3,
  coingeckoNetworkId: EMPTY,
  coingeckoNativeTokenId: EMPTY,
  deBankSlug: EMPTY,
}

export default bnbTestnetInfo
