var mongoose = require("mongoose");
conn2 = mongoose.createConnection('mongodb://localhost:27017/restaurantDB', {useNewUrlParser: true});
var Schema = mongoose.Schema;
var orderSchema = new Schema({
    "username": String,
    "dish": String,
    "quantity" : String
});
module.exports = conn2.model('orders', orderSchema);
