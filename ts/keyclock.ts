import { lookup } from 'dns';
import Keycloak, { KeycloakConfig, KeycloakProfile } from 'keycloak-js'
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
    await keycloak.init({ onLoad: 'login-required' }).then(
        () => {
            log("Keyclock initialized and ready")
            isready = true
        }
    ).catch(
        error => {
            const errmess: string = lstring("errorinitauthorization", error.error);
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

export function getUserName(): string {
    return keycloak?.profile?.username as string
}
