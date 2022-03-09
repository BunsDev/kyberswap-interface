import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import {
  Fraction,
  JSBI,
  Price,
  Pair,
  Token,
  Currency,
  WETH,
  ZERO,
  ONE,
  ChainId,
  CurrencyAmount,
  ETHER
} from '@dynamic-amm/sdk'
import { SubgraphPoolData, UserLiquidityPosition } from 'state/pools/hooks'
import { formattedNum } from 'utils'
import { TokenAmount as TokenAmountSUSHI, Token as TokenSUSHI, ChainId as ChainIdSUSHI } from '@sushiswap/sdk'
import { TokenAmount as TokenAmountUNI, Token as TokenUNI, ChainId as ChainIdUNI } from '@uniswap/sdk'
import { Token as TokenDMM, TokenAmount as TokenAmountDMM, ChainId as ChainIdDMM } from '@dynamic-amm/sdk'
import { BLOCKS_PER_YEAR, SECONDS_PER_YEAR, ZERO_ADDRESS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { Farm, Reward, RewardPerTimeUnit } from 'state/farms/types'
import { useAllTokens } from 'hooks/Tokens'
import { useActiveAndUniqueFarmsData, useRewardTokenPrices, useRewardTokens } from 'state/farms/hooks'
import { getFullDisplayBalance } from './formatBalance'
import { useBlockNumber } from 'state/application/hooks'
import { tryParseAmount } from 'state/swap/hooks'
import { getAddress } from '@ethersproject/address'
import { unwrappedToken } from 'utils/wrappedCurrency'

export function priceRangeCalc(price?: Price | Fraction, amp?: Fraction): [Fraction | undefined, Fraction | undefined] {
  //Ex amp = 1.23456
  if (amp && (amp.equalTo(ONE) || amp?.equalTo(ZERO))) return [undefined, undefined]
  const temp = amp?.divide(amp?.subtract(JSBI.BigInt(1)))
  if (!amp || !temp || !price) return [undefined, undefined]
  return [
    (price as Price)?.adjusted.multiply(temp).multiply(temp),
    (price as Price)?.adjusted.divide(temp.multiply(temp))
  ]
}

export function parseSubgraphPoolData(
  poolData: SubgraphPoolData,
  chainId: ChainId
): {
  reserve0: CurrencyAmount | undefined
  virtualReserve0: CurrencyAmount | undefined
  reserve1: CurrencyAmount | undefined
  virtualReserve1: CurrencyAmount | undefined
  totalSupply: CurrencyAmount | undefined
  currency0: Currency
  currency1: Currency
} {
  const token0 = new Token(
    chainId,
    getAddress(poolData.token0.id),
    +poolData.token0.decimals,
    poolData.token0.symbol,
    poolData.token0.name
  )
  const token1 = new Token(
    chainId,
    getAddress(poolData.token1.id),
    +poolData.token1.decimals,
    poolData.token1.symbol,
    poolData.token1.name
  )
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)

  const reserve0 = tryParseAmount(poolData.reserve0, currency0)
  const virtualReserve0 = tryParseAmount(poolData.vReserve0, currency0)
  const reserve1 = tryParseAmount(poolData.reserve1, currency1)
  const virtualReserve1 = tryParseAmount(poolData.vReserve1, currency1)
  const totalSupply = tryParseAmount(poolData.totalSupply, ETHER) // Only care about decimals 18

  return {
    reserve0,
    virtualReserve0,
    reserve1,
    virtualReserve1,
    totalSupply,
    currency0,
    currency1
  }
}

function getToken0MinPrice(pool: Pair | SubgraphPoolData): Fraction {
  if (pool instanceof Pair) {
    const temp = pool.virtualReserve1.subtract(pool.reserve1)
    return temp
      .multiply(temp)
      .divide(pool.virtualReserve0)
      .divide(pool.virtualReserve1)
  } else {
    const { reserve0, virtualReserve0, reserve1, virtualReserve1 } = parseSubgraphPoolData(pool, 1) // chainId doesn't matter.
    if (reserve0 && virtualReserve0 && reserve1 && virtualReserve1) {
      const temp = virtualReserve1.subtract(reserve1)
      return temp
        .multiply(temp)
        .divide(virtualReserve0)
        .divide(virtualReserve1)
    } else {
      return new Fraction('-1')
    }
  }
}

