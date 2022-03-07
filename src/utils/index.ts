import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'
import Numeral from 'numeral'
import dayjs from 'dayjs'

import { blockClient } from 'apollo/client'
import { GET_BLOCK, GET_BLOCKS } from 'apollo/queries'
import {
  ROUTER_ADDRESSES,
  ROUTER_ADDRESSES_V2,
  ZAP_ADDRESSES,
  FACTORY_ADDRESSES,
  ROPSTEN_TOKEN_LOGOS_MAPPING,
  MIGRATE_ADDRESS,
  KNCL_ADDRESS,
  KNCL_ADDRESS_ROPSTEN,
  KNC,
  AGGREGATION_EXECUTOR,
  DEFAULT_GAS_LIMIT_MARGIN,
  CLAIM_REWARD_SC_ADDRESS,
  FEE_OPTIONS
} from '../constants'
import ROUTER_ABI from '../constants/abis/dmm-router.json'
import ROUTER_ABI_WITHOUT_DYNAMIC_FEE from '../constants/abis/dmm-router-without-dynamic-fee.json'
import ROUTER_ABI_V2 from '../constants/abis/dmm-router-v2.json'
import AGGREGATOR_EXECUTOR_ABI from '../constants/abis/aggregation-executor.json'
import MIGRATOR_ABI from '../constants/abis/dmm-migrator.json'
import FACTORY_ABI from '../constants/abis/dmm-factory.json'
import ZAP_ABI from '../constants/abis/zap.json'
import CLAIM_REWARD_ABI from '../constants/abis/claim-reward.json'
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, ETHER, WETH } from '@dynamic-amm/sdk'
import { TokenAddressMap } from '../state/lists/hooks'
import { getEthereumMainnetTokenLogoURL } from './ethereumMainnetTokenMapping'
import { getMaticTokenLogoURL } from './maticTokenMapping'
import { getBscMainnetTokenLogoURL } from './bscMainnetTokenMapping'
import { getMumbaiTokenLogoURL } from './mumbaiTokenMapping'
import { getBscTestnetTokenLogoURL } from './bscTestnetTokenMapping'
import { getAvaxTestnetTokenLogoURL } from './avaxTestnetTokenMapping'
import { getAvaxMainnetTokenLogoURL } from './avaxMainnetTokenMapping'
import { getFantomTokenLogoURL } from './fantomTokenMapping'
import { getCronosTokenLogoURL } from './cronosTokenMapping'
import { getAuroraTokenLogoURL } from './auroraTokenMapping'
import { BTTC_TOKEN_LIST } from 'constants/tokenLists/bttc.tokenlist'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function isAddressString(value: any): string {
  try {
    return getAddress(value)
  } catch {
    return ''
  }
}

function getEtherscanDomain(chainId: ChainId): string {
  switch (chainId) {
    case ChainId.MAINNET:
      return 'https://etherscan.io'
    case ChainId.ROPSTEN:
      return 'https://ropsten.etherscan.io'
    case ChainId.RINKEBY:
      return 'https://rinkeby.etherscan.io'
    case ChainId.GÖRLI:
      return 'https://goerli.etherscan.io'
    case ChainId.KOVAN:
      return 'https://kovan.etherscan.io'
    case ChainId.MATIC:
      return 'https://polygonscan.com'
    case ChainId.MUMBAI:
      return 'https://mumbai.polygonscan.com'
    case ChainId.BSCTESTNET:
      return 'https://testnet.bscscan.com'
    case ChainId.BSCMAINNET:
      return 'https://bscscan.com'
    case ChainId.AVAXTESTNET:
      return 'https://testnet.snowtrace.io'
    case ChainId.AVAXMAINNET:
      return 'https://snowtrace.io'
    case ChainId.FANTOM:
      return 'https://ftmscan.com'
    case ChainId.CRONOSTESTNET:
      return 'https://cronos.crypto.org/explorer/testnet3'
    case ChainId.CRONOS:
      return 'https://cronos.crypto.org/explorer'
    case ChainId.AURORA:
      return 'https://explorer.mainnet.aurora.dev'
    case ChainId.ARBITRUM_TESTNET:
      return 'https://testnet.arbiscan.io'
    case ChainId.ARBITRUM:
      return 'https://arbiscan.io'
    case ChainId.BTTC:
      return 'https://bttcscan.com'
    default:
      return ''
  }
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const prefix = getEtherscanDomain(chainId)

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

export function getEtherscanLinkText(chainId: ChainId): string {
  if ([ChainId.MATIC, ChainId.MUMBAI].includes(chainId)) {
    return 'View on Explorer'
  }
  if ([ChainId.BSCTESTNET, ChainId.BSCMAINNET].includes(chainId)) {
    return 'View on Bscscan'
  }

  if ([ChainId.AVAXTESTNET, ChainId.AVAXMAINNET].includes(chainId)) {
    return 'View on Snowtrace Explorer'
  }

  if ([ChainId.FANTOM].includes(chainId)) {
    return 'View on Ftmscan'
  }

  if ([ChainId.CRONOSTESTNET, ChainId.CRONOS].includes(chainId)) {
    return 'View on Explorer'
  }

  if ([ChainId.AURORA].includes(chainId)) {
    return 'View on Explorer'
  }

  if ([ChainId.ARBITRUM, ChainId.ARBITRUM_TESTNET].includes(chainId)) {
    return 'View on Arbiscan'
  }

  if (ChainId.BTTC === chainId) return 'View on BTTCScan'

  return 'View on Etherscan'
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

/**
 * Add a margin amount equal to max of 20000 or 20% of estimatedGas
 * total = estimate + max(20k, 20% * estimate)
 *
 * @param value BigNumber
 * @returns BigNumber
 */
export function calculateGasMargin(value: BigNumber): BigNumber {
  const defaultGasLimitMargin = BigNumber.from(DEFAULT_GAS_LIMIT_MARGIN)
  const gasMagin = value.mul(BigNumber.from(2000)).div(BigNumber.from(10000))

  return gasMagin.gte(defaultGasLimitMargin) ? value.add(gasMagin) : value.add(defaultGasLimitMargin)
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}
// account is optional
export function getContractForReading(address: string, ABI: any, library: ethers.providers.JsonRpcProvider): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, library)
}

