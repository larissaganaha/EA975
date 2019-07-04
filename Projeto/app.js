// Servidor da aplicacao

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// adicione "ponteiro" para o MongoDB
var users = require('./models/users');
var orders = require('./models/orders');
var dishes = require('./models/dishes');

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

var clientCounterId = 0;
var itemToModify = {};

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
  console.log(content);
  var key = content.key;
  var role = content.role;
  console.log(role);
  if(role == 'admin' || role == 'user') return role
  console.log('Unauthorized logging')
  return 'Unauthorized';
}

function getUserId(req, res) {
  cookies = req.cookies;
  if(! cookies || ! cookies.userAuth) return 'unauthorized';
  cauth = cookies.userAuth;
  var content = JSON.parse(cauth);
  console.log(content);
  var key = content.key;
  var role = content.role;
  var name = content.username;
  console.log(username);
  return name
}

// index.html
router.route('/')
 .get(function(req, res) {  // GET
   var path = 'index.html';
   res.header('Cache-Control', 'no-cache');
   res.sendFile(path, {"root": "./"});
 })

.post(function(req, res) {   // POST (cria)
     var query = {"username": req.body.username, "password": req.body.password};
     var response = {};
     users.findOne(query, function(erro, data) {
        if (data == null) {
           var db = new users();
	         db.username = req.body.username;
           db.password = req.body.password;
           db.id = clientCounterId;
           db.orderAmount = 0.0;
           db.itemsQuantity = 0;
	         db.order = 0;
           db.role = "user";

           db.save(function(erro) {
             if(erro) {
                 response = {"resultado": "falha de acesso ao BD"};
                 res.json(response);
             } else {
                 response = {"resultado": "usuário inserido"};
                 clientCounterId = clientCounterId + 1;
                 res.json(response);
              }
            }
          )
        } else {
	    response = {"resultado": "usuário ja existente"};
            res.json(response);
          }
        }
      )
    }
 );

router.route('/filterByName/:dish')
.get(function(req, res) {
  var response = {};
  console.log(req.params)
  var query = {"name": req.params.dish}
  dishes.find(query, function(erro, data) {
    if(erro){
     console.log("failed")
       response = {"resultado": "falha de acesso ao DB"};
   } else{
       console.log("nao deu erro")
       response = {"dishes": data};
   }
   res.json(response)
  })
})


router.route('/filterByCusine/:dish')
.get(function(req, res) {
  var response = {};
  console.log(req.params)
  var query = {"cusine": req.params.dish}
  dishes.find(query, function(erro, data) {
    if(erro){
     console.log("failed")
       response = {"resultado": "falha de acesso ao DB"};
   } else{
       console.log("nao deu erro")
       response = {"dishes": data};
   }
   res.json(response)
  })
})

 router.route('/userArea')
 .get(function(req, res) {  // GET
      // if(checkAuth(req, res) != 'admin') {
      //   res.status(401).send('Unauthorized');
      //   return;
      // }
      var path = 'userArea.html';
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
      res.sendFile(path, {"root": "./"});
      }
   )


 router.route('/dishes')
 .get(function(req,res) {
   var response = {};
   dishes.find({}, function(erro, data) {
     if(erro){
      console.log("failed")
        response = {"resultado": "falha de acesso ao DB"};
    } else{
        console.log("nao deu erro")
        response = {"dishes": data};
    }
    res.json(response)
   })
 })


router.route('/dishManager')
.get(function(req, res) {  // GET
     if(checkAuth(req, res) != 'admin') {
       res.status(401).send('Unauthorized');
       return;
     }
     console.log("this is a get inside dishManager")
     var path = 'dishmanager.html';
     res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
     res.sendFile(path, {"root": "./"});
     }
  )

