const ProductService = require("../services/product-service");
const { RPCObserver } = require("../utils");
const multer = require('multer');

module.exports = (app, channel) => {

  const service = new ProductService();

  RPCObserver("PRODUCT_RPC", service);

  const imageStorage = multer.diskStorage({
    destination: function(req, file, cb){
        console.log('Destination function called with file:', file); // NEW
        cb(null, 'images')
    },
    filename: function(req, file, cb){
        console.log('Filename function called with file:', file); // NEW
        const date = new Date().toISOString().replace(/:/g, '-');
        cb(null, date + '_' + file.originalname);
    }
    
})

const images = multer({ storage: imageStorage }).array('images', 10);

  app.post("/product/create", images, async (req, res, next) => {
    const { name, description, category, foodType, readyTime, price, rating } =
      req.body;
    const images = req.files.map(file => file.path);
    // validation
    const { data } = await service.CreateProduct({
      name,
      description,
      category,
      foodType,
      readyTime,
      price,
      rating,
      images,
    });
    return res.json(data);
  });

  app.get("/category/:category", async (req, res, next) => {
    const category = req.params.category;

    try {
      const { data } = await service.GetProductsByCategory(category);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.post("/ids", async (req, res, next) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });
  app.get("/whoami", (req, res, next) => {
    return res
      .status(200)
      .json({ msg: "/ or /products : I am products Service" });
  });

  //get Top products and category
  app.get("/", async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};
