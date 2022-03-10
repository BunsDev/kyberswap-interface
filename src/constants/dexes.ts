import { ChainId } from '@dynamic-amm/sdk'

export type DexConfig = {
  value?: string
  name: string
  icon: string
  chainIds?: ChainId[]
}

type DexList = { [key: string]: DexConfig }

export const dexListConfig: DexList = {
  dmm: {
    name: 'KyberSwap',
    icon: 'https://kyberswap.com/favicon.ico',
    chainIds: [
      ChainId.MAINNET,
      ChainId.MATIC,
      ChainId.BSCMAINNET,
      ChainId.AVAXMAINNET,
      ChainId.FANTOM,
      ChainId.CRONOS,
      ChainId.ARBITRUM,
      ChainId.BTTC,
      ChainId.AURORA,
      ChainId.VELAS,
    ],
  },
  kyberswap: {
    name: 'KyberSwap',
    icon: 'https://kyberswap.com/favicon.ico',
    chainIds: [
      ChainId.MAINNET,
      ChainId.MATIC,
      ChainId.BSCMAINNET,
      ChainId.AVAXMAINNET,
      ChainId.FANTOM,
      ChainId.CRONOS,
      ChainId.ARBITRUM,
      ChainId.BTTC,
      ChainId.AURORA,
      ChainId.VELAS,
    ],
  },
  uniswap: {
    name: 'UniSwap_V2',
    icon: 'https://www.logowik.com/content/uploads/images/uniswap-uni7403.jpg',
    chainIds: [ChainId.MAINNET],
  },
  sushiswap: {
    name: 'SushiSwap',
    icon:
      'https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,c_limit,w_32,q_auto/https://app.sushi.com/images/logo.svg',
    chainIds: [ChainId.MAINNET, ChainId.MATIC, ChainId.FANTOM, ChainId.ARBITRUM, ChainId.BSCMAINNET],
  },
  shibaswap: {
    name: 'ShibaSwap',
    icon: 'https://shibaswap.com/images/logo_shiba_swap.png',
    chainIds: [ChainId.MAINNET],
  },
  defiswap: {
    name: 'DefiSwap',
    icon: 'https://crypto.com/defi/swap/favicon.c5a5b109.png',
    chainIds: [ChainId.MAINNET],
  },
  quickswap: {
    name: 'QuickSwap',
    icon: 'https://quickswap.exchange/logo_circle.png',
    chainIds: [ChainId.MATIC],
  },
  dfyn: {
    name: 'Dfyn',
    icon: 'https://dfyn.network/assets/logos/dfyn-favicon.png',
    chainIds: [ChainId.MATIC],
  },
  firebird: {
    name: 'Firebird',
    icon: 'https://app.firebird.finance/favicon.png',
    chainIds: [ChainId.MATIC, ChainId.BSCMAINNET],
  },
  oneswap: {
    name: 'OneSwap',
    icon: 'https://app.firebird.finance/favicon.png',
    chainIds: [ChainId.MATIC, ChainId.BSCMAINNET],
  },
  wault: {
    name: 'Wault',
    icon: 'https://wault.finance/wp-content/uploads/2021/04/cropped-wault-new-favicon-32x32.png',
    chainIds: [ChainId.MATIC, ChainId.BSCMAINNET],
  },
  curve: {
    name: 'Curve',
    icon: 'https://curve.fi/favicon-32x32.svg',
    chainIds: [ChainId.MAINNET, ChainId.MATIC, ChainId.FANTOM, ChainId.ARBITRUM],
  },
  jetswap: {
    name: 'JetSwap',
    icon: 'https://jetswap.finance/favicon_io/favicon.ico',
    chainIds: [ChainId.MATIC, ChainId.BSCMAINNET, ChainId.FANTOM],
  },
  'iron-stable': {
    name: 'IronSwap',
    icon: 'https://iron.finance/icons/icon-72x72.png',
    chainIds: [ChainId.MATIC, ChainId.AVAXMAINNET],
  },
  polydex: {
    name: 'PolyDex',
    icon: 'https://www.polydex.fi/favicon.ico',
    chainIds: [ChainId.MATIC],
  },
  polycat: {
    name: 'Polycat',
    icon: 'https://polycat.finance/favicon-32x32.png',
    chainIds: [ChainId.MATIC],
  },
  gravity: {
    name: 'Gravity',
    icon: 'https://gravityfinance.io/favicon.ico',
    chainIds: [ChainId.MATIC],
  },
  cometh: {
    name: 'ComethSwap',
    icon: 'https://swap.cometh.io/favicon.ico',
    chainIds: [ChainId.MATIC],
  },
  dinoswap: {
    name: 'DinoSwap',
    icon: 'https://dinoswap.exchange/favicon.ico',
    chainIds: [ChainId.MATIC],
  },
  pancake: {
    name: 'PancakeSwap',
    icon: 'https://pancakeswap.finance/favicon.ico',
    chainIds: [ChainId.BSCMAINNET],
  },
  'pancake-legacy': {
    name: 'PancakeSwap Legacy',
    icon: 'https://pancakeswap.finance/favicon.ico',
    chainIds: [ChainId.BSCMAINNET],
  },
  mdex: {
    name: 'Mdex',
    icon: 'https://cdn.jsdelivr.net/gh/mdexSwap/hswap@main/favicon.png',
    chainIds: [ChainId.BSCMAINNET],
  },
  biswap: {
    name: 'Biswap',
    icon: 'https://biswap.org/logo.png',
    chainIds: [ChainId.BSCMAINNET],
  },
  apeswap: {
    name: 'ApeSwap',
    icon: 'https://apeswap.finance/favicon.ico',
    chainIds: [ChainId.MATIC, ChainId.BSCMAINNET],
  },
  ellipsis: {
    name: 'Ellipsis',
    icon: 'https://ellipsis.finance/ellipsis-light.png',
    chainIds: [ChainId.BSCMAINNET],
  },
  safeswap: {
    name: 'SafeSwap',
    icon: 'https://safeswap.yfdai.finance/favicon.png',
    chainIds: [ChainId.BSCMAINNET],
  },
  pantherswap: {
    name: 'PantherSwap',
    icon: 'https://pantherswap.com/favicon.ico',
    chainIds: [ChainId.BSCMAINNET],
  },
  nerve: {
    name: 'Nerve',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8755.png',
    chainIds: [ChainId.BSCMAINNET],
  },
  pangolin: {
    name: 'Pangolin',
    icon: 'https://pangolin.exchange/icon.svg',
    chainIds: [ChainId.AVAXMAINNET],
  },
  traderjoe: {
    name: 'TraderJoe',
    icon: 'https://www.traderjoexyz.com/favicon.png',
    chainIds: [ChainId.AVAXMAINNET],
  },
  spookyswap: {
    name: 'SpookySwap',
    icon: 'https://spookyswap.finance/favicon.ico',
    chainIds: [ChainId.FANTOM],
  },
  spiritswap: {
    name: 'SpiritSwap',
    icon: 'https://app.spiritswap.finance/favicon-32x32.png',
    chainIds: [ChainId.FANTOM],
  },
  paintswap: {
    name: 'PaintSwap',
    icon: 'https://paintswap.finance/favicon.png',
    chainIds: [ChainId.FANTOM],
  },
  morpheus: {
    name: 'MorpheusSwap',
    icon: 'https://morpheusswap.app/favicon.ico',
    chainIds: [ChainId.FANTOM],
  },
  beethovenx: {
    name: 'beethoven-x',
    icon: 'https://app.beets.fi/favicon.ico',
    chainIds: [ChainId.FANTOM],
  },
  synapse: {
    name: 'Synapse',
    icon: 'https://synapseprotocol.com/favicon.ico',
    chainIds: [ChainId.MAINNET, ChainId.BSCMAINNET, ChainId.MATIC, ChainId.AVAXMAINNET, ChainId.FANTOM],
  },
  balancer: {
    name: 'Balancer',
    icon: 'https://app.balancer.fi/favicon.ico',
    chainIds: [ChainId.MAINNET, ChainId.MATIC, ChainId.ARBITRUM],
  },
  axial: {
    name: 'Axial',
    icon: 'https://assets.website-files.com/6189dee5e79d6e8f7e214eba/618bf2f3e40e777d4210a84f_favicon.ico',
    chainIds: [ChainId.AVAXMAINNET],
  },
  lydia: {
    name: 'Lydia',
    icon: 'https://www.lydia.finance/favicon.ico',
    chainIds: [ChainId.AVAXMAINNET],
  },
  yetiswap: {
    name: 'Yeti Swap',
    icon: 'https://exchange.yetiswap.app/favicon.png',
    chainIds: [ChainId.AVAXMAINNET],
  },
  hurricane: {
    name: 'HurricaneSwap',
    icon: 'https://hurricaneswap.com/favicon.png',
    chainIds: [ChainId.AVAXMAINNET],
  },
  vvs: {
    name: 'VVS Finance',
    icon: 'https://vvs.finance/favicon.ico',
    chainIds: [ChainId.CRONOS],
  },
  cronaswap: {
    name: 'CronaSwap',
    icon: 'https://app.cronaswap.org/favicon.png',
    chainIds: [ChainId.CRONOS],
  },
  crodex: {
    name: 'Crodex',
    icon: 'https://swap.crodex.app/favicon.png',
    chainIds: [ChainId.CRONOS],
  },
  mmf: {
    name: 'Mad Meerkat Finance',
    icon: 'https://mm.finance/favicon.ico',
    chainIds: [ChainId.CRONOS],
  },
  kryptodex: {
    name: 'KryptoDEX',
    icon: 'https://www.kryptodex.org/favicon.svg',
    chainIds: [ChainId.CRONOS],
  },
  empiredex: {
    name: 'Empire Dex',
    icon: 'https://bsc.empiredex.org/favicon.png',
    chainIds: [ChainId.CRONOS],
  },
  photonswap: {
    name: 'PhotonSwap',
    icon: 'https://photonswap.finance/logo.png',
    chainIds: [ChainId.CRONOS],
  },
  trisolaris: {
    name: 'Trisolaris',
    icon: 'https://www.trisolaris.io/favicon.png',
    chainIds: [ChainId.AURORA],
  },
  wannaswap: {
    name: 'WannaSwap',
    icon: 'https://wannaswap.finance/icon.png',
    chainIds: [ChainId.AURORA],
  },
  nearpad: {
    name: 'NearPAD',
    icon: 'https://i.imgur.com/6IFKjOZ.png',
    chainIds: [ChainId.AURORA],
  },
  swapr: {
    name: 'Swapr',
    icon: 'https://swapr.eth.link/favicon.png',
    chainIds: [ChainId.ARBITRUM],
  },
  wagyuswap: {
    name: 'WagyuSwap',
    icon: 'https://exchange.wagyuswap.app/images/logo.png',
    chainIds: [ChainId.VELAS],
  },
  astroswap: {
    name: 'AstroSwap',
    icon: 'https://exchange.astroswap.app/images/logo.png',
    chainIds: [ChainId.VELAS],
  },
}

