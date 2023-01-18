const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const customers = []; // Array para guardar os usuários

// Middleware, basicamente é algo que fica no meio, entre a requisição e a resposta, e ele geralmente é usado para validar um token e etc, é basicamente uma função que valida a requisição antes de retornar a resposta
// Esse parametro "next", define se a função vai pra frente ou não
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Não há extrato!" });
  }

  return next();
}

app.use(express.json());

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;
  const customerAlreadyExists = customers.some(
    // some retorna true ou false, ou seja aqui queremos saber se tem um cpf no array igual ao que estamos tentando colocar dentro dele
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "CPF já cadastrado!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return (
    console.log(customers),
    response.status(201).json({ error: "CPF cadastrado com sucesso!" }).send()
  );
});

app.get("/statement", (request, response) => {
  verifyIfExistsAccountCPF()
  return response.json(customer.statement);
});

app.listen(3333);
