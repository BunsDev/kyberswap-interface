import { ChainId, JSBI, Percent, Token, WETH } from '@dynamic-amm/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { injected, ledger, walletconnect, walletlink } from '../connectors'
import { PopularPair } from 'state/pair/types'
import { t } from '@lingui/macro'
import { uuid } from 'uuidv4'

export const ZAP_ADDRESSES: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging' ? '' : '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
  [ChainId.ROPSTEN]: '0xc33D1124c43cE3d020d1153fa0593eB9Ebc75Fb0',
  [ChainId.MATIC]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0xF79B1ea5566Ab2120f58bA8174055e9Eb8526975'
      : '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
  [ChainId.MUMBAI]: '',
  [ChainId.BSCTESTNET]: '0x0ff512d940F390Cd76D95304fC4493170e0B42DE',
  [ChainId.BSCMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging' ? '' : '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
  [ChainId.AVAXTESTNET]: '',
  [ChainId.AVAXMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging' ? '' : '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
  [ChainId.FANTOM]: process.env.REACT_APP_MAINNET_ENV === 'staging' ? '' : '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
  [ChainId.CRONOSTESTNET]: '',
  [ChainId.CRONOS]: '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
  [ChainId.ARBITRUM_TESTNET]: '0xfa33723F6fA00a35F69F8aCd72A5BE9AF3c8Bd25',
  [ChainId.ARBITRUM]: '0xf530a090EF6481cfB33F98c63532E7745abab58A',
  [ChainId.BTTC]: '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
  [ChainId.AURORA]: '0xd1f345593cb69fa546852b2DEb90f373F8AdC903',
  [ChainId.VELAS]: '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
}

export const ROUTER_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0xD8358861251E1af3081cD722Ae96c8753Ab7591D'
      : '0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6',
  [ChainId.ROPSTEN]: '0x96E8B9E051c81661C36a18dF64ba45F86AC80Aae',
  [ChainId.RINKEBY]: '',
  [ChainId.GÖRLI]: '',
  [ChainId.KOVAN]: '',
  [ChainId.MATIC]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x8Efa5A9AD6D594Cf76830267077B78cE0Bc5A5F8'
      : '0x546C79662E028B661dFB4767664d0273184E4dD1',
  [ChainId.MUMBAI]: '0xD536e64EAe5FBc62E277167e758AfEA570279956',
  [ChainId.BSCTESTNET]: '0x19395624C030A11f58e820C3AeFb1f5960d9742a',
  [ChainId.BSCMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x8Efa5A9AD6D594Cf76830267077B78cE0Bc5A5F8'
      : '0x78df70615ffc8066cc0887917f2Cd72092C86409',
  [ChainId.AVAXTESTNET]: '0x19395624C030A11f58e820C3AeFb1f5960d9742a',
  [ChainId.AVAXMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging' ? '' : '0x8Efa5A9AD6D594Cf76830267077B78cE0Bc5A5F8',
  [ChainId.FANTOM]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x8efa5a9ad6d594cf76830267077b78ce0bc5a5f8'
      : '0x5d5A5a0a465129848c2549669e12cDC2f8DE039A',
  [ChainId.CRONOSTESTNET]: '0x548E585B17908D0387d16F9BFf46c4EDe7ca7746',
  [ChainId.CRONOS]: '0xEaE47c5D99f7B31165a7f0c5f7E0D6afA25CFd55',
  [ChainId.ARBITRUM_TESTNET]: '0x78Ad9A49327D73C6E3B9881eCD653232cF3E480C',
  [ChainId.ARBITRUM]: '0xC3E2aED41ECdFB1ad41ED20D45377Da98D5489dD',
  [ChainId.BTTC]: '0xEaE47c5D99f7B31165a7f0c5f7E0D6afA25CFd55',
  [ChainId.AURORA]: '0x0622973c3A8893838A3bc0c5309a8c6897148795',
  [ChainId.VELAS]: '0xEaE47c5D99f7B31165a7f0c5f7E0D6afA25CFd55',
}

// Aggregation Router
export const ROUTER_ADDRESSES_V2: { [chainId in ChainId]?: string } = {
  [ChainId.BSCMAINNET]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.MATIC]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.AVAXMAINNET]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.MAINNET]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.FANTOM]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.CRONOS]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.ARBITRUM]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.BTTC]: '0xdf1a1b60f2d438842916c0adc43748768353ec25',
  [ChainId.AURORA]: '0xDF1A1b60f2D438842916C0aDc43748768353EC25',
  [ChainId.VELAS]: '0xDF1A1b60f2D438842916C0aDc43748768353EC25',
}

export const AGGREGATION_EXECUTOR: { [chainId in ChainId]?: string } = {
  [ChainId.BSCMAINNET]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.MATIC]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.AVAXMAINNET]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.MAINNET]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.FANTOM]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.CRONOS]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.BTTC]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.ARBITRUM]: '0xd12bcdfb9a39be79da3bdf02557efdcd5ca59e77',
  [ChainId.AURORA]: '0xd12bcdFB9A39BE79DA3bDF02557EFdcD5CA59e77',
  [ChainId.VELAS]: '0xd12bcdFB9A39BE79DA3bDF02557EFdcD5CA59e77',
}

export const FACTORY_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x5C1cBdc3b8dD2a3456643A62547ef9AA5e1571f3'
      : '0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE',
  [ChainId.ROPSTEN]: '0x0639542a5cd99bd5f4e85f58cb1f61d8fbe32de9',
  [ChainId.RINKEBY]: '',
  [ChainId.GÖRLI]: '',
  [ChainId.KOVAN]: '',
  [ChainId.MATIC]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x10908C875D865C66f271F5d3949848971c9595C9'
      : '0x5F1fe642060B5B9658C15721Ea22E982643c095c',
  [ChainId.MUMBAI]: '0x7900309d0b1c8D3d665Ae40e712E8ba4FC4F5453',
  [ChainId.BSCTESTNET]: '0x7900309d0b1c8D3d665Ae40e712E8ba4FC4F5453',
  [ChainId.BSCMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x10908C875D865C66f271F5d3949848971c9595C9'
      : '0x878dFE971d44e9122048308301F540910Bbd934c',
  [ChainId.AVAXTESTNET]: '0x7900309d0b1c8D3d665Ae40e712E8ba4FC4F5453',
  [ChainId.AVAXMAINNET]: '0x10908C875D865C66f271F5d3949848971c9595C9',
  [ChainId.FANTOM]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x10908C875D865C66f271F5d3949848971c9595C9'
      : '0x78df70615ffc8066cc0887917f2Cd72092C86409',
  [ChainId.CRONOSTESTNET]: '0x9fE747AEA6173DD2c72e9D9BF4E2bCbbC0f8aD9e',
  [ChainId.CRONOS]: '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974',
  [ChainId.ARBITRUM_TESTNET]: '0x9D4ffbf49cc21372c2115Ae4C155a1e5c0aACf36',
  [ChainId.ARBITRUM]: '0x51E8D106C646cA58Caf32A47812e95887C071a62',
  [ChainId.BTTC]: '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974',
  [ChainId.AURORA]: '0x39a8809fbbf22ccaeac450eaf559c076843eb910',
  [ChainId.VELAS]: '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974',
}

