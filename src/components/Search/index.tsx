import React from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import SearchIcon from 'components/Icons/Search'
import useTheme from 'hooks/useTheme'
import { X } from 'react-feather'
import { ButtonEmpty } from 'components/Button'

const Container = styled.div`
  z-index: 1;
  position: relative;
  background-color: ${({ theme }) => theme.background};
  border-radius: 999px;

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`

const Wrapper = styled.div<{ minWidth?: string; backgroundColor?: string }>`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 12px;
  border-radius: 40px;
  background-color: ${({ theme, backgroundColor }) => backgroundColor || theme.background};

  width: 100%;
  min-width: ${({ minWidth }) => minWidth || '360px'};
  box-sizing: border-box;
  @media screen and (max-width: 500px) {
    box-shadow: none;
    min-width: 100%;
  }
`
const Input = styled.input<{ color?: string; placeholderColor?: string }>`
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  width: 100%;
  color: ${({ theme, color }) => color || theme.text};
  font-size: 12px;

  ::placeholder {
    color: ${({ theme, placeholderColor }) => placeholderColor || theme.border};
    font-size: 12px;
  }
`

interface SearchProps {
  searchValue: string
  onSearch: (newSearchValue: string) => void
  placeholder?: string
  allowClear?: boolean
  minWidth?: string
  backgroundColor?: string
  placeholderColor?: string
  color?: string
  style?: React.CSSProperties
}

export const Search = ({
  searchValue,
  onSearch,
  placeholder,
  minWidth,
  backgroundColor,
  placeholderColor,
  color,
  style,
}: SearchProps) => {
  const theme = useTheme()
  return (
    <Container style={style}>
      <Wrapper minWidth={minWidth} backgroundColor={backgroundColor}>
        <Input
          type="text"
          placeholder={placeholder || t`Search by pool address`}
          value={searchValue}
          onChange={e => {
            onSearch(e.target.value)
          }}
          color={color}
          placeholderColor={placeholderColor}
        />
        {searchValue && (
          <ButtonEmpty onClick={() => onSearch('')} style={{ padding: '2px 4px', width: 'max-content' }}>
            <X color={theme.subText} size={14} style={{ minWidth: '14px' }} />
          </ButtonEmpty>
        )}
        <SearchIcon color={theme.border} />
      </Wrapper>
    </Container>
  )
}

export default Search
