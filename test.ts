// testing AuthZserver

const authZServerURL = "http://localhost:8050/"
import { getAuthenticatedSession } from "./src/util/CSSAuthentication";

async function main() {
    console.log("[SolidLib]:login - Logging in.")

    const session = await getAuthenticatedSession({
        // webId:"https://pod.woutslabbinck.com/profile/card#me",
        webId: "https://woslabbi.pod.knows.idlab.ugent.be/profile/card#me",
        email: "wout.slabbinck@gmail.com",
        password: "Aco6B&A9#ddDtvg46TC%EWyR7"
    })

    if (session.info.isLoggedIn) {
        console.log(`[SolidLib]:login - Logged in.\n(web-id: ${session.info.webId} | client-id: ${session.info.clientAppId})`)
    } else {
        console.log(`[SolidLib]:login - Failed logging in.`)

    }

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
        console.log(`[SolidLib]:getData - No Authorization token received.`)
        console.log(`[SolidLib]:getData - Signing "pod signed Instantiated Policy".`)
    }
}
main()