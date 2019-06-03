var mongoose = require("mongoose");
conn1 = mongoose.createConnection('mongodb://localhost:27017/restaurantDB', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "username": String,
    "password": String,
    "id": String,
    "orderAmount": Number,
    "itemsQuantity": Number,
    "order": Number,
    "role": String
});
module.exports = conn1.model('clients', userSchema);

