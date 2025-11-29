const mongoose = require('mongoose');
const Drug = require('../models/Drug');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/drugstore';
const filePAth = '/Users/sandeepsingh/Documents/projects/drugstore/drugData.json';
console.log('MONGO_URI', MONGO_URI)
async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('connected to mongo db for seeding');

    const raw = fs.readFileSync(filePAth, 'utf-8');
    const arr = JSON.parse(raw);
    console.log('arr>>>>', arr)
    const docs = arr.map(item => ({
        cosd: item.code,
        genricName: item.genricName,
        brandName: item.brandName,
        company: item.company,
        lanchDate: item.lanchDate? new Date(item.lanchDate) : null
    }));
    await Drug.deleteMany({});
    await Drug.insertMany(docs);
    console.log(`Inserted ${docs.length} drugs`);
    mongoose.disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1)
})