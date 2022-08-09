import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'

import CreatePool from './index'

export default function RedirectDuplicateTokenIds(
  props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>,
) {
  const {
    match: {
      params: { currencyIdA, currencyIdB },
    },
  } = props
  if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Redirect to={`/create/${currencyIdA}`} />
  }
  return <CreatePool {...props} />
}
