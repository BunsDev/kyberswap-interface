import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from '@dynamic-amm/sdk'
import { SUBGRAPH_BLOCK_NUMBER } from './queries'

const EXCHANGE_SUBGRAPH_URLS = {
  mainnet: ['https://api.thegraph.com/subgraphs/name/dynamic-amm/dynamic-amm'],
  mainnetStaging: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-staging'],
  ropsten: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-ropsten'],
  polygon: [
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-matic',
    'https://polygon-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-matic'
  ],
  polygonStaging: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-matic-staging'],
  mumbai: ['https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-mumbai'],
  bsc: [
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-bsc'
    // 'https://bsc-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-bsc'
  ],
  bscStaging: ['https://api.thegraph.com/subgraphs/name/ducquangkstn/dynamic-amm-bsc-staging'],
  bscTestnet: ['https://api.thegraph.com/subgraphs/name/ducquangkstn/dynamic-amm-ropsten'],
  avalanche: [
    'https://avax-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-avax',
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-avax'
  ],
  avalancheTestnet: ['https://api.thegraph.com/subgraphs/name/ducquangkstn/dmm-exchange-fuij'],
  fantom: [
    'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-ftm'
    // 'https://fantom-subgraph.dmm.exchange/subgraphs/name/dynamic-amm/dmm-exchange-ftm'
  ],
  cronosTestnet: ['https://testnet-cronos-subgraph.knstats.com/subgraphs/name/dynamic-amm/dmm-exchange-cronos-testnet'],
  cronos: ['https://cronos-subgraph.kyberswap.com/subgraphs/name/kyberswap/kyberswap-cronos'],
  arbitrumTestnet: ['https://api.thegraph.com/subgraphs/name/viet-nv/kyberswap-arbitrum-rinkeby'],
  arbitrum: ['https://api.thegraph.com/subgraphs/name/viet-nv/kyberswap-arbitrum'],
  bttc: ['https://bttc-graph.dev.kyberengineering.io/subgraphs/name/dynamic-amm/kyberswap-bttc'],
  aurora: ['https://aurora-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-aurora'],
  velas: ['https://velas-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-velas'],
}

export function getExchangeSubgraphUrls(networkId: ChainId): string[] {
  switch (networkId) {
    case ChainId.MAINNET:
      if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
        return EXCHANGE_SUBGRAPH_URLS.mainnetStaging
      } else {
        return EXCHANGE_SUBGRAPH_URLS.mainnet
      }
    case ChainId.ROPSTEN:
      return EXCHANGE_SUBGRAPH_URLS.ropsten
    // case ChainId.RINKEBY:
    //   return EXCHANGE_SUBGRAPH_URLS.ropsten
    // case ChainId.GÖRLI:
    //   return EXCHANGE_SUBGRAPH_URLS.ropsten
    // case ChainId.KOVAN:
    //   return EXCHANGE_SUBGRAPH_URLS.ropsten

    case ChainId.MATIC:
      if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
        return EXCHANGE_SUBGRAPH_URLS.polygonStaging
      } else {
        return EXCHANGE_SUBGRAPH_URLS.polygon
      }
    case ChainId.MUMBAI:
      return EXCHANGE_SUBGRAPH_URLS.mumbai
    case ChainId.BSCMAINNET:
      if (process.env.REACT_APP_MAINNET_ENV === 'staging') {
        return EXCHANGE_SUBGRAPH_URLS.bscStaging
      } else {
        return EXCHANGE_SUBGRAPH_URLS.bsc
      }
    case ChainId.BSCTESTNET:
      return EXCHANGE_SUBGRAPH_URLS.bscTestnet
    case ChainId.AVAXMAINNET:
      return EXCHANGE_SUBGRAPH_URLS.avalanche
    case ChainId.AVAXTESTNET:
      return EXCHANGE_SUBGRAPH_URLS.avalancheTestnet
    case ChainId.FANTOM:
      return EXCHANGE_SUBGRAPH_URLS.fantom
    case ChainId.CRONOSTESTNET:
      return EXCHANGE_SUBGRAPH_URLS.cronosTestnet
    case ChainId.CRONOS:
      return EXCHANGE_SUBGRAPH_URLS.cronos
    case ChainId.ARBITRUM_TESTNET:
      return EXCHANGE_SUBGRAPH_URLS.arbitrumTestnet
    case ChainId.ARBITRUM:
      return EXCHANGE_SUBGRAPH_URLS.arbitrum
    case ChainId.BTTC:
      return EXCHANGE_SUBGRAPH_URLS.bttc
    case ChainId.AURORA:
      return EXCHANGE_SUBGRAPH_URLS.aurora
    case ChainId.VELAS:
      return EXCHANGE_SUBGRAPH_URLS.velas
    default:
      return EXCHANGE_SUBGRAPH_URLS.mainnet
  }
}

export async function getExchangeSubgraphClient(chainId: ChainId): Promise<ApolloClient<NormalizedCacheObject>> {
  const subgraphUrls = getExchangeSubgraphUrls(chainId)

  if (subgraphUrls.length === 1) {
    return new ApolloClient({
      uri: subgraphUrls[0],
      cache: new InMemoryCache()
    })
  }

  const subgraphClients = subgraphUrls.map(
    uri =>
      new ApolloClient({
        uri,
        cache: new InMemoryCache()
      })
  )

  const subgraphPromises = subgraphClients.map(client =>
    client
      .query({
        query: SUBGRAPH_BLOCK_NUMBER(),
        fetchPolicy: 'network-only'
      })
      .catch(e => {
        console.error(e)
        return e
      })
  )

  const subgraphQueryResults = await Promise.all(subgraphPromises)

  const subgraphBlockNumbers = subgraphQueryResults.map(res =>
    res instanceof Error ? 0 : res?.data?._meta?.block?.number || 0
  )

  let bestIndex = 0
  let maxBlockNumber = 0

  for (let i = 0; i < subgraphClients.length; i += 1) {
    if (subgraphBlockNumbers[i] > maxBlockNumber) {
      maxBlockNumber = subgraphBlockNumbers[i]
      bestIndex = i
    }
  }

  return subgraphClients[bestIndex]
}

export const getExchangeSubgraphClients = async () => {
  const chainIds = [
    ChainId.MAINNET,
    ChainId.ROPSTEN,
    ChainId.MATIC,
    ChainId.MUMBAI,
    ChainId.BSCMAINNET,
    ChainId.BSCTESTNET,
    ChainId.AVAXMAINNET,
    ChainId.AVAXTESTNET,
    ChainId.FANTOM,
    ChainId.CRONOSTESTNET,
    ChainId.CRONOS,
    ChainId.ARBITRUM_TESTNET,
    ChainId.ARBITRUM,
    ChainId.BTTC,
    ChainId.AURORA,
    ChainId.VELAS,
  ]
  const promises = chainIds.map(chainId => getExchangeSubgraphClient(chainId))

  const res = await Promise.all(promises)

  return chainIds.reduce((obj, key, index) => ({ ...obj, [key]: res[index] }), {})
}
