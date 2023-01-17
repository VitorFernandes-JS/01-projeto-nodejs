const express = require("express")

const app = express()

app.post("/", (request, response) => {
    const { cpf, name } = request.body;
    return
})

app.listen(3333)