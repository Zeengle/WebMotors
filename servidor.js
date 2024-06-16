var colors = require("colors");
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
const { type } = require("os");

var app = express();
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.set("views", "./views");

var server = http.createServer(app);
server.listen(80);

console.log("servidor esta online...".rainbow)

const MongoClient = mongodb.MongoClient;
const uri = //insert here your MongoDB URI;
const client = new MongoClient(uri, { useNewUrlParser: true });



app.get('/', function(request, response) {
    client.db("BC1").collection("Carros").find({}).toArray(function(err, items) {
        console.log(items);
        response.render('index.ejs', {info: items});
    });
});

app.post('/homes', function(request, response) {
    client.db("BC1").collection("Carros").find({}).toArray(function(err, items) {
        console.log(items);
        response.render('remove.ejs', {info: items});
  });
});


app.post('/cadastra', function(request, response) {
    response.redirect('Cadastro.html');
});

app.post("/cadastrar_usuario", function(req, resp) {
  acesso = false
  client.db("BC1").collection("usuarios").findOne(
    { db_senha: req.body.Senha, db_login: req.body.Login },
    function (err, usu) {
      if (err) {
        resp.render('resposta_usuario', {resposta: "Erro ao cadastrar funcionário.", acesso: acesso})
      } else if (usu) {
        resp.render('resposta_usuario', {resposta: "Funcionário já cadastrado.", acesso: acesso})
      } else {
        client.db("BC1").collection("usuarios").insertOne(
          { db_nome: req.body.Nome, db_login: req.body.Login, db_senha: req.body.Senha }, function (err) {
            if (err) {
              resp.render('resposta_usuario', {resposta: "Erro ao cadastrar funcionário.", acesso: true})
            } else {
              resp.render('resposta_usuario', {resposta: "Funcionário cadastrado com sucesso.", acesso: true})
            };
          });
      };
    }
  );
});

app.post('/logar', function(request, response) {
    response.redirect('Login.html');
});

app.post("/logar_usuario", function(requisicao, resposta) {
    let acesso = false
    client.db("BC1").collection("usuarios").findOne(
      {
        db_login: requisicao.body.Login, 
        db_senha: requisicao.body.Senha 
    },function(err, user) {
        if (err) {
            resposta.render('resposta_usuario', {resposta: "Usuário/senha não encontrado!", acesso: false})
          }else if (!user) {
            resposta.render('resposta_usuario', {resposta: "Erro ao logar usuário!", acesso: false})
          }else {
            acesso = true;
            resposta.render('resplog.ejs', {resposta: "Seja bem vindo novamente!", acesso: acesso});  
          };
      });
 
 });


app.post('/criar_carro', function(request, response){
  acesso =false
  let Qtd = Number(request.body.Qtd)
    client.db("BC1").collection("Carros").findOne(
        { db_marca: request.body.Marca, 
            db_modelo: request.body.Modelo, 
            db_ano: request.body.Ano
        }, 
        function (err, carro) {
          if (err){
            response.render('resposta_usuario', {resposta: "Erro ao carro.", acesso: acesso})
          } else if(carro){
            client.db("BC1").collection("Carros").updateOne(
              {db_marca: request.body.Marca, db_modelo: request.body.Modelo, db_ano: request.body.Ano},
               {$inc:{db_qtd: Qtd}}
             )
             response.render('resposta_usuario', {resposta: "Por conta de ja existir um carro cadastrado, adicionamos as quantidades!", acesso:false})
          } else{
            client.db("BC1").collection("Carros").insertOne(
              {db_marca: request.body.Marca, db_modelo: request.body.Modelo, db_ano: request.body.Ano, db_qtd: Number(request.body.Qtd)}, function (err) {
                if (err){
                  response.render('resposta_usuario', {resposta: "Erro ao cadastrar carro", acesso: false})
                } else{
                  console.log(type(request.body.Qtd))
                  response.render('resposta_usuario', {resposta: "Carro cadastrado.", acesso:false}) ;
                }
              }
            )
          }
        }
    );
}); 