// account is optional
export function getRouterContract(chainId: ChainId, library: Web3Provider, account?: string): Contract {
  return getContract(
    ROUTER_ADDRESSES[chainId],
    FEE_OPTIONS[chainId] ? ROUTER_ABI_WITHOUT_DYNAMIC_FEE : ROUTER_ABI,
    library,
    account
  )
}

export function getRouterV2Contract(chainId: ChainId, library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESSES_V2[chainId] || '', ROUTER_ABI_V2, library, account)
}

// account is optional
export function getZapContract(chainId: ChainId, library: Web3Provider, account?: string): Contract {
  return getContract(ZAP_ADDRESSES[chainId] || '', ZAP_ABI, library, account)
}

export function getClaimRewardContract(
  chainId: ChainId,
  library: Web3Provider,
  account?: string
): Contract | undefined {
  if (![ChainId.ROPSTEN, ChainId.MATIC].includes(chainId)) return
  return getContract(CLAIM_REWARD_SC_ADDRESS[chainId], CLAIM_REWARD_ABI, library, account)
}

export function getAggregationExecutorAddress(chainId: ChainId): string {
  return AGGREGATION_EXECUTOR[chainId] || ''
}

export function getAggregationExecutorContract(chainId: ChainId, library: Web3Provider, account?: string): Contract {
  return getContract(getAggregationExecutorAddress(chainId), AGGREGATOR_EXECUTOR_ABI, library, account)
}

export function getMigratorContract(_: number, library: Web3Provider, account?: string): Contract {
  return getContract(MIGRATE_ADDRESS, MIGRATOR_ABI, library, account)
}

export function getFactoryContract(chainId: ChainId, library: Web3Provider, account?: string): Contract {
  return getContract(FACTORY_ADDRESSES[chainId], FACTORY_ABI, library, account)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export const toK = (num: string) => {
  return Numeral(num).format('0.[00]a')
}

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number, digits: number) => {
  const formatter = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
  return formatter.format(num)
}

export function formattedNum(number: string, usd = false, acceptNegatives = false) {
  if (number === '' || number === undefined) {
    return usd ? '$0' : 0
  }

  const num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd ? formatDollarAmount(num, 0) : Number(num.toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4)
    } else {
      return formatDollarAmount(num, 2)
    }
  }

  return Number(num.toFixed(5)).toLocaleString()
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow: string, value24HoursAgo: string) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0
  }

  return adjustedPercentChange
}

export function getTimestampsForChanges(): [number, number, number] {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix()
  const t2 = utcCurrentTime
    .subtract(2, 'day')
    .startOf('minute')
    .unix()
  const tWeek = utcCurrentTime
    .subtract(1, 'week')
    .startOf('minute')
    .unix()
  return [t1, t2, tWeek]
}

export async function splitQuery(query: any, localClient: any, vars: any, list: any, skipCount = 100): Promise<any> {
  let fetchedData = {}
  let allFound = false
  let skip = 0

  while (!allFound) {
    let end = list.length
    if (skip + skipCount < list.length) {
      end = skip + skipCount
    }
    const sliced = list.slice(skip, end)
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first'
    })
    fetchedData = {
      ...fetchedData,
      ...result.data
    }
    if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
      allFound = true
    } else {
      skip += skipCount
    }
  }

  return fetchedData
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Int} timestamp in seconds
 */
