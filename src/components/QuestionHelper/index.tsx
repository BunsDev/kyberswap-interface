import React, { useCallback, useState } from 'react'
import { Info } from 'react-feather'
import { Flex } from 'rebass'
import styled from 'styled-components'

import useTheme from 'hooks/useTheme'

import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div<{ useCurrentColor?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  color: ${({ theme, useCurrentColor, color }) => (useCurrentColor ? 'inherit' : theme.text2)};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const LightQuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  width: 24px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.white};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const QuestionMark = styled.span`
  font-size: 1rem;
`

export default function QuestionHelper({
  text,
  color,
  size = 12,
  useCurrentColor,
}: {
  text: string
  color?: string
  size?: number
  useCurrentColor?: boolean
}) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  const theme = useTheme()

  return (
    <Flex as="span" marginLeft="0.25rem" alignItems="center">
      <Tooltip text={text} show={show}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} useCurrentColor={useCurrentColor}>
          <Info size={size} color={useCurrentColor ? undefined : color || theme.subText} />
        </QuestionWrapper>
      </Tooltip>
    </Flex>
  )
}

export function LightQuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <LightQuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionMark>?</QuestionMark>
        </LightQuestionWrapper>
      </Tooltip>
    </span>
  )
}
