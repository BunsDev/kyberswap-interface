import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'

import { ChainId, Token } from '@dynamic-amm/sdk'
import FAIRLAUNCH_ABI from 'constants/abis/fairlaunch.json'
import FAIRLAUNCH_V2_ABI from 'constants/abis/fairlaunch-v2.json'
import { FAIRLAUNCH_ADDRESSES, FAIRLAUNCH_V2_ADDRESSES } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { useRewardLockerContracts } from 'hooks/useContract'
import { AppState } from 'state'
import { useAppDispatch } from 'state/hooks'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { useRewardTokensFullInfo } from 'utils/dmm'
import { setLoading, setSchedulesByRewardLocker } from './actions'
import { RewardLockerVersion } from 'state/farms/types'

export const useRewardLockerAddressesWithVersion = (): { [rewardLockerAddress: string]: RewardLockerVersion } => {
  const { chainId } = useActiveWeb3React()

  const fairLaunchAddresses = useMemo(() => FAIRLAUNCH_ADDRESSES[chainId as ChainId], [chainId])
  const fairLaunchV2Addresses = useMemo(() => FAIRLAUNCH_V2_ADDRESSES[chainId as ChainId], [chainId])
  const fairLaunchInterface = useMemo(() => new Interface(FAIRLAUNCH_ABI), [])
  const fairLaunchV2Interface = useMemo(() => new Interface(FAIRLAUNCH_V2_ABI), [])

  const rewardLockerAddressesV1MulticallResult = useMultipleContractSingleData(
    fairLaunchAddresses,
    fairLaunchInterface,
    'rewardLocker'
  )
  const rewardLockerAddressesV2MulticallResult = useMultipleContractSingleData(
    fairLaunchV2Addresses,
    fairLaunchV2Interface,
    'rewardLocker'
  )

  return useMemo(() => {
    const result: { [rewardLockerAddress: string]: RewardLockerVersion } = {}

    rewardLockerAddressesV1MulticallResult.forEach(callState => {
      callState.result &&
        callState.result.forEach(address => {
          if (result[address] === undefined) result[address] = RewardLockerVersion.V1
        })
    })

    rewardLockerAddressesV2MulticallResult.forEach(callState => {
      callState.result &&
        callState.result.forEach(address => {
          if (result[address] === undefined) result[address] = RewardLockerVersion.V2
        })
    })

    return result
  }, [rewardLockerAddressesV1MulticallResult, rewardLockerAddressesV2MulticallResult])
}

export const useRewardTokensByRewardLocker = () => {
  const { chainId } = useActiveWeb3React()

  /**
   * Both V1 and V2 contain `getRewardTokens` and `rewardLocker`
   */
  const fairLaunchAddresses = useMemo(
    () => [...FAIRLAUNCH_ADDRESSES[chainId as ChainId], ...FAIRLAUNCH_V2_ADDRESSES[chainId as ChainId]],
    [chainId]
  )
  const fairLaunchInterface = useMemo(() => new Interface(FAIRLAUNCH_ABI), [])

  const rewardTokensMulticallResult = useMultipleContractSingleData(
    fairLaunchAddresses,
    fairLaunchInterface,
    'getRewardTokens'
  )

  const rewardLockerAddressesMulticallResult = useMultipleContractSingleData(
    fairLaunchAddresses,
    fairLaunchInterface,
    'rewardLocker'
  )

  const fairLaunchToTokensMapping: { [key: string]: string[] } = useMemo(() => {
    const res: { [key: string]: string[] } = {}
    rewardTokensMulticallResult.forEach((token, index) => {
      res[fairLaunchAddresses[index]] = token?.result?.[0]
    })
    return res
  }, [rewardTokensMulticallResult, fairLaunchAddresses])

  const fairLaunchToRewardLockerMapping: { [key: string]: string } = useMemo(() => {
    const res: { [key: string]: string } = {}
    rewardLockerAddressesMulticallResult.forEach((address, index) => {
      res[fairLaunchAddresses[index]] = address?.result?.[0]
    })
    return res
  }, [rewardLockerAddressesMulticallResult, fairLaunchAddresses])

  // Get the mapping between reward locker => reward tokens
  return useMemo(() => {
    const result: { [key: string]: string[] } = {}

    Object.keys(fairLaunchToRewardLockerMapping).forEach(fairLaunchAddress => {
      const rewardLockerAddress = fairLaunchToRewardLockerMapping[fairLaunchAddress]
      const rewardTokens = fairLaunchToTokensMapping[fairLaunchAddress]

      if (result[rewardLockerAddress]) {
        result[rewardLockerAddress] = result[rewardLockerAddress].concat(
          rewardTokens.filter((item: string) => result[rewardLockerAddress].indexOf(item) < 0)
        )
      } else {
        result[rewardLockerAddress] = rewardTokens
      }
    })

    return result
  }, [fairLaunchToRewardLockerMapping, fairLaunchToTokensMapping])
}

export const useSchedules = () => {
  const dispatch = useAppDispatch()
  const { account } = useActiveWeb3React()
  const rewardLockerAddressesWithVersion = useRewardLockerAddressesWithVersion()
  const rewardTokensByRewardLocker = useRewardTokensByRewardLocker()
  const rewardLockerContracts = useRewardLockerContracts()
  const rewardTokensFullInfo = useRewardTokensFullInfo()

  const schedulesByRewardLocker = useSelector<
    AppState,
    { [key: string]: [BigNumber, BigNumber, BigNumber, BigNumber, Token, number, RewardLockerVersion][] }
  >(state => state.vesting.schedulesByRewardLocker)

  useEffect(() => {
    const fetchSchedules = async (account: string): Promise<any> => {
      dispatch(setLoading(true))
      try {
        const result: {
          [key: string]: [BigNumber, BigNumber, BigNumber, BigNumber, Token, number, RewardLockerVersion][]
        } = {}

        for (let i = 0; i < Object.keys(rewardLockerAddressesWithVersion).length; i++) {
          const rewardLockerAddress = Object.keys(rewardLockerAddressesWithVersion)[i]
          const rewardLockerVersion = rewardLockerAddressesWithVersion[rewardLockerAddress]
          const rewardLockerContract = rewardLockerContracts?.[rewardLockerAddress]
          const rewardTokenAddresses = rewardTokensByRewardLocker[rewardLockerAddress]
          const rewardTokens = rewardTokensFullInfo.filter(t => rewardTokenAddresses.includes(t.address))

          const promises = rewardTokens
            .filter(token => !!token)
            .map(async token => {
              const res = await rewardLockerContract?.getVestingSchedules(account, token.address)
              return res.map((s: any, index: any) => [...s, token, index, rewardLockerVersion])
            })

          const res = await Promise.all(promises)

          result[rewardLockerAddress] = res.flat()
        }

        dispatch(setSchedulesByRewardLocker(result))
      } catch (err) {
        console.error(err)
      }

      dispatch(setLoading(false))
    }

    if (account && rewardLockerContracts) {
      fetchSchedules(account)
    }
  }, [
    account,
    dispatch,
    rewardLockerAddressesWithVersion,
    rewardLockerContracts,
    rewardTokensByRewardLocker,
    rewardTokensFullInfo
  ])

  return { schedulesByRewardLocker }
}
