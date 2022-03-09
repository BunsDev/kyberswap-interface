import { useEffect, useState } from 'react'

import { GLOBAL_DATA } from 'apollo/queries'
import { useActiveWeb3React } from 'hooks'
import { ChainId } from '@dynamic-amm/sdk'
import { useBlockNumber, useExchangeClient } from 'state/application/hooks'
import { getExchangeSubgraphUrls } from 'apollo/manager'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import useAggregatorVolume from 'hooks/useAggregatorVolume'
import { SUPPORTED_NETWORKS } from 'constants/networks'

interface GlobalData {
  dmmFactories: {
    totalVolumeUSD: string
    totalVolumeETH: string
    totalFeeUSD: string
    untrackedVolumeUSD: string
    untrackedFeeUSD: string
    totalLiquidityUSD: string
    totalLiquidityETH: string
    totalAmplifiedLiquidityUSD: string
    totalAmplifiedLiquidityETH: string
    [key: string]: string
  }[]
  aggregatorData?: {
    totalVolume?: string
    last24hVolume?: string
  }
}

export function useGlobalData() {
  const { chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const apolloClient = useExchangeClient()
  const [globalData, setGlobalData] = useState<GlobalData>()
  const aggregatorData = useAggregatorVolume()

  useEffect(() => {
    const getSumValues = (results: { data: GlobalData }[], field: string) => {
      return results
        .reduce((total, item) => total + parseFloat(item?.data?.dmmFactories?.[0]?.[field] || '0'), 0)
        .toString()
    }

    const getResultByChainIds = async (chainIds: readonly ChainId[]) => {
      const allChainPromises = chainIds.map(chain => {
        const subgraphPromises = getExchangeSubgraphUrls(chain)
          .map(uri => new ApolloClient({ uri, cache: new InMemoryCache() }))
          .map(client =>
            client.query({
              query: GLOBAL_DATA(chain),
              fetchPolicy: 'cache-first',
            }),
          )
        return subgraphPromises
      })

      const queryResult = (
        await Promise.all(allChainPromises.map(promises => Promise.any(promises.map(p => p.catch(e => e)))))
      ).filter(res => !(res instanceof Error))

      return {
        data: {
          dmmFactories: [
            {
              totalVolumeUSD: getSumValues(queryResult, 'totalVolumeUSD'),
              totalVolumeETH: getSumValues(queryResult, 'totalVolumeETH'),
              totalFeeUSD: getSumValues(queryResult, 'totalFeeUSD'),
              untrackedVolumeUSD: getSumValues(queryResult, 'untrackedVolumeUSD'),
              untrackedFeeUSD: getSumValues(queryResult, 'untrackedFeeUSD'),
              totalLiquidityUSD: getSumValues(queryResult, 'totalLiquidityUSD'),
              totalLiquidityETH: getSumValues(queryResult, 'totalLiquidityETH'),
              totalAmplifiedLiquidityUSD: getSumValues(queryResult, 'totalAmplifiedLiquidityUSD'),
              totalAmplifiedLiquidityETH: getSumValues(queryResult, 'totalAmplifiedLiquidityETH'),
            },
          ],
        },
      }
    }

    async function getGlobalData() {
      const result = await getResultByChainIds(SUPPORTED_NETWORKS)

      setGlobalData({
        ...result.data,
        aggregatorData: {
          totalVolume: aggregatorData?.totalVolume,
          last24hVolume: aggregatorData?.last24hVolume,
        },
      })
    }

    getGlobalData()
  }, [chainId, blockNumber, apolloClient, aggregatorData])

  return globalData
}
