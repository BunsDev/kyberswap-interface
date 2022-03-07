import React from 'react'
import styled from 'styled-components'
import { CheckCircle, Copy } from 'react-feather'

import useCopyClipboard from '../../hooks/useCopyClipboard'

const CopyIcon = styled.div<{ margin?: string }>`
  flex-shrink: 0;
  margin-right: 1rem;
  margin-left: 2px;
  ${({ margin }) => `margin: ${margin};`}
  text-decoration: none;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    opacity: 0.8;
    cursor: pointer;
    color: ${({ theme }) => theme.text2};
  }
`
const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  font-size: 0.825rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

export default function CopyHelper({
  toCopy,
  margin
}: {
  toCopy: string
  children?: React.ReactNode
  margin?: string
}) {
  const [isCopied, setCopied] = useCopyClipboard()

  const onCopy = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()
    setCopied(toCopy)
  }

  return (
    <CopyIcon onClick={onCopy} margin={margin}>
      {isCopied ? (
        <TransactionStatusText>
          <CheckCircle size={'14'} />
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>
          <Copy size={'14'} />
        </TransactionStatusText>
      )}
    </CopyIcon>
  )
}
