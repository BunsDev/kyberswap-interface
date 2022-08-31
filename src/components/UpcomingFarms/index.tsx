import { Trans } from '@lingui/macro'
import { useMedia } from 'react-use'
import { Flex } from 'rebass'

import { ClickableText } from 'components/YieldPools/styleds'
import { UPCOMING_POOLS } from 'constants/upcoming-pools'

import ListItem from './ListItem'
import NoFarms from './NoFarms'
import { RowsWrapper, TableHeader, TableWrapper } from './styled'

const UpcomingFarms = () => {
  const lgBreakpoint = useMedia('(min-width: 1000px)')

  const renderHeader = () => {
    if (!lgBreakpoint) {
      return null
    }

    return (
      <TableHeader>
        <Flex grid-area="pools" alignItems="center" justifyContent="flex-start">
          <ClickableText>
            <Trans>Pools</Trans>
          </ClickableText>
        </Flex>

        <Flex grid-area="startingIn" alignItems="center" justifyContent="flex-start">
          <ClickableText>
            <Trans>Starting In</Trans>
          </ClickableText>
        </Flex>

        <Flex grid-area="network" alignItems="center" justifyContent="flex-start">
          <ClickableText>
            <Trans>Network</Trans>
          </ClickableText>
        </Flex>

        <Flex grid-area="rewards" alignItems="right" justifyContent="flex-end">
          <ClickableText>
            <Trans>Rewards</Trans>
          </ClickableText>
        </Flex>

        <Flex grid-area="information" alignItems="center" justifyContent="flex-end">
          <ClickableText>
            <Trans>Information</Trans>
          </ClickableText>
        </Flex>
      </TableHeader>
    )
  }

  return (
    <>
      {UPCOMING_POOLS.length > 0 ? (
        <TableWrapper>
          {renderHeader()}
          <RowsWrapper>
            {UPCOMING_POOLS.map((pool, index) => (
              <ListItem key={index} pool={pool} isLastItem={index === UPCOMING_POOLS.length - 1} />
            ))}
          </RowsWrapper>
        </TableWrapper>
      ) : (
        <NoFarms />
      )}
    </>
  )
}

export default UpcomingFarms