function getToken0MaxPrice(pool: Pair | SubgraphPoolData): Fraction {
  if (pool instanceof Pair) {
    const temp = pool.virtualReserve0.subtract(pool.reserve0)

    // Avoid error division by 0
    if (temp.equalTo(new Fraction('0'))) {
      return new Fraction('-1')
    }

    return pool.virtualReserve0
      .multiply(pool.virtualReserve1)
      .divide(temp)
      .divide(temp)
  } else {
    const { reserve0, virtualReserve0, reserve1, virtualReserve1 } = parseSubgraphPoolData(pool, 1) // chainId doesn't matter.
    if (reserve0 && virtualReserve0 && reserve1 && virtualReserve1) {
      const temp = virtualReserve0.subtract(reserve0)

      // Avoid error division by 0
      if (temp.equalTo(new Fraction('0'))) {
        return new Fraction('-1')
      }

      return virtualReserve0
        .multiply(virtualReserve1)
        .divide(temp)
        .divide(temp)
    } else {
      return new Fraction('-1')
    }
  }
}

function getToken1MinPrice(pool: Pair | SubgraphPoolData): Fraction {
  if (pool instanceof Pair) {
    const temp = pool.virtualReserve0.subtract(pool.reserve0)
    return temp
      .multiply(temp)
      .divide(pool.virtualReserve0)
      .divide(pool.virtualReserve1)
  } else {
    const { reserve0, virtualReserve0, reserve1, virtualReserve1 } = parseSubgraphPoolData(pool, 1) // chainId doesn't matter.
    if (reserve0 && virtualReserve0 && reserve1 && virtualReserve1) {
      const temp = virtualReserve0.subtract(reserve0)
      return temp
        .multiply(temp)
        .divide(virtualReserve0)
        .divide(virtualReserve1)
    } else {
      return new Fraction('-1')
    }
  }
}

function getToken1MaxPrice(pool: Pair | SubgraphPoolData): Fraction {
  if (pool instanceof Pair) {
    const temp = pool.virtualReserve1.subtract(pool.reserve1)

    // Avoid error division by 0
    if (temp.equalTo(new Fraction('0'))) {
      return new Fraction('-1')
    }

    return pool.virtualReserve0
      .multiply(pool.virtualReserve1)
      .divide(temp)
      .divide(temp)
  } else {
    const { reserve0, virtualReserve0, reserve1, virtualReserve1 } = parseSubgraphPoolData(pool, 1) // chainId doesn't matter.
    if (reserve0 && virtualReserve0 && reserve1 && virtualReserve1) {
      const temp = virtualReserve1.subtract(reserve1)

      // Avoid error division by 0
      if (temp.equalTo(new Fraction('0'))) {
        return new Fraction('-1')
      }

      return virtualReserve0
        .multiply(virtualReserve1)
        .divide(temp)
        .divide(temp)
    } else {
      return new Fraction('-1')
    }
  }
}

export const priceRangeCalcByPair = (pair?: Pair): [Fraction | undefined, Fraction | undefined][] => {
  //Ex amp = 1.23456
  if (!pair || new Fraction(pair.amp).equalTo(JSBI.BigInt(10000)))
    return [
      [undefined, undefined],
      [undefined, undefined]
    ]
  return [
    [getToken0MinPrice(pair), getToken0MaxPrice(pair)],
    [getToken1MinPrice(pair), getToken1MaxPrice(pair)]
  ]
}

export const priceRangeCalcBySubgraphPool = (
  pool?: SubgraphPoolData
): [Fraction | undefined, Fraction | undefined][] => {
  if (!pool || new Fraction(pool.amp).equalTo(JSBI.BigInt(10000)))
    return [
      [undefined, undefined],
      [undefined, undefined]
    ]
  return [
    [getToken0MinPrice(pool), getToken0MaxPrice(pool)],
    [getToken1MinPrice(pool), getToken1MaxPrice(pool)]
  ]
}

export const feeRangeCalc = (amp: number): string => {
  let baseFee = 0
  if (amp > 20) baseFee = 4
  if (amp <= 20 && amp > 5) baseFee = 10
  if (amp <= 5 && amp > 2) baseFee = 20
  if (amp <= 2) baseFee = 30

  return `${(baseFee / 2 / 100).toPrecision()}% - ${((baseFee * 2) / 100).toPrecision()}%`
}