app.post("/remover_carro", function(req, resp) {
    let Qtd = parseInt(req.body.Qtd);
    client.db("BC1").collection("Carros").deleteOne(
      { db_marca: req.body.Marca, db_modelo: req.body.Modelo, db_ano: req.body.Ano, db_qtd: Qtd } , function (err, result) {
        console.log(result);
        if (result.deletedCount == 0) {
          resp.render('resposta_usuario', {resposta: "Carro não encontrado!",acesso:false})
        }else if (err) {
          resp.render('resposta_usuario', {resposta: "Erro ao remover Carro!",acesso:false})
        }else {
          resp.render('resposta_usuario', {resposta: "Carro removido do catálogo.",acesso:false})
        };
      });
});


app.post('/vender', function(request, response) {
  client.db("BC1").collection("Carros").find({}).toArray(function(err, items) {
    console.log(items);
    response.render('Venda.ejs', {info: items});
});
});

app.post("/vender_carro", function(req, resp) {
  client.db("BC1").collection("Carros").findOne(
    { db_marca: req.body.Marca, db_modelo: req.body.Modelo, db_ano: req.body.Ano }, 
    function (err, doc) {
      console.log(doc);
      if (doc == null) {
        resp.render('resposta_usuario', {resposta: "Carro não encontrado.", acesso: false})
      }else {
        const Qtd = parseInt(doc.db_qtd);
        if (Qtd <= 1){
          client.db("BC1").collection("Carros").deleteOne(
            { db_marca: req.body.Marca, db_modelo: req.body.Modelo, db_ano: req.body.Ano}, function (err, result){
              console.log(result);
              if (result.deletedCount == 0) {
                resp.render('resposta_usuario', {resposta: "Carro não encontrado.",acesso:false})
              }else if (err) {
                resp.render('resposta_usuario', {resposta: "Erro ao remover carro.",acesso:false})
              }else {
                resp.render('resposta_usuario', {resposta: "Comprado, Parabéns pois esta foi a última unidade",acesso:false})        
              };

            }) }
        else{
          client.db("BC1").collection("Carros").updateOne(
            { db_marca: req.body.Marca, db_modelo: req.body.Modelo, db_ano: req.body.Ano }, 
            { $inc: {db_qtd: -1} }, function (err, result) {
              console.log(result);
              if (result.modifiedCount == 0) {
                resp.render('resposta_usuario', {resposta: "Carro não encontrado.", acesso: false})
              }else if (err) {
                resp.render('resposta_usuario', {resposta: "Erro ao comprar carro.", acesso: false})
              }else {
                resp.render('resposta_usuario', {resposta: "Carro comprado, parabéns pela nova aquisição!Caso não esteja carregando, quando chegar na página de catálogo, clique em atualizar.", acesso: false})
              };
            });
        }
      };
      
});
});

app.post("/atualizar_carro", function(req, resp) {
  let Qtd = parseInt(req.body.Qtd);
  let nQtd = parseInt(req.body.nQtd);
  client.db("BC1").collection("Carros").updateOne(
    { db_marca: req.body.Marca, db_modelo: req.body.Modelo, db_ano: req.body.Ano, db_qtd: Qtd }, 
    { $set: {db_marca: req.body.nMarca, db_modelo: req.body.nModelo, db_ano: req.body.nAno, db_qtd: nQtd} }, function (err, result) {
      console.log(result);
      if (result.modifiedCount == 0) {
        resp.render('resposta_usuario', {resposta: "Carro não encontrado.",acesso:false})
      }else if (err) {
        resp.render('resposta_usuario', {resposta: "Erro ao atualizar carro.",acesso:false})
      }else {
        resp.render('resposta_usuario', {resposta: "Carro atualizado com sucesso.",acesso:false})        
      };
  });
});

app.post('/novo', function(request, response) {
  client.db("BC1").collection("Carros").find({}).toArray(function(err, items) {
    console.log(items);
    response.render('novo.ejs', {info: items});
});
});

app.post('/remover', function(request, response) {
  client.db("BC1").collection("Carros").find({}).toArray(function(err, items) {
    console.log(items);
    response.render('remove.ejs', {info: items});
});
});


app.post('/atualizar', function(request, response) {
  client.db("BC1").collection("Carros").find({}).toArray(function(err, items) {
    console.log(items);
    response.render('atualizar.ejs', {info: items});
  });
});
