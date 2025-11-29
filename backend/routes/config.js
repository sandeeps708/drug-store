const express = require('express');
const router = express.Router();


const tableConfig = {
    columns: [
        {key: 'id', label: 'ID', type: 'autoIndex'},
        {key: 'code', label: 'code'},
        {key: 'name', label: 'Name'},
        {key: 'company', lable:'Company'},
        {key: 'launchDate', lable:'Launch Date'}
    ]
};

router.get('/', (req, res) => res.json(tableConfig));
module.exports = router;