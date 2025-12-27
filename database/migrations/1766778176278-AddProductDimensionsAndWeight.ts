import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductDimensionsAndWeight1766778176278 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Drop all conflicting columns first
        await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN IF EXISTS "length" CASCADE,
            DROP COLUMN IF EXISTS "width" CASCADE,
            DROP COLUMN IF EXISTS "height" CASCADE,
            DROP COLUMN IF EXISTS "weight" CASCADE,
            DROP COLUMN IF EXISTS "panjang" CASCADE,
            DROP COLUMN IF EXISTS "lebar" CASCADE,
            DROP COLUMN IF EXISTS "tinggi" CASCADE,
            DROP COLUMN IF EXISTS "berat" CASCADE
        `);
        
        // Step 2: Add Indonesian dimension columns with defaults and nullable first
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD COLUMN "berat" numeric(8,2) DEFAULT 1.00,
            ADD COLUMN "panjang" numeric(8,2) DEFAULT 20.00,
            ADD COLUMN "lebar" numeric(8,2) DEFAULT 15.00,
            ADD COLUMN "tinggi" numeric(8,2) DEFAULT 10.00
        `);
        
        // Step 3: Set NULL values to defaults
        await queryRunner.query(`
            UPDATE "products"
            SET 
                "berat" = COALESCE("berat", 1.00),
                "panjang" = COALESCE("panjang", 20.00),
                "lebar" = COALESCE("lebar", 15.00),
                "tinggi" = COALESCE("tinggi", 10.00)
            WHERE "berat" IS NULL OR "panjang" IS NULL OR "lebar" IS NULL OR "tinggi" IS NULL
        `);
        
        // Step 4: Add NOT NULL constraints
        await queryRunner.query(`
            ALTER TABLE "products"
            ALTER COLUMN "berat" SET NOT NULL,
            ALTER COLUMN "panjang" SET NOT NULL,
            ALTER COLUMN "lebar" SET NOT NULL,
            ALTER COLUMN "tinggi" SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN IF EXISTS "length",
            DROP COLUMN IF EXISTS "width",
            DROP COLUMN IF EXISTS "height"
        `);
    }

}
