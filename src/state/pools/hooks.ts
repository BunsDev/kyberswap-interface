import { ApolloClient, NormalizedCacheObject, useQuery } from '@apollo/client'
import { ChainId } from '@kyberswap/ks-sdk-core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  POOLS_BULK_FROM_LIST,
  POOLS_BULK_WITH_PAGINATION,
  POOLS_HISTORICAL_BULK_FROM_LIST,
  POOLS_HISTORICAL_BULK_WITH_PAGINATION,
  POOL_COUNT,
  POOL_DATA,
  USER_POSITIONS,
} from 'apollo/queries'
import { NETWORKS_INFO } from 'constants/networks'
import { useActiveWeb3React } from 'hooks'
import { useETHPrice } from 'state/application/hooks'
import { get24hValue, getBlocksFromTimestamps, getPercentChange, getTimestampsForChanges } from 'utils'

import { AppState } from '../index'
import { ONLY_DYNAMIC_FEE_CHAINS } from './../../constants/index'
import { setError, setLoading, setSharedPoolId, updatePools } from './actions'

export interface SubgraphPoolData {
  id: string
  amp: string
  fee: number
  reserve0: string
  reserve1: string
  vReserve0: string
  vReserve1: string
  totalSupply: string
  reserveUSD: string
  volumeUSD: string
  feeUSD: string
  oneDayVolumeUSD: string
  oneDayVolumeUntracked: string
  oneDayFeeUSD: string
  oneDayFeeUntracked: string
  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
    totalLiquidity: string
    derivedETH: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
    totalLiquidity: string
    derivedETH: string
  }
}

export interface UserLiquidityPosition {
  id: string
  liquidityTokenBalance: string
  pool: {
    id: string
    token0: {
      id: string
    }
    token1: {
      id: string
    }
    reserveUSD: string
    totalSupply: string
  }
}

export interface UserLiquidityPositionResult {
  loading: boolean
  error: any
  data: {
    liquidityPositions: UserLiquidityPosition[]
  }
}

/**
 * Get my liquidity for all pools
 *
 * @param user string
 */
export function useUserLiquidityPositions(user: string | null | undefined): UserLiquidityPositionResult {
  const { loading, error, data } = useQuery(USER_POSITIONS, {
    variables: {
      user: user?.toLowerCase(),
    },
    fetchPolicy: 'no-cache',
  })

  return useMemo(() => ({ loading, error, data }), [data, error, loading])
}

function parseData(data: any, oneDayData: any, ethPrice: any, oneDayBlock: any, chainId?: ChainId): SubgraphPoolData {
  // get volume changes
  const oneDayVolumeUSD = get24hValue(data?.volumeUSD, oneDayData?.volumeUSD)
  const oneDayFeeUSD = get24hValue(data?.feeUSD, oneDayData?.feeUSD)
  const oneDayVolumeUntracked = get24hValue(data?.untrackedVolumeUSD, oneDayData?.untrackedVolumeUSD)
  const oneDayFeeUntracked = get24hValue(data?.untrackedFeeUSD, oneDayData?.untrackedFeeUSD)

  // set volume properties
  data.oneDayVolumeUSD = oneDayVolumeUSD
  data.oneDayFeeUSD = oneDayFeeUSD
  data.oneDayFeeUntracked = oneDayFeeUntracked
  data.oneDayVolumeUntracked = oneDayVolumeUntracked

  // set liquiditry properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice
  data.liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)

  // format if pool hasnt existed for a day or a week
  if (!oneDayData && data) {
    if (data.createdAtBlockNumber > oneDayBlock) data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
    else data.oneDayVolumeUSD = 0
  }

  if (chainId === ChainId.MAINNET) {
    if (data?.token0?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      data.token0 = { ...data.token0, name: 'Ether (Wrapped)', symbol: 'ETH' }
    }

    if (data?.token1?.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      data.token1 = { ...data.token1, name: 'Ether (Wrapped)', symbol: 'ETH' }
    }
  }

  if (chainId === ChainId.MATIC) {
    if (data?.token0?.id === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270') {
      data.token0 = { ...data.token0, name: 'Matic (Wrapped)', symbol: 'MATIC' }
    }

    if (data?.token1?.id === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270') {
      data.token1 = { ...data.token1, name: 'Matic (Wrapped)', symbol: 'MATIC' }
    }

    if (data?.token0?.id === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
      data.token0 = { ...data.token0, name: 'Ether (Wrapped)', symbol: 'ETH' }
    }

    if (data?.token1?.id === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
      data.token1 = { ...data.token1, name: 'Ether (Wrapped)', symbol: 'ETH' }
    }
  }

  if (chainId === ChainId.BSCMAINNET) {
    if (data?.token0?.id === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c') {
      data.token0 = { ...data.token0, name: 'BNB (Wrapped)', symbol: 'BNB' }
    }

    if (data?.token1?.id === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c') {
      data.token1 = { ...data.token1, name: 'BNB (Wrapped)', symbol: 'BNB' }
    }
  }

  if (chainId === ChainId.AVAXMAINNET) {
    if (data?.token0?.id === '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7') {
      data.token0 = { ...data.token0, name: 'AVAX (Wrapped)', symbol: 'AVAX' }
    }

    if (data?.token1?.id === '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7') {
      data.token1 = { ...data.token1, name: 'AVAX (Wrapped)', symbol: 'AVAX' }
    }
  }

  if (chainId === ChainId.CRONOS) {
    if (data?.token0?.id === '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23') {
      data.token0 = { ...data.token0, name: 'CRO (Wrapped)', symbol: 'CRO' }
    }

    if (data?.token1?.id === '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23') {
      data.token1 = { ...data.token1, name: 'CRO (Wrapped)', symbol: 'CRO' }
    }
  }

  if (chainId === ChainId.AURORA) {
    if (data?.token0?.id === '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb') {
      data.token0 = { ...data.token0, name: 'ETH (Wrapped)', symbol: 'ETH' }
    }

    if (data?.token1?.id === '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb') {
      data.token1 = { ...data.token1, name: 'ETH (Wrapped)', symbol: 'ETH' }
    }
  }

  return data
}

