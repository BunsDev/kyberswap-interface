import { ChainId, Currency, Token } from '@kyberswap/ks-sdk-core'
import { parse } from 'querystring'

import { NETWORKS_INFO } from 'constants/networks'

/**
 * ex:  nguyen hoai danh => nguyen-hoai-danh
 * @param text
 * @returns
 */
export function convertToSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[^\w-.]+/g, '')
}

export const getSymbolSlug = (token: Currency | Token | undefined) =>
  token ? convertToSlug(token?.symbol || token?.wrapped?.symbol || '') : ''

export const getNetworkSlug = (chainId: ChainId | undefined) => {
  return chainId ? NETWORKS_INFO[chainId].route : ''
}

export const queryStringToObject = (queryString: string) => {
  return parse(queryString.startsWith('?') ? queryString.substring(1) : queryString)
}