export async function getBlockFromTimestamp(timestamp: number, chainId?: ChainId) {
  const result = await blockClient[chainId as ChainId].query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600
    },
    fetchPolicy: 'cache-first'
  })

  return result?.data?.blocks?.[0]?.number
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(timestamps: number[], chainId?: ChainId, skipCount = 500) {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData = await splitQuery(GET_BLOCKS, blockClient[chainId as ChainId], [], timestamps, skipCount)

  const blocks = []
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number']
        })
      }
    }
  }
  return blocks
}

/**
 * gets the amount difference in 24h
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const get24hValue = (valueNow: any, value24HoursAgo: any) => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo)

  return currentChange
}

export const getRopstenTokenLogoURL = (address: string) => {
  if (address.toLowerCase() === KNCL_ADDRESS_ROPSTEN.toLowerCase()) {
    return 'https://raw.githubusercontent.com/dynamic-amm/dmm-interface/develop/src/assets/images/KNCL.png'
  }

  if (ROPSTEN_TOKEN_LOGOS_MAPPING[address.toLowerCase()]) {
    address = ROPSTEN_TOKEN_LOGOS_MAPPING[address.toLowerCase()]
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
    address
  )}/logo.png`
}

export const getTokenLogoURL = (address: string, chainId?: ChainId): string => {
  if (address.toLowerCase() === KNC[chainId as ChainId].address.toLowerCase()) {
    return 'https://raw.githubusercontent.com/dynamic-amm/dmm-interface/develop/src/assets/images/KNC.svg'
  }

  if (address.toLowerCase() === KNCL_ADDRESS.toLowerCase()) {
    return 'https://raw.githubusercontent.com/dynamic-amm/dmm-interface/develop/src/assets/images/KNCL.png'
  }

  // WBTC
  if (address.toLowerCase() === '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f') {
    return 'https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744'
  }

  let imageURL

  switch (chainId) {
    case ChainId.MAINNET:
      imageURL = getEthereumMainnetTokenLogoURL(address)
      break
    case ChainId.ROPSTEN:
      imageURL = getRopstenTokenLogoURL(address)
      break
    case ChainId.MATIC:
      imageURL = getMaticTokenLogoURL(address)
      break
    case ChainId.MUMBAI:
      imageURL = getMumbaiTokenLogoURL(address)
      break
    case ChainId.BSCTESTNET:
      imageURL = getBscTestnetTokenLogoURL(address)
      break
    case ChainId.BSCMAINNET:
      imageURL = getBscMainnetTokenLogoURL(address)
      break
    case ChainId.AVAXTESTNET:
      imageURL = getAvaxTestnetTokenLogoURL(address)
      break
    case ChainId.AVAXMAINNET:
      imageURL = getAvaxMainnetTokenLogoURL(address)
      break
    case ChainId.FANTOM:
      imageURL = getFantomTokenLogoURL(address)
      break
    case ChainId.CRONOS:
      imageURL = getCronosTokenLogoURL(address)
      break
    case ChainId.AURORA:
      imageURL = getAuroraTokenLogoURL(address)
      break
    case ChainId.ARBITRUM:
      imageURL = `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/arbitrum/assets/${address}/logo.png`
      break
    case ChainId.BTTC:
      imageURL =
        BTTC_TOKEN_LIST.tokens.find(item => item.address.toLowerCase() === address.toLowerCase())?.logoURI || ''
      break
    default:
      imageURL = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
        address
      )}/logo.png`
      break
  }

  return imageURL
}

export const getTokenSymbol = (token: Token, chainId?: ChainId): string => {
  if (token.address.toLowerCase() === WETH[chainId as ChainId].address.toLowerCase()) {
    switch (chainId) {
      case ChainId.MATIC:
        return 'MATIC'
      case ChainId.MUMBAI:
        return 'MATIC'
      case ChainId.BSCTESTNET:
        return 'BNB'
      case ChainId.BSCMAINNET:
        return 'BNB'
      case ChainId.AVAXTESTNET:
        return 'AVAX'
      case ChainId.AVAXMAINNET:
        return 'AVAX'
      case ChainId.FANTOM:
        return 'FTM'
      case ChainId.CRONOSTESTNET:
        return 'CRO'
      case ChainId.CRONOS:
        return 'CRO'
      case ChainId.AURORA:
        return 'ETH'
      case ChainId.BTTC:
        return 'BTT'
      default:
        return 'ETH'
    }
  }

  return token.symbol || 'ETH'
}