export const getTradingFeeAPR = (liquidity?: string, feeOneDay?: string): number => {
  return !feeOneDay || !liquidity || parseFloat(liquidity) === 0
    ? 0
    : (parseFloat(feeOneDay) * 365 * 100) / parseFloat(liquidity)
}

const DEFAULT_MY_LIQUIDITY = '-'

export const getMyLiquidity = (liquidityPosition?: UserLiquidityPosition): string | 0 => {
  if (!liquidityPosition || parseFloat(liquidityPosition.pool.totalSupply) === 0) {
    return DEFAULT_MY_LIQUIDITY
  }

  const myLiquidity =
    (parseFloat(liquidityPosition.liquidityTokenBalance) * parseFloat(liquidityPosition.pool.reserveUSD)) /
    parseFloat(liquidityPosition.pool.totalSupply)

  if (myLiquidity === 0) {
    return DEFAULT_MY_LIQUIDITY
  }

  return formattedNum(myLiquidity.toString(), true)
}

export function convertChainIdFromDmmToSushi(chainId: ChainIdDMM) {
  switch (chainId) {
    case ChainIdDMM.MAINNET:
      return ChainIdSUSHI.MAINNET
    case ChainIdDMM.ROPSTEN:
      return ChainIdSUSHI.ROPSTEN
    case ChainIdDMM.RINKEBY:
      return ChainIdSUSHI.RINKEBY
    case ChainIdDMM.GÖRLI:
      return ChainIdSUSHI.GÖRLI
    case ChainIdDMM.KOVAN:
      return ChainIdSUSHI.KOVAN
    case ChainIdDMM.MATIC:
      return ChainIdSUSHI.MATIC
    case ChainIdDMM.MUMBAI:
      return ChainIdSUSHI.MATIC_TESTNET
    case ChainIdDMM.BSCTESTNET:
      return ChainIdSUSHI.BSC_TESTNET
    case ChainIdDMM.BSCMAINNET:
      return ChainIdSUSHI.BSC
    case ChainIdDMM.AVAXTESTNET:
      return ChainIdSUSHI.FUJI
    case ChainIdDMM.AVAXMAINNET:
      return ChainIdSUSHI.AVALANCHE
    case ChainIdDMM.FANTOM:
      return ChainIdSUSHI.FANTOM
    default:
      return ChainIdSUSHI.MAINNET
  }
}

export function convertChainIdFromUniToDMM(chainId: ChainIdUNI) {
  switch (chainId) {
    case ChainIdUNI.MAINNET:
      return ChainIdDMM.MAINNET
    case ChainIdUNI.ROPSTEN:
      return ChainIdDMM.ROPSTEN
    case ChainIdUNI.RINKEBY:
      return ChainIdDMM.RINKEBY
    case ChainIdUNI.GÖRLI:
      return ChainIdDMM.GÖRLI
    case ChainIdUNI.KOVAN:
      return ChainIdDMM.KOVAN
  }
}

export function convertChainIdFromDmmToUni(chainId: ChainIdDMM) {
  switch (chainId) {
    case ChainIdDMM.MAINNET:
      return ChainIdUNI.MAINNET
    case ChainIdDMM.ROPSTEN:
      return ChainIdUNI.ROPSTEN
    case ChainIdDMM.RINKEBY:
      return ChainIdUNI.RINKEBY
    case ChainIdDMM.GÖRLI:
      return ChainIdUNI.GÖRLI
    case ChainIdDMM.KOVAN:
      return ChainIdUNI.KOVAN
    default:
      return undefined
  }
}

export function convertChainIdFromSushiToDMM(chainId: ChainIdSUSHI) {
  switch (chainId) {
    case ChainIdSUSHI.MAINNET:
      return ChainIdDMM.MAINNET
    case ChainIdSUSHI.ROPSTEN:
      return ChainIdDMM.ROPSTEN
    case ChainIdSUSHI.RINKEBY:
      return ChainIdDMM.RINKEBY
    case ChainIdSUSHI.GÖRLI:
      return ChainIdDMM.GÖRLI
    case ChainIdSUSHI.KOVAN:
      return ChainIdDMM.KOVAN
    case ChainIdSUSHI.MATIC:
      return ChainIdDMM.MATIC
    case ChainIdSUSHI.MATIC_TESTNET:
      return ChainIdDMM.MUMBAI
    default:
      return undefined
  }
}

