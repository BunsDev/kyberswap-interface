import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from '@dynamic-amm/sdk'

export const defaultExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-staging'
      : 'https://api.thegraph.com/subgraphs/name/dynamic-amm/dynamic-amm',
  cache: new InMemoryCache(),
})

const ropstenExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-ropsten',
  cache: new InMemoryCache(),
})

const mainnetExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-staging'
      : 'https://api.thegraph.com/subgraphs/name/dynamic-amm/dynamic-amm',
  cache: new InMemoryCache(),
})

const maticExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-matic-staging'
      : 'https://polygon-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-matic',
  cache: new InMemoryCache(),
})

const mumbaiExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-mumbai',
  cache: new InMemoryCache(),
})
const bscTestnetExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/dynamic-amm-ropsten',
  cache: new InMemoryCache(),
})
const bscMainnetExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://api.thegraph.com/subgraphs/name/ducquangkstn/dynamic-amm-bsc-staging'
      : 'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-bsc',
  cache: new InMemoryCache(),
})

const avaxTestnetExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/dmm-exchange-fuij',
  cache: new InMemoryCache(),
})

const avaxMainnetExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? ''
      : 'https://avax-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-avax',
  cache: new InMemoryCache(),
})

const fantomExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-ftm'
      : '',
  cache: new InMemoryCache(),
})

const cronosTestnetExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://testnet-cronos-subgraph.knstats.com/subgraphs/name/dynamic-amm/dmm-exchange-cronos-testnet',
  cache: new InMemoryCache(),
})

const cronosExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://cronos-subgraph.kyberswap.com/subgraphs/name/kyberswap/kyberswap-cronos',
  cache: new InMemoryCache(),
})

const arbitrumTestnetExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/viet-nv/kyberswap-arbitrum-rinkeby',
  cache: new InMemoryCache(),
})

const arbitrumExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/viet-nv/kyberswap-arbitrum',
  cache: new InMemoryCache(),
})

const bttcExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://bttc-graph.dev.kyberengineering.io/subgraphs/name/dynamic-amm/kyberswap-bttc',
  cache: new InMemoryCache(),
})

const velasExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://velas-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-velas',
  cache: new InMemoryCache(),
})


const auroraExchangeClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: 'https://aurora-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-aurora',
  cache: new InMemoryCache()
})

export const exchangeClients: { [chainId in ChainId]: ApolloClient<NormalizedCacheObject> } = {
  [ChainId.MAINNET]: mainnetExchangeClient,
  [ChainId.ROPSTEN]: ropstenExchangeClient,
  [ChainId.RINKEBY]: ropstenExchangeClient,
  [ChainId.GÖRLI]: ropstenExchangeClient,
  [ChainId.KOVAN]: ropstenExchangeClient,
  [ChainId.MATIC]: maticExchangeClient,
  [ChainId.MUMBAI]: mumbaiExchangeClient,
  [ChainId.BSCTESTNET]: bscTestnetExchangeClient,
  [ChainId.BSCMAINNET]: bscMainnetExchangeClient,
  [ChainId.AVAXTESTNET]: avaxTestnetExchangeClient,
  [ChainId.AVAXMAINNET]: avaxMainnetExchangeClient,
  [ChainId.FANTOM]: fantomExchangeClient,
  [ChainId.CRONOSTESTNET]: cronosTestnetExchangeClient,
  [ChainId.CRONOS]: cronosExchangeClient,
  [ChainId.ARBITRUM_TESTNET]: arbitrumTestnetExchangeClient,
  [ChainId.ARBITRUM]: arbitrumExchangeClient,
  [ChainId.BTTC]: bttcExchangeClient,
  [ChainId.AURORA]: auroraExchangeClient,
  [ChainId.VELAS]: velasExchangeClient,
}

const ropstenBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/edwardevans094/ropsten-blocks',
  cache: new InMemoryCache(),
})

const mainnetBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  cache: new InMemoryCache(),
})

const maticBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ord786/matic-blocks',
  cache: new InMemoryCache(),
})

const mumbaiBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/piavgh/mumbai-blocks',
  cache: new InMemoryCache(),
})
const bscTestnetBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/ethereum-blocks-bsctestnet',
  cache: new InMemoryCache(),
})
const bscMainnetBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/ethereum-blocks-bsc',
  cache: new InMemoryCache(),
})

const avaxTestnetBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/ethereum-block-fuji',
  cache: new InMemoryCache(),
})

const avaxMainnetBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/avalache-blocks',
  cache: new InMemoryCache(),
})

const fantomBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/fantom-blocks',
  cache: new InMemoryCache(),
})

const cronosTestnetBlockClient = new ApolloClient({
  uri: 'https://testnet-cronos-subgraph.knstats.com/subgraphs/name/dynamic-amm/ethereum-blocks-cronos-testnet',
  cache: new InMemoryCache(),
})

const cronosBlockClient = new ApolloClient({
  uri: 'https://cronos-subgraph.kyberswap.com/subgraphs/name/dynamic-amm/ethereum-blocks-cronos',
  cache: new InMemoryCache(),
})

const arbitrumTestnetBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/viet-nv/arbitrum-rinkeby-blocks',
  cache: new InMemoryCache(),
})

const arbitrumBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/viet-nv/arbitrum-blocks',
  cache: new InMemoryCache(),
})

const bttcBlockClient = new ApolloClient({
  uri: 'https://bttc-graph.dev.kyberengineering.io/subgraphs/name/dynamic-amm/bttc-blocks',
  cache: new InMemoryCache(),
})

const velasBlockClient = new ApolloClient({
  uri: 'https://velas-graph.kyberengineering.io/subgraphs/name/kybernetwork/velas-blocks',
  cache: new InMemoryCache(),
})

const auroraBlockClient = new ApolloClient({
  uri: 'https://aurora-graph.kyberengineering.io/subgraphs/name/kybernetwork/aurora-blocks',
  cache: new InMemoryCache()
})

export const blockClient: { [chainId in ChainId]: ApolloClient<NormalizedCacheObject> } = {
  [ChainId.MAINNET]: mainnetBlockClient,
  [ChainId.ROPSTEN]: ropstenBlockClient,
  [ChainId.RINKEBY]: ropstenBlockClient,
  [ChainId.GÖRLI]: ropstenBlockClient,
  [ChainId.KOVAN]: ropstenBlockClient,
  [ChainId.MATIC]: maticBlockClient,
  [ChainId.MUMBAI]: mumbaiBlockClient,
  [ChainId.BSCTESTNET]: bscTestnetBlockClient,
  [ChainId.BSCMAINNET]: bscMainnetBlockClient,
  [ChainId.AVAXTESTNET]: avaxTestnetBlockClient,
  [ChainId.AVAXMAINNET]: avaxMainnetBlockClient,
  [ChainId.FANTOM]: fantomBlockClient,
  [ChainId.CRONOSTESTNET]: cronosTestnetBlockClient,
  [ChainId.CRONOS]: cronosBlockClient,
  [ChainId.ARBITRUM_TESTNET]: arbitrumTestnetBlockClient,
  [ChainId.ARBITRUM]: arbitrumBlockClient,
  [ChainId.BTTC]: bttcBlockClient,
  [ChainId.AURORA]: auroraBlockClient,
  [ChainId.VELAS]: velasBlockClient,
}

//https://router.firebird.finance/bsc/route
export const routerUri: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: `${process.env.REACT_APP_AGGREGATOR_API}/ethereum/route`,
  [ChainId.BSCMAINNET]: `${process.env.REACT_APP_AGGREGATOR_API}/bsc/route`,
  [ChainId.MATIC]: `${process.env.REACT_APP_AGGREGATOR_API}/polygon/route`,
  [ChainId.AVAXMAINNET]: `${process.env.REACT_APP_AGGREGATOR_API}/avalanche/route`,
  [ChainId.FANTOM]: `${process.env.REACT_APP_AGGREGATOR_API}/fantom/route`,
  [ChainId.CRONOS]: `${process.env.REACT_APP_AGGREGATOR_API}/cronos/route`,
  [ChainId.ARBITRUM]: `${process.env.REACT_APP_AGGREGATOR_API}/arbitrum/route`,
  [ChainId.BTTC]: `${process.env.REACT_APP_AGGREGATOR_API}/bttc/route`,
  [ChainId.AURORA]: `${process.env.REACT_APP_AGGREGATOR_API}/aurora/route`,
  [ChainId.VELAS]: `${process.env.REACT_APP_AGGREGATOR_API}/velas/route`,
}

// TODO-swapv2: change price uri
export const priceUri: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '',
  [ChainId.BSCMAINNET]: 'https://price-api.firebird.finance',
  [ChainId.MATIC]: 'https://price-api-polygon.firebird.finance',
  [ChainId.AVAXMAINNET]: '',
}