export const MIGRATE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x2f99E688cfe6FB7Add8F383779f259f370E16C25'
      : '0x6A65e062cE8290007301296F3C6AE446Af7BDEeC',
  [ChainId.ROPSTEN]: '0x247B641bB4eAff621987E2B5c3D0247489556E75',
  [ChainId.RINKEBY]: '',
  [ChainId.GÖRLI]: '',
  [ChainId.KOVAN]: '',
  [ChainId.MATIC]: '',
  [ChainId.MUMBAI]: '',
  [ChainId.BSCTESTNET]: '',
  [ChainId.BSCMAINNET]: '',
  [ChainId.AVAXTESTNET]: '',
  [ChainId.AVAXMAINNET]: '',
  [ChainId.FANTOM]: '',
  [ChainId.CRONOSTESTNET]: '',
  [ChainId.CRONOS]: '',
  [ChainId.ARBITRUM_TESTNET]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.BTTC]: '',
  [ChainId.AURORA]: '',
  [ChainId.VELAS]: '',
}

export const MIGRATE_ADDRESS = process.env.REACT_APP_MIGRATOR_ADDRESS || '0xa650f16F41cA35bF21594eef706290D26B12FF2e'
export const ROUTER_ADDRESS_UNI = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
// export const ROUTER_ADDRESS = '0x8406Caa2Cc202aFB4eCfb066D472E462bee00f3b'
// export const FACTORY_ADDRESS = '0x945c725e3eCC3dfdC350C0334f3fF42f08F719EA'
// export const ROUTER_ABI = IUniswapV2Router02ABI
// export const FACTORY_ABI = [{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":false,"internalType":"address","name":"pair","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalPair","type":"uint256"}],"name":"PairCreated","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenA","type":"address"},{"internalType":"contract IERC20","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeTo","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeToSetter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"","type":"address"},{"internalType":"contract IERC20","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_feeTo","type":"address"}],"name":"setFeeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeToSetter","type":"address"}],"name":"setFeeToSetter","outputs":[],"stateMutability":"nonpayable","type":"function"}]
export const INIT_CODE_HASH = '0xf6eae63ebbc500de6e7310fc6568df4e6a4514aac0d3d423da5e4e3f332d04f5'
export const BAD_RECIPIENT_ADDRESSES: string[] = [FACTORY_ADDRESSES[ChainId.MAINNET], ROUTER_ADDRESSES[ChainId.MAINNET]]

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const CLAIM_REWARD_SC_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '',
  [ChainId.ROPSTEN]: '0xB2eA6DaAD5334907311c63a27EdFb02535048f50',
  [ChainId.RINKEBY]: '',
  [ChainId.GÖRLI]: '',
  [ChainId.KOVAN]: '',
  [ChainId.MATIC]: '0x89929Bc485cE72D2Af7b7283B40b921e9F4f80b3',
  [ChainId.MUMBAI]: '',
  [ChainId.BSCTESTNET]: '',
  [ChainId.BSCMAINNET]: '',
  [ChainId.AVAXTESTNET]: '',
  [ChainId.AVAXMAINNET]: '',
  [ChainId.FANTOM]: '',
  [ChainId.CRONOSTESTNET]: '',
  [ChainId.CRONOS]: '',
  [ChainId.BTTC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.ARBITRUM_TESTNET]: '',
  [ChainId.AURORA]: '',
  [ChainId.VELAS]: '',
}
export const DMM_ANALYTICS_URL: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://staging-dmm-info.knstats.com'
      : 'https://analytics.kyberswap.com',
  [ChainId.ROPSTEN]: 'https://dev-dmm-info.knstats.com',
  [ChainId.RINKEBY]: 'https://analytics.kyberswap.com',
  [ChainId.GÖRLI]: 'https://analytics.kyberswap.com',
  [ChainId.KOVAN]: 'https://analytics.kyberswap.com',
  [ChainId.MATIC]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://staging-matic-dmm-info.knstats.com'
      : 'https://polygon-analytics.kyberswap.com',
  [ChainId.MUMBAI]: 'https://mumbai-dmm-info.knstats.com',
  [ChainId.BSCTESTNET]: 'https://mumbai-dmm-info.knstats.com',
  [ChainId.BSCMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://staging-bsc-dmm-info.knstats.com'
      : 'https://bsc-analytics.kyberswap.com',
  [ChainId.AVAXTESTNET]: '',
  [ChainId.AVAXMAINNET]: process.env.REACT_APP_MAINNET_ENV === 'staging' ? '' : 'https://avax-analytics.kyberswap.com',
  [ChainId.FANTOM]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? 'https://staging-fantom-dmm-info.knstats.com'
      : 'https://fantom-analytics.kyberswap.com',
  [ChainId.CRONOSTESTNET]: 'https://cronos-testnet-analytics.kyberswap.com',
  [ChainId.CRONOS]: 'https://cronos-analytics.kyberswap.com',
  [ChainId.ARBITRUM_TESTNET]: 'https://dmm-info-plum.vercel.app',
  [ChainId.ARBITRUM]: 'https://arbitrum-analytics.kyberswap.com',
  [ChainId.BTTC]: 'https://bttc-analytics.kyberswap.com',
  [ChainId.AURORA]: 'https://aurora-analytics.kyberswap.com',
  [ChainId.VELAS]: 'https://velas-analytics.kyberswap.com',
}

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const DAI: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.ROPSTEN]: new Token(
    ChainId.ROPSTEN,
    '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.RINKEBY]: new Token(
    ChainId.RINKEBY,
    '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0xaD6D458402F60fD3Bd25163575031ACDce07538D', 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0xaD6D458402F60fD3Bd25163575031ACDce07538D', 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.MATIC]: new Token(ChainId.MATIC, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.MUMBAI]: new Token(
    ChainId.MUMBAI,
    '0x5e2de02472aC02736b43054f095837725A5870eF',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.BSCTESTNET]: new Token(
    ChainId.BSCTESTNET,
    '0xBb843a2296F9AA49070EB2Dcd482f23548238f65',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.BSCMAINNET]: new Token(
    ChainId.BSCMAINNET,
    '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.AVAXTESTNET]: new Token(
    ChainId.AVAXTESTNET,
    '0xE50c0F38a1890Db49d64ac1C4A5B4fe2f02f819d',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.AVAXMAINNET]: new Token(
    ChainId.AVAXMAINNET,
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.FANTOM]: new Token(
    ChainId.FANTOM,
    '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.CRONOSTESTNET]: new Token(
    ChainId.CRONOSTESTNET,
    '0xFEC9C3feCB5f17A2C7b01492498D00966E623454',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.CRONOS]: new Token(
    ChainId.CRONOS,
    '0xF2001B145b43032AAF5Ee2884e456CCd805F677D',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.ARBITRUM_TESTNET]: new Token(
    ChainId.ARBITRUM_TESTNET,
    '0x340eefA7154BF23e328F59E936568607841FE027',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.ARBITRUM]: new Token(
    ChainId.ARBITRUM,
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    18,
    'DAI_e',
    'Dai Stablecoin_Ethereum',
  ),
  [ChainId.BTTC]: new Token(ChainId.BTTC, '0xe7dC549AE8DB61BDE71F22097BEcc8dB542cA100', 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.AURORA]: new Token(
    ChainId.AURORA,
    '0xe3520349F477A5F6EB06107066048508498A291b',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  //not existing on velas
  [ChainId.VELAS]: new Token(ChainId.VELAS, '0xe7dC549AE8DB61BDE71F22097BEcc8dB542cA100', 18, 'DAI', 'Dai Stablecoin'),
}

