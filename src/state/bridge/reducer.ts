import { ChainId } from '@kyberswap/ks-sdk-core'
import { createReducer } from '@reduxjs/toolkit'

import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

import { resetBridgeState, setBridgeState } from './actions'

export interface BridgeState {
  tokenIn: WrappedTokenInfo | undefined
  tokenOut: WrappedTokenInfo | undefined
  chainIdOut: ChainId | undefined
  listChainIn: ChainId[]
  listTokenIn: WrappedTokenInfo[]
  listTokenOut: WrappedTokenInfo[]
}

export const DEFAULT_STATE: BridgeState = {
  tokenIn: undefined,
  tokenOut: undefined,
  chainIdOut: undefined,
  listTokenIn: [],
  listChainIn: [],
  listTokenOut: [],
}

export default createReducer(DEFAULT_STATE, builder =>
  builder
    .addCase(
      setBridgeState,
      (state, { payload: { tokenIn, tokenOut, chainIdOut, listChainIn, listTokenIn, listTokenOut } }) => {
        if (tokenIn !== undefined) state.tokenIn = tokenIn
        if (tokenOut !== undefined) state.tokenOut = tokenOut
        if (chainIdOut !== undefined) state.chainIdOut = chainIdOut
        if (listChainIn !== undefined) state.listChainIn = listChainIn
        if (listTokenIn !== undefined) state.listTokenIn = listTokenIn
        if (listTokenOut !== undefined) state.listTokenOut = listTokenOut
      },
    )
    .addCase(resetBridgeState, state => {
      state.tokenIn = undefined
      state.tokenOut = undefined
      state.chainIdOut = undefined
    }),
)
