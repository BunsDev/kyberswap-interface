import { VersionUpgrade, getVersionUpgrade } from '@uniswap/token-lists'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { useAllLists } from 'state/lists/hooks'

import { useActiveWeb3React } from '../../hooks'
import { useFetchListCallback } from '../../hooks/useFetchListCallback'
import useInterval from '../../hooks/useInterval'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { AppDispatch } from '../index'
import { acceptListUpdate } from './actions'
import { useActiveListUrls } from './hooks'

export default function Updater(): null {
  const { library } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const isWindowVisible = useIsWindowVisible()

  // get all loaded lists, and the active urls
  const lists = useAllLists()
  const activeListUrls = useActiveListUrls() //todo: check if this is needed?

  const fetchList = useFetchListCallback()
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return
    Object.keys(lists).forEach(url =>
      fetchList(url).catch(error => console.debug('interval list fetching error', error)),
    )
  }, [fetchList, isWindowVisible, lists])

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null)

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach(listUrl => {
      const list = lists[listUrl]
      if (!list.current && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch(error => console.debug('list added fetching error', error))
      }
    })
  }, [dispatch, fetchList, library, lists])

  // if any lists from unsupported lists are loaded, check them too (in case new updates since last visit)
  useEffect(() => {
    UNSUPPORTED_LIST_URLS.forEach(listUrl => {
      const list = lists[listUrl]
      if (!list || (!list.current && !list.loadingRequestId && !list.error)) {
        fetchList(listUrl).catch(error => console.debug('list added fetching error', error))
      }
    })
  }, [dispatch, fetchList, library, lists])

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach(listUrl => {
      const list = lists[listUrl]

      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version)
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump')
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
          case VersionUpgrade.MAJOR:
            dispatch(acceptListUpdate(listUrl))
        }
      }
    })
  }, [dispatch, lists, activeListUrls])

  return null
}
