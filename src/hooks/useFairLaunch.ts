import { BigNumber } from 'ethers'
import { useCallback } from 'react'

import { CONTRACT_NOT_FOUND_MSG } from 'constants/messages'
import { useFairLaunchContract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils'
import { getFullDisplayBalance } from 'utils/formatBalance'

const useFairLaunch = (address: string) => {
  const addTransactionWithType = useTransactionAdder()
  const fairLaunchContract = useFairLaunchContract(address) // withSigner

  const getPoolLength = useCallback(async () => {
    try {
      const poolLength = await fairLaunchContract?.poolLength()

      return poolLength
    } catch (err) {
      console.error(err)
      return err
    }
  }, [fairLaunchContract])

  const getPoolInfo = useCallback(
    async (pid: number) => {
      try {
        const poolInfo = await fairLaunchContract?.getPoolInfo(pid)

        return poolInfo
      } catch (err) {
        console.error(err)
        return err
      }
    },
    [fairLaunchContract],
  )

  const getRewardTokens = useCallback(async (): Promise<string[]> => {
    try {
      const rewardTokens = await fairLaunchContract?.getRewardTokens()

      return rewardTokens
    } catch (err) {
      console.error(err)
      return []
    }
  }, [fairLaunchContract])

  // Deposit
  const deposit = useCallback(
    async (pid: number, amount: BigNumber, name: string, shouldHaverst = false) => {
      if (!fairLaunchContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }

      const estimateGas = await fairLaunchContract.estimateGas.deposit(pid, amount, shouldHaverst)
      const tx = await fairLaunchContract.deposit(pid, amount, shouldHaverst, {
        gasLimit: calculateGasMargin(estimateGas),
      })
      addTransactionWithType(tx, { type: 'Stake', summary: `${getFullDisplayBalance(amount)} ${name} Tokens` })

      return tx.hash
    },
    [addTransactionWithType, fairLaunchContract],
  )

  // Withdraw
  const withdraw = useCallback(
    async (pid: number, amount: BigNumber, name: string) => {
      if (!fairLaunchContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }

      const estimateGas = await fairLaunchContract.estimateGas.withdraw(pid, amount)
      const tx = await fairLaunchContract.withdraw(pid, amount, {
        gasLimit: calculateGasMargin(estimateGas),
      })
      addTransactionWithType(tx, { type: 'Unstake', summary: `${getFullDisplayBalance(amount)} ${name} Tokens` })

      return tx.hash
    },
    [addTransactionWithType, fairLaunchContract],
  )

  const harvest = useCallback(
    async (pid: number, _name: string) => {
      if (!fairLaunchContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }

      const estimateGas = await fairLaunchContract.estimateGas.harvest(pid)
      const tx = await fairLaunchContract.harvest(pid, {
        gasLimit: calculateGasMargin(estimateGas),
      })
      addTransactionWithType(tx, { type: 'Harvest' })

      return tx.hash
    },
    [addTransactionWithType, fairLaunchContract],
  )

  const harvestMultiplePools = useCallback(
    async (pids: number[]) => {
      if (!fairLaunchContract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG)
      }

      const estimateGas = await fairLaunchContract.estimateGas.harvestMultiplePools(pids)
      const tx = await fairLaunchContract.harvestMultiplePools(pids, {
        gasLimit: calculateGasMargin(estimateGas),
      })
      addTransactionWithType(tx, { type: 'Harvest' })

      return tx.hash
    },
    [addTransactionWithType, fairLaunchContract],
  )

  return {
    masterChefContract: fairLaunchContract,
    getPoolLength,
    getPoolInfo,
    getRewardTokens,
    deposit,
    withdraw,
    harvest,
    harvestMultiplePools,
  }
}

export default useFairLaunch
