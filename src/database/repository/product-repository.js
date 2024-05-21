const mongoose = require("mongoose");
const { ProductModel } = require('../models');

//Dealing with data base operations
class ProductRepository {
  async CreateProduct({
    name,
    description,
    category,
    foodType,
    readyTime,
    price,
    rating,
    images,
  }) {
    const product = new ProductModel({
      name,
      description,
      category,
      foodType,
      readyTime,
      price,
      rating,
      images,
    });

    const productResult = await product.save();
    return productResult;
  }

  async Products() {
    return await ProductModel.find();
  }

  async FindById(id) {
    return await ProductModel.findById(id);
  }

  async FindByCategory(category) {
    const products = await ProductModel.find({ category: category });

    return products;
  }

  async FindSelectedProducts(selectedIds) {
    const products = await ProductModel.find()
      .where("_id")
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }
}

module.exports = ProductRepository;
