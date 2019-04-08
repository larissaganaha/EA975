var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// comente as duas linhas abaixo
// var index = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// serve static files
// app.use('/', express.static(__dirname + '/'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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


// alguns navegadores enviam uma requisicao OPTIONS antes de POST e PUT
router.route('/*') 
 .options(function(req, res) {  // OPTIONS
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Request-With');
   res.sendStatus(200);
   }
 );

// index.html
router.route('/')
 .get(function(req, res) {  // GET
   var path = 'index.html';
   res.header('Cache-Control', 'no-cache');
   res.sendFile(path, {"root": "./"});
   }
 );

// base de alunos (Hash Map)
var alunosMap = new Map();

router.route('/alunos')   // operacoes sobre todos os alunos
  .get(function(req, res) {  // GET
      var response = {"alunos": []};
      if (alunosMap.size == 0) {
       res.json(response);
       return;
      }
      for (var [key, value] of alunosMap) {
        response.alunos.push(value);
      }
      res.json(response);
      }
   )
  .post(function(req, res) {   // POST (cria)
      var aluno = req.body;
      var response = {};
      if(alunosMap.get(aluno.ra) == undefined) {
        alunosMap.set(aluno.ra, aluno);   // armazena JSON
        response = {"resultado": "aluno inserido"};
      } else response = {"resultado": "aluno ja existente"};
      res.json(response);
    }
 );

router.route('/alunos/:id')   // operacoes sobre um aluno (ID)
  .get(function(req, res) {   // GET
      var response = {};
      if(alunosMap.get(req.params.id) != undefined) 
         response = alunosMap.get(req.params.id);
      else response = {"resultado": "aluno inexistente"};
      res.json(response);   
      }
  )
  .put(function(req, res) {   // PUT (altera)
      var response = {};
      if(alunosMap.get(req.params.id) != undefined) {
         alunosMap.set(req.params.id, req.body);
         response = {"resultado": "aluno atualizado"};
      } else response = {"resultado": "aluno inexistente"};
      res.json(response);   
    }
  )
  .delete(function(req, res) {   // DELETE (remove)
      var response = {};
      if(alunosMap.get(req.params.id) != undefined) {
         alunosMap.delete(req.params.id);
         response = {"resultado": "aluno removido"};
      } else response = {"resultado": "aluno inexistente"};
      res.json(response);
    }
  );


