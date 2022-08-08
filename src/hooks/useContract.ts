import { Contract } from '@ethersproject/contracts'
import { ChainId, WETH } from '@kyberswap/ks-sdk-core'
import { useMemo } from 'react'

import IUniswapV2PairABI from 'constants/abis/IUniswapV2PairABI.json'
import ZAP_STATIC_FEE_ABI from 'constants/abis/zap-static-fee.json'
import ZAP_ABI from 'constants/abis/zap.json'
import { NETWORKS_INFO } from 'constants/networks'
import { FARM_CONTRACTS as PROMM_FARM_CONTRACTS } from 'constants/v2'
import { FairLaunchVersion, RewardLockerVersion } from 'state/farms/types'
import { useRewardLockerAddressesWithVersion } from 'state/vesting/hooks'

import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS,
} from '../constants/abis/argent-wallet-detector'
import FACTORY_ABI from '../constants/abis/dmm-factory.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import FAIRLAUNCH_V2_ABI from '../constants/abis/fairlaunch-v2.json'
import FAIRLAUNCH_ABI from '../constants/abis/fairlaunch.json'
import KS_STATIC_FEE_FACTORY_ABI from '../constants/abis/ks-factory.json'
import REWARD_LOCKER_V2_ABI from '../constants/abis/reward-locker-v2.json'
import REWARD_LOCKER_ABI from '../constants/abis/reward-locker.json'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import NFTPositionManagerABI from '../constants/abis/v2/ProAmmNFTPositionManager.json'
import ProAmmPoolAbi from '../constants/abis/v2/ProAmmPoolState.json'
import QuoterABI from '../constants/abis/v2/ProAmmQuoter.json'
import TickReaderABI from '../constants/abis/v2/ProAmmTickReader.json'
import PROMM_FARM_ABI from '../constants/abis/v2/farm.json'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { getContract, getContractForReading } from '../utils'
import { providers, useActiveWeb3React } from './index'

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()
  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useContractForReading(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true,
): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useMemo(() => {
    if (!address || !chainId) return null
    const provider = providers[chainId]
    try {
      return getContractForReading(address, ABI, provider)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, chainId])
}

// returns null on errors
export function useMultipleContracts(
  addresses: string[] | undefined,
  ABI: any,
  withSignerIfPossible = true,
): {
  [key: string]: Contract
} | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0 || !ABI || !library) return null

    const result: {
      [key: string]: Contract
    } = {}

    try {
      addresses.forEach(address => {
        if (address) {
          result[address] = getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
        }
      })

      if (Object.keys(result).length > 0) {
        return result
      }

      return null
    } catch (error) {
      console.error('Failed to get contract', error)

      return null
    }
  }, [addresses, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useTokenContractForReading(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContractForReading(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false,
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GÖRLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI.abi, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContractForReading(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
    UNISOCKS_ABI,
    false,
  )
}

export function useOldStaticFeeFactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()

  return useContract(chainId && NETWORKS_INFO[chainId].classic.oldStatic?.factory, FACTORY_ABI)
}
export function useStaticFeeFactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()

  return useContract(chainId && NETWORKS_INFO[chainId].classic.static.factory, KS_STATIC_FEE_FACTORY_ABI)
}
export function useDynamicFeeFactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()

  return useContract(chainId && NETWORKS_INFO[chainId].classic.dynamic?.factory, FACTORY_ABI)
}

export function useZapContract(isStaticFeeContract: boolean, isOldStaticFeeContract: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId &&
      (isStaticFeeContract
        ? isOldStaticFeeContract
          ? NETWORKS_INFO[chainId].classic.oldStatic?.zap
          : NETWORKS_INFO[chainId].classic.static.zap
        : NETWORKS_INFO[chainId].classic.dynamic?.zap),
    isStaticFeeContract && !isOldStaticFeeContract ? ZAP_STATIC_FEE_ABI : ZAP_ABI,
  )
}

export function useProMMFarmContracts(): { [key: string]: Contract } | null {
  const { chainId } = useActiveWeb3React()
  return useMultipleContracts(chainId && PROMM_FARM_CONTRACTS[chainId], PROMM_FARM_ABI)
}

export function useProMMFarmContract(address: string): Contract | null {
  return useContract(address, PROMM_FARM_ABI)
}

