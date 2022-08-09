import { useCallback, useEffect } from 'react'
import { X } from 'react-feather'
import { animated, useSpring } from 'react-spring'
import { Flex } from 'rebass'
import styled, { DefaultTheme, keyframes } from 'styled-components'

import useTheme from 'hooks/useTheme'
import { PopupContentListUpdate, PopupContentSimple, PopupContentTxn, PopupType } from 'state/application/actions'
import { NotificationType, useRemovePopup } from 'state/application/hooks'

import ListUpdatePopup from './ListUpdatePopup'
import SimplePopup from './SimplePopup'
import TransactionPopup from './TransactionPopup'

export const StyledClose = styled(X)`
  margin-left: 10px;
  :hover {
    cursor: pointer;
  }
`
const delta = window.innerWidth + 'px'

const rtl = keyframes`
  from {
    opacity: 0;
    transform: translateX(${delta});
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const ltr = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(${delta});
  }
`

const getBackgroundColor = (theme: DefaultTheme, type: NotificationType = NotificationType.ERROR) => {
  const mapColor = {
    [NotificationType.SUCCESS]: theme.bg21,
    [NotificationType.ERROR]: theme.bg22,
    [NotificationType.WARNING]: theme.bg23,
  }
  return mapColor[type]
}

export const Popup = styled.div<{ type?: NotificationType }>`
  display: inline-block;
  width: 100%;
  background: ${({ theme, type }) => getBackgroundColor(theme, type)};
  position: relative;
  padding: 20px;
  padding-right: 12px;
`

const Fader = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.subText};
`

const AnimatedFader = animated(Fader)

const PopupWrapper = styled.div<{ removeAfterMs?: number | null }>`
  position: relative;
  isolation: isolate;
  border-radius: 10px;
  overflow: hidden;
  width: min(calc(100vw - 32px), 425px);
  animation: ${rtl} 0.7s ease-in-out,
    ${ltr} 0.5s ease-in-out ${({ removeAfterMs }) => (removeAfterMs || 15000) / 1000 - 0.2}s; // animation out auto play after removeAfterMs - 0.2 seconds
  &:not(:first-of-type) {
    margin-top: 15px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: auto;
  `}
`

const SolidBackgroundLayer = styled.div`
  background: ${({ theme }) => theme.bg2};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

export default function PopupItem({
  removeAfterMs,
  content,
  popKey,
  popupType,
}: {
  removeAfterMs: number | null
  content: PopupContentTxn | PopupContentListUpdate | PopupContentSimple
  popKey: string
  popupType: PopupType
}) {
  const removePopup = useRemovePopup()
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
  useEffect(() => {
    if (removeAfterMs === null) return
    const timeout = setTimeout(() => {
      removeThisPopup()
    }, removeAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [removeAfterMs, removeThisPopup])

  const theme = useTheme()

  let notiType: NotificationType
  let popupContent
  switch (popupType) {
    case PopupType.SIMPLE: {
      const { title, summary, type = NotificationType.ERROR } = content as PopupContentSimple
      notiType = type
      popupContent = <SimplePopup title={title} type={type} summary={summary} />
      break
    }
    case PopupType.TRANSACTION: {
      const { hash, type, summary, notiType: _notiType = NotificationType.ERROR } = content as PopupContentTxn
      notiType = _notiType
      popupContent = <TransactionPopup hash={hash} notiType={notiType} type={type} summary={summary} />
      break
    }
    case PopupType.LIST_UPDATE: {
      const { listUrl, oldList, newList, auto } = content as PopupContentListUpdate
      notiType = NotificationType.SUCCESS
      popupContent = (
        <ListUpdatePopup popKey={popKey} listUrl={listUrl} oldList={oldList} newList={newList} auto={auto} />
      )
      break
    }
  }
  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration: removeAfterMs ?? undefined },
  })

  return (
    <PopupWrapper removeAfterMs={removeAfterMs}>
      <SolidBackgroundLayer />
      <Popup type={notiType}>
        <Flex justifyContent={'space-between'}>
          {popupContent}
          <StyledClose color={theme.text2} onClick={removeThisPopup} />
        </Flex>
        {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null}
      </Popup>
    </PopupWrapper>
  )
}
