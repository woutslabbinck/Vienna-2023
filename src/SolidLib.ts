import { Session } from "@rubensworks/solid-client-authn-isomorphic";
import { Action, AuthZInterfaceResponse, AuthZToken, DataPlusPlus, ErrorMessage, ISolidAwareLib, PreObligationRequest, SolidAuthZRequestMessage, SolidDataRequestMessage } from "./ISolidLib";

export class SolidLib implements ISolidAwareLib {
    //@ts-ignore
    session: Session;
    authZToken: AuthZToken;

    private authZServerURL = "http://localhost:8050/"

    async login(idpURI?: string | undefined): Promise<boolean> {
        throw Error("Not Implemented")
    }
    async getData(query: any, purpose: string[]): Promise<DataPlusPlus> {

        const dataRequestMessage: SolidDataRequestMessage = {
            query: query,
            action: Action.Read,
            authZToken: {}
        }

        const solidDataInterfaceComponent = new SolidDataInterfaceComponentInstantiated()

        // Get Data without AuthZ
        const dataRequestResponse = await solidDataInterfaceComponent.process(dataRequestMessage);

        if (dataRequestResponse !== ErrorMessage.NeedsAuthZToken) {
            return {
                agreements: [],
                data: dataRequestResponse
            }
        }

        // If we are here, it means we need to get an AuthZ token
        const authZRequestMessage: SolidAuthZRequestMessage = {
            authNToken: {
                WebID: this.session.info.webId ?? "",
                Client: this.session.info.clientAppId ?? "",
                Issuer: "" // TODO:
            },
            action: Action.Read,
            query: query
        }


        // get AuthZ Token
        const authZServerURL = this.authZServerURL
        const authZResponse = await this.session.fetch(
            authZServerURL, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                "access-mode": "read",
                "resource": authZRequestMessage.action,
                "purpose": purpose,
                "agreement": null
            })
        })

        const authZtokenResponse: AuthZInterfaceResponse = {
            result: false,
            preObligation: undefined
        }

        if (authZResponse.status === 401) {
            const response = await authZResponse.json()
            authZtokenResponse.preObligation = response
        }



        if (!authZtokenResponse.result) {
            // oopsie woopsie, we need to sign obligation and request again
            const toSign = authZtokenResponse.preObligation!
            // TODO: sign obligations here and store them here internally, we need them later for data plus plus
            const signed = (toSign) => {
                console.log("We are signing it here")

            }
            // TODO now -> do authz request again with signatures

        }

        // now we have the authz token, do data request again


        // merge agreement with dataplus and return
        throw Error("Not Implemented")
    }
    async addPolicy(policy: string): Promise<boolean> {
        throw Error("Not Implemented")
    }

}