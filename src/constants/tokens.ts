import { ChainId, NativeCurrency, Token } from '@namgold/ks-sdk-core'

import { MAINNET_ENV } from './env'
import { NETWORKS_INFO, SUPPORTED_NETWORKS } from './networks'

export const NativeCurrencies: { [chainId in ChainId]: NativeCurrency } = SUPPORTED_NETWORKS.reduce(
  (acc, chainId) => ({
    ...acc,
    [chainId]: new NativeCurrency(
      chainId,
      NETWORKS_INFO[chainId].nativeToken.decimal,
      NETWORKS_INFO[chainId].nativeToken.symbol,
      NETWORKS_INFO[chainId].nativeToken.name,
    ),
  }),
  {},
) as { [chainId in ChainId]: NativeCurrency }

export const STABLE_COINS_ADDRESS: { [chainId in ChainId]: string[] } = {
  [ChainId.MAINNET]: [
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // BUSD
  ],
  [ChainId.ETHW]: [
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // BUSD
  ],
  [ChainId.MATIC]: [
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', //DAI
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', //usdc
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', //usdt
    '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1', //MAI
  ],
  [ChainId.BSCMAINNET]: [
    '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', //dai
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // usdc
    '0x55d398326f99059fF775485246999027B3197955', //usdt
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // busd
  ],
  [ChainId.AVAXMAINNET]: [
    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDt
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', // usdt.e
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // usdc.e
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', //usdc
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', //dai.e
    '0x3B55E45fD6bd7d4724F5c47E0d1bCaEdd059263e', // MAI
    '0x130966628846BFd36ff31a822705796e8cb8C18D', // MIM
  ],
  [ChainId.FANTOM]: [
    '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', //dai
    '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', //usdc
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A', // fusdt
    '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', // 'dai'
  ],
  [ChainId.CRONOS]: [
    '0xF2001B145b43032AAF5Ee2884e456CCd805F677D', // dai
    '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', //usdc
    '0x66e428c3f67a68878562e79A0234c1F83c208770', //'usdt'
  ],
  [ChainId.ARBITRUM]: [
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', //dai
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', //usdc
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', //usdt
  ],
  [ChainId.BTTC]: [
    '0x9B5F27f6ea9bBD753ce3793a07CbA3C74644330d', // usdt_b
    '0xdB28719F7f938507dBfe4f0eAe55668903D34a15', // usdt_t
    '0xE887512ab8BC60BcC9224e1c3b5Be68E26048B8B', //usdt_e
    '0x935faA2FCec6Ab81265B301a30467Bbc804b43d3', // usdc_t
    '0xCa424b845497f7204D9301bd13Ff87C0E2e86FCF', // usdc_b
    '0xAE17940943BA9440540940DB0F1877f101D39e8b', // usdc_e
    '0xe7dC549AE8DB61BDE71F22097BEcc8dB542cA100', //dai_e
    '0x17F235FD5974318E4E2a5e37919a209f7c37A6d1', // usdd_t
  ],
  [ChainId.VELAS]: [
    '0xe2C120f188eBd5389F71Cf4d9C16d05b62A58993', // usdc
    '0x01445C31581c354b7338AC35693AB2001B50b9aE', //usdt
  ],
  [ChainId.AURORA]: [
    '0xe3520349F477A5F6EB06107066048508498A291b', //Dai
    '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', //'usdc'
    '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', //usdt
  ],
  [ChainId.OASIS]: [
    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844', //usdc
    '0xdC19A122e268128B5eE20366299fc7b5b199C8e3', //usdtet
    '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', //busd
    '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B', // usdt
  ],
  [ChainId.OPTIMISM]: [
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // Dai
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', //usdt
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', //usdc
  ],
  [ChainId.SOLANA]: [
    'EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o', // Dai
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', //usdc
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', //usdt
  ],
  [ChainId.ROPSTEN]: [],
  [ChainId.RINKEBY]: [],
  [ChainId.GÖRLI]: [],
  [ChainId.KOVAN]: [],
  [ChainId.MUMBAI]: [],
  [ChainId.BSCTESTNET]: [],
  [ChainId.AVAXTESTNET]: [],
  [ChainId.CRONOSTESTNET]: [],
  [ChainId.ARBITRUM_TESTNET]: [],
}

export const DAI = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.ETHW]: new Token(ChainId.ETHW, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.ROPSTEN]: new Token(
    ChainId.ROPSTEN,
    '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.RINKEBY]: new Token(
    ChainId.RINKEBY,
    '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0x1BBeeEdCF32dc2c1Ebc2F138e3FC7f3DeCD44D6A', 18, 'DAI', 'Dai Stablecoin'),
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
  //not existing on Velas
  [ChainId.VELAS]: new Token(ChainId.VELAS, '0xe7dC549AE8DB61BDE71F22097BEcc8dB542cA100', 18, 'DAI', 'Dai Stablecoin'),
  //not existing on Oasis
  [ChainId.OASIS]: new Token(ChainId.OASIS, '0xe7dC549AE8DB61BDE71F22097BEcc8dB542cA100', 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.OPTIMISM]: new Token(
    ChainId.OPTIMISM,
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  [ChainId.SOLANA]: new Token(
    ChainId.SOLANA,
    'EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o',
    8,
    'DAI',
    'Dai Stablecoin (Wormhole)',
  ),
}