export function tokenSushiToDmm(tokenSushi: TokenSUSHI): TokenDMM | undefined {
  const chainIdDMM = convertChainIdFromSushiToDMM(tokenSushi.chainId)
  return !!chainIdDMM
    ? new TokenDMM(chainIdDMM, tokenSushi.address, tokenSushi.decimals, tokenSushi.symbol, tokenSushi.name)
    : undefined
}
export function tokenDmmToSushi(tokenDmm: TokenDMM): TokenSUSHI {
  return new TokenSUSHI(
    convertChainIdFromDmmToSushi(tokenDmm.chainId),
    tokenDmm.address,
    tokenDmm.decimals,
    tokenDmm.symbol,
    tokenDmm.name
  )
}

export function tokenUniToDmm(tokenUni: TokenUNI): TokenDMM | undefined {
  return new TokenDMM(tokenUni.chainId as ChainId, tokenUni.address, tokenUni.decimals, tokenUni.symbol, tokenUni.name)
}

export function tokenDmmToUni(tokenDmm: TokenDMM): TokenUNI | undefined {
  const chainIdUNI = convertChainIdFromDmmToUni(tokenDmm.chainId)
  return !!chainIdUNI
    ? new TokenUNI(chainIdUNI, tokenDmm.address, tokenDmm.decimals, tokenDmm.symbol, tokenDmm.name)
    : undefined
}

export function tokenAmountDmmToSushi(amount: TokenAmountDMM): TokenAmountSUSHI {
  return new TokenAmountSUSHI(
    new TokenSUSHI(
      convertChainIdFromDmmToSushi(amount.token.chainId),
      amount.token.address,
      amount.token.decimals,
      amount.token.symbol,
      amount.token.name
    ),
    amount.raw
  )
}

export function tokenAmountDmmToUni(amount: TokenAmountDMM): TokenAmountUNI | undefined {
  const chainIdUNI = convertChainIdFromDmmToUni(amount.token.chainId)
  return !!chainIdUNI
    ? new TokenAmountUNI(
      new TokenUNI(chainIdUNI, amount.token.address, amount.token.decimals, amount.token.symbol, amount.token.name),
      amount.raw
    )
    : undefined
}

export function useFarmRewardsPerTimeUnit(farm?: Farm): RewardPerTimeUnit[] {
  if (!farm) {
    return []
  }

  const farmRewardsPerTimeUnit: RewardPerTimeUnit[] = []

  if (farm.rewardPerSeconds) {
    farm.rewardTokens.forEach((token, index) => {
      if (farmRewardsPerTimeUnit[index]) {
        farmRewardsPerTimeUnit[index].amount = farmRewardsPerTimeUnit[index].amount.add(
          BigNumber.from(farm.rewardPerSeconds[index])
        )
      } else {
        farmRewardsPerTimeUnit[index] = {
          token,
          amount: BigNumber.from(farm.rewardPerSeconds[index])
        }
      }
    })
  } else if (farm.rewardPerBlocks) {
    farm.rewardTokens.forEach((token, index) => {
      if (farmRewardsPerTimeUnit[index]) {
        farmRewardsPerTimeUnit[index].amount = farmRewardsPerTimeUnit[index].amount.add(
          BigNumber.from(farm.rewardPerBlocks[index])
        )
      } else {
        farmRewardsPerTimeUnit[index] = {
          token,
          amount: BigNumber.from(farm.rewardPerBlocks[index])
        }
      }
    })
  }

  return farmRewardsPerTimeUnit
}

/**
 * Get farm APR value in %
 * @param kncPriceUsd KNC price in USD
 * @param poolLiquidityUsd Total pool liquidity in USD
 * @returns
 */
