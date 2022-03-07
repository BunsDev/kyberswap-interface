import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'rebass'
import { Currency } from '@dynamic-amm/sdk'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'react-feather'
import { useMedia } from 'react-use'
import { t, Trans } from '@lingui/macro'
import InfoHelper from 'components/InfoHelper'
import {
  SubgraphPoolData,
  useAllPoolsData,
  useResetPools,
  UserLiquidityPosition,
  useUserLiquidityPositions
} from 'state/pools/hooks'
import ListItemGroup from './ListItem'
import ItemCardGroup from 'components/PoolList/ItemCard/ItemCardGroup'
import PoolDetailModal from './PoolDetailModal'
import { AMP_HINT, AMP_LIQUIDITY_HINT, MAX_ALLOW_APY } from 'constants/index'
import useTheme from 'hooks/useTheme'
import { useActiveWeb3React } from 'hooks'
import LocalLoader from 'components/LocalLoader'
import { Field } from 'state/pair/actions'
import { SelectPairInstructionWrapper } from 'pages/Pools/styleds'
import { getTradingFeeAPR } from 'utils/dmm'
import { useActiveAndUniqueFarmsData } from 'state/farms/hooks'
import { wrappedCurrency } from 'utils/wrappedCurrency'

const TableHeader = styled.div`
  display: grid;
  grid-gap: 1.5rem;
  grid-template-columns: 1.5fr 1.5fr 2fr 0.75fr 1fr 1fr 1fr 1.5fr;
  padding: 18px 16px;
  font-size: 12px;
  align-items: center;
  height: fit-content;
  position: relative;
  background-color: ${({ theme }) => theme.tableHeader};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  z-index: 1;
  border-bottom: ${({ theme }) => `1px solid ${theme.border}`};
`

const ClickableText = styled(Text)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.subText};

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  user-select: none;
  text-transform: uppercase;
`

const Pagination = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: ${({ theme }) => theme.oddRow};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
    border: none;
    background-color: revert;
  `}
`

const PaginationText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.subText};
`

interface PoolListProps {
  currencies: { [field in Field]?: Currency }
  searchValue: string
  isShowOnlyActiveFarmPools: boolean
}

const SORT_FIELD = {
  LIQ: 0,
  VOL: 1,
  FEES: 2,
  APR: 3
}

const ITEM_PER_PAGE = 5

