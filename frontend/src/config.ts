import type { Token } from '@/types'
import { default as devnetTokens } from './devnet-token-list.json'
import { ALPH_TOKEN_ID, type NetworkId, type Number256 } from '@alephium/web3'
import { loadSettings } from '../../alephium.config'
import { loadDeployments } from '../../artifacts/ts/deployments'

export const tradeFee = 0.007
export const domainURL = 'localhost:5173'

export const mainnetTokens: Token[] = [
  {
    symbol: 'ALPH',
    name: 'Alephium',
    contractId: ALPH_TOKEN_ID,
    decimals: 18,
    logoUri: '/images/tokens/ALPH.png'
  },
  {
    symbol: 'ALF',
    name: 'Alf',
    contractId: '66da610efb5129c062e88e5fd65fe810f31efd1597021b2edf887a4360fa0800',
    decimals: 9,
    logoUri: '/images/tokens/ALF.png'
  },
  {
    symbol: 'PACA',
    name: 'ALPHpaca',
    contractId: 'b2d71c116408ae47b931482a440f675dc9ea64453db24ee931dacd578cae9002',
    decimals: 0,
    logoUri: '/images/tokens/PACA.png'
  },
  {
    symbol: 'BERRY',
    name: 'Berry',
    contractId: 'b522184377a33e376e997a950288fa76c1f48e97bc29cd10779adc7cfb673200',
    decimals: 0,
    logoUri: '/images/tokens/BERRY.png'
  },
  {
    symbol: 'TAIL',
    name: 'Montycoin',
    contractId: '1516c410b54470d667e1315ce2faa81870c76c5c7a491e3e86eeec8366495502',
    decimals: 0,
    logoUri: '/images/tokens/TAIL.png'
  },
  {
    symbol: 'AYIN',
    name: 'AYIN',
    contractId: '1a281053ba8601a658368594da034c2e99a0fb951b86498d05e76aedfe666800',
    decimals: 18,
    logoUri: '/images/tokens/AYIN.png'
  },
  {
    symbol: 'XAYIN',
    name: 'Staked Ayin',
    contractId: '5bf2f559ae714dab83ff36bed4d9e634dfda3ca9ed755d60f00be89e2a20bd00',
    decimals: 18,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'VLAD',
    name: 'Vlad',
    contractId: '7da28936499f56ffed497fe7eba856aa85eeb943bab2478e36f7020d89cd2400',
    decimals: 9,
    logoUri: '/images/tokens/VLAD.png'
  },
  {
    symbol: 'JKL',
    name: 'Jekyll',
    contractId: '2bc4b844502d6c27b57dfe064f95353647a606b3d92150786ecacb56c885c800',
    decimals: 18,
    logoUri: '/images/tokens/JKL.png'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether (AlphBridge)',
    contractId: '19246e8c2899bc258a1156e08466e3cdd3323da756d8a',
    decimals: 18,
    logoUri: '/images/tokens/WETH.png'
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC (AlphBridge)',
    contractId: '383bc735a4de6722af80546ec9eeb3cff508f2f68e97da19489ce69f3e703200',
    decimals: 8,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (AlphBridge)',
    contractId: '556d9582463fe44fbd108aedc9f409f69086dc78d994b88ea6c9e65f8bf98e00',
    decimals: 6,
    logoUri: '/images/tokens/USDT.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (AlphBridge)',
    contractId: '722954d9067c5a5ad532746a024f2a9d7a18ed9b90e27d0a3a504962160b5600',
    decimals: 6,
    logoUri: '/images/tokens/USDC.png'
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin (AlphBridge)',
    contractId: '3d0a1895108782acfa875c2829b0bf76cb586d95ffa4ea9855982667cc73b700',
    decimals: 18,
    logoUri: '/images/tokens/DAI.png'
  },
  {
    symbol: 'NGU',
    name: 'NUMBER GO UP',
    contractId: 'df3008f43a7cc1d4a37eef71bf581fc4b9c3be4e2d58ed6d1df483bbb83bd200',
    decimals: 7,
    logoUri: '/images/tokens/NGU.png'
  },
  {
    symbol: 'VIRL',
    name: 'VIRAL',
    contractId: '11379064c747f89753d493b562130a63caf1a1fc448fcb161e507d2e542c0b00',
    decimals: 4,
    logoUri: '/images/tokens/VIRL.png'
  },
  {
    symbol: 'BUBBLE',
    name: 'BUBBLE',
    contractId: '130f008dcc71ad5138bdae00d918acef3b78ddbe95e627215a36a47b6b151100',
    decimals: 0,
    logoUri: '/images/tokens/BUBBLE.png'
  },
  {
    symbol: 'CYXE',
    name: 'CYXE',
    contractId: '7dd0c01b2c835ed659c85c1ae64c7c10b916c06f13cf5b91f1369a5a3feda000',
    decimals: 4,
    logoUri: '/images/tokens/CYXE.png'
  },
  {
    symbol: 'WANG',
    name: 'Wang',
    contractId: 'c1aeea313e36454f35beaf40130c9219faa40ba645aff93e16429146039f8202',
    decimals: 5,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'MIX',
    name: 'KleoMixer',
    contractId: '4e0eb20afb173cd534ae29acd013861115482c1e3d8ed626294bbe1008a3f900',
    decimals: 8,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'SUCC',
    name: 'SUCC',
    contractId: '93cc555d3dfc0a81aa6f3127c0108e529a32c87c595c1b89f1855e698c2bc700',
    decimals: 10,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'SHIN',
    name: 'Shin Inu',
    contractId: '3f0139e1b0aa2cf0a9400ccdb73d00750bcfc8c7be0e858052d794491c8a5900',
    decimals: 5,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'Noodz',
    name: 'Noodle',
    contractId: 'b3e354fb095fffe3d5fe0431ef6209604323f9d3db069e008d9e8aeacaa30800',
    decimals: 0,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'LOVE',
    name: 'LOVE',
    contractId: '06bc1a82909c566eb6b00a3dc2dfca0d0564f43f3e8357114a0a59b182792a00',
    decimals: 7,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'SQRL',
    name: 'Squirrel',
    contractId: 'e565d11d6d5194dc2a65c7d67c324d341bc55f1e7131a9ef5577e8e75e199000',
    decimals: 4,
    logoUri: '/images/tokens/nologo.png'
  }
]

