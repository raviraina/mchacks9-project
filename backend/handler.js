const express = require('express');
const router = express.Router();
const Schemas = require('../models/Schemas.js');

router.get('/test', async (req, res) => {
    const users = Schemas.Users;
    const name = req.body.user.name;


});