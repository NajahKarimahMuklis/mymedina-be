import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';

/**
 * Seed Admin and Owner Accounts
 * 
 * Creates initial admin and owner accounts for the system.
 * Run with: npm run seed:admin
 */
export class AdminOwnerSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    console.log('🌱 Seeding Admin and Owner accounts...');

    const userRepository = this.dataSource.getRepository('User');

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@mymedina.com' },
    });

    if (!existingAdmin) {
      await userRepository.save({
        email: 'admin@mymedina.com',
        hashPassword: hashedPassword,
        nama: 'Admin MyMedina',
        nomorTelepon: '081234567890',
        role: Role.ADMIN,
        emailTerverifikasi: true,
      });
      console.log('✅ Admin account created: admin@mymedina.com / Admin123!');
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // Check if owner already exists
    const existingOwner = await userRepository.findOne({
      where: { email: 'owner@mymedina.com' },
    });

    if (!existingOwner) {
      await userRepository.save({
        email: 'owner@mymedina.com',
        hashPassword: hashedPassword,
        nama: 'Owner MyMedina',
        nomorTelepon: '081234567891',
        role: Role.OWNER,
        emailTerverifikasi: true,
      });
      console.log('✅ Owner account created: owner@mymedina.com / Admin123!');
    } else {
      console.log('ℹ️  Owner account already exists');
    }

    console.log('✅ Admin and Owner seeding completed!');
  }
}

// Run if executed directly
if (require.main === module) {
  import('../../config/data.source').then(({ AppDataSource }) => {
    AppDataSource.initialize()
      .then(async () => {
        const seeder = new AdminOwnerSeeder(AppDataSource);
        await seeder.run();
        await AppDataSource.destroy();
        process.exit(0);
      })
      .catch((error) => {
        console.error('Error during seeding:', error);
        process.exit(1);
      });
  });
}