export const testnetTokens: Token[] = [
  {
    symbol: 'ALPH',
    name: 'Alephium',
    contractId: ALPH_TOKEN_ID,
    decimals: 18,
    logoUri: '/images/tokens/ALPH.png'
  },
  {
    symbol: 'TBTC',
    name: 'Test BTC',
    contractId: 'bed35ce97166170f91a8cdb35948b8696aa67dbd573ee0c5cc572bb8c44ddb01',
    decimals: 8,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'TETH',
    name: 'Test ETH',
    contractId: '4d765e05a5f08c39ab441c10fea45310cbd7b8c7bc7b4cd4e93d4531fdf2b601',
    decimals: 18,
    logoUri: '/images/tokens/WETH.png'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether (Wormhole)',
    contractId: '9a8cda8bc3423347b7fe2932ef7981ed67e8825dba3a5ee36011f578d1d70f00',
    decimals: 18,
    logoUri: '/images/tokens/WETH.png'
  },
  {
    symbol: 'WBNB',
    name: 'Wrapped BNB (Wormhole)',
    contractId: '4db93c3e58ca4c3392b9d47be17b62fcbabccba61a7d7c1fa1c3baa40181f700',
    decimals: 18,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'TDAI',
    name: 'Test DAI',
    contractId: '92982a9d35b38ff1d0b43dec536631b523cdccde0cf2fc1d5c349790c59d2701',
    decimals: 18,
    logoUri: '/images/tokens/DAI.png'
  },
  {
    symbol: 'TUSDT',
    name: 'Test USDT',
    contractId: '416800f4e2a7326ef2c129d38e4db35de11cec2d4aff98972558ca2c6f976e01',
    decimals: 6,
    logoUri: '/images/tokens/USDT.png'
  },
  {
    symbol: 'TUSDC',
    name: 'Test USDC',
    contractId: 'ecc6dd103bbb3cfad3ada8d6a22d73a599a9d39a43b81a734bc9784acc261b01',
    decimals: 6,
    logoUri: '/images/tokens/USDC.png'
  },
  {
    symbol: 'FETA',
    name: 'Fetatoken',
    contractId: 'f393e2366ee780141240e840aa32f26eade79559864d103b453f0d595425af00',
    decimals: 18,
    logoUri: '/images/tokens/nologo.png'
  },
  {
    symbol: 'SQRL',
    name: 'Squirrel',
    contractId: '99d91e5ab1b054da64c9933c126297c5067d7e2c8b08be8095d1aeab9f0c9201',
    decimals: 4,
    logoUri: '/images/tokens/nologo.png'
  }
]

export const getTokens = () => {
  const network = import.meta.env.VITE_NETWORK_ID
  if (network === 'testnet') {
    return Array.from(testnetTokens)
  } else if (network === 'mainnet') {
    return Array.from(mainnetTokens)
  } else if (network === 'devnet') {
    const alph = {
      symbol: 'ALPH',
      name: 'Alephium',
      contractId: ALPH_TOKEN_ID,
      decimals: 18,
      logoUri: '/images/tokens/ALPH.png'
    }
    const tokens = Array.from(devnetTokens)
    tokens.unshift(alph)
    return tokens
  } else {
    return []
  }
}

export function getDefaultNodeUrl(): string {
  const network = import.meta.env.VITE_NETWORK_ID
  return network === 'devnet'
    ? 'http://127.0.0.1:22973'
    : network === 'testnet'
      ? 'https://wallet-v20.testnet.alephium.org'
      : 'https://wallet-v20.mainnet.alephium.org'
}

export function getDefaultExplorerUrl(): string {
  const network = import.meta.env.VITE_NETWORK_ID
  return network === 'devnet'
    ? 'http://localhost:9090'
    : network === 'testnet'
      ? 'https://backend-v113.testnet.alephium.org'
      : 'https://backend-v113.mainnet.alephium.org'
}

export interface MarketplaceConfig {
  network: NetworkId
  groupIndex: number
  marketplaceAdminAddress: string
  marketplaceContractId: string
  marketplaceContractAddress: string
  nftTemplateId: string
  fee: Number256
  defaultNodeUrl: string
  defaultExplorerUrl: string
}

export function getMarketplaceConfig(): MarketplaceConfig {
  const network = import.meta.env.VITE_NETWORK_ID
  const settings = loadSettings(network as NetworkId)
  const deployments = loadDeployments(network as NetworkId)
  const marketPlace = deployments.contracts.LendingMarketplace.contractInstance
  const groupIndex = marketPlace.groupIndex
  const marketplaceAdminAddress = deployments.deployerAddress
  return {
    network,
    groupIndex,
    marketplaceAdminAddress,
    marketplaceContractId: marketPlace.contractId,
    marketplaceContractAddress: marketPlace.address,
    nftTemplateId: deployments.contracts.LendingOffer.contractInstance.contractId,
    fee: settings.fee,
    defaultNodeUrl: getDefaultNodeUrl(),
    defaultExplorerUrl: getDefaultExplorerUrl()
  }
}
