import Keycloak, { KeycloakConfig } from 'keycloak-js'
import { getkeycloak } from '../services/readconf';
import { isSec } from './j'
import { log } from './l';
import lstring from './localize';

let keycloak: Keycloak | undefined = undefined
let isready: boolean = false

//const keycloak = new Keycloak({
//    url: "http://thinkde:8080",
//    realm: "Perseus",
//    clientId: "React-auth",
//   })

export function getToken(): string | undefined {
    if (!isready) return undefined
    return keycloak?.token
}

export async function initkeyclock() {
    if (!isSec()) return
    const params: any = await getkeycloak()
    const pars: KeycloakConfig = {
        realm: params.realm,
        clientId: params.clientId,
        url: params.url
    }
    keycloak = new Keycloak(pars)
    log("Keycloak init")
    // await necessary
    await keycloak.init({ onLoad: 'login-required', flow: 'implicit' }).then(
        //await keycloak.init({ onLoad: 'login-required' }).then(

        () => {
            log("Keyclock initialized and ready")
            isready = true
        }
    ).catch(
        error => {
            const errmess: string = lstring("errorinitauthorization", error === undefined ? 'unauthorized' : error.error);
            throw new Error(errmess);
        }
    )
    keycloak.onTokenExpired = () => {
        log("Update keycloak token")
        keycloak?.updateToken(600);
    }
    await keycloak.loadUserInfo().then(
        () => log("User data loaded")
    )
    await keycloak.loadUserProfile().then(
        () => log("User profile loaded")
    )
}

export function isAuthenticated(): boolean {

    if (!isSec()) return true;
    return keycloak?.authenticated as boolean
}

export function getUserName(): string | undefined {
    return keycloak?.profile?.username
}

export function getUserFullName(): string | undefined {
    const firstname: string | undefined = keycloak?.profile?.firstName
    const lastname: string | undefined = keycloak?.profile?.lastName
    if (firstname === undefined && lastname === undefined) return undefined
    if (firstname !== undefined && lastname !== undefined) return firstname + " " + lastname
    return (firstname !== undefined) ? firstname : lastname as string
}
