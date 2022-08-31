import { Trans } from '@lingui/macro'
import { Text } from 'rebass'

import useTheme from 'hooks/useTheme'
import { getFormattedTimeFromSecond } from 'utils/formatTime'

const StartingIn = ({ startingIn }: { startingIn?: string }) => {
  const theme = useTheme()

  if (!startingIn) {
    return (
      <Text color={theme.text}>
        <Trans>Coming soon</Trans>
      </Text>
    )
  }

  const timeDiff = new Date(startingIn).getTime() - Date.now()

  if (timeDiff < 0) {
    return null
  }

  const seconds = Math.abs(timeDiff) / 1000

  return <Text color={theme.text}>{getFormattedTimeFromSecond(seconds)}</Text>
}

export default StartingIn
