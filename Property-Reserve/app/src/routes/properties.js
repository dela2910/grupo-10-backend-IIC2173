const Router = require('koa-router');
const router = new Router();
const { Property } = require('../models');
const { Op, fn, col, where, literal } = require('sequelize');


router.get('/:id', async (ctx) => {
  try {
    const property = await Property.findOne({
      where: { id: ctx.params.id },
      raw: true // para tener datos en json y no tipo sequelize
    });
    ctx.body = property;
    ctx.status = 200;
    
  } catch (e) {
    ctx.status = 500;
    ctx.body = { error: e.message };
  }
});


router.get('/', async (ctx) => {
  const { page = 1, limit = 25, currency, price, location, date} = ctx.query;

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.max(parseInt(limit, 10), 1);

  const whereClause = {};

  if (price) whereClause.price = { [Op.lt]: price }; // less than, < price

  if (location) {
    whereClause.location = where(
      fn("unaccent", col("location")), // sacar acentos de location en tabla al hacer query
      {
        [Op.iLike]: `%${location.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}%` // separar acentos de caracteres y luego eliminar con regex
      }
    );
  }

  if (date) {
    const start = date // formato 2025-08-08
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    whereClause.timestamp = {
      [Op.gte]: start, // mayores o igual a ese día
      [Op.lt]: end.toISOString().slice(0, 10) // castear a str, conseguir la fecha del día siguiente, buscar menores a ese día
    };
  }


  if(currency){
    if (currency.toLowerCase() === 'clp') {
    whereClause.currency = '$';
  } else if (currency.toLowerCase() === 'uf') {
    whereClause.currency = 'UF';
  } else{
    whereClause.currency = ''; // con una currency no válida no encuentra nada
  }}


  try {
    const properties = await Property.findAll({
      attributes: ['id', 'name', 'reserved_visits', 'price', 'location', 'timestamp', 'currency'],
      raw: true,
      where: whereClause,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum // recupera desde el número de página y el limite por pag
    });
    ctx.body = properties;
    ctx.status = 200;

  } catch (e) {
    ctx.status = 500;
    ctx.body = { error: e.message };
  }
});


router.post('/', async (ctx) => {
  const propertyData = ctx.request.body;
  console.log('Se recibió esto en el json:', propertyData);

  try {
    const existingProperty = await Property.findOne({
  where: {
    name: propertyData.name,
    price: propertyData.price,
    currency: propertyData.currency,
    bedrooms: propertyData.bedrooms,
    bathrooms: propertyData.bathrooms,
    m2: propertyData.m2,
    location: propertyData.location,
    img: propertyData.img,
    url: propertyData.url,
    is_project: propertyData.is_project // no se agrega timestamp porque nunca concidirían
  }
});

  if (existingProperty){
      existingProperty.reserved_visits += 1;
      await existingProperty.save();
      ctx.body = { message: 'La propiedad ya existe' };
      ctx.status = 200;
  } else{
      const property = await Property.create(propertyData);
      ctx.body = { message: 'Propiedad creada', data: property };
      ctx.status = 200;
      console.log("Se creo")
  }


  } catch (err) {
    console.error('Error creando propiedad:', err);
    ctx.status = 500;
    ctx.body = { message: 'Error al crear propiedad', error: err.message };
    console.log("No se creó propiedad por error:", err)
  }

});

module.exports = router;