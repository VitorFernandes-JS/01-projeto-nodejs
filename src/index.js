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

  request.customer = customer; // fazemos isso para termos acesso ao customer fora da middleware

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, item) => {
    if ((item.type = "credit")) {
      return acc + item.amount;
    }
    return acc - item.amount;
  }, 0);

  return balance;
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

  return response
    .status(201)
    .json({ message: "CPF cadastrado com sucesso!" })
    .send();
});

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  // const balance = getBalance(customer.statement);
  // console.log("Balanço: R$", balance)

  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;
  // const balance = getBalance(customer.statement);
  
  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };
  
  customer.statement.push(statementOperation);
  console.log("Valor do deposito: R$", amount)
  // console.log("Balanço: R$", balance)
  return response
    .status(201)
    .json({ message: "Extrato adicionado com sucesso!" })
    .send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    // console.log("Balanço: R$", balance, "Valor do saque: R$", amount)
    return response.status(400).json({ error: "Saldo insuficiente!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response
    .status(201)
    .json({ message: "Saque realizado com sucesso!" })
    .send();
});

app.listen(3333);
