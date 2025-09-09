const Router = require('koa-router');

const properties = require('./properties');

const router = new Router();

router.use('/properties', properties.routes());

module.exports = router;