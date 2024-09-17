import readResource from './readresource'
import defaults from './defaults'
import { addRouterElem, setMenuRoute } from './leftmenu'
import PrintDisplay from '../components/PrintDisplay'
import { setHost } from '../services/api'
import { isSecEnabled } from '../services/readconf'
import { setSec } from './j'
import { initkeyclock } from './keyclock'
import { TReadResource } from './typing'
import { readHeaderMenu } from './headermenu'
import { getRouterRoot, getServerUrl, setUrlDomain } from './url'


let customReadResource: TReadResource | undefined

export function setCustomReadResource(f: TReadResource) {
    customReadResource = f
}

async function init() {
    const serverURL: string = await getServerUrl()
    console.log(`Server URL ${serverURL}`)
    setHost(serverURL)

    const sec: boolean = await isSecEnabled()
    setSec(sec)
    await initkeyclock()

    await readResource();
    addRouterElem(defaults.displayprintrouterid, () => <PrintDisplay />)

    await readHeaderMenu()

    if (customReadResource !== undefined) await customReadResource()
    setMenuRoute({ rootredirect: getRouterRoot() + 'welcome' })
}

export default init