export function useFairLaunchV1Contracts(withSignerIfPossible?: boolean): {
  [key: string]: Contract
} | null {
  const { chainId } = useActiveWeb3React()

  return useMultipleContracts(
    chainId && NETWORKS_INFO[chainId].classic.fairlaunch,
    FAIRLAUNCH_ABI,
    withSignerIfPossible,
  )
}

export function useFairLaunchV2Contracts(withSignerIfPossible?: boolean): {
  [key: string]: Contract
} | null {
  const { chainId } = useActiveWeb3React()

  return useMultipleContracts(
    chainId && NETWORKS_INFO[chainId].classic.fairlaunchV2,
    FAIRLAUNCH_V2_ABI,
    withSignerIfPossible,
  )
}

export function useFairLaunchContracts(withSignerIfPossible?: boolean): {
  [key: string]: Contract
} | null {
  const fairLaunchV1Contracts = useFairLaunchV1Contracts(withSignerIfPossible)
  const fairLaunchV2Contracts = useFairLaunchV2Contracts(withSignerIfPossible)

  const fairLaunchContracts = useMemo(() => {
    return { ...fairLaunchV1Contracts, ...fairLaunchV2Contracts }
  }, [fairLaunchV1Contracts, fairLaunchV2Contracts])

  return fairLaunchContracts
}

export const useFairLaunchVersion = (address: string): FairLaunchVersion => {
  const { chainId } = useActiveWeb3React()
  let version = FairLaunchVersion.V1

  // Use .find to search with case insensitive
  const isV2 = NETWORKS_INFO[chainId || ChainId.MAINNET].classic.fairlaunchV2.find(a => {
    return a.toLowerCase() === address.toLowerCase()
  })

  // Even if we have V3 in the future, we can update it here

  if (isV2) {
    version = FairLaunchVersion.V2
  }

  return version
}

export function useFairLaunchContract(address: string, withSignerIfPossible?: boolean): Contract | null {
  const version = useFairLaunchVersion(address)
  let abi

  switch (version) {
    case FairLaunchVersion.V1:
      abi = FAIRLAUNCH_ABI
      break
    case FairLaunchVersion.V2:
      abi = FAIRLAUNCH_V2_ABI
      break
    default:
      abi = FAIRLAUNCH_ABI
      break
  }

  return useContract(address, abi, withSignerIfPossible)
}

export function useRewardLockerContracts(withSignerIfPossible?: boolean): {
  [key: string]: Contract
} | null {
  const rewardLockerAddressesWithVersion = useRewardLockerAddressesWithVersion()
  const rewardLockerV1Addresses = useMemo(
    () =>
      Object.keys(rewardLockerAddressesWithVersion).filter(
        address => rewardLockerAddressesWithVersion[address] === RewardLockerVersion.V1,
      ),
    [rewardLockerAddressesWithVersion],
  )
  const rewardLockerV2Addresses = useMemo(
    () =>
      Object.keys(rewardLockerAddressesWithVersion).filter(
        address => rewardLockerAddressesWithVersion[address] === RewardLockerVersion.V2,
      ),
    [rewardLockerAddressesWithVersion],
  )
  const rewardLockerV1Contracts = useMultipleContracts(rewardLockerV1Addresses, REWARD_LOCKER_ABI, withSignerIfPossible)
  const rewardLockerV2Contracts = useMultipleContracts(
    rewardLockerV2Addresses,
    REWARD_LOCKER_V2_ABI,
    withSignerIfPossible,
  )
  return useMemo(
    () => ({ ...rewardLockerV1Contracts, ...rewardLockerV2Contracts }),
    [rewardLockerV1Contracts, rewardLockerV2Contracts],
  )
}

export function useRewardLockerContract(address: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, REWARD_LOCKER_ABI, withSignerIfPossible)
}

export function useProAmmNFTPositionManagerContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId && NETWORKS_INFO[chainId].elastic.nonfungiblePositionManager,
    NFTPositionManagerABI.abi,
    withSignerIfPossible,
  )
}

export function useProAmmPoolContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ProAmmPoolAbi.abi, withSignerIfPossible)
}

export function useProAmmTickReader(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && NETWORKS_INFO[chainId].elastic.tickReader, TickReaderABI.abi, withSignerIfPossible)
}

export function useProAmmQuoter() {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && NETWORKS_INFO[chainId].elastic.quoter, QuoterABI.abi)
}
