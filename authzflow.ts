import { getAuthenticatedSession } from "./src/util/CSSAuthentication";
require('dotenv').config()

const authZServerURL = "http://localhost:8050/"
const webId: string = process.env.WEB_ID!
const username: string = process.env.USER_NAME!
const password: string = process.env.PASSWORD!

async function main() {
    // testing AuthZserver
    console.log("[SolidLib]:login - Logging in.")

    const session = await getAuthenticatedSession({
        webId: webId,
        email: username,
        password: password
    })

    if (session.info.isLoggedIn) {
        console.log(`[SolidLib]:login - Logged in.\n(web-id: ${session.info.webId} | client-id: ${session.info.clientAppId})`)
    } else {
        console.log(`[SolidLib]:login - Failed logging in.`)
        return
    }

    console.log(`[SolidLib]:getData - Requesting Authorization token at ${authZServerURL}.`)

    const res = await session.fetch(authZServerURL, {
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

    if (res.status === 401) {
        const preObligationRequest = await res.json()

        console.log(`[SolidLib]:getData - No Authorization token received; Received status code ${res.status} with following error message: ${preObligationRequest.type}.`)
        console.log(`[SolidLib]:getData - Signing "pod signed Instantiated Policy".`)

        const agreement = {
            owner: preObligationRequest.value.actor,
            ownerSignature: preObligationRequest.value.actorSignature,
            consumer: session.info.clientAppId,
            consumerSignature: {
                issuer: session.info.clientAppId,
                value: "hash"
            },
            policy: preObligationRequest.value.policy
        }

        const agreementResponse = await session.fetch(authZServerURL, {
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
            console.log(`[SolidLib]:getData - Retrieved an AuthZ token to ${agreement.policy["access-mode"]} ${agreement.policy.resource}.`)
        } else {
            console.log('[SolidLib]:getData - Failed to retrieve an AuthZ token.')
        }
    }
}
main()