import express from 'express'
import bodyParser from 'body-parser';
import { PolicyStore } from '../util/Storage';
const app = express()
const port = 8060
app.use(bodyParser.text({ type: 'text/turtle' }));


app.post('/', async (req, res) => {
    // check for AuthZ token
    if (!req.headers.authorization) {
        console.log(`[${new Date().toISOString()}] - Admin: No AuthZ token.`);
        res
            .status(401)
            .contentType("application/json")
            .send({ error: "No AuthZ Token" })
        return
    }

    if (req.headers.authorization !== "Bearer verySecretToken.Allowed-to-add-policy") { // proper verification needs to happen here (pref communication to authz server)
        // incorrect token
        console.log(`[${new Date().toISOString()}] - Admin: Incorrect AuthZ token.`);
        res
            .status(401)
            .contentType("application/json")
            .send({ error: "Incorrect AuthZ Token" })
        return
    }

    console.log(`[${new Date().toISOString()}] - Admin: Incorrect AuthZ token.`);


    const policyStore = new PolicyStore()
    policyStore.write(req.body, new Date().valueOf() + '.ttl')
    console.log(`[${new Date().toISOString()}] - Admin: Writing Policy to Policy Store.`);

    res
        .status(200)
        .contentType("application/json")
        .send({ info: "Policy added" })
})

app.listen(port, () => {
    console.log(`Admin Interface listening on ${port}`)
    console.log(`URI: http://localhost:${port}/`)
})