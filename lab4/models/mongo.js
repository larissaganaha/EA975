var mongoose = require("mongoose");
conn1 = mongoose.createConnection('mongodb://localhost:27017/alunosDB', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "ra": String,
    "nome": String,
    "curso": String,
    "cp": Number,
    "cr": Number
});
module.exports = conn1.model('users', userSchema);
