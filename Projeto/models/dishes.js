var mongoose = require("mongoose");
conn3 = mongoose.createConnection('mongodb://localhost:27017/menuDB', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var menuSchema = new Schema({
    "ra": String,
    "nome": String,
    "curso": String,
    "cp": Number,
    "cr": Number
});
module.exports = conn3.model('menu', menuSchema);
