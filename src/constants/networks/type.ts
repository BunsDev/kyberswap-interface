import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from '@namgold/ks-sdk-core'
import { Connection } from '@solana/web3.js'

export interface NetworkInfo {
  readonly chainId: ChainId

  // route can be used to detect which chain is favored in query param, check out useActiveNetwork.ts
  readonly route: string
  readonly name: string
  readonly icon: string
  readonly iconDark: string | null
  readonly iconSelected: string | null
  readonly iconDarkSelected: string | null
  readonly etherscanUrl: string
  readonly etherscanName: string
  readonly bridgeURL: string
  readonly nativeToken: {
    readonly symbol: string
    readonly name: string
    readonly logo: string
    readonly decimal: number
  }
  readonly routerUri: string
  readonly coingeckoNetworkId: string //https://api.coingecko.com/api/v3/asset_platforms
  readonly coingeckoNativeTokenId: string //https://api.coingecko.com/api/v3/coins/list
  readonly deBankSlug: string
  readonly tokenListUrl: string
  readonly trueSightId: string | null
  // token: {
  //   DAI: Token
  //   USDC: Token
  //   USDT: Token
  // }
}

export interface EVMNetworkInfo extends NetworkInfo {
  readonly classicClient: ApolloClient<NormalizedCacheObject>
  readonly elasticClient: ApolloClient<NormalizedCacheObject>
  readonly blockClient: ApolloClient<NormalizedCacheObject>
  readonly rpcUrl: string
  readonly multicall: string
  readonly classic: {
    readonly static: {
      readonly zap: string
      readonly router: string
      readonly factory: string
    }
    readonly oldStatic: {
      readonly zap: string
      readonly router: string
      readonly factory: string
    } | null
    readonly dynamic: {
      readonly zap: string
      readonly router: string
      readonly factory: string
    } | null
    readonly claimReward: string | null
    readonly fairlaunch: string[]
    readonly fairlaunchV2: string[]
  }
  readonly elastic: {
    readonly coreFactory: string
    readonly nonfungiblePositionManager: string
    readonly tickReader: string
    readonly initCodeHash: string
    readonly quoter: string
    readonly routers: string
  }
  readonly averageBlockTimeInSeconds: number
}

export interface SolanaNetworkInfo extends NetworkInfo {
  readonly classic: {
    readonly pool: string
    readonly factory: string
    readonly router: string
  }
  connection: Connection
}