.post(function(req, res) {   // POST (cria)
     if(checkAuth(req, res) != 'admin') {
       res.status(401).send('Unauthorized');
       return;
     }
     console.log("this is a post inside dishmanager")
     var query = {"name": req.body.name};
     var response = {};
     dishes.findOne(query, function(erro, data) {
       console.log("checking if data is null")
        if (data == null) {
           console.log("it is")
           var db = new dishes();
           db.name = req.body.name;
           db.price = req.body.price;
           db.calories = req.body.calories;
           db.nutritionInfo = req.body.nutritionInfo;
           db.cusine = req.body.cusine;

           db.save(function(erro) {
             if(erro) {
                 response = {"resultado": "Failed to access DB"};
                 res.json(response);
             } else {
                 response = {"resultado": "Dish added!"};
                 res.json(response);
              }
            }
          )
        } else {
       console.log("it is not")
      response = {"resultado": "This dish was previously added"};
            res.json(response);
          }
        }
      )
    }
  )

  .delete(function(req, res) {
      if(checkAuth(req, res) != 'admin') {
        res.status(401).send('Unauthorized');
        return;
      }
      console.log(JSON.stringify(req.params));
      console.log(JSON.stringify(req.body));
      console.log(JSON.stringify(req.data));
      response = {"resultado": "resposta padrão"};
      res.json(response);
    }
  )
  .put(function(req, res) {
      if(checkAuth(req, res) != 'admin') {
        res.status(401).send('Unauthorized');
        return;
      }

      console.log("inside put dishmanager handler")
      console.log(JSON.stringify(req.body));
      var response = {};
      itemToModify = {"name": req.body.old_name,
                      "price": req.body.old_price,
                      "calories": req.body.old_calories,
                      "nutritionInfo": req.body.old_nutritionInfo,
                      "cusine": req.body.old_cusine};
      res.json("success");
      }
    );

router.route('/dishManager/:dish')
.delete(function(req, res) {
    if(checkAuth(req, res) != 'admin') {
      res.status(401).send('Unauthorized');
      return;
    }
    console.log("Removing " + JSON.stringify(req.params));
    var query = {"name": req.params.dish}
    var response = {}
    dishes.findOneAndDelete(query, function(erro, data) {
      if(erro) response = {"resultado": "falha de acesso ao DB"};
      else if (data == null) response = {"resultado": "prato inexistente"};
      else response = {"resultado": "prato removido"};
      res.json(response)
      }
    )
  }
);

router.route('/editItem')

.get(function(req, res) {  // GET
     if(checkAuth(req, res) != 'admin') {
       res.status(401).send('Unauthorized');
       return;
     }
     var path = 'editItem.html';
     res.header("Access-Control-Allow-Methods", "GET, PUT, POST")
     res.sendFile(path, {"root": "./"});
     console.log(JSON.stringify(itemToModify))

     }
  )

.put(function(req, res) {
    if(checkAuth(req, res) != 'admin') {
      res.status(401).send('Unauthorized');
      return;
    }

    console.log("inside put of editItem");
    console.log(JSON.stringify(req.body));
    var response = {};
    var query = {"name": itemToModify["name"]};

    var price = req.body.price;
    var calories = req.body.calories;
    var nutritionInfo = req.body.nutritionInfo;
    var cusine = req.body.cusine;

    if(price == undefined) {
      price = itemToModify["price"];
    }
    if(calories == undefined) {
    calories = itemToModify["calories"];
    }
    if(nutritionInfo == undefined) {
      nutritionInfo = itemToModify["nutritionInfo"];
    }
    if(cusine == undefined) {
      cusine = itemToModify["cusine"];
    }

    var data = { //TODO: This name should not be null
                "price": price,
                "calories": calories,
                "nutritionInfo": nutritionInfo,
                "cusine": cusine
              };

    console.log(data)

    dishes.findOneAndUpdate(query, data, function(erro, data) {
        if(erro) response = {"resultado": "falha de acesso ao DB"};
        else if (data == null) response = {"resultado": "prato inexistente"};
        else response = {"resultado": "prato atualizado"};
        console.log(response)
        res.json(response);
      }
    )
  }
);

