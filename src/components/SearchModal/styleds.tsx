import { Search } from 'react-feather'
import styled from 'styled-components'

import { AutoColumn } from '../Column'
import { RowFixed } from '../Row'

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary};
  font-size: 14px;
`

export const TextDot = styled.div`
  height: 3px;
  width: 3px;
  background-color: ${({ theme }) => theme.text2};
  border-radius: 50%;
`

export const Checkbox = styled.input`
  border: 1px solid ${({ theme }) => theme.red3};
  height: 20px;
  margin: 0;
`

export const PaddedColumn = styled(AutoColumn)`
  padding: 20px;
  padding-bottom: 12px;
`

export const SearchWrapper = styled.div`
  position: relative;
  height: 45px;
`

export const SearchIcon = styled(Search)`
  position: absolute;
  right: 12px;
  top: 12px;
`

export const SearchInput = styled.input`
  position: absolute;
  display: flex;
  padding: 10px 30px 13px 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 999px;
  color: ${({ theme }) => theme.text};
  border-style: solid;
  border: 1px solid ${({ theme }) => theme.buttonBlack};
  background: ${({ theme }) => theme.buttonBlack};
  -webkit-appearance: none;

  font-size: 17px;

  ::placeholder {
    color: ${({ theme }) => theme.border};
    font-size: 13.5px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 12.5px;
    `};
  }
  transition: border 100ms;
  :focus {
    border: 1px solid ${({ theme }) => theme.primary};
    outline: none;
  }
`
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.border};
`

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`