type DexTypes = {
  [chainId in ChainId | 'all']?: {
    [dex: string]: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  }
}
/*
// dex id - swap fee
1 - 30 (default) = 0.3%
2 - 25
3 - 20
4 - 15
5 - 10
6 - 5
7 - 17 = 0.17%
8 - 18 = 0.18%
9 - 50 = 0.5%
*/
export const dexIds: DexTypes = {
  all: {
    firebird: 1,
    pancake: 2,
    'pancake-legacy': 2,
    apeswap: 3,
    wault: 3,
    biswap: 5,
    polydex: 5,
    jetswap: 5,
    polycat: 2,
    spookyswap: 3,
    axial: 3,
    cronaswap: 2,
    gravity: 2,
    kyberswap: 0,
    mmf: 7,
    kryptodex: 3,
    cometh: 9,
    dinoswap: 8,
    safeswap: 2,
    pantherswap: 3,
    morpheus: 4,
    wannaswap: 3,
    swapr: 2,
    wagyuswap: 3,
    astroswap: 3,
  },
  [ChainId.BSCMAINNET]: {
    jetswap: 1,
  },
  [ChainId.MATIC]: {},
}

export const dexTypes: DexTypes = {
  all: {
    curve: 2,
    dmm: 3,
    kyberswap: 3,
    oneswap: 1,
    ellipsis: 2,
    nerve: 1,
    'iron-stable': 4,
    balancer: 6,
    synapse: 4,
    axial: 4,
    beethovenx: 6,
  },
  [ChainId.MAINNET]: {},
  [ChainId.BSCMAINNET]: {},
  [ChainId.MATIC]: {},
  [ChainId.AVAXMAINNET]: {},
  [ChainId.FANTOM]: {},
  [ChainId.VELAS]: {},
}

function findDex(exchange: string): DexConfig | undefined {
  const dex = dexListConfig[exchange]
  return dex ? { ...dex, value: exchange } : undefined
}

export const DEX_TO_COMPARE: { [chainId in ChainId]?: DexConfig } = {
  [ChainId.BSCMAINNET]: findDex('pancake'),
  [ChainId.MATIC]: findDex('quickswap'),
  [ChainId.AVAXMAINNET]: findDex('traderjoe'),
  [ChainId.MAINNET]: findDex('uniswap'),
  [ChainId.FANTOM]: findDex('spookyswap'),
  [ChainId.CRONOS]: findDex('vvs'),
  [ChainId.AURORA]: findDex('trisolaris'),
  [ChainId.ARBITRUM]: findDex('sushiswap'),
  [ChainId.VELAS]: findDex('wagyuswap'),
}
