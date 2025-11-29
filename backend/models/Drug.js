const mongoose = require('mongoose');

const DrugSchema = new mongoose.Schema({
    code: String,
    genricName: String,
    brandName: String,
    company: String,
    launchDate: Date
}, {collection: 'drugs'});

module.exports = mongoose.model('Drug', DrugSchema);