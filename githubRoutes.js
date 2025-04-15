const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middlewares/auth');

router.post('/import', authMiddleware, githubController.importFromGitHub);

module.exports = router;