const ProductService = require('../services/product-service'); // Update the path accordingly
const { ProductRepository } = require('../database'); // Update the path accordingly
const { FormateData } = require('../utils'); // Update the path accordingly

jest.mock('../database', () => ({
  ProductRepository: jest.fn().mockImplementation(() => ({
    CreateProduct: jest.fn(),
    Products: jest.fn(),
    FindById: jest.fn(),
    FindByCategory: jest.fn(),
    FindSelectedProducts: jest.fn(),
  }))
}));

jest.mock('../utils', () => ({
  FormateData: jest.fn()
}));

describe('ProductService', () => {
  let service;

  const mockProduct = {
    _id: '1',
    name: 'Product Name',
    category: 'Category1',
    price: 100
  };

  beforeEach(() => {
    service = new ProductService();
    service.repository.CreateProduct.mockClear();
    service.repository.Products.mockClear();
    service.repository.FindById.mockClear();
    service.repository.FindByCategory.mockClear();
    service.repository.FindSelectedProducts.mockClear();
    FormateData.mockClear();
  });

  ////////////////////////// Create Product //////////////////////////////

  describe('CreateProduct', () => {
    it('should create product successfully', async () => {
      service.repository.CreateProduct.mockResolvedValue(mockProduct);
      FormateData.mockReturnValue(mockProduct);

      const result = await service.CreateProduct(mockProduct);

      expect(service.repository.CreateProduct).toHaveBeenCalledWith(mockProduct);
      expect(FormateData).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw an error if CreateProduct fails', async () => {
      service.repository.CreateProduct.mockRejectedValue(new Error('Failed to create product'));

      await expect(service.CreateProduct(mockProduct))
        .rejects.toThrow('Failed to create product');
    });

    it('should return formatted error if product data is invalid', async () => {
      const invalidProduct = { name: '', category: 'Category1', price: 100 }; // Missing required fields
      const errorResponse = { error: 'Invalid product data' };

      service.repository.CreateProduct.mockResolvedValue(null);
      FormateData.mockReturnValue(errorResponse);

      const result = await service.CreateProduct(invalidProduct);

      expect(service.repository.CreateProduct).toHaveBeenCalledWith(invalidProduct);
      expect(FormateData).toHaveBeenCalledWith(null); // Ensure FormateData is called with null
      expect(result).toEqual(errorResponse);
    });
  });

  ////////////////////////// Get Products //////////////////////////////

  describe('GetProducts', () => {
    it('should get products successfully', async () => {
      const mockProducts = [
        { _id: '1', category: 'Category1' },
        { _id: '2', category: 'Category2' }
      ];
      const formattedData = {
        products: mockProducts,
        categories: ['Category1', 'Category2']
      };

      service.repository.Products.mockResolvedValue(mockProducts);
      FormateData.mockReturnValue(formattedData);

      const result = await service.GetProducts();

      expect(service.repository.Products).toHaveBeenCalled();
      expect(FormateData).toHaveBeenCalledWith({
        products: mockProducts,
        categories: ['Category1', 'Category2']
      });
      expect(result).toEqual(formattedData);
    });

    it('should throw an error if Products fails', async () => {
      service.repository.Products.mockRejectedValue(new Error('Failed to get products'));

      await expect(service.GetProducts())
        .rejects.toThrow('Failed to get products');
    });

    it('should return an empty array if no products are found', async () => {
      const emptyProducts = [];
      const formattedData = {
        products: emptyProducts,
        categories: []
      };

      service.repository.Products.mockResolvedValue(emptyProducts);
      FormateData.mockReturnValue(formattedData);

      const result = await service.GetProducts();

      expect(service.repository.Products).toHaveBeenCalled();
      expect(FormateData).toHaveBeenCalledWith(formattedData);
      expect(result).toEqual(formattedData);
    });
  });

  ////////////////////////// Get Product Description //////////////////////////////

  describe('GetProductDescription', () => {
    it('should get product description successfully', async () => {
      service.repository.FindById.mockResolvedValue(mockProduct);
      FormateData.mockReturnValue(mockProduct);

      const result = await service.GetProductDescription('1');

      expect(service.repository.FindById).toHaveBeenCalledWith('1');
      expect(FormateData).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw an error if FindById fails', async () => {
      service.repository.FindById.mockRejectedValue(new Error('Failed to get product description'));

      await expect(service.GetProductDescription('1'))
        .rejects.toThrow('Failed to get product description');
    });

    it('should return an error if product is not found', async () => {
      const errorResponse = { error: 'Product not found' };
      service.repository.FindById.mockResolvedValue(null);
      FormateData.mockReturnValue(errorResponse);

      const result = await service.GetProductDescription('1');

      expect(service.repository.FindById).toHaveBeenCalledWith('1');
      expect(FormateData).toHaveBeenCalledWith(null); // Ensure FormateData is called with null
      expect(result).toEqual(errorResponse);
    });
  });

  ////////////////////////// Get Products by Category //////////////////////////////

  describe('GetProductsByCategory', () => {
    it('should get products by category successfully', async () => {
      const mockProducts = [
        { _id: '1', category: 'Category1' },
        { _id: '2', category: 'Category1' }
      ];
      service.repository.FindByCategory.mockResolvedValue(mockProducts);
      FormateData.mockReturnValue(mockProducts);

      const result = await service.GetProductsByCategory('Category1');

      expect(service.repository.FindByCategory).toHaveBeenCalledWith('Category1');
      expect(FormateData).toHaveBeenCalledWith(mockProducts);
      expect(result).toEqual(mockProducts);
    });

    it('should throw an error if FindByCategory fails', async () => {
      service.repository.FindByCategory.mockRejectedValue(new Error('Failed to get products by category'));

      await expect(service.GetProductsByCategory('Category1'))
        .rejects.toThrow('Failed to get products by category');
    });

    it('should return an empty array if no products are found for the category', async () => {
      const emptyProducts = [];
      service.repository.FindByCategory.mockResolvedValue(emptyProducts);
      FormateData.mockReturnValue(emptyProducts);

      const result = await service.GetProductsByCategory('Category1');

      expect(service.repository.FindByCategory).toHaveBeenCalledWith('Category1');
      expect(FormateData).toHaveBeenCalledWith(emptyProducts);
      expect(result).toEqual(emptyProducts);
    });
  });

  ////////////////////////// Get Selected Products //////////////////////////////

  describe('GetSelectedProducts', () => {
    it('should get selected products successfully', async () => {
      const mockProducts = [
        { _id: '1', name: 'Product 1' },
        { _id: '2', name: 'Product 2' }
      ];
      service.repository.FindSelectedProducts.mockResolvedValue(mockProducts);
      FormateData.mockReturnValue(mockProducts);

      const result = await service.GetSelectedProducts(['1', '2']);

      expect(service.repository.FindSelectedProducts).toHaveBeenCalledWith(['1', '2']);
      expect(FormateData).toHaveBeenCalledWith(mockProducts);
      expect(result).toEqual(mockProducts);
    });

    it('should throw an error if FindSelectedProducts fails', async () => {
      service.repository.FindSelectedProducts.mockRejectedValue(new Error('Failed to get selected products'));

      await expect(service.GetSelectedProducts(['1', '2']))
        .rejects.toThrow('Failed to get selected products');
    });
  });

  ////////////////////////// Get Product Payload //////////////////////////////

  describe('GetProductPayload', () => {
    it('should get product payload successfully', async () => {
      const mockPayload = {
        event: 'TEST_EVENT',
        data: { userId: 'user1', product: mockProduct, qty: 2 }
      };
      service.repository.FindById.mockResolvedValue(mockProduct);
      FormateData.mockReturnValue(mockPayload);

      const result = await service.GetProductPayload('user1', { productId: '1', qty: 2 }, 'TEST_EVENT');

      expect(service.repository.FindById).toHaveBeenCalledWith('1');
      expect(FormateData).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual(mockPayload);
    });

    it('should return an error if product is not found', async () => {
      service.repository.FindById.mockResolvedValue(null);
      const errorResponse = { error: 'No product Available' };
      FormateData.mockReturnValue(errorResponse);

      const result = await service.GetProductPayload('user1', { productId: '1', qty: 2 }, 'TEST_EVENT');

      expect(service.repository.FindById).toHaveBeenCalledWith('1');
      expect(FormateData).toHaveBeenCalledWith(errorResponse);
      expect(result).toEqual(errorResponse);
    });

    it('should throw an error if FindById fails', async () => {
      service.repository.FindById.mockRejectedValue(new Error('Failed to get product'));

      await expect(service.GetProductPayload('user1', { productId: '1', qty: 2 }, 'TEST_EVENT'))
        .rejects.toThrow('Failed to get product');
    });
  });

  ////////////////////////// Serve RPC Request //////////////////////////////

  describe('serveRPCRequest', () => {
    it('should handle VIEW_PRODUCT request', async () => {
      service.repository.FindById.mockResolvedValue(mockProduct);

      const payload = { type: 'VIEW_PRODUCT', data: '1' };
      const result = await service.serveRPCRequest(payload);

      expect(service.repository.FindById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProduct);
    });

    it('should handle VIEW_PRODUCTS request', async () => {
      const mockProducts = [
        { _id: '1', name: 'Product 1' },
        { _id: '2', name: 'Product 2' }
      ];
      service.repository.FindSelectedProducts.mockResolvedValue(mockProducts);

      const payload = { type: 'VIEW_PRODUCTS', data: ['1', '2'] };
      const result = await service.serveRPCRequest(payload);

      expect(service.repository.FindSelectedProducts).toHaveBeenCalledWith(['1', '2']);
      expect(result).toEqual(mockProducts);
    });

    it('should return undefined for unsupported request type', async () => {
      const payload = { type: 'UNSUPPORTED_TYPE', data: '1' };
      const result = await service.serveRPCRequest(payload);

      expect(result).toBeUndefined();
    });
  });
});
