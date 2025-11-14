import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { UserRole, RoleType } from '../../database/entities/user-role.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phoneNumber: registerDto.phoneNumber,
      isActive: true,
      status: 'Active',
    });

    await this.userRepository.save(user);

    // Assign default role (Customer)
    const userRole = this.userRoleRepository.create({
      userId: user.userId,
      role: RoleType.Customer,
      isActive: true,
    });

    await this.userRoleRepository.save(userRole);

    // Generate JWT token
    const roles = [RoleType.Customer];
    const token = this.generateJwtToken(user.userId, user.email, roles);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      token,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roles.map((r) => r.toString()),
      expiresAt,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user with roles
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['userRoles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Get active roles
    const roles = user.userRoles
      .filter((ur) => ur.isActive)
      .map((ur) => ur.role);

    // Generate JWT token
    const token = this.generateJwtToken(user.userId, user.email, roles);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      token,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roles.map((r) => r.toString()),
      expiresAt,
    };
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userId, isActive: true },
      relations: ['userRoles'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateJwtToken(
    userId: number,
    email: string,
    roles: RoleType[],
  ): string {
    const payload = {
      sub: userId,
      email,
      roles: roles.map((r) => r.toString()),
    };

    return this.jwtService.sign(payload);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