export async function getBulkPoolDataFromPoolList(
  poolList: string[],
  apolloClient: ApolloClient<NormalizedCacheObject>,
  ethPrice?: string,
  chainId?: ChainId,
): Promise<any> {
  try {
    const current = await apolloClient.query({
      query: POOLS_BULK_FROM_LIST(poolList, chainId && !ONLY_DYNAMIC_FEE_CHAINS.includes(chainId)),
      fetchPolicy: 'network-only',
    })
    let poolData
    const [t1] = getTimestampsForChanges()
    const blocks = await getBlocksFromTimestamps([t1], chainId)
    if (!blocks.length) {
      return current.data.pools
    } else {
      const [{ number: b1 }] = blocks

      const [oneDayResult] = await Promise.all(
        [b1].map(async block => {
          const result = apolloClient.query({
            query: POOLS_HISTORICAL_BULK_FROM_LIST(
              block,
              poolList,
              chainId && !ONLY_DYNAMIC_FEE_CHAINS.includes(chainId),
            ),
            fetchPolicy: 'network-only',
          })
          return result
        }),
      )

      const oneDayData = oneDayResult?.data?.pools.reduce((obj: any, cur: any) => {
        return { ...obj, [cur.id]: cur }
      }, {})

      poolData = await Promise.all(
        current &&
          current.data.pools.map(async (pool: any) => {
            let data = { ...pool }
            let oneDayHistory = oneDayData?.[pool.id]
            if (!oneDayHistory) {
              const newData = await apolloClient.query({
                query: POOL_DATA(pool.id, b1, chainId && !ONLY_DYNAMIC_FEE_CHAINS.includes(chainId)),
                fetchPolicy: 'network-only',
              })
              oneDayHistory = newData.data.pools[0]
            }

            data = parseData(data, oneDayHistory, ethPrice, b1, chainId)

            return data
          }),
      )
    }

    return poolData
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function getBulkPoolDataWithPagination(
  first: number,
  skip: number,
  apolloClient: ApolloClient<NormalizedCacheObject>,
  ethPrice?: string,
  chainId?: ChainId,
): Promise<any> {
  try {
    const [t1] = getTimestampsForChanges()
    const blocks = await getBlocksFromTimestamps([t1], chainId)

    // In case we can't get the block one day ago then we set it to 0 which is fine
    // because our subgraph never syncs from block 0 => response is empty
    const [{ number: b1 }] = blocks.length ? blocks : [{ number: 0 }]
    const [oneDayResult, current] = await Promise.all(
      [b1]
        .map(async block => {
          const result = apolloClient
            .query({
              query: POOLS_HISTORICAL_BULK_WITH_PAGINATION(
                first,
                skip,
                block,
                chainId && !ONLY_DYNAMIC_FEE_CHAINS.includes(chainId),
              ),
              fetchPolicy: 'network-only',
            })
            .catch(err => {
              return err
            })
          return result
        })
        .concat(
          apolloClient.query({
            query: POOLS_BULK_WITH_PAGINATION(first, skip, chainId && !ONLY_DYNAMIC_FEE_CHAINS.includes(chainId)),
            fetchPolicy: 'network-only',
          }),
        ),
    )

    const oneDayData = oneDayResult?.data?.pools.reduce((obj: any, cur: any) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const poolData = await Promise.all(
      current &&
        current.data.pools.map(async (pool: any) => {
          let data = { ...pool }
          const oneDayHistory = oneDayData?.[pool.id]
          // TODO nguyenhuudungz: If number of pools > 1000 then uncomment this.
          // if (!oneDayHistory) {
          //   const newData = await apolloClient.query({
          //     query: POOL_DATA(pool.id, b1),
          //     fetchPolicy: 'network-only'
          //   })
          //   oneDayHistory = newData.data.pools[0]
          // }

          data = parseData(data, oneDayHistory, ethPrice, b1, chainId)

          return data
        }),
    )

    return poolData
  } catch (e) {
    console.error(e)
    throw e
  }
}

export function useResetPools(chainId: ChainId | undefined) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(updatePools({ pools: [] }))
    dispatch(setError(undefined))
  }, [chainId, dispatch])
}

