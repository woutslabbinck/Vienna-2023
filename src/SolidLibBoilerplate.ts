type Query = any;

type Session = {
    authNToken: AuthNToken;
}

type AuthNToken = {
    WebID: string,
    Client: string,
    Issuer: string
}

type AuthZToken = {

}

type Policy = string

type DataPlusPlus = {
    agreements: Agreement[],
    data: DataPlus,
}

type Agreement = {
    owner: string
    ownerSignature: Signature,
    consumer: string,
    consumerSignature: Signature,
    policy: InstantiatedPolicy;

}

type DataPlus = {
    dataSignature: string,
    dataProvenance: string[],
    data: string
}

type Signature = string;

type InstantiatedPolicy = string;

type SignedInstantiatedPolicy = {
    actor: string,
    actorSignature: string,
    policy: InstantiatedPolicy,
}


type PreObligation = {
    signature: string,
    instantiatedPolicy: InstantiatedPolicy,
}

type PreObligationRequest = {
    type: "signObligation",
    value: SignedInstantiatedPolicy,
}

type Purpose = string;

enum Action {
    Read,
    Write
}

enum ErrorMessage {
    NeedsAuthZToken
}

interface ISolidAwareLib {
    session: Session;
    authZToken: AuthZToken; // This needs to go somewhere inside the getData and addPolicy functions;

    login: (idpURI?: string) => Promise<boolean>; // Token is stored in the session object

    getData: (query: Query, purpose: Purpose[]) => Promise<DataPlusPlus> // get AuthNToken from session

    addPolicy: (policy: Policy) => Promise<boolean> // get AuthNToken from session
}

interface SolidDataInterfaceComponent {
    process: (message: SolidDataRequestMessage) => Promise<DataPlus | ErrorMessage.NeedsAuthZToken>
}

interface AuthZInterfaceComponent {
    process: (message: SolidAuthZRequestMessage) => Promise<AuthZInterfaceResponse>
}

interface AdminInterfaceComponent {
    process: (message: PolicyRequestMessage) => Promise<boolean>

}

type SolidDataRequestMessage = {
    query: Query,
    action: Action.Read,  // our use-case, we just read it, so action = Action.Read
    authZToken: AuthZToken,
}

type SolidAuthZRequestMessage = {
    authNToken: AuthNToken, // Subject
    action: Action,         // Action
    query: Query,           // Resource
    purpose?: Purpose[],       // Purpose: 
    agreement?: Agreement, // Agreement: Solidlib signes the obligation request of AuthZInterface
}

type AuthZInterfaceResponse = {
    result: boolean,                        // Yes or No
    authZToken?: AuthZToken,                // Yes and, ALWAYS THERE WHEN YES
    preObligation?: PreObligationRequest    // No but, MAY BE HERE WHEN NO
}

type PolicyRequestMessage = {
    policy: Policy
    action: Action.Write                          // our use-case, we just add it, so action = Action.Write
    authZToken: AuthZToken
}




// instantiation of SolidLib

class SolidLib implements ISolidAwareLib {
    session: Session;
    authZToken: AuthZToken;
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
        const authZInterfaceComponent = new AuthZInterfaceComponentInstantiated()

        const authZRequestMessage: SolidAuthZRequestMessage = {
            authNToken: this.session.authNToken,
            action: Action.Read,
            query: query
        }
        // get AuthZ Token
        const authZtokenResponse = await authZInterfaceComponent.process(authZRequestMessage)

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

// instantiation of SolidDataInterfaceComponent that does communication to actual Solid Data Interface
class SolidDataInterfaceComponentInstantiated implements SolidDataInterfaceComponent {
    // Endpoint in constructor

    async process(message: SolidDataRequestMessage): Promise<DataPlus | ErrorMessage> {
        // Do actual call

        // if not Data ->
        return ErrorMessage.NeedsAuthZToken

        // if data -> return it
    }
}

// instantiation of AuthZInterfaceComponent that does communication to actual Solid AuthZ Interface
class AuthZInterfaceComponentInstantiated implements AuthZInterfaceComponent {
    // Endpoint in constructor

    async process(message: SolidAuthZRequestMessage): Promise<AuthZInterfaceResponse> {
        // Do actual call


        // understand response TODO:
        const authZInterfaceResponse: AuthZInterfaceResponse = {
            result: false
        }

        return authZInterfaceResponse
    }
}