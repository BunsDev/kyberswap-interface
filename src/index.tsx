import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import 'inter-ui'
import React, { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { NetworkContextName, sentryRequestId } from './constants'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { LanguageProvider } from './i18n'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'
import SEO from './components/SEO'
import ReactGA from 'react-ga'
import * as Sentry from '@sentry/react'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

window.version = process.env.REACT_APP_VERSION

if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

const initGoogleAnalytics = () => {
  /*
  const gaLinkScript = document.createElement('script')
  gaLinkScript.async = true
  gaLinkScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-69MK4SBS26'

  const gaScript = document.createElement('script')
  gaScript.innerHTML = `
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-69MK4SBS26');
`

  document.head.insertBefore(gaScript, document.head.childNodes[0])
  document.head.insertBefore(gaLinkScript, document.head.childNodes[0])
  */
  ReactGA.initialize('UA-207888714-1')
}

if (process.env.REACT_APP_MAINNET_ENV === 'production') {
  initGoogleAnalytics()
}

if (window.location.href.includes('kyberswap')) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DNS
  })
  Sentry.configureScope(scope => {
    scope.setTag('request_id', sentryRequestId)
  })
}

const preloadhtml = document.querySelector('.preloadhtml')
const preloadhtmlStyle = document.querySelector('.preloadhtml-style')
const hideLoader = () => {
  setTimeout(() => {
    preloadhtml?.remove()
    preloadhtmlStyle?.remove()
  }, 100)
}

const ReactApp = ({ hideLoader }: { hideLoader: () => void }) => {
  useEffect(hideLoader, [])

  return (
    <StrictMode>
      <SEO
        title="KyberSwap - Swap and earn tokens at the best rates"
        description="KyberSwap is DeFi‚Äôs first Dynamic Market Maker; a decentralized exchange protocol that provides frictionless crypto liquidity with extremely high flexibility and capital efficiency. KyberSwap is the first major protocol in Kyber‚Äôs liquidity hub."
      />
      <FixedGlobalStyle />
      <Provider store={store}>
        <HashRouter>
          <LanguageProvider>
            <Web3ReactProvider getLibrary={getLibrary}>
              <Web3ProviderNetwork getLibrary={getLibrary}>
                <Updaters />
                <ThemeProvider>
                  <ThemedGlobalStyle />
                  <App />
                </ThemeProvider>
              </Web3ProviderNetwork>
            </Web3ReactProvider>
          </LanguageProvider>
        </HashRouter>
      </Provider>
    </StrictMode>
  )
}

ReactDOM.render(<ReactApp hideLoader={hideLoader} />, document.getElementById('root'))

// if (process.env.REACT_APP_SERVICE_WORKER === 'true') {
//   serviceWorkerRegistration.register()
// } else {
//   serviceWorkerRegistration.unregister()
// }
serviceWorkerRegistration.unregister()