export function usePoolCountInSubgraph(): number {
  const [poolCount, setPoolCount] = useState(0)
  const { chainId } = useActiveWeb3React()
  const apolloClient = NETWORKS_INFO[chainId || ChainId.MAINNET].classicClient

  useEffect(() => {
    const getPoolCount = async () => {
      const result = await apolloClient.query({
        query: POOL_COUNT,
        fetchPolicy: 'network-only',
      })
      setPoolCount(
        result?.data.dmmFactories.reduce((count: number, factory: { poolCount: number }) => {
          return count + factory.poolCount
        }, 0) || 0,
      )
    }

    getPoolCount()
  }, [apolloClient])

  return poolCount
}

export function useAllPoolsData(): {
  loading: AppState['pools']['loading']
  error: AppState['pools']['error']
  data: AppState['pools']['pools']
} {
  const dispatch = useDispatch()
  const { chainId } = useActiveWeb3React()
  const apolloClient = NETWORKS_INFO[chainId || ChainId.MAINNET].classicClient

  const poolsData = useSelector((state: AppState) => state.pools.pools)
  const loading = useSelector((state: AppState) => state.pools.loading)
  const error = useSelector((state: AppState) => state.pools.error)

  const { currentPrice: ethPrice } = useETHPrice()

  const poolCountSubgraph = usePoolCountInSubgraph()
  useEffect(() => {
    let cancelled = false

    const getPoolsData = async () => {
      try {
        if (poolCountSubgraph > 0 && poolsData.length === 0 && !error && ethPrice) {
          dispatch(setLoading(true))
          const ITEM_PER_CHUNK = Math.min(1000, poolCountSubgraph) // GraphNode can handle max 1000 records per query.
          const promises = []
          for (let i = 0, j = poolCountSubgraph; i < j; i += ITEM_PER_CHUNK) {
            promises.push(() => getBulkPoolDataWithPagination(ITEM_PER_CHUNK, i, apolloClient, ethPrice, chainId))
          }
          const pools = (await Promise.all(promises.map(callback => callback()))).flat()
          !cancelled && dispatch(updatePools({ pools }))
          !cancelled && dispatch(setLoading(false))
        }
      } catch (error) {
        !cancelled && dispatch(setError(error as Error))
        !cancelled && dispatch(setLoading(false))
      }
    }

    getPoolsData()

    return () => {
      cancelled = true
    }
  }, [apolloClient, chainId, dispatch, error, ethPrice, poolCountSubgraph, poolsData.length])

  return useMemo(() => ({ loading, error, data: poolsData }), [error, loading, poolsData])
}

export function useSelectedPool() {
  return useSelector((state: AppState) => state.pools.selectedPool)
}

export function useSinglePoolData(
  poolAddress: string | undefined,
  ethPrice?: string,
): {
  loading: boolean
  error?: Error
  data?: SubgraphPoolData
} {
  const { chainId } = useActiveWeb3React()
  const apolloClient = NETWORKS_INFO[chainId || ChainId.MAINNET].classicClient

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [poolData, setPoolData] = useState<SubgraphPoolData>()

  const latestRenderTime = useRef(0)
  useEffect(() => {
    async function checkForPools(currentRenderTime: number) {
      setLoading(true)

      try {
        if (poolAddress && !error) {
          const pools = await getBulkPoolDataFromPoolList([poolAddress], apolloClient, ethPrice, chainId)

          if (pools.length > 0) {
            currentRenderTime === latestRenderTime.current && setPoolData(pools[0])
          }
        }
      } catch (error) {
        currentRenderTime === latestRenderTime.current && setError(error as Error)
      }

      setLoading(false)
    }

    checkForPools(latestRenderTime.current)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      latestRenderTime.current++
    }
  }, [ethPrice, error, poolAddress, apolloClient, chainId])

  return { loading, error, data: poolData }
}

export function useSharedPoolIdManager(): [string | undefined, (newSharedPoolId: string | undefined) => void] {
  const dispatch = useDispatch()
  const sharedPoolId = useSelector((state: AppState) => state.pools.sharedPoolId)

  const onSetSharedPoolId = useCallback(
    (newSharedPoolId: string | undefined) => {
      dispatch(setSharedPoolId({ poolId: newSharedPoolId }))
    },
    [dispatch],
  )

  return useMemo(() => [sharedPoolId, onSetSharedPoolId], [onSetSharedPoolId, sharedPoolId])
}
