import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

/**
 * Roles Guard
 *
 * OOP Concepts:
 * - Encapsulation: Authorization logic dalam satu class
 * - Single Responsibility: Hanya handle role-based authorization
 *
 * Design Pattern:
 * - Guard Pattern: Protect routes berdasarkan role
 * - Decorator Pattern: Menggunakan @Roles() decorator
 *
 * Usage:
 * @Roles(Role.ADMIN, Role.OWNER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnly() {
 *   return 'Only admin and owner can access this';
 * }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 🔥 FIX UTAMA
    if (!user || !user.role) {
      return false; // akan jadi 403
    }

    return requiredRoles.includes(user.role);
  }
}