export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, '0x068B43f7F2f2c6a662C36E201144aE45f7a1C040', 6, 'USDC', 'USD Coin'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x068B43f7F2f2c6a662C36E201144aE45f7a1C040', 6, 'USDC', 'USD Coin'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0x068B43f7F2f2c6a662C36E201144aE45f7a1C040', 6, 'USDC', 'USD Coin'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0x068B43f7F2f2c6a662C36E201144aE45f7a1C040', 6, 'USDC', 'USD Coin'),
  [ChainId.MATIC]: new Token(ChainId.MATIC, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 'USDC', 'USD Coin'),
  [ChainId.MUMBAI]: new Token(ChainId.MUMBAI, '0x2CeC76B26A8d96BF3072D34A01BB3a4edE7c06BE', 6, 'USDC', 'USD Coin'),
  [ChainId.BSCTESTNET]: new Token(
    ChainId.BSCTESTNET,
    '0xb448B701807E644f141a4E4a269aD2F567526505',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.BSCMAINNET]: new Token(
    ChainId.BSCMAINNET,
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    18,
    'USDC',
    'USD Coin',
  ),
  [ChainId.AVAXTESTNET]: new Token(
    ChainId.AVAXTESTNET,
    '0x5973774202E8b0ad563A69D502bb0e670e7d00Dd',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.AVAXMAINNET]: new Token(
    ChainId.AVAXMAINNET,
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    6,
    'USDC.e',
    'USD Coin',
  ),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', 6, 'USDC', 'USD Coin'),
  [ChainId.CRONOSTESTNET]: new Token(
    ChainId.CRONOSTESTNET,
    '0x136ae5CC3150C4e53AF8b1DC886464CB9AF1AB61',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', 6, 'USDC', 'USD Coin'),
  [ChainId.ARBITRUM_TESTNET]: new Token(
    ChainId.ARBITRUM_TESTNET,
    '0xB4BbD0250618917b3679578C58f6440A227C8c03',
    6,
    'USDC',
    'USD Coin',
  ),

  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 6, 'USDC', 'USD Coin'),
  [ChainId.BTTC]: new Token(ChainId.BTTC, '0xCa424b845497f7204D9301bd13Ff87C0E2e86FCF', 18, 'USDC_b', 'USD Coin_BSC'),
  [ChainId.AURORA]: new Token(ChainId.AURORA, '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', 6, 'USDC', 'USD Coin'),
  [ChainId.VELAS]: new Token(ChainId.VELAS, '0xe2C120f188eBd5389F71Cf4d9C16d05b62A58993', 6, 'USDC', 'Multichain USDC'),
}

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, '0x65Bd1F48f1dd07bb285a3715c588F75684128acE', 6, 'USDT', 'Tether USD'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x65Bd1F48f1dd07bb285a3715c588F75684128acE', 6, 'USDT', 'Tether USD'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0x65Bd1F48f1dd07bb285a3715c588F75684128acE', 6, 'USDT', 'Tether USD'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0x65Bd1F48f1dd07bb285a3715c588F75684128acE', 6, 'USDT', 'Tether USD'),
  [ChainId.MATIC]: new Token(ChainId.MATIC, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6, 'USDT', 'Tether USD'),
  [ChainId.MUMBAI]: new Token(ChainId.MUMBAI, '0x064B91Bda6d178DfE03835de9450BFe78201c43F', 6, 'USDT', 'Tether USD'),
  [ChainId.BSCTESTNET]: new Token(
    ChainId.BSCTESTNET,
    '0x3d8f2Ada8e97e4eF19e4ccBf6ec1Ca52900406aA',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.BSCMAINNET]: new Token(
    ChainId.BSCMAINNET,
    '0x55d398326f99059fF775485246999027B3197955',
    18,
    'USDT',
    'Tether USD',
  ),
  [ChainId.AVAXTESTNET]: new Token(
    ChainId.AVAXTESTNET,
    '0xBD1EEAf651aEB210106E1c1aFb3BC41C388ee577',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.AVAXMAINNET]: new Token(
    ChainId.AVAXMAINNET,
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    6,
    'USDT.e',
    'Tether USD',
  ),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, '0x049d68029688eAbF473097a2fC38ef61633A3C7A', 6, 'fUSDT', 'Tether USD'),
  [ChainId.CRONOSTESTNET]: new Token(
    ChainId.CRONOSTESTNET,
    '0x0b19552b293Be73D147159537706450B52f53a61',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, '0x66e428c3f67a68878562e79A0234c1F83c208770', 6, 'USDT', 'Tether USD'),
  [ChainId.ARBITRUM_TESTNET]: new Token(
    ChainId.ARBITRUM_TESTNET,
    '0x41a56c30b881296859FB4db30Eb9a639B473619B',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.ARBITRUM]: new Token(
    ChainId.ARBITRUM,
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.BTTC]: new Token(ChainId.BTTC, '0x9B5F27f6ea9bBD753ce3793a07CbA3C74644330d', 18, 'USDT_b', 'Tether USD_BSC'),
  [ChainId.AURORA]: new Token(ChainId.AURORA, '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', 6, 'USDT', 'Tether USD'),
  [ChainId.VELAS]: new Token(ChainId.VELAS, '0x01445C31581c354b7338AC35693AB2001B50b9aE', 6, 'USDT', 'Multichain USDT'),
}

export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')
export const WBTC_ARBITRUM = new Token(
  ChainId.ARBITRUM,
  '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
  8,
  'WBTC',
  'Wrapped BTC',
)

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS: { [chainId in ChainId]: number } = {
  [ChainId.MAINNET]: 13.13,
  [ChainId.RINKEBY]: 13.13,
  [ChainId.ROPSTEN]: 13.13,
  [ChainId.GÖRLI]: 13.13,
  [ChainId.KOVAN]: 13.13,
  [ChainId.MATIC]: 2.6,
  [ChainId.MUMBAI]: 2.6,
  [ChainId.BSCTESTNET]: 3,
  [ChainId.BSCMAINNET]: 3,
  [ChainId.AVAXTESTNET]: 1.85,
  [ChainId.AVAXMAINNET]: 1.85,
  [ChainId.FANTOM]: 1,
  [ChainId.CRONOSTESTNET]: 6,
  [ChainId.CRONOS]: 5.6,
  [ChainId.AURORA]: 1,

  // TODO: check these info
  [ChainId.ARBITRUM]: 1,
  [ChainId.ARBITRUM_TESTNET]: 1,
  [ChainId.BTTC]: 2,
  [ChainId.VELAS]: 1,
}

