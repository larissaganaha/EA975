// Servidor da aplicacao

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// adicione "ponteiro" para o MongoDB
var mongoOp = require('./models/mongo');
var mongoOp2 = require('./models/mongo2');

// comente as duas linhas abaixo
// var index = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// serve static files
app.use('/', express.static(__dirname + '/'));

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// adicione as duas linhas abaixo
var router = express.Router();
app.use('/', router);   // deve vir depois de app.use(bodyParser...

// comente as duas linhas abaixo
// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// codigo abaixo adicionado para o processamento das requisições
// HTTP GET, POST, PUT, DELETE

function checkAuth(req, res) {
  cookies = req.cookies;
  if(! cookies || ! cookies.userAuth) return 'unauthorized';
  cauth = cookies.userAuth;
  var content = JSON.parse(cauth);
  var key = content.key;
  var role = content.role;
  if(key == 'secret') return role
  return 'unauthorized';
}

// index.html
router.route('/') 
 .get(function(req, res) {  // GET
   var path = 'index.html';
   res.header('Cache-Control', 'no-cache');
   res.sendFile(path, {"root": "./"});
   }
 );

router.route('/alunos')   // operacoes sobre todos os alunos
 .get(function(req, res) {  // GET
     if(checkAuth(req, res) == 'unauthorized') {
       res.status(401).send('Unauthorized');
       return;
     }
     var response = {};
     mongoOp.find({}, function(erro, data) {
       if(erro)
          response = {"resultado": "falha de acesso ao BD"};
       else
          response = {"alunos": data};
        res.json(response);
        }
      )
    }
  )
  .post(function(req, res) {   // POST (cria)
     if(checkAuth(req, res) != 'admin') {
       res.status(401).send('Unauthorized');
       return;
     }
     var query = {"ra": req.body.ra};
     var response = {};
     mongoOp.findOne(query, function(erro, data) {
        if (data == null) {
           var db = new mongoOp();
           db.ra = req.body.ra;
           db.nome = req.body.nome;
           db.curso = req.body.curso;
           db.save(function(erro) {
             if(erro) {
                 response = {"resultado": "falha de acesso ao BD"};
                 res.json(response);
             } else {
                 response = {"resultado": "aluno inserido"};
                 res.json(response);
              }
            }
          )
        } else {
	    response = {"resultado": "aluno ja existente"};
            res.json(response);
          }
        }
      )
    }
  );


router.route('/alunos/:ra')   // operacoes sobre um aluno (RA)
  .get(function(req, res) {   // GET
      if(checkAuth(req, res) == 'unauthorized') {
        res.status(401).send('Unauthorized');
        return;
      }
      var response = {};
      var query = {"ra": req.params.ra};
      mongoOp.findOne(query, function(erro, data) {
         if(erro) response = {"resultado": "falha de acesso ao BD"};
         else if (data == null) response = {"resultado": "aluno inexistente"};
	 else response = {"alunos": [data]};
         res.json(response);
        }
      )
    }
  )
  .put(function(req, res) {   // PUT (altera)
       if(checkAuth(req, res) != 'admin') {
         res.status(401).send('Unauthorized');
         return;
      }
      var response = {};
      var query = {"ra": req.params.ra};
      var data = {"nome": req.body.nome, "curso": req.body.curso};
      mongoOp.findOneAndUpdate(query, data, function(erro, data) {
          if(erro) response = {"resultado": "falha de acesso ao DB"};
	  else if (data == null) response = {"resultado": "aluno inexistente"};
          else response = {"resultado": "aluno atualizado"};
          res.json(response);
        }
      )
    }
  )
  .delete(function(req, res) {   // DELETE (remove)
     if(checkAuth(req, res) != 'admin') {
        res.status(401).send('Unauthorized');
        return;
     }
     var response = {};
     var query = {"ra": req.params.ra};
      mongoOp.findOneAndRemove(query, function(erro, data) {
         if(erro) response = {"resultado": "falha de acesso ao DB"};
	 else if (data == null) response = {"resultado": "aluno inexistente"};
         else response = {"resultado": "aluno removido"};
         res.json(response)
         }
       )
     }
  );


router.route('/authentication')   // autenticação
  .get(function(req, res) {  // GET
     var path = 'login.html';
     res.header('Cache-Control', 'no-cache');
     res.sendFile(path, {"root": "./"});
     }
  )
  .post(function(req, res) { 
      var user = req.body.user;
      var pass = req.body.key;


      // verifica usuario e senha na base de dados
      var query = {"user": user};
      mongoOp2.findOne(query, function(erro, data) {

        if (data != null) {
            var content =  {"key":"secret", "role":"user"};
	    res.cookie('userAuth', JSON.stringify(content), {'maxAge': 3600000*24*5});
	    res.status(200).send('Sucesso');  // OK
        } else {
	    response = {"resultado": "Usuário e/ou senha inexistentes."};
	    res.status(401).send('Unauthorized');
        }
      }
     )
    }
  )
  .delete(function(req, res) {
      if(checkAuth(req, res) != 'unauthorized') {
        res.clearCookie('userAuth');	 // remove cookie no cliente
        res.status(200).send('Sucesso');
      } else {
         res.status(401).send('Unauthorized');
         return;
      } 
    }
  );

