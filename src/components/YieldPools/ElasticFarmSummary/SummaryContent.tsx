import { Trans, t } from '@lingui/macro'
import { useState } from 'react'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import useTheme from 'hooks/useTheme'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 36px;
  padding: 4px;
  background: ${({ theme }) => theme.background};
  border-radius: 20px;
  flex-shrink: 0;
`

const Tab = styled.div`
  flex: 1 1 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 8px;

  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.subText};

  border-radius: 20px;

  will-change: color, background;
  transition: color 100ms, background 100ms;

  cursor: pointer;

  &[data-active='true'] {
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.tableHeader};
  }
`

const TextContainer = styled.ul`
  flex-shrink: 0;

  display: flex;
  flex-direction: column;
  margin: 0;
  padding-left: 24px;
  padding-right: 8px;
  width: 100%;
  row-gap: 8px;

  margin-block-start: 0;
  margin-block-end: 0;

  margin-inline-start: 0;
  margin-inline-end: 0;

  list-style-type: disc;
  list-style-position: outside;

  color: ${({ theme }) => theme.subText};

  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
`

const HighlightedText = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`

type Props = {
  isOpen: boolean
}

const SummaryContent: React.FC<Props> = ({ isOpen }) => {
  const theme = useTheme()
  const upToMedium = useMedia(`(max-width: ${MEDIA_WIDTHS.upToMedium}px)`)
  const [activeTab, setActiveTab] = useState<1 | 2>(1)

  return (
    <Flex
      sx={{
        width: '100%',
        flexDirection: 'column',
        rowGap: '12px',
        maxHeight: isOpen ? '1000px' : '0',
        transition: 'max-height 150ms, margin 150ms',
        overflow: 'hidden',
        marginTop: isOpen ? '12px' : '0px',
      }}
    >
      {upToMedium ? (
        <>
          <TabContainer>
            <Tab data-active={activeTab === 1} role="button" onClick={() => setActiveTab(1)}>
              {t`Farming Mechanism 1`}
            </Tab>
            <Tab data-active={activeTab === 2} role="button" onClick={() => setActiveTab(2)}>
              {t`Farming Mechanism 2`}
            </Tab>
          </TabContainer>
          <Text
            as="span"
            sx={{
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              textAlign: 'center',
            }}
          >
            {activeTab === 1 ? t`Active Liquidity Time` : t`Active Liquidity Time & Target Volume`}
          </Text>
        </>
      ) : (
        <TabContainer>
          <Tab data-active={activeTab === 1} role="button" onClick={() => setActiveTab(1)}>
            {t`Farming Mechanism 1 - Active Liquidity Time`}
          </Tab>
          <Tab data-active={activeTab === 2} role="button" onClick={() => setActiveTab(2)}>
            {t`Farming Mechanism 2 - Active Liquidity Time & Target Volume`}
          </Tab>
        </TabContainer>
      )}

      {activeTab === 1 ? (
        <TextContainer>
          <li>
            <Trans>
              Farms setup using this mechanism rely on 1 factor only - the <HighlightedText>total time</HighlightedText>{' '}
              your liquidity position is <HighlightedText>active</HighlightedText> (aka in range) in the pool
            </Trans>
          </li>
          <li>
            <Trans>
              If the <HighlightedText>Target Volume</HighlightedText> column for a farm is marked as{' '}
              <HighlightedText>blank</HighlightedText> (or with - -), the farm is setup with this 1st mechanism
            </Trans>
          </li>
          <li>
            <Trans>
              Once you stake your liquidity position into a farm, your farming rewards are calculated based on the time
              your liquidity position is currently active and supporting the current market price of the pool. You will
              continue to accumulate farming rewards as long as your position is active
            </Trans>
          </li>
          <li>
            <Trans>
              If your liquidity position goes out of range (aka becomes inactive), you will stop accumulating farming
              rewards
            </Trans>
          </li>
        </TextContainer>
      ) : (
        <TextContainer>
          <li>
            <Trans>Farms setup using this mechanism rely on 2 factors:</Trans>
          </li>

          <TextContainer>
            <li>
              <Trans>
                The <HighlightedText>total time</HighlightedText> your liquidity position is active (aka in range) in
                the pool
              </Trans>
            </li>

            <li>
              <Trans>
                The <HighlightedText>trade volume</HighlightedText> supported by your liquidity position
              </Trans>
            </li>
          </TextContainer>

          <li>
            <Trans>
              If the <HighlightedText>Target Volume</HighlightedText> column for a farm displays a{' '}
              <HighlightedText>progress bar</HighlightedText>, the farm is setup with this 2nd mechanism
            </Trans>
          </li>

          <li>
            <Trans>
              Your liquidity position needs to achieve the <HighlightedText>required target volume</HighlightedText>{' '}
              (represented by a progress bar). You will accumulate farming rewards even if your liquidity position
              hasn&apos;t hit the required Target Volume. But as soon as your position hits the required Target Volume
              (i.e. progress bar is 100%), from thereafter, you will earn 100% of the rewards for that liquidity
              position
            </Trans>
          </li>

          <li>
            <Trans>The more trading volume your position supports, the more farming rewards you will earn</Trans>
          </li>

          <li>
            <Trans>
              If your liquidity position goes out of range (aka becomes inactive), you will stop accumulating farming
              rewards
            </Trans>
          </li>
        </TextContainer>
      )}

      <Text
        as="span"
        sx={{
          fontWeight: '400',
          fontSize: '14px',
          lineHeight: '20px',
          color: theme.subText,
          flexShrink: '0',
        }}
      >
        <Trans>
          If you wish to learn more, click{' '}
          <ExternalLink href="https://docs.kyberswap.com/guides/farming-mechanisms">here ↗</ExternalLink>
        </Trans>
      </Text>
    </Flex>
  )
}

export default SummaryContent
