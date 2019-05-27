var mongoose = require("mongoose");
conn1 = mongoose.createConnection('mongodb://localhost:27017/usersDB', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "username": String,
    "password": String,
    "id": String,
    "orderAmount": Number,
    "itemsQuantity": String,
    "order": Number,
    "role": String
});
module.exports = conn1.model('users', userSchema);
