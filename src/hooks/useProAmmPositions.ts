import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/solidity'
import { useMemo } from 'react'

import { EVMNetworkInfo } from 'constants/networks/type'
import { useActiveWeb3React } from 'hooks'
import { Result, useSingleCallResult, useSingleContractMultipleData } from 'state/multicall/hooks'
import { PositionDetails } from 'types/position'

import { useProAmmNFTPositionManagerContract } from './useContract'

//           { "internalType": "uint96", "name": "nonce", "type": "uint96" },
//           { "internalType": "address", "name": "operator", "type": "address" },
//           { "internalType": "uint80", "name": "poolId", "type": "uint80" },
//           { "internalType": "int24", "name": "tickLower", "type": "int24" },
//           { "internalType": "int24", "name": "tickUpper", "type": "int24" },
//           { "internalType": "uint128", "name": "liquidity", "type": "uint128" },
//           { "internalType": "uint256", "name": "rTokenOwed", "type": "uint256" },
//           { "internalType": "uint256", "name": "feeGrowthInsideLast", "type": "uint256" }
interface UseProAmmPositionsResults {
  loading: boolean
  positions: PositionDetails[] | undefined
}

export function useProAmmPositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseProAmmPositionsResults {
  const positionManager = useProAmmNFTPositionManagerContract()
  const { isEVM, networkInfo } = useActiveWeb3React()

  const inputs = useMemo(() => (tokenIds ? tokenIds.map(tokenId => [tokenId]) : []), [tokenIds])
  const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds && isEVM) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.result as Result

        return {
          tokenId: tokenId,
          poolId: getCreate2Address(
            (networkInfo as EVMNetworkInfo).elastic.coreFactory,
            keccak256(
              ['bytes'],
              [
                defaultAbiCoder.encode(
                  ['address', 'address', 'uint24'],
                  [result.info.token0, result.info.token1, result.info.fee],
                ),
              ],
            ),
            (networkInfo as EVMNetworkInfo).elastic.initCodeHash,
          ),
          feeGrowthInsideLast: result.pos.feeGrowthInsideLast,
          nonce: result.pos.nonce,
          liquidity: result.pos.liquidity,
          operator: result.pos.operator,
          tickLower: result.pos.tickLower,
          tickUpper: result.pos.tickUpper,
          rTokenOwed: result.pos.rTokenOwed,
          fee: result.info.fee,
          token0: result.info.token0,
          token1: result.info.token1,
        }
      })
    }
    return undefined
  }, [loading, error, results, tokenIds, networkInfo, isEVM])

  return useMemo(() => {
    return {
      loading,
      positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
    }
  }, [loading, positions, inputs])
}

interface UseProAmmPositionResults {
  loading: boolean
  position: PositionDetails | undefined
}

export function useProAmmPositionsFromTokenId(tokenId: BigNumber | undefined): UseProAmmPositionResults {
  const position = useProAmmPositionsFromTokenIds(tokenId ? [tokenId] : undefined)
  return {
    loading: position.loading,
    position: position.positions?.[0],
  }
}

export const useTokenIdsOwnedByAddress = (address: string): { loading: boolean; tokenIds: BigNumber[] } => {
  const positionManager = useProAmmNFTPositionManagerContract()
  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    address ?? undefined,
  ])

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && address) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([address, i])
      }
      return tokenRequests
    }
    return []
  }, [address, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)

  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])
  const tokenIds = useMemo(() => {
    if (address) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is Result => !!result)
        .map(result => BigNumber.from(result[0]))
    }
    return []
  }, [address, tokenIdResults])

  return {
    loading: balanceLoading || someTokenIdsLoading,
    tokenIds,
  }
}

export function useProAmmPositions(account: string | null | undefined): UseProAmmPositionsResults {
  const positionManager = useProAmmNFTPositionManagerContract()
  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    account ?? undefined,
  ])

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber()

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i])
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)

  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])
  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is Result => !!result)
        .map(result => BigNumber.from(result[0]))
    }
    return []
  }, [account, tokenIdResults])

  const { positions, loading: positionsLoading } = useProAmmPositionsFromTokenIds(tokenIds)

  return useMemo(() => {
    return {
      loading: someTokenIdsLoading || balanceLoading || positionsLoading,
      positions,
    }
  }, [someTokenIdsLoading, balanceLoading, positionsLoading, positions])
}