const PoolList = ({ currencies, searchValue, isShowOnlyActiveFarmPools }: PoolListProps) => {
  const above1000 = useMedia('(min-width: 1000px)')
  const theme = useTheme()

  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)
  const { loading: loadingPoolsData, data: subgraphPoolsData } = useAllPoolsData()

  const { account, chainId } = useActiveWeb3React()

  useResetPools(chainId)

  const userLiquidityPositionsQueryResult = useUserLiquidityPositions(account)
  const loadingUserLiquidityPositions = !account ? false : userLiquidityPositionsQueryResult.loading
  const userLiquidityPositions = !account ? { liquidityPositions: [] } : userLiquidityPositionsQueryResult.data
  const transformedUserLiquidityPositions: {
    [key: string]: UserLiquidityPosition
  } = {}
  userLiquidityPositions &&
    userLiquidityPositions.liquidityPositions.forEach(position => {
      transformedUserLiquidityPositions[position.pool.id] = position
    })

  const listComparator = useCallback(
    (poolA: SubgraphPoolData, poolB: SubgraphPoolData): number => {
      const feeA = poolA?.oneDayFeeUSD ? poolA?.oneDayFeeUSD : poolA?.oneDayFeeUntracked
      const feeB = poolB?.oneDayFeeUSD ? poolB?.oneDayFeeUSD : poolB?.oneDayFeeUntracked

      switch (sortedColumn) {
        case SORT_FIELD.LIQ:
          return parseFloat(poolA?.amp.toString() || '0') * parseFloat(poolA?.reserveUSD) >
            parseFloat(poolB?.amp.toString() || '0') * parseFloat(poolB?.reserveUSD)
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1
        case SORT_FIELD.VOL:
          const volumeA = poolA?.oneDayVolumeUSD ? poolA?.oneDayVolumeUSD : poolA?.oneDayVolumeUntracked

          const volumeB = poolB?.oneDayVolumeUSD ? poolB?.oneDayVolumeUSD : poolB?.oneDayVolumeUntracked

          return parseFloat(volumeA) > parseFloat(volumeB)
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1
        case SORT_FIELD.FEES:
          return parseFloat(feeA) > parseFloat(feeB) ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        case SORT_FIELD.APR:
          const oneYearFLPoolA =
            getTradingFeeAPR(poolA?.reserveUSD, feeA) > MAX_ALLOW_APY ? -1 : getTradingFeeAPR(poolA?.reserveUSD, feeA)
          const oneYearFLPoolB =
            getTradingFeeAPR(poolB?.reserveUSD, feeB) > MAX_ALLOW_APY ? -1 : getTradingFeeAPR(poolB?.reserveUSD, feeB)

          return oneYearFLPoolA > oneYearFLPoolB ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        default:
          break
      }

      return 0
    },
    [sortDirection, sortedColumn]
  )

  const renderHeader = () => {
    return above1000 ? (
      <TableHeader>
        <Flex alignItems="center">
          <ClickableText>
            <Trans>Token Pair</Trans>
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText>
            <Trans>Pool | AMP</Trans>
          </ClickableText>
          <InfoHelper text={AMP_HINT} />
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
            style={{ textAlign: 'right' }}
          >
            <Trans>AMP LIQUIDITY</Trans>
            <InfoHelper text={AMP_LIQUIDITY_HINT} />
            <span style={{ marginLeft: '0.25rem' }}>|</span>
            <span style={{ marginLeft: '0.25rem' }}>TVL</span>
            {sortedColumn === SORT_FIELD.LIQ ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.APR)
              setSortDirection(sortedColumn !== SORT_FIELD.APR ? true : !sortDirection)
            }}
          >
            <Trans>APR</Trans>
            {sortedColumn === SORT_FIELD.APR ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
          <InfoHelper text={t`Estimated return based on yearly fees of the pool`} />
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
            style={{ textAlign: 'right' }}
          >
            <Trans>Volume (24h)</Trans>
            {sortedColumn === SORT_FIELD.VOL ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText
            onClick={() => {
              setSortedColumn(SORT_FIELD.FEES)
              setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
            }}
          >
            <Trans>Fee (24h)</Trans>
            {sortedColumn === SORT_FIELD.FEES ? (
              !sortDirection ? (
                <ChevronUp size="14" style={{ marginLeft: '2px' }} />
              ) : (
                <ChevronDown size="14" style={{ marginLeft: '2px' }} />
              )
            ) : (
              ''
            )}
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText style={{ textAlign: 'right' }}>
            <Trans>My liquidity</Trans>
          </ClickableText>
        </Flex>

        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText>
            <Trans>Actions</Trans>
          </ClickableText>
        </Flex>
      </TableHeader>
    ) : null
  }

  const { data: farms } = useActiveAndUniqueFarmsData()

  const sortedFilteredSubgraphPoolsData = useMemo(() => {
    let res = [...subgraphPoolsData].sort(listComparator)

    if (isShowOnlyActiveFarmPools) {
      const farmAddresses = farms.map(farm => farm.id)
      res = res.filter(poolData => farmAddresses.includes(poolData.id))
    }

    const ca = currencies[Field.CURRENCY_A]
    const cb = currencies[Field.CURRENCY_B]

    if (ca) {
      const wca = wrappedCurrency(ca, chainId)
      const wcaAddress = wca && wca.address.toLowerCase()
      res = res.filter(
        poolData => wcaAddress && (poolData.token0.id === wcaAddress || poolData.token1.id === wcaAddress)
      )
    }

    if (cb) {
      const wcb = wrappedCurrency(cb, chainId)
      const wcbAddress = wcb && wcb.address.toLowerCase()
      res = res.filter(
        poolData => wcbAddress && (poolData.token0.id === wcbAddress || poolData.token1.id === wcbAddress)
      )
    }

    res = res.filter(poolData => {
      const search = searchValue.toLowerCase()

      return (
        poolData.token0.symbol.toLowerCase().includes(search) ||
        poolData.token1.symbol.toLowerCase().includes(search) ||
        poolData.id.includes(search)
      )
    })

    return res
  }, [subgraphPoolsData, listComparator, currencies, searchValue, isShowOnlyActiveFarmPools, farms, chainId])

  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    setCurrentPage(1)
  }, [subgraphPoolsData, currencies, searchValue, isShowOnlyActiveFarmPools])

  const sortedFilteredSubgraphPoolsObject = useMemo(() => {
    const res = new Map<string, SubgraphPoolData[]>()
    sortedFilteredSubgraphPoolsData.forEach(poolData => {
      if (!poolData) return
      const poolKey = poolData.token0.id + '-' + poolData.token1.id
      const prevValue = res.get(poolKey)
      res.set(poolKey, (prevValue ?? []).concat(poolData))
    })
    return res
  }, [sortedFilteredSubgraphPoolsData])

  const maxPage =
    sortedFilteredSubgraphPoolsObject.size % ITEM_PER_PAGE === 0
      ? sortedFilteredSubgraphPoolsObject.size / ITEM_PER_PAGE
      : Math.floor(sortedFilteredSubgraphPoolsObject.size / ITEM_PER_PAGE) + 1

  const sortedFilteredPaginatedSubgraphPoolsList = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEM_PER_PAGE
    const endIndex = currentPage * ITEM_PER_PAGE
    const res = Array.from(sortedFilteredSubgraphPoolsObject, ([, pools]) => pools[0]).slice(startIndex, endIndex)
    return res
  }, [currentPage, sortedFilteredSubgraphPoolsObject])

  const onPrev = () => setCurrentPage(prev => Math.max(1, prev - 1))
  const onNext = () => setCurrentPage(prev => Math.min(maxPage, prev + 1))

  const [expandedPoolKey, setExpandedPoolKey] = useState<string>()

  // Active first expandable pool in first page for first time.
  useEffect(() => {
    if (!above1000 || expandedPoolKey !== undefined) return

    const firstPoolHasMoreThanTwoExpandedPools = sortedFilteredPaginatedSubgraphPoolsList.filter(poolData => {
      const poolKey = poolData.token0.id + '-' + poolData.token1.id

      const expandedPools = sortedFilteredSubgraphPoolsObject.get(poolKey) ?? []

      return expandedPools.length >= 2
    })

    firstPoolHasMoreThanTwoExpandedPools.length &&
      setExpandedPoolKey(
        firstPoolHasMoreThanTwoExpandedPools[0].token0.id + '-' + firstPoolHasMoreThanTwoExpandedPools[0].token1.id
      )
  }, [above1000, sortedFilteredPaginatedSubgraphPoolsList, expandedPoolKey, sortedFilteredSubgraphPoolsObject])

  if (loadingUserLiquidityPositions || loadingPoolsData) return <LocalLoader />

  if (sortedFilteredPaginatedSubgraphPoolsList.length === 0)
    return (
      <SelectPairInstructionWrapper>
        <div style={{ marginBottom: '1rem' }}>
          <Trans>There are no pools for this token pair.</Trans>
        </div>
        <div>
          <Trans>Create a new pool or select another pair of tokens to view the available pools.</Trans>
        </div>
      </SelectPairInstructionWrapper>
    )

  return (
    <div>
      {renderHeader()}
      {sortedFilteredPaginatedSubgraphPoolsList.map(poolData => {
        if (poolData) {
          return above1000 ? (
            <ListItemGroup
              key={poolData.id}
              sortedFilteredSubgraphPoolsObject={sortedFilteredSubgraphPoolsObject}
              poolData={poolData}
              userLiquidityPositions={transformedUserLiquidityPositions}
              expandedPoolKey={expandedPoolKey}
              setExpandedPoolKey={setExpandedPoolKey}
            />
          ) : (
            <ItemCardGroup
              key={poolData.id}
              sortedFilteredSubgraphPoolsObject={sortedFilteredSubgraphPoolsObject}
              poolData={poolData}
              userLiquidityPositions={transformedUserLiquidityPositions}
              expandedPoolKey={expandedPoolKey}
              setExpandedPoolKey={setExpandedPoolKey}
            />
          )
        }

        return null
      })}
      <Pagination>
        <ClickableText>
          <ArrowLeft size={16} color={theme.primary} onClick={onPrev} />
        </ClickableText>
        <PaginationText>
          Page {currentPage} of {maxPage}
        </PaginationText>
        <ClickableText>
          <ArrowRight size={16} color={theme.primary} onClick={onNext} />
        </ClickableText>
      </Pagination>
      <PoolDetailModal />
    </div>
  )
}

export default PoolList
