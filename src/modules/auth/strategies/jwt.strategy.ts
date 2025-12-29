import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const secret = process.env.JWT_SECRET || 'mymedina_secret_key';
    console.log('🔑 JWT Strategy Secret:', secret);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT Payload:', payload); // ✅ DEBUG

    const { sub: userId } = payload;

    // Cari user berdasarkan ID dari payload
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // Cek apakah user aktif
    if (!user.aktif) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    }

    console.log('✅ JWT User validated:', user.id); // ✅ DEBUG

    return user;
  }
}