export function useFarmApr(farm: Farm, poolLiquidityUsd: string): number {
  const { chainId } = useActiveWeb3React()
  const currentBlock = useBlockNumber()
  const rewardsPerTimeUnit = useFarmRewardsPerTimeUnit(farm)
  const tokenPrices = useRewardTokenPrices((rewardsPerTimeUnit || []).map(item => item.token))
  let yearlyRewardUSD

  if (farm.rewardPerSeconds) {
    // FarmV2

    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Check if pool is active for liquidity mining
    const isLiquidityMiningActive =
      currentTimestamp && farm.startTime && farm.endTime
        ? farm.startTime <= currentTimestamp && currentTimestamp <= farm.endTime
        : false

    if (parseFloat(poolLiquidityUsd) === 0 || !isLiquidityMiningActive) {
      return 0
    }

    if (!rewardsPerTimeUnit || rewardsPerTimeUnit.length === 0) {
      return 0
    }

    yearlyRewardUSD = rewardsPerTimeUnit.reduce((total, rewardPerSecond, index) => {
      if (!rewardPerSecond || !rewardPerSecond.amount) {
        return total
      }

      if (chainId && tokenPrices[index]) {
        const rewardPerSecondAmount = new TokenAmountDMM(rewardPerSecond.token, rewardPerSecond.amount.toString())
        const yearlyETHRewardAllocation = parseFloat(rewardPerSecondAmount.toSignificant(6)) * SECONDS_PER_YEAR
        total += yearlyETHRewardAllocation * tokenPrices[index]
      }

      return total
    }, 0)
  } else {
    // Check if pool is active for liquidity mining
    const isLiquidityMiningActive =
      currentBlock && farm.startBlock && farm.endBlock
        ? farm.startBlock <= currentBlock && currentBlock <= farm.endBlock
        : false

    if (parseFloat(poolLiquidityUsd) === 0 || !isLiquidityMiningActive) {
      return 0
    }

    if (!rewardsPerTimeUnit || rewardsPerTimeUnit.length === 0) {
      return 0
    }

    yearlyRewardUSD = rewardsPerTimeUnit.reduce((total, rewardPerBlock, index) => {
      if (!rewardPerBlock || !rewardPerBlock.amount) {
        return total
      }

      if (chainId && tokenPrices[index]) {
        const rewardPerBlockAmount = new TokenAmountDMM(rewardPerBlock.token, rewardPerBlock.amount.toString())
        const yearlyETHRewardAllocation =
          parseFloat(rewardPerBlockAmount.toSignificant(6)) * BLOCKS_PER_YEAR[chainId as ChainId]
        total += yearlyETHRewardAllocation * tokenPrices[index]
      }

      return total
    }, 0)
  }

  const apr = (yearlyRewardUSD / parseFloat(poolLiquidityUsd)) * 100

  return apr
}

export function convertToNativeTokenFromETH(currency: Currency, chainId?: ChainIdDMM): Currency {
  if (chainId && currency === Currency.ETHER) {
    if ([137, 80001].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'MATIC', 'MATIC')
    if ([97, 56].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'BNB', 'BNB')
    if ([43113, 43114].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'AVAX', 'AVAX')
    if ([250].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'FTM', 'FTM')
    if ([25, 338].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'CRO', 'CRO')
    if ([ChainId.AURORA].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'ETH', 'ETH')
    if ([ChainId.BTTC].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'BTT', 'BTT')
    if ([ChainId.ARBITRUM].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'ETH', 'ETH')
    if ([ChainId.VELAS].includes(chainId)) return new TokenDMM(chainId, WETH[chainId].address, 18, 'VLX', 'VLX')
  }

  return currency
}

export function useCurrencyConvertedToNative(currency?: Currency): Currency | undefined {
  const { chainId } = useActiveWeb3React()
  if (!!currency && !!chainId) {
    return convertToNativeTokenFromETH(currency, chainId)
  }
  return undefined
}

