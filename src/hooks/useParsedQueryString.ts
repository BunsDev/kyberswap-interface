import { ParsedUrlQuery } from 'querystring'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { queryStringToObject } from 'utils/string'

export default function useParsedQueryString(): ParsedUrlQuery {
  const { search } = useLocation()
  return useMemo(() => (search && search.length > 1 ? queryStringToObject(search) : {}), [search])
}