router.route('/orders')
.post(function(req, res) {   // POST (cria)
     // if(checkAuth(req, res) != 'user') {
     //   res.status(401).send('Unauthorized');
     //   return;
     // }
     // var query = {"userID": req.body.id};
     // var response = {};
     // users.findOne(query, function(erro, data) {
     //    if (data == null) {
     //       var db = new users();
	   //       db.username = req.body.username;
     //       db.password = req.body.password;
     //       db.id = req.body.id;
     //       db.orderAmount = req.body.orderAmount;
     //       db.itemsQuantity = req.body.itemsQuantity;
	   //       db.order = req.body.order;
     //       db.role = req.body.role;
     //
     //       db.save(function(erro) {
     //         if(erro) {
     //             response = {"resultado": "falha de acesso ao BD"};
     //             res.json(response);
     //         } else {
     //             response = {"resultado": "usuário inserido"};
     //             res.json(response);
     //          }
     //        }
     //      )
     //    } else {
	   //  response = {"resultado": "usuário ja existente"};
     //        res.json(response);
     //      }
     //    }
     //  )
    }
  );

// USUÁRIOS
router.route('/signup')   // operacoes sobre todos os usuários
.get(function(req, res) {  // GET
     var path = 'signup.html';
     res.header('Cache-Control', 'no-cache');
     res.sendFile(path, {"root": "./"});
     }
  )

.post(function(req, res) {   // POST (cria)
     if(checkAuth(req, res) != 'admin') {
       res.status(401).send('Unauthorized');
       return;
     }
     var query = {"id": req.body.id};
     var response = {};
     users.findOne(query, function(erro, data) {
        if (data == null) {
           var db = new users();
	         db.username = req.body.username;
           db.password = req.body.password;
           db.id = req.body.id;
           db.orderAmount = req.body.orderAmount;
           db.itemsQuantity = req.body.itemsQuantity;
	         db.order = req.body.order;
           db.role = req.body.role;

           db.save(function(erro) {
             if(erro) {
                 response = {"resultado": "falha de acesso ao BD"};
                 res.json(response);
             } else {
                 response = {"resultado": "usuário inserido"};
                 res.json(response);
              }
            }
          )
        } else {
	    response = {"resultado": "usuário ja existente"};
            res.json(response);
          }
        }
      )
    }
  );


router.route('/users/:id')   // operacoes sobre um usuário (id)
  .get(function(req, res) {   // GET
      if(checkAuth(req, res) == 'unauthorized') {
        res.status(401).send('Unauthorized');
        return;
      }
      var response = {};
      var query = {"id": req.params.id};
      users.findOne(query, function(erro, data) {
         if(erro) response = {"resultado": "falha de acesso ao BD"};
         else if (data == null) response = {"resultado": "usuário inexistente"};
	 else response = {"users": [data]};
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

      users.findOneAndUpdate(query, data, function(erro, data) {
          if(erro) response = {"resultado": "falha de acesso ao DB"};
	  else if (data == null) response = {"resultado": "usuário inexistente"};
          else response = {"resultado": "usuário atualizado"};
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
     var query = {"id": req.params.id};
      users.findOneAndRemove(query, function(erro, data) {
         if(erro) response = {"resultado": "falha de acesso ao DB"};
	 else if (data == null) response = {"resultado": "usuário inexistente"};
         else response = {"resultado": "usuário removido"};
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
      console.log(JSON.stringify(req.body));
      var user = req.body.user;
      var pass = req.body.pass;


      // verifica usuario e senha na base de dados
      var query = {"username": user, "password": pass};
      users.findOne(query, function(erro, data) {

        if (data != null) {
            var content =  data;
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

  router.route('/dishInfo')
  .get(function(req, res) {  // GET
     var path = 'dishInfo.html';
     res.header('Cache-Control', 'no-cache');
     res.sendFile(path, {"root": "./"});
     }
  );

  router.route('/dishInfo/:dish')
  .get(function(req, res) {
      var query = {"name": req.params.dish}
      var response = {}
      dishes.findOne(query, function(erro, data) {
        if(erro) response = {"resultado": "falha de acesso ao DB"};
        else if (data == null) response = {"resultado": "prato inexistente"};
        else response = data
        itemToModify = {"name": req.params.dish};
        res.json(response)
        }

      )
    }
  );
