import { Placement } from '@popperjs/core'
import React, { CSSProperties, ReactNode, useCallback, useState } from 'react'
import { Info } from 'react-feather'
import styled from 'styled-components'

import Tooltip from '../Tooltip'

const InfoWrapper = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  color: ${({ theme, isActive }) => (isActive ? theme.textReverse : theme.subText)};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const LightInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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

const InfoMark = styled.span`
  font-size: 1rem;
`

const InfoHelperWrapper = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-left: 0.25rem;
  line-height: 100%;
  vertical-align: middle;
`

export default function InfoHelper({
  text,
  size,
  isActive = false,
  color,
  placement,
  width,
  style,
}: {
  text: string | ReactNode
  size?: number
  isActive?: boolean
  color?: string
  placement?: Placement
  width?: string
  style?: CSSProperties
}) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <InfoHelperWrapper style={style}>
      <Tooltip text={text} show={show} placement={placement} width={width} size={size}>
        <InfoWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} isActive={isActive}>
          <Info size={size || 12} color={color} />
        </InfoWrapper>
      </Tooltip>
    </InfoHelperWrapper>
  )
}

export function LightInfoHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <LightInfoWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <InfoMark>?</InfoMark>
        </LightInfoWrapper>
      </Tooltip>
    </span>
  )
}
