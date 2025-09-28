const express = require('express');  
const aiController = require('../controllers/ai.controller'); 

const router = express.Router(); 

// Maps the POST request for a code review to the controller function
router.post("/get-review", aiController.getReview);

module.exports = router;