export const BLOCKS_PER_YEAR: { [chainId in ChainId]: number } = {
  [ChainId.MAINNET]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.MAINNET]) * 60 * 24 * 365),
  [ChainId.RINKEBY]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.RINKEBY]) * 60 * 24 * 365),
  [ChainId.ROPSTEN]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.ROPSTEN]) * 60 * 24 * 365),
  [ChainId.GÖRLI]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.GÖRLI]) * 60 * 24 * 365),
  [ChainId.KOVAN]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.KOVAN]) * 60 * 24 * 365),
  [ChainId.MATIC]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.MATIC]) * 60 * 24 * 365),
  [ChainId.MUMBAI]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.MUMBAI]) * 60 * 24 * 365),
  [ChainId.BSCTESTNET]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.BSCTESTNET]) * 60 * 24 * 365),
  [ChainId.BSCMAINNET]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.BSCMAINNET]) * 60 * 24 * 365),
  [ChainId.AVAXTESTNET]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.AVAXTESTNET]) * 60 * 24 * 365),
  [ChainId.AVAXMAINNET]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.AVAXMAINNET]) * 60 * 24 * 365),
  [ChainId.FANTOM]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.FANTOM]) * 60 * 24 * 365),
  [ChainId.CRONOSTESTNET]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.CRONOSTESTNET]) * 60 * 24 * 365),
  [ChainId.CRONOS]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.CRONOS]) * 60 * 24 * 365),
  [ChainId.AURORA]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.AURORA]) * 60 * 24 * 365),
  [ChainId.BTTC]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.BTTC]) * 60 * 24 * 365),
  [ChainId.ARBITRUM_TESTNET]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.ARBITRUM_TESTNET]) * 60 * 24 * 365),
  [ChainId.ARBITRUM]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.ARBITRUM]) * 60 * 24 * 365),
  [ChainId.VELAS]: Math.floor((60 / AVERAGE_BLOCK_TIME_IN_SECS[ChainId.VELAS]) * 60 * 24 * 365),
}

export const SECONDS_PER_YEAR = 31556926

const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.MATIC]: new Token(ChainId.MATIC, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.MUMBAI]: new Token(ChainId.MUMBAI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.BSCTESTNET]: new Token(ChainId.MUMBAI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.BSCMAINNET]: new Token(ChainId.MUMBAI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.AVAXTESTNET]: new Token(ChainId.MUMBAI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.AVAXMAINNET]: new Token(ChainId.MUMBAI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.FANTOM]: new Token(ChainId.MUMBAI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.CRONOSTESTNET]: new Token(ChainId.CRONOSTESTNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.AURORA]: new Token(ChainId.AURORA, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.ARBITRUM_TESTNET]: new Token(ChainId.ARBITRUM_TESTNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', 18, 'UNI', 'Uniswap'),
  [ChainId.BTTC]: new Token(ChainId.BTTC, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.VELAS]: new Token(ChainId.VELAS, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
  [ChainId.MATIC]: [WETH[ChainId.MATIC]],
  [ChainId.MUMBAI]: [WETH[ChainId.MUMBAI]],
  [ChainId.BSCTESTNET]: [WETH[ChainId.BSCTESTNET]],
  [ChainId.BSCMAINNET]: [WETH[ChainId.BSCMAINNET]],
  [ChainId.AVAXTESTNET]: [WETH[ChainId.AVAXTESTNET]],
  [ChainId.AVAXMAINNET]: [WETH[ChainId.AVAXMAINNET]],
  [ChainId.FANTOM]: [WETH[ChainId.FANTOM]],
  [ChainId.CRONOSTESTNET]: [WETH[ChainId.CRONOSTESTNET]],
  [ChainId.CRONOS]: [WETH[ChainId.CRONOS]],
  [ChainId.AURORA]: [WETH[ChainId.AURORA]],
  [ChainId.BTTC]: [WETH[ChainId.BTTC]],
  [ChainId.ARBITRUM]: [WETH[ChainId.ARBITRUM]],
  [ChainId.ARBITRUM_TESTNET]: [WETH[ChainId.ARBITRUM_TESTNET]],
  [ChainId.VELAS]: [WETH[ChainId.VELAS]],
}

export const KNC_ADDRESS = '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202'

export const KNC: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.RINKEBY]: new Token(
    ChainId.RINKEBY,
    '0x8B4DDF9F13f382aff76D262F6C8C50E6d7961b94',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.ROPSTEN]: new Token(
    ChainId.ROPSTEN,
    '0x8B4DDF9F13f382aff76D262F6C8C50E6d7961b94',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.GÖRLI]: new Token(
    ChainId.GÖRLI,
    '0x8B4DDF9F13f382aff76D262F6C8C50E6d7961b94',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.KOVAN]: new Token(
    ChainId.KOVAN,
    '0x8B4DDF9F13f382aff76D262F6C8C50E6d7961b94',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? '0x51E8D106C646cA58Caf32A47812e95887C071a62'
      : '0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.MUMBAI]: new Token(
    ChainId.MUMBAI,
    '0xFD1f9381Cb641Dc76Fe8087dbcf8ea84a2c77cbE',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.BSCTESTNET]: new Token(
    ChainId.BSCTESTNET,
    '0x51E8D106C646cA58Caf32A47812e95887C071a62',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.BSCMAINNET]: new Token(
    ChainId.BSCMAINNET,
    '0xfe56d5892BDffC7BF58f2E84BE1b2C32D21C308b',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.AVAXTESTNET]: new Token(ChainId.AVAXTESTNET, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.AVAXMAINNET]: new Token(
    ChainId.AVAXMAINNET,
    '0x39fC9e94Caeacb435842FADeDeCB783589F50f5f',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.CRONOSTESTNET]: new Token(
    ChainId.CRONOSTESTNET,
    '0x868FC5cB3367C4A43c350b85D5001acaF58A857E',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.AURORA]: new Token(ChainId.AURORA, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),

  [ChainId.ARBITRUM_TESTNET]: new Token(
    ChainId.ARBITRUM_TESTNET,
    '0x7596961744096D12eFa3CfA58d1D30EDd82BD396',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),

  // UPDATE WHEN HAS BRIDGE KNC
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.BTTC]: new Token(ChainId.BTTC, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.VELAS]: new Token(ChainId.VELAS, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
}

export const KNCL_ADDRESS = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200'
export const KNCL_ADDRESS_ROPSTEN = '0x7b2810576aa1cce68f2b118cef1f36467c648f92'

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
    COMP,
    MKR,
  ],
  [ChainId.ROPSTEN]: [
    ...WETH_ONLY[ChainId.ROPSTEN],
    DAI[ChainId.ROPSTEN],
    USDC[ChainId.ROPSTEN],
    USDT[ChainId.ROPSTEN],
  ],
  [ChainId.MUMBAI]: [...WETH_ONLY[ChainId.MUMBAI], DAI[ChainId.MUMBAI], USDC[ChainId.MUMBAI], USDT[ChainId.MUMBAI]],
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    new Token(ChainId.MATIC, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'ETH', 'Ether'),
  ],

  [ChainId.BSCTESTNET]: [
    ...WETH_ONLY[ChainId.BSCTESTNET],
    DAI[ChainId.BSCTESTNET],
    USDC[ChainId.BSCTESTNET],
    USDT[ChainId.BSCTESTNET],
  ],
  [ChainId.BSCMAINNET]: [
    ...WETH_ONLY[ChainId.BSCMAINNET],
    DAI[ChainId.BSCMAINNET],
    USDC[ChainId.BSCMAINNET],
    USDT[ChainId.BSCMAINNET],
    new Token(ChainId.BSCMAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'BUSD'),
  ],
  [ChainId.AVAXTESTNET]: [
    ...WETH_ONLY[ChainId.AVAXTESTNET],
    DAI[ChainId.AVAXTESTNET],
    USDC[ChainId.AVAXTESTNET],
    USDT[ChainId.AVAXTESTNET],
  ],
  [ChainId.AVAXMAINNET]: [
    ...WETH_ONLY[ChainId.AVAXMAINNET],
    DAI[ChainId.AVAXMAINNET],
    USDC[ChainId.AVAXMAINNET],
    USDT[ChainId.AVAXMAINNET],
  ],
  [ChainId.FANTOM]: [...WETH_ONLY[ChainId.FANTOM], DAI[ChainId.FANTOM], USDC[ChainId.FANTOM], USDT[ChainId.FANTOM]],
  [ChainId.CRONOS]: [...WETH_ONLY[ChainId.CRONOS], DAI[ChainId.CRONOS], USDC[ChainId.CRONOS], USDT[ChainId.CRONOS]],
  [ChainId.AURORA]: [...WETH_ONLY[ChainId.AURORA], DAI[ChainId.AURORA], USDC[ChainId.AURORA], USDT[ChainId.AURORA]],
  [ChainId.VELAS]: [...WETH_ONLY[ChainId.VELAS], USDC[ChainId.VELAS], USDT[ChainId.VELAS]],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI[ChainId.MAINNET], WETH[ChainId.MAINNET]],
  },
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
  ],
  [ChainId.MATIC]: [...WETH_ONLY[ChainId.MATIC], DAI[ChainId.MATIC], USDC[ChainId.MATIC], USDT[ChainId.MATIC]],
  [ChainId.BSCMAINNET]: [
    ...WETH_ONLY[ChainId.BSCMAINNET],
    DAI[ChainId.BSCMAINNET],
    USDC[ChainId.BSCMAINNET],
    USDT[ChainId.BSCMAINNET],
    new Token(ChainId.BSCMAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'BUSD'),
  ],
  [ChainId.AVAXMAINNET]: [
    ...WETH_ONLY[ChainId.AVAXMAINNET],
    DAI[ChainId.AVAXMAINNET],
    USDC[ChainId.AVAXMAINNET],
    USDT[ChainId.AVAXMAINNET],
    new Token(ChainId.AVAXMAINNET, '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 18, 'WETH.e', 'Wrapped Ether'),
  ],

  [ChainId.FANTOM]: [...WETH_ONLY[ChainId.FANTOM], DAI[ChainId.FANTOM], USDC[ChainId.FANTOM], USDT[ChainId.FANTOM]],
  [ChainId.CRONOS]: [...WETH_ONLY[ChainId.CRONOS], DAI[ChainId.CRONOS], USDC[ChainId.CRONOS], USDT[ChainId.CRONOS]],
  [ChainId.AURORA]: [...WETH_ONLY[ChainId.AURORA], DAI[ChainId.AURORA], USDC[ChainId.AURORA], USDT[ChainId.AURORA]],
  [ChainId.ARBITRUM_TESTNET]: [
    ...WETH_ONLY[ChainId.ARBITRUM_TESTNET],
    DAI[ChainId.ARBITRUM_TESTNET],
    USDC[ChainId.ARBITRUM_TESTNET],
    USDT[ChainId.ARBITRUM_TESTNET],
  ],
  [ChainId.ARBITRUM]: [
    ...WETH_ONLY[ChainId.ARBITRUM],
    DAI[ChainId.ARBITRUM],
    USDC[ChainId.ARBITRUM],
    USDT[ChainId.ARBITRUM],
    WBTC_ARBITRUM,
  ],
  [ChainId.BTTC]: [...WETH_ONLY[ChainId.BTTC], DAI[ChainId.BTTC], USDC[ChainId.BTTC], USDT[ChainId.BTTC]],
  [ChainId.VELAS]: [...WETH_ONLY[ChainId.VELAS], USDC[ChainId.VELAS], USDT[ChainId.VELAS]],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
    KNC[ChainId.MAINNET],
    WBTC,
  ],
  [ChainId.ROPSTEN]: [...WETH_ONLY[ChainId.ROPSTEN], KNC[ChainId.ROPSTEN]],
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    KNC[ChainId.MATIC],
  ],
  [ChainId.MUMBAI]: [...WETH_ONLY[ChainId.MUMBAI], KNC[ChainId.MUMBAI]],
  [ChainId.BSCMAINNET]: [
    ...WETH_ONLY[ChainId.BSCMAINNET],
    DAI[ChainId.BSCMAINNET],
    USDC[ChainId.BSCMAINNET],
    USDT[ChainId.BSCMAINNET],
    new Token(ChainId.BSCMAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'BUSD'),
  ],
  [ChainId.AVAXMAINNET]: [
    ...WETH_ONLY[ChainId.AVAXMAINNET],
    DAI[ChainId.AVAXMAINNET],
    USDC[ChainId.AVAXMAINNET],
    USDT[ChainId.AVAXMAINNET],
  ],
  [ChainId.FANTOM]: [...WETH_ONLY[ChainId.FANTOM], DAI[ChainId.FANTOM], USDC[ChainId.FANTOM], USDT[ChainId.FANTOM]],
  [ChainId.CRONOS]: [...WETH_ONLY[ChainId.CRONOS], DAI[ChainId.CRONOS], USDC[ChainId.CRONOS], USDT[ChainId.CRONOS]],
  [ChainId.AURORA]: [...WETH_ONLY[ChainId.AURORA], DAI[ChainId.AURORA], USDC[ChainId.AURORA], USDT[ChainId.AURORA]],
  [ChainId.ARBITRUM]: [
    ...WETH_ONLY[ChainId.ARBITRUM],
    DAI[ChainId.ARBITRUM],
    USDC[ChainId.ARBITRUM],
    USDT[ChainId.ARBITRUM],
  ],
  [ChainId.VELAS]: [...WETH_ONLY[ChainId.VELAS], USDC[ChainId.VELAS], USDT[ChainId.VELAS]],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin'),
    ],
    [USDC[ChainId.MAINNET], USDT[ChainId.MAINNET]],
    [DAI[ChainId.MAINNET], USDT[ChainId.MAINNET]],
  ],
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.svg',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'wallet-connect.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'wallet-link.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5',
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'wallet-link.svg',
    description: 'Open in Coinbase Wallet app.',
    // To get this link: go to Coinbase app -> Dapp Browser -> go to dmm.exchange -> click "..." button -> share -> copy link
    href: 'https://go.cb-w.com/S7mannYpWjb',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true,
  },
  // FORTMATIC: {
  //   connector: fortmatic,
  //   name: 'Fortmatic',
  //   iconName: 'fortmaticIcon.png',
  //   description: 'Login using Fortmatic hosted wallet',
  //   href: null,
  //   color: '#6748FF',
  //   mobile: true
  // },
  // Portis: {
  //   connector: portis,
  //   name: 'Portis',
  //   iconName: 'portisIcon.png',
  //   description: 'Login using Portis hosted wallet',
  //   href: null,
  //   color: '#4A6C9B',
  //   mobile: true
  // },
  LEDGER: {
    connector: ledger,
    name: 'Ledger',
    iconName: 'ledger.svg',
    description: 'Ledger Device',
    href: null,
    color: '#315CF5',
  },
  // TREZOR: {
  //   connector: trezor,
  //   name: 'Trezor',
  //   iconName: 'trezor.svg',
  //   description: 'Trezor Device',
  //   href: null,
  //   color: '#315CF5'
  // }
}

