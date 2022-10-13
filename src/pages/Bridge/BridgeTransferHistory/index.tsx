import { Trans } from '@lingui/macro'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { rgba } from 'polished'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Info } from 'react-feather'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'
import styled, { css } from 'styled-components'

import LocalLoader from 'components/LocalLoader'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import { MEDIA_WIDTHS } from 'theme'

import { ITEMS_PER_PAGE } from '../consts'
import ActionCell from './ActionCell'
import RouteCell from './RouteCell'
import StatusBadge from './StatusBadge'
import TimeCell from './TimeCell'
import TimeStatusCell from './TimeStatusCell'
import TokenReceiveCell from './TokenReceiveCell'
import useTransferHistory from './useTransferHistory'

dayjs.extend(utc)

const commonCSS = css`
  width: 100%;
  padding: 0 16px;

  display: grid;
  grid-template-columns: 120px 130px 80px 150px 32px;
  justify-content: space-between;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    column-gap: 4px;
    grid-template-columns: 120px minmax(80px, 120px) 64px minmax(auto, 130px) 28px;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    column-gap: 16px;
    grid-template-columns: 90px 64px 1fr 28px;
  `}
`

const TableHeader = styled.div`
  ${commonCSS}
  height: 48px;
  background: ${({ theme }) => theme.tableHeader};
  border-radius: 20px 20px 0 0;
`

const TableColumnText = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.subText};
`

const TableRow = styled.div`
  ${commonCSS}
  height: 60px;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: none;
  }
`

const PaginationButton = styled.button`
  flex: 0 0 36px;
  height: 36px;
  padding: 0px;
  margin: 0px;
  border: none;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  border-radius: 999px;
  color: ${({ theme }) => theme.subText};
  background: ${({ theme }) => theme.buttonGray};
  transition: color 150ms;

  &:active {
    color: ${({ theme }) => theme.text};
  }

  @media (hover: hover) {
    &:hover {
      color: ${({ theme }) => theme.text};
    }
  }

  &:disabled {
    color: ${({ theme }) => rgba(theme.subText, 0.4)};
    cursor: not-allowed;
  }
`

type Props = {
  className?: string
}
const TransferHistory: React.FC<Props> = ({ className }) => {
  const upToExtraSmall = useMedia(`(max-width: ${MEDIA_WIDTHS.upToExtraSmall}px)`)
  const theme = useTheme()
  const { account } = useActiveWeb3React()
  const [shouldShowLoading, setShouldShowLoading] = useState(true)
  const { isCompletelyEmpty, range, transfers, isValidating, canGoNext, canGoPrevious, onClickNext, onClickPrevious } =
    useTransferHistory(account || '')

  const isThisPageEmpty = transfers.length === 0

  const timeOutRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    // This is to ensure loading is displayed at least 1.5s
    const existingTimeout = timeOutRef.current

    if (isValidating) {
      setShouldShowLoading(true)
    } else {
      timeOutRef.current = setTimeout(() => {
        setShouldShowLoading(false)
      }, 1_500)
    }
    return () => {
      existingTimeout && clearTimeout(existingTimeout)
    }
  }, [isValidating])

  // todo: when transfers is [] and not, show different loading strategy
  // toast error
  if (shouldShowLoading) {
    return <LocalLoader />
  }

  if (isCompletelyEmpty) {
    return (
      <Flex
        sx={{
          width: '100%',
          height: '180px', // to match the Loader's height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: theme.subText,
          gap: '16px',
        }}
      >
        <Info size={48} />
        <Text
          sx={{
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
          }}
        >
          <Trans>You haven&apos;t made any transfers yet</Trans>
        </Text>
      </Flex>
    )
  }

  const renderInvisibleRows = () => {
    if (transfers.length === ITEMS_PER_PAGE) {
      return null
    }

    return Array(ITEMS_PER_PAGE - transfers.length)
      .fill(0)
      .map((_, i) => {
        return (
          <TableRow
            key={i}
            style={{
              visibility: 'hidden',
            }}
          />
        )
      })
  }

  const getTxsUrl = (txid: string) => `https://anyswap.net/explorer/tx?params=${txid}`

  const renderTable = () => {
    if (upToExtraSmall) {
      return (
        <>
          <TableHeader>
            <TableColumnText>DATE | STATUS</TableColumnText>
            <TableColumnText>ROUTE</TableColumnText>
            <TableColumnText>AMOUNT</TableColumnText>
            <TableColumnText />
          </TableHeader>
          {transfers.map((transfer, i) => (
            <TableRow key={i}>
              <TimeStatusCell
                status={transfer.status}
                dateString={transfer.inittime ? dayjs.utc(transfer.inittime).local().format('YYYY/MM/DD') : ''}
              />
              <RouteCell fromChainID={Number(transfer.fromChainID)} toChainID={Number(transfer.toChainID)} />
              <TokenReceiveCell transfer={transfer} />
              <ActionCell url={getTxsUrl(transfer.txid)} />
            </TableRow>
          ))}
          {renderInvisibleRows()}
        </>
      )
    }

    return (
      <>
        <TableHeader>
          <TableColumnText>CREATED</TableColumnText>
          <TableColumnText>STATUS</TableColumnText>
          <TableColumnText>ROUTE</TableColumnText>
          <TableColumnText>RECEIVED AMOUNT</TableColumnText>
          <TableColumnText />
        </TableHeader>
        {transfers.map((transfer, i) => (
          <TableRow key={i}>
            <TimeCell
              timeString={transfer.inittime ? dayjs.utc(transfer.inittime).local().format('YYYY/MM/DD HH:mm') : ''}
            />
            <StatusBadge status={transfer.status} />
            <RouteCell fromChainID={Number(transfer.fromChainID)} toChainID={Number(transfer.toChainID)} />
            <TokenReceiveCell transfer={transfer} />
            <ActionCell url={getTxsUrl(transfer.txid)} />
          </TableRow>
        ))}
        {renderInvisibleRows()}
      </>
    )
  }

  return (
    <div className={className}>
      <Flex flexDirection="column">{renderTable()}</Flex>
      <Flex
        sx={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 0',
          gap: '12px',
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <PaginationButton disabled={!canGoPrevious} onClick={onClickPrevious}>
          <ChevronLeft width={18} />
        </PaginationButton>

        <Flex
          sx={{
            width: '120px',
            fontSize: '12px',
            color: theme.subText,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isThisPageEmpty ? '-' : `${range[0]} - ${range[1]}`}
        </Flex>

        <PaginationButton disabled={!canGoNext} onClick={onClickNext}>
          <ChevronRight width={18} />
        </PaginationButton>
      </Flex>
    </div>
  )
}

export default styled(TransferHistory)`
  flex: 1;
  width: 100%;
  background: ${({ theme }) => rgba(theme.background, 0.3)};
  border-radius: 20px;
`