export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
  [ChainId.ETHW]: new Token(ChainId.MAINNET, '0x25de68ef588cb0c2c8f3537861e828ae699cd0db', 6, 'USDC', 'USD Coin'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, '0x068B43f7F2f2c6a662C36E201144aE45f7a1C040', 6, 'USDC', 'USD Coin'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b', 6, 'USDC', 'USD Coin'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0x8e9Bd30D15420bAe4B7EC0aC014B7ECeE864373C', 18, 'USDC', 'USD Coin'),
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
  [ChainId.OASIS]: new Token(
    ChainId.OASIS,
    '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844',
    6,
    'USDC',
    'USD Coin (Multichain)',
  ),
  [ChainId.OPTIMISM]: new Token(ChainId.OPTIMISM, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 6, 'USDC', 'USD Coin'),
  [ChainId.SOLANA]: new Token(ChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC', 'USD Coin'),
}

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
  [ChainId.ETHW]: new Token(ChainId.MAINNET, '0x2ad7868ca212135c6119fd7ad1ce51cfc5702892', 6, 'USDT', 'Tether USD'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, '0x65Bd1F48f1dd07bb285a3715c588F75684128acE', 6, 'USDT', 'Tether USD'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02', 18, 'USDT', 'Tether USD'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0x2bf64acf7ead856209749d0d125e9ade2d908e7f', 18, 'USDT', 'Tether USD'),
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
    '0x42296280d753ecdfafe9dbdfa912c9e6221a4e05',
    18,
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
  [ChainId.OASIS]: new Token(ChainId.OASIS, '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B', 6, 'USDT', 'Tether USD'),
  [ChainId.OPTIMISM]: new Token(
    ChainId.OPTIMISM,
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.SOLANA]: new Token(ChainId.SOLANA, 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 6, 'USDT', 'Tether USD'),
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

export const KNC_ADDRESS = '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202'
export const KNCL_ADDRESS = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200'
export const KNCL_ADDRESS_ROPSTEN = '0x7b2810576aa1cce68f2b118cef1f36467c648f92'

// todo: make it nullable
export const KNC: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.ETHW]: new Token(ChainId.ETHW, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
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
    MAINNET_ENV === 'staging'
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
  [ChainId.BTTC]: new Token(
    ChainId.BTTC,
    '0x18fA72e0EE4C580a129b0CE5bD0694d716C7443E',
    18,
    'KNC_b',
    'Kyber Network Crystal v2 - BSC',
  ),

  // UPDATE WHEN HAS BRIDGE KNC
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.VELAS]: new Token(ChainId.VELAS, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.OASIS]: new Token(ChainId.OASIS, KNC_ADDRESS, 18, 'KNC', 'Kyber Network Crystal'),
  [ChainId.OPTIMISM]: new Token(
    ChainId.OPTIMISM,
    '0xa00e3a3511aac35ca78530c85007afcd31753819',
    18,
    'KNC',
    'Kyber Network Crystal',
  ),
  [ChainId.SOLANA]: new Token(
    ChainId.SOLANA,
    'KNCkfGAnBUvoG5EJipAzSBjjaF8iNL4ivYsBS14DKdg',
    18,
    'KNC',
    'Kyber Network Crystal',
  ), // todo namgold: not exists yet
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

export const DEFAULT_OUTPUT_TOKEN_BY_CHAIN: Partial<Record<ChainId, Token>> = {
  [ChainId.MAINNET]: USDT[ChainId.MAINNET],
  [ChainId.ETHW]: USDT[ChainId.ETHW],
  [ChainId.MATIC]: USDT[ChainId.MATIC],
  [ChainId.BSCMAINNET]: new Token(ChainId.BSCMAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'BUSD'),
  [ChainId.AVAXMAINNET]: USDC[ChainId.AVAXMAINNET], // USDC.e
  [ChainId.FANTOM]: USDC[ChainId.FANTOM],
  [ChainId.CRONOS]: USDC[ChainId.CRONOS],
  [ChainId.ARBITRUM]: USDC[ChainId.ARBITRUM],
  [ChainId.OPTIMISM]: USDC[ChainId.OPTIMISM],
  [ChainId.VELAS]: USDC[ChainId.VELAS],
  [ChainId.AURORA]: USDC[ChainId.AURORA],
  [ChainId.OASIS]: USDC[ChainId.OASIS],
  [ChainId.BTTC]: USDT[ChainId.BTTC], // USDT_b
}