export const BLACKLIST_WALLETS: string[] = [
  '0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b',
  '0x7f367cc41522ce07553e823bf3be79a889debe1b',
  '0x076567024aa84D766803EF0128dc7C58C13a6359',
  '0x901bb9583b24d97e995513c6778dc6888ab6870e',
  '0xa7e5d5a720f06526557c513402f2e6b5fa20b00',
  '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c',
  '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a',
  '0x7db418b5d567a4e0e8c59ad71be1fce48f3e6107',
  '0x72a5843cc08275c8171e582972aa4fda8c397b2a',
  '0x7f19720a857f834887fc9a7bc0a0fbe7fc7f8102',
  '0x9f4cda013e354b8fc285bf4b9a60460cee7f7ea9',
]

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20
// denominated in seconds
export const TIME_TO_REFRESH_SWAP_RATE = 10

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

export const BUNDLE_ID = '1'

export const ROPSTEN_TOKEN_LOGOS_MAPPING: {
  [key: string]: string
} = {
  '0x8b4ddf9f13f382aff76d262f6c8c50e6d7961b94': '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202',
  '0x7b2810576aa1cce68f2b118cef1f36467c648f92': '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
  '0x068b43f7f2f2c6a662c36e201144ae45f7a1c040': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x65bd1f48f1dd07bb285a3715c588f75684128ace': '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0xad6d458402f60fd3bd25163575031acdce07538d': '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0x3dff0dce5fc4b367ec91d31de3837cf3840c8284': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0xa748593dd74e5d0bb38a3f2f5090a0f31370c574': '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
  '0xb4f7332ed719eb4839f091eddb2a3ba309739521': '0x514910771af9ca656af840dff83e8264ecf986ca',
  '0xdb0040451f373949a4be60dcd7b6b8d6e42658b6': '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  '0x787e7339a52d7784a22146da7209c702e1e38511': '0xc00e94cb662c3520282e6f5717214004a7f26888',
  '0x5f4f41e067e8ccf0d1f9ee007223af4d72990cdc': '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  '0xc778417e063141139fce010982780140aa0cd5ab': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
}

export const DEFAULT_REWARDS: { [key: string]: string[] } = {
  [ChainId.MAINNET]: ['0x9F52c8ecbEe10e00D9faaAc5Ee9Ba0fF6550F511'],
}

export const OUTSIDE_FAIRLAUNCH_ADDRESSES: {
  // key: fairlaunch address
  [key: string]: {
    address: string
    subgraphAPI: string
    query: string
    name: string
    poolInfoLink: string
    getLPTokenLink: string
  }
} = {
  '0x597e3FeDBC02579232799Ecd4B7edeC4827B0435': {
    address: '0x597e3FeDBC02579232799Ecd4B7edeC4827B0435',
    subgraphAPI: 'https://pancake-subgraph-proxy.kyberswap.com/proxy',
    query: ` { pair(id: "0x4e241e3e76214635eccc7408620b940f0bda267d") {
    id
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedUSD
      derivedBNB
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedUSD
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    volumeUSD
    untrackedVolumeUSD
    trackedReserveBNB
    token0Price
    token1Price
  }}`,
    name: 'PancakeSwap',
    poolInfoLink: 'https://pancakeswap.finance/info/pool/0x4e241E3E76214635ecCC7408620b940f0bDA267D',
    getLPTokenLink:
      'https://pancakeswap.finance/add/0xc04a23149efdf9a63697f3eb60705147e9f07ffd/0xe9e7cea3dedca5984780bafc599bd69add087d56',
  },
}

export const OUTSITE_FARM_REWARDS_QUERY: {
  [key: string]: {
    subgraphAPI: string
    query: string
  }
} = {
  '0xc04a23149efdF9A63697f3Eb60705147e9f07FfD': {
    subgraphAPI: 'https://pancake-subgraph-proxy.kyberswap.com/proxy',
    query: `{
      tokens(where: {id_in: ["0xc04a23149efdf9a63697f3eb60705147e9f07ffd"]}){
    id
    name
    symbol
    derivedUSD
    derivedBNB
  }
  }`,
  },
}

export const FAIRLAUNCH_ADDRESSES: { [chainId in ChainId]: string[] } = {
  [ChainId.MAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? ['0xf530a090EF6481cfB33F98c63532E7745abab58A']
      : [
          '0xc0601973451d9369252Aee01397c0270CD2Ecd60',
          '0x0FEEa33C4dE6f37A0Fc550028FddA2401B2Ee5Ce',
          '0xc93239B33239A901143e15473e4A852a0D92c53b',
          '0x31De05f28568e3d3D612BFA6A78B356676367470',
        ],
  [ChainId.ROPSTEN]: ['0x0FEEa33C4dE6f37A0Fc550028FddA2401B2Ee5Ce', '0xfEf235b06AFe69589e6C7622F4C071BcCed5bb13'],

  [ChainId.RINKEBY]: [''],
  [ChainId.GÖRLI]: [''],
  [ChainId.KOVAN]: [''],
  [ChainId.MATIC]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? ['0xf530a090EF6481cfB33F98c63532E7745abab58A', '0xF13A25d05898530b5615698aa98D76684914aEdB']
      : [
          '0xc39bD0fAE646Cb026C73943C5B50E703de2a6532',
          '0xc940acee228893c14274eF1bB64e631308E96e1A',
          '0x7EB05d3115984547a50Ff0e2d247fB6948E1c252',
          '0xc0601973451d9369252Aee01397c0270CD2Ecd60',
          '0x829c27fd3013b944cbE76E92c3D6c45767c0C789',
          '0x3aDd3034Fcf921F20c74c6149FB44921709595B1',
        ],
  [ChainId.MUMBAI]: ['0x882233B197F9e50b1d41F510fD803a510470d7a6'],
  [ChainId.BSCTESTNET]: [
    '0xf0fb5bD9EB287A902Bd45b57AE4CF5F9DcEBe550',
    '0xC4ad1e43c755F3437b890eeCE2E55cA7b14D1F15',
    '0x7B731e53B16694cF5dEb87d4C84bA2b4F4EcB4eB',
    '0x35D1b10fA26cd0FbC52Fd22dd58E2d9d22FC631F',
  ],
  [ChainId.BSCMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? ['0xC3E2aED41ECdFB1ad41ED20D45377Da98D5489dD', '0xf530a090EF6481cfB33F98c63532E7745abab58A']
      : [
          '0x597e3FeDBC02579232799Ecd4B7edeC4827B0435',
          '0x3D88bDa6ed7dA31E15E86A41CA015Ea50771448E',
          '0x829c27fd3013b944cbE76E92c3D6c45767c0C789',
          '0xc49b3b43565b76E5ba7A98613263E7bFdEf1140c',
          '0xcCAc8DFb75120140A5469282a13E9A60B1751276',
          '0x31De05f28568e3d3D612BFA6A78B356676367470',
        ],
  [ChainId.AVAXTESTNET]: ['0xC3E2aED41ECdFB1ad41ED20D45377Da98D5489dD'],
  [ChainId.AVAXMAINNET]: [
    '0xD169410524Ab1c3C51F56a856a2157B88d4D4FF5',
    '0x3133C5C35947dBcA7A76Ee05f106a7c63BFD5C3F',
    '0x98910F7f13496fcDE2ade93648F05b4854Fc99D9',
    '0x854Cf246b09c7366AEe5abce92fA167bfE7f3E75',
  ],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOSTESTNET]: [],
  [ChainId.CRONOS]: [],
  [ChainId.AURORA]: [],
  [ChainId.ARBITRUM]: [],
  [ChainId.ARBITRUM_TESTNET]: [],
  [ChainId.BTTC]: [],
  [ChainId.VELAS]: [],
}

export const FAIRLAUNCH_V2_ADDRESSES: { [chainId in ChainId]: string[] } = {
  [ChainId.MAINNET]: [],
  [ChainId.ROPSTEN]: [
    '0x26Eb52A419C5492134BB9007795CdACBa20143DE',
    '0xbc191D7757Be78FbE0997Ba59304A35cdE844dD8',
    '0xBDe20F598AEe01732Be0011E2D2210e10de4e49d',
  ],
  [ChainId.RINKEBY]: [],
  [ChainId.GÖRLI]: [],
  [ChainId.KOVAN]: [],
  [ChainId.MATIC]: [],
  [ChainId.MUMBAI]: [],
  [ChainId.BSCTESTNET]: [],
  [ChainId.BSCMAINNET]: [],
  [ChainId.AVAXTESTNET]: [],
  [ChainId.AVAXMAINNET]: [],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOSTESTNET]: [],
  [ChainId.CRONOS]: [],
  [ChainId.ARBITRUM]: [],
  [ChainId.ARBITRUM_TESTNET]: [],
  [ChainId.BTTC]: [],
  [ChainId.AURORA]: [],
  [ChainId.VELAS]: [],
}

export const FARMING_POOLS_CHAIN_STAKING_LINK: { [key: string]: string } = {
  '0x9a56f30ff04884cb06da80cb3aef09c6132f5e77':
    'https://sipher.xyz/stake/deposit/kyber-slp-sipher-eth?utm_source=kyberswap',
}

export const FARMING_POOLS: { [chainId in ChainId]: string[] } = {
  [ChainId.MAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? [
          '0xf5426127Fa776eDaFa6232d52F566bc3b32d15F9',
          '0xDA2D12BcC6343f84B627D18Fb240bA73141b048A',
          '0x9744bddE8dd5C6441f797Ec9e04fb337Ff41d8d9',
          '0x23c0E614f660Aeef5Daf87dE483931d145B7F5B8',
        ]
      : [
          '0x9A56f30fF04884cB06da80cB3aEf09c6132f5E77',
          '0xf4c408835De8C68232f4746b5Ed598608B17e98D',
          '0xdEb01e683FF0d2e3AdB852a03df28e1bA7c99774',
          '0xE69Ba3f5FfE577BBA3A2bF8Ce949f7875D4C67DB',
        ],
  [ChainId.ROPSTEN]: [
    '0x4F54C52D446605f324f30dDd79547D607255612E',
    '0x26b8d1680b8450dda51FA7d4753cDcA9766717bD',
    '0xb26A8395Ba1997A4C9a47D1589234BcD3fF468F3',
    '0x03aBe515bcDDA4c01F1E98666E2406d837B1b597',
  ],
  [ChainId.RINKEBY]: [''],
  [ChainId.GÖRLI]: [''],
  [ChainId.KOVAN]: [''],
  [ChainId.MATIC]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? [
          '0xe1dAd9E06380bC8962e259dDd6a5257A4f56d525',
          '0x706eF64b3842a8a6D31d7DC6669e521cCA9f5Ce1',
          '0x0f0FC5a5029E3d155708356b422D22Cc29f8b3D4',
        ]
      : [
          '0x3f1f398887525D2D9acd154eC5E4a3979ADFfaE6',
          '0xa1219DBE76eEcBf7571Fed6b020Dd9154396B70e',
          '0xbb2d00675B775E0F8acd590e08DA081B2a36D3a6',
          '0x439E6A13a5ce7FdCA2CC03bF31Fb631b3f5EF157',
          '0xa623aacf9eb4fc0a29515f08bdabb0d8ce385cf7',
        ],
  [ChainId.MUMBAI]: ['0x967a889dbF977DD9c7b79BF422f5Fa50294e56FD', '0x801Da4b550D1645F7aD3De8A5349a51B8dea48b8'],
  [ChainId.BSCTESTNET]: [
    '0xEA6A8B8ef82512e989FaAF7a7614fD89BbC3c8A5',
    '0x7FC3B624dB42a90bE70dd8bCee5C1E0ea7ae01b1',
    '0xb09a1EA652962197f54B580812D153b1Cfd3274e',
    '0x30F2F907B014cB6520bfFe7FC715ad9c138dF7B0',
  ],
  [ChainId.BSCMAINNET]:
    process.env.REACT_APP_MAINNET_ENV === 'staging'
      ? [
          '0x706eF64b3842a8a6D31d7DC6669e521cCA9f5Ce1',
          '0xe1dAd9E06380bC8962e259dDd6a5257A4f56d525',
          '0x8BcBc65Ce330BC019D87409C2949A2471Bef1E5C',
        ]
      : [
          '0xF8E61E301A44DF4e2dBAba570d2CB09039289B31',
          '0x6170B6d96167346896169b35e1E9585feAB873bb',
          '0xec303cE1eDbEbF7e71fc7B350341bB6A6A7a6381',
          '0xc3daC2049616326E7D596cE52062789d96373b55',
          '0xd26fa4D47Ab61C03259F0CBC9054890DF5C3B7aD',
          '0x2D49F16C9ad4f1145bb27c9af71474F468a697c8',
          '0xf81e106C5B44ba9A993Fc1f456A4c8e54C47CF34',
          '0x97dBaf4aD688aEd04817121301a005B710E6067a',
        ],
  [ChainId.AVAXTESTNET]: ['0x2b4b833864f75fc23f96b5a0cbde8a4046c710b6', '0x0cfc06499dab780aab7775dc260117ec5ca106b4'],
  [ChainId.AVAXMAINNET]: [
    '0x44d1b2974b3b8CE93B261f6D15DcE5ad57f8933B',
    '0xe1dAd9E06380bC8962e259dDd6a5257A4f56d525',
    '0x0f0FC5a5029E3d155708356b422D22Cc29f8b3D4',
    '0x535a99a079d64b8c3f4cc264eba70d82992b224b',
  ],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOSTESTNET]: [],
  [ChainId.CRONOS]: [],
  [ChainId.AURORA]: [],
  [ChainId.ARBITRUM]: [],
  [ChainId.ARBITRUM_TESTNET]: [],
  [ChainId.BTTC]: [],
  [ChainId.VELAS]: [],
}

export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
export const KNC_COINGECKO_ID = 'kyber-network-crystal'

export const COINGECKO_NETWORK_ID: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.BSCMAINNET]: 'binance-smart-chain',
  [ChainId.MATIC]: 'polygon-pos',
  [ChainId.AVAXMAINNET]: 'avalanche',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.CRONOS]: 'cronos',
  [ChainId.AURORA]: 'aurora',
  [ChainId.ARBITRUM]: 'arbitrum-one',
  // TODO: check this
  [ChainId.BTTC]: 'tron',
  [ChainId.VELAS]: 'velas',

  [ChainId.ROPSTEN]: '',
  [ChainId.RINKEBY]: '',
  [ChainId.GÖRLI]: '',
  [ChainId.KOVAN]: '',
  [ChainId.MUMBAI]: '',
  [ChainId.BSCTESTNET]: '',
  [ChainId.AVAXTESTNET]: '',
  [ChainId.CRONOSTESTNET]: '',
  [ChainId.ARBITRUM_TESTNET]: '',
}

export const COINGECKO_NATIVE_TOKEN_ID: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.BSCMAINNET]: 'binancecoin',
  [ChainId.MATIC]: 'matic-network',
  [ChainId.AVAXMAINNET]: 'avalanche-2',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.CRONOS]: 'crypto-com-chain',
  [ChainId.AURORA]: 'ethereum',
  [ChainId.ARBITRUM]: 'ethereum',
  [ChainId.ARBITRUM_TESTNET]: 'ethereum',
  // TODO: check this
  [ChainId.BTTC]: 'bittorrent',
  [ChainId.VELAS]: 'velas',

  [ChainId.ROPSTEN]: '',
  [ChainId.RINKEBY]: '',
  [ChainId.GÖRLI]: '',
  [ChainId.KOVAN]: '',
  [ChainId.MUMBAI]: '',
  [ChainId.BSCTESTNET]: '',
  [ChainId.AVAXTESTNET]: '',
  [ChainId.CRONOSTESTNET]: '',
}

export const ETHER_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const KYBER_NETWORK_DISCORD_URL = 'https://discord.com/invite/NB3vc8J9uv'
export const KYBER_NETWORK_TWITTER_URL = 'https://twitter.com/KyberNetwork'

export const DEFAULT_GAS_LIMIT_MARGIN = 20000

export const POPULAR_PAIRS: { [chainId in ChainId]: PopularPair[] } = {
  [ChainId.MAINNET]: [],
  [ChainId.ROPSTEN]: [],
  [ChainId.RINKEBY]: [],
  [ChainId.GÖRLI]: [],
  [ChainId.KOVAN]: [],
  [ChainId.MATIC]: [],
  [ChainId.MUMBAI]: [],
  [ChainId.BSCTESTNET]: [],
  [ChainId.BSCMAINNET]: [],
  [ChainId.AVAXTESTNET]: [],
  [ChainId.AVAXMAINNET]: [
    {
      token0: {
        id: '0x39fC9e94Caeacb435842FADeDeCB783589F50f5f',
        symbol: 'KNC',
      },
      token1: {
        id: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        symbol: 'AVAX',
      },
    },
    {
      token0: {
        id: '0x130966628846bfd36ff31a822705796e8cb8c18d',
        symbol: 'MIM',
      },
      token1: {
        id: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
        symbol: 'USDT',
      },
    },
    {
      token0: {
        id: '0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4',
        symbol: 'XAVA',
      },
      token1: {
        id: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        symbol: 'AVAX',
      },
    },
    {
      token0: {
        id: '0x130966628846BFd36ff31a822705796e8cb8C18D',
        symbol: 'MIM',
      },
      token1: {
        id: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
        symbol: 'USDC',
      },
    },
  ],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOSTESTNET]: [],
  [ChainId.CRONOS]: [],
  [ChainId.AURORA]: [],
  [ChainId.ARBITRUM]: [],
  [ChainId.ARBITRUM_TESTNET]: [],
  [ChainId.BTTC]: [],
  [ChainId.VELAS]: [],
}

// This variable to handle crazy APR which it can be wrong calculations or a bug
// But now, for FOMO of Pagxy, updated this to 10000 (before we set 2000 for it)
export const MAX_ALLOW_APY = 10000
export const LP_TOKEN_DECIMALS = 18
export const RESERVE_USD_DECIMALS = 100
export const SUBGRAPH_AMP_MULTIPLIER = 10000
export const AMP_LIQUIDITY_HINT = t`AMP factor x Liquidity in the pool. Amplified pools have higher capital efficiency and liquidity.`
export const AMP_HINT = t`Stands for amplification factor. Each pool can have its own AMP. Pools with a higher AMP provide higher capital efficiency within a particular price range`
export const CREATE_POOL_AMP_HINT = t`Stands for amplification factor. Pools with a higher AMP provide higher capital efficiency within a particular price range. We recommend higher AMP for stable token pairs and lower AMP for volatile token pairs`
export const AGGREGATOR_ROUTER_SWAPPED_EVENT_TOPIC =
  '0xd6d4f5681c246c9f42c203e287975af1601f8df8035a9251f79aab5c8f09e2f8'

export const CLAIM_REWARDS_DATA_URL =
  'https://raw.githubusercontent.com/KyberNetwork/zkyber-reward-distribution/main/results/phase_0/merkle_data.json'

export const sentryRequestId = uuid()

// Fee options instead of dynamic fee
export const FEE_OPTIONS: { [chainId: number]: number[] } = {
  [ChainId.ARBITRUM]: [1, 5, 30, 50, 100],
  [ChainId.ARBITRUM_TESTNET]: [1, 5, 30, 50, 100],
  [ChainId.AURORA]: [1, 5, 30, 50, 100],
  [ChainId.VELAS]: [1, 5, 30, 50, 100],
}
