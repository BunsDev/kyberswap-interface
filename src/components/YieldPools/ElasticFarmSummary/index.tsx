import { Trans } from '@lingui/macro'
import { useState } from 'react'
import { Triangle } from 'react-feather'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as Bulb } from 'assets/svg/sprinkling_bulb.svg'
import useTheme from 'hooks/useTheme'

import SummaryContent from './SummaryContent'

const HighlightedText = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`

const ElasticFarmSummary = () => {
  const theme = useTheme()
  const [isOpen, setOpen] = useState(false)

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        width: '100%',
        border: `1px solid ${theme.warning}`,
        borderRadius: '26px',
        padding: '16px 18px',
      }}
    >
      <Flex
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingLeft: '2px',
          paddingRight: '4px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        role="button"
        onClick={() => setOpen(o => !o)}
      >
        <Flex
          sx={{
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Flex
            sx={{
              flex: '0 0 20px',
            }}
          >
            <Bulb />
          </Flex>
          <Text
            as="span"
            sx={{
              fontWeight: '400',
              fontSize: '14px',
              lineHeight: '20px',
              color: theme.subText,
            }}
          >
            <Trans>
              All farms are setup using ether of our 2 innovative farming mechanisms. Read the tips below to{' '}
              <HighlightedText>maximize</HighlightedText> your farming rewards!
            </Trans>
          </Text>
        </Flex>

        <Flex
          sx={{
            flex: '0 0 8px',
          }}
        >
          <Triangle
            style={{
              width: '8px',
              height: 'auto',
              color: theme.subText,
              transform: isOpen ? undefined : 'rotate(180deg)',
              fill: 'currentColor',
              transition: 'transform 150ms',
            }}
          />
        </Flex>
      </Flex>

      <SummaryContent isOpen={isOpen} />
    </Flex>
  )
}

export default ElasticFarmSummary
