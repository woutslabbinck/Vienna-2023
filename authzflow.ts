import { Session } from "@rubensworks/solid-client-authn-isomorphic";
import { Action, AuthZInterfaceResponse, AuthZToken, DataPlusPlus, ErrorMessage, ISolidAwareLib, PreObligationRequest, SolidAuthZRequestMessage, SolidDataRequestMessage } from "./src/ISolidLib";
import { getAuthenticatedSession } from "./src/util/CSSAuthentication";
require('dotenv').config()

const authZServerURL = "http://localhost:8050/"
const webId: string = process.env.WEB_ID!
const username: string = process.env.USER_NAME!
const password: string = process.env.PASSWORD!

class SolidLib {
    private session: Session | undefined;

    constructor() {

    }

    public async login(IDP?: string): Promise<void> {
        console.log("[SolidLib]:login - Logging in.")

        const webId: string = process.env.WEB_ID!
        const username: string = process.env.USER_NAME!
        const password: string = process.env.PASSWORD!
        const session = await getAuthenticatedSession({
            webId: webId,
            email: username,
            password: password
        })

        if (session.info.isLoggedIn) {
            console.log(`[SolidLib]:login - Logged in.\n(web-id: ${session.info.webId} | client-id: ${session.info.clientAppId})`)
        } else {
            console.log(`[SolidLib]:login - Failed logging in.`)
        }
        this.session = session
    }

    public async getData(query: any, purpose: string[]): Promise<DataPlusPlus> {
        // stubbed: Don't have access
        console.log(`SolidLib]:getData - No access, need AuthZ token.`)
        const authZRequestMessage: SolidAuthZRequestMessage = {
            authNToken: {
                WebID: this.session?.info.webId ?? "",
                Client: this.session?.info.clientAppId ?? "",
                Issuer: "" // TODO:
            },
            action: Action.Read,
            query: query
        }

        const authZToken = await this.getAuthZToken(authZRequestMessage)

        console.log(`SolidLib]:getData - Now that token is there, fetch data`, authZToken)

        throw Error("not implemented yet")
    }

    private async getAuthZToken(authZRequestMessage: SolidAuthZRequestMessage): Promise<AuthZToken> {

        if (!this.session) {
            throw Error("No session")
        }

        console.log(`[SolidLib]:getAuthZToken - Requesting Authorization token at ${authZServerURL}.`)
        const res = await this.session.fetch(authZServerURL, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                "access-mode": "read",
                "resource": "date_of_birth",
                "purpose": [
                    "verification",
                    "advertisement"
                ],
                "agreement": null
            })
        })

        let token = {}

        if (res.status === 401) {
            const preObligationRequest = await res.json()
            console.log(`[SolidLib]:getAuthZToken - No Authorization token received; Received status code ${res.status} with following error message: ${preObligationRequest.type}.`)
            console.log(`[SolidLib]:getAuthZToken - Signing "pod signed Instantiated Policy".`)

            const agreement = {
                owner: preObligationRequest.value.actor,
                ownerSignature: preObligationRequest.value.actorSignature,
                consumer: this.session.info.clientAppId,
                consumerSignature: {
                    issuer: this.session.info.clientAppId,
                    value: "hash"
                },
                policy: preObligationRequest.value.policy
            }

            const agreementResponse = await this.session.fetch(authZServerURL, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "access-mode": "read",
                    "resource": "date_of_birth",
                    "purpose": [],
                    "agreement": agreement
                })
            })

            if (agreementResponse.status === 200) {
                console.log(`[SolidLib]:getAuthZToken - Retrieved an AuthZ token to ${agreement.policy["access-mode"]} ${agreement.policy.resource}.`)
                token = agreementResponse.json()
            } else {
                console.log('[SolidLib]:getAuthZToken - Failed to retrieve an AuthZ token.')
            }
        } else {
            console.log(`[SolidLib]:getAuthZToken - Retrieved an AuthZ token (no agreements).`)
            token = res.json()
        }
        return token
    }
}

async function app() {
    const solidLib = new SolidLib();
    await solidLib.login()
    await solidLib.getData("date_of_birth", [
        "verification",
        "advertisement"
    ])
}
app()
