import express from 'express'
const app = express()
const port = 8050

app.use(express.json())

app.post('/', async (req, res) => {
  // validate AuthN token
  // note: stubbed
  if (!req.headers.authorization) {
    res
      .status(401)
      .contentType("application/json")
      .send({ error: "No Auth Token" })
    return
  }

  const authNHeader = req.headers.authorization
  const authNToken = authNHeader.split(" ")[1]
  const clientSession = parseJwt(authNToken)

  console.log("[Authz]: AuthN token: OK");

  const client_id = clientSession.client_id.split("_")[0] // don't want random uuid
  const actor = clientSession.webid

  // parse body
  if (!req.headers['content-type']) {
    res
      .status(400)
      .contentType("application/json")
      .send({ error: "No content type" })
    return
  }
  const authZRequestMessage = req.body

  if (authZRequestMessage.agreement === null) {
    console.log(`[Authz]: "${client_id}" Requesting ${authZRequestMessage['access-mode']} for ${authZRequestMessage.resource} with purpose`,authZRequestMessage.purpose)

    // Policy matching here | stubbed
    const authZResponseMessage = {
      type: "signObligation",
      value: {
        actor: actor,
        actorSignature: {
          issuer: "Pod",
          value: "hash"
        },
        "policy": {
          "access-mode": "read",
          "resource": "date_of_birth",
          "purpose": "verification",
          "actor": client_id
        }
      }
    }

    console.log(`[Authz]: "${client_id}" needs to sign this "pod signed Instantiated Policy".`)

    res
      .status(401)
      .contentType("application/json")
      .send(authZResponseMessage)
    return
  }

  // verify agreement
  console.log(`[Authz]: "${client_id}" Requesting ${authZRequestMessage['access-mode']} for ${authZRequestMessage.resource} with agreement.`)
  console.log(`[Authz]: Verifying agreement.`)
  console.log(`[Authz]: Agreement verified: Storing it to [Log Store].`)


  console.log(`[Authz]: Returning AuthZ token.`)
  // sent authZtoken
 
  res
    .status(200)
    .contentType("application/json")
    .send({
      access_token: "verySecretToken.Allowed-to-read-dob.",
      type: 'Bearer' // maybe Dpop, I don't fucking know
    })
})

app.listen(port, () => {
  console.log(`Authorization Interface listening on ${port}`)
  console.log(`URI: http://localhost:${port}/`)
})

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}