import { createReducer } from '@reduxjs/toolkit'

import { SubgraphPoolData, UserLiquidityPosition } from './hooks'
import { setError, setLoading, setSelectedPool, updatePools } from './actions'

interface SelectedPool {
  poolData: SubgraphPoolData
  myLiquidity: UserLiquidityPosition | undefined
}

export interface PoolsState {
  readonly pools: SubgraphPoolData[]
  readonly loading: boolean
  readonly error: Error | undefined
  readonly selectedPool: SelectedPool | undefined
}

const initialState: PoolsState = {
  pools: [],
  loading: false,
  error: undefined,
  selectedPool: undefined
}

export default createReducer<PoolsState>(initialState, builder =>
  builder
    .addCase(updatePools, (state, { payload: { pools } }) => {
      return {
        ...state,
        pools,
        selectedPool: undefined
      }
    })
    .addCase(setLoading, (state, { payload: loading }) => {
      return {
        ...state,
        loading,
        selectedPool: undefined
      }
    })
    .addCase(setError, (state, { payload: error }) => {
      return {
        ...state,
        error,
        selectedPool: undefined
      }
    })
    .addCase(setSelectedPool, (state, { payload: { poolData, myLiquidity } }) => {
      return {
        ...state,
        selectedPool: {
          poolData,
          myLiquidity
        }
      }
    })
)