export function useFarmRewards(farms?: Farm[], onlyCurrentUser = true): Reward[] {
  if (!farms) {
    return []
  }

  const initialRewards: { [key: string]: Reward } = {}

  const userFarmRewards = farms.reduce((total, farm) => {
    if (farm.userData?.rewards) {
      farm.rewardTokens.forEach((token, index) => {
        if (total[token.address]) {
          total[token.address].amount = total[token.address].amount.add(BigNumber.from(farm.userData?.rewards?.[index]))
        } else {
          total[token.address] = {
            token,
            amount: BigNumber.from(farm.userData?.rewards?.[index])
          }
        }
      })
      return total
    }

    return total
  }, initialRewards)

  const initialAllFarmsRewards: { [key: string]: Reward } = {}

  const allFarmsRewards = farms.reduce((total, farm) => {
    if (farm.rewardPerSeconds) {
      farm.rewardTokens.forEach((token, index) => {
        if (total[token.address]) {
          total[token.address].amount = total[token.address].amount.add(
            BigNumber.from(farm.lastRewardTime - farm.startTime).mul(farm.rewardPerSeconds[index])
          )
        } else {
          total[token.address] = {
            token,
            amount: BigNumber.from(farm.lastRewardTime - farm.startTime).mul(farm.rewardPerSeconds[index])
          }
        }
      })
    } else {
      farm.rewardTokens.forEach((token, index) => {
        if (total[token.address]) {
          total[token.address].amount = total[token.address].amount.add(
            BigNumber.from(farm.lastRewardBlock - farm.startBlock).mul(farm.rewardPerBlocks[index])
          )
        } else {
          total[token.address] = {
            token,
            amount: BigNumber.from(farm.lastRewardBlock - farm.startBlock).mul(farm.rewardPerBlocks[index])
          }
        }
      })
    }

    return total
  }, initialAllFarmsRewards)

  return onlyCurrentUser ? Object.values(userFarmRewards) : Object.values(allFarmsRewards)
}

export function useFarmRewardsUSD(rewards?: Reward[]): number {
  const { chainId } = useActiveWeb3React()
  const tokenPrices = useRewardTokenPrices((rewards || []).map(item => item.token))
  if (!rewards) {
    return 0
  }

  const rewardUSD = rewards.reduce((total, reward, index) => {
    if (!reward || !reward.amount || !reward.token) {
      return total
    }

    if (chainId && tokenPrices[index]) {
      total += parseFloat(getFullDisplayBalance(reward.amount, reward.token.decimals)) * tokenPrices[index]
    }

    return total
  }, 0)

  return rewardUSD
}

export function useRewardTokensFullInfo(): Token[] {
  const { chainId } = useActiveWeb3React()
  const rewardTokens = useRewardTokens()
  const allTokens = useAllTokens()
  const nativeName =
    chainId && [137, 80001].includes(chainId)
      ? 'MATIC'
      : chainId && [97, 56].includes(chainId)
        ? 'BNB'
        : chainId && [43113, 43114].includes(chainId)
          ? 'AVAX'
          : chainId && [250].includes(chainId)
            ? 'FTM'
            : chainId && [25, 338].includes(chainId)
              ? 'CRO'
              : chainId && chainId === ChainId.BTTC
                ? 'BTT'
                : chainId && chainId === ChainId.VELAS
                  ? 'VLX'
                  : 'ETH'

  return useMemo(
    () =>
      !!rewardTokens && allTokens
        ? rewardTokens.map(address =>
          address.toLowerCase() === ZERO_ADDRESS.toLowerCase()
            ? new Token(chainId as ChainId, ZERO_ADDRESS.toLowerCase(), 18, nativeName, nativeName)
            : allTokens[address]
        )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, nativeName, JSON.stringify(rewardTokens)]
  )
}

export function useCheckIsFarmingPool(address: string): boolean {
  const { data: uniqueAndActiveFarms } = useActiveAndUniqueFarmsData()
  const uniqueAndActiveFarmAddresses = uniqueAndActiveFarms.map(farm => farm.id)

  return uniqueAndActiveFarmAddresses.includes(address) || uniqueAndActiveFarmAddresses.includes(address.toLowerCase())
}

export function errorFriendly(text: string): string {
  const error = text.toLowerCase()
  if (error.includes('router: expired')) {
    return 'An error occurred. Refresh the page and try again '
  } else if (
    error.includes('mintotalamountout') ||
    error.includes('err_limit_out') ||
    error.includes('return amount is not enough') ||
    error.includes('code=call_exception') ||
    error.includes('none of the calls threw an error')
  ) {
    return 'An error occurred. Try refreshing the price rate or increase max slippage'
  } else if (error.includes('header not found') || error.includes('swap failed') || error.includes('json-rpc error')) {
    return 'An error occurred. Refresh the page and try again. If the issue still persists, it might be an issue with your RPC node settings in Metamask.'
  } else return text
}
