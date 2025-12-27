import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async buatProduk(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    const slugSudahAda = await this.productRepository.findOne({
      where: { slug: createProductDto.slug },
    });

    if (slugSudahAda) {
      throw new ConflictException('Slug produk sudah digunakan');
    }

    const produkBaru = this.productRepository.create(createProductDto);
    return await this.productRepository.save(produkBaru);
  }

  /**
   * ULTRA SIMPLE VERSION - NO QueryBuilder, NO Complex Logic
   * Ini versi paling minimal untuk debug
   */
  async ambilSemuaProduk(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    active?: boolean;
  }): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      this.logger.log(`[ambilSemuaProduk] START - Options: ${JSON.stringify(options)}`);

      // STEP 1: Coba query paling sederhana dulu - TANPA RELATIONS
      this.logger.log('[ambilSemuaProduk] Step 1: Find all products without relations');
      
      const allProducts = await this.productRepository.find({
        order: {
          dibuatPada: 'DESC',
        },
      });

      this.logger.log(`[ambilSemuaProduk] Found ${allProducts.length} products total`);

      // STEP 2: Filter di memory (bukan di database)
      let filteredProducts = allProducts;

      // Filter soft deleted
      filteredProducts = filteredProducts.filter(p => !p.dihapusPada);
      this.logger.log(`[ambilSemuaProduk] After soft-delete filter: ${filteredProducts.length}`);

      // Filter active
      if (options.active !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.aktif === options.active);
      } else {
        filteredProducts = filteredProducts.filter(p => p.aktif === true);
      }
      this.logger.log(`[ambilSemuaProduk] After active filter: ${filteredProducts.length}`);

      // Filter category
      if (options.categoryId) {
        filteredProducts = filteredProducts.filter(p => p.categoryId === options.categoryId);
      }

      // Filter status
      if (options.status) {
        filteredProducts = filteredProducts.filter(p => p.status === options.status);
      }

      // Filter search
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.nama?.toLowerCase().includes(searchLower) || 
          p.deskripsi?.toLowerCase().includes(searchLower)
        );
      }

      const total = filteredProducts.length;
      this.logger.log(`[ambilSemuaProduk] Total after all filters: ${total}`);

      // STEP 3: Pagination di memory
      const paginatedProducts = filteredProducts.slice(skip, skip + limit);
      this.logger.log(`[ambilSemuaProduk] Returning ${paginatedProducts.length} products for page ${page}`);

      // STEP 4: Load category manually untuk setiap product
      for (const product of paginatedProducts) {
        try {
          const category = await this.categoryRepository.findOne({
            where: { id: product.categoryId },
          });
          if (category) {
            product.category = category;
          }
        } catch (err) {
          this.logger.error(`Failed to load category for product ${product.id}: ${err.message}`);
        }
      }

      this.logger.log('[ambilSemuaProduk] SUCCESS');

      return {
        data: paginatedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

    } catch (error) {
      this.logger.error(`[ambilSemuaProduk] ERROR: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  async ambilProdukById(id: string): Promise<Product> {
    try {
      this.logger.log(`[ambilProdukById] Finding product ${id}`);
      
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product || product.dihapusPada) {
        throw new NotFoundException('Produk tidak ditemukan');
      }

      // Load category manually
      try {
        const category = await this.categoryRepository.findOne({
          where: { id: product.categoryId },
        });
        if (category) {
          product.category = category;
        }
      } catch (err) {
        this.logger.warn(`Failed to load category: ${err.message}`);
      }

      return product;
    } catch (error) {
      this.logger.error(`[ambilProdukById] ERROR: ${error.message}`);
      throw error;
    }
  }

  async updateProduk(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.ambilProdukById(id);

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Kategori tidak ditemukan');
      }
    }

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const slugSudahAda = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug },
      });

      if (slugSudahAda) {
        throw new ConflictException('Slug produk sudah digunakan');
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async hapusProduk(id: string): Promise<{ message: string }> {
    const product = await this.ambilProdukById(id);
    await this.productRepository.softRemove(product);

    return {
      message: 'Produk berhasil dihapus',
    };
  }

  async ambilVariantsProduct(productId: string): Promise<any[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return product.ambilVariants();
  }

  async ambilStokTersediaProduct(productId: string): Promise<number> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return product.ambilStokTersedia();
  }

  async isTersediaProduct(productId: string): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return product.isTersedia();
  }
}