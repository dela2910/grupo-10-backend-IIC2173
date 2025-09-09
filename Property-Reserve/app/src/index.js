const Koa = require('koa');
const Logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const router = require('./routes');


const app = new Koa();

app.use(Logger());
app.use(bodyParser());

app.use(router.routes());

app.listen(3000, '0.0.0.0', () => {
  console.log('Server se levantó en puerto 3000');
});


