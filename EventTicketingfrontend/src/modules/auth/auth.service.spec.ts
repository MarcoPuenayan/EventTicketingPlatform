import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../../models/entities/user.entity';
import { UserRole } from '../../models/entities/user-role.entity';
import { RegisterDto } from '../../models/dtos/auth/register.dto';
import { LoginDto } from '../../models/dtos/auth/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RoleType } from '../../models/entities/enums';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let userRoleRepository: Repository<UserRole>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRoleRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userRoleRepository = module.get<Repository<UserRole>>(getRepositoryToken(UserRole));
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const mockUser = {
        userId: 1,
        ...registerDto,
        passwordHash: hashedPassword,
        isEmailVerified: false,
        createdAt: new Date(),
      };

      const mockUserRole = {
        userRoleId: 1,
        userId: 1,
        role: RoleType.Customer,
        isActive: true,
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserRoleRepository.create.mockReturnValue(mockUserRole);
      mockUserRoleRepository.save.mockResolvedValue(mockUserRole);
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email.toLowerCase() },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockUserRoleRepository.create).toHaveBeenCalledWith({
        userId: mockUser.userId,
        role: RoleType.Customer,
        isActive: true,
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email.toLowerCase());
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = { userId: 1, email: registerDto.email };
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email.toLowerCase() },
      });
    });

    it('should hash the password before saving', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      
      const mockUser = {
        userId: 1,
        ...registerDto,
        passwordHash: 'hashed-password',
        isEmailVerified: false,
        createdAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserRoleRepository.create.mockReturnValue({});
      mockUserRoleRepository.save.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      await service.register(registerDto);

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.passwordHash).toBeDefined();
      expect(savedUser.passwordHash).not.toBe(registerDto.password);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        userId: 1,
        email: loginDto.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
        userRoles: [
          {
            userRoleId: 1,
            role: RoleType.Customer,
            isActive: true,
          },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email.toLowerCase() },
        relations: ['userRoles'],
      });
      expect(result).toHaveProperty('accessToken', 'test-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email.toLowerCase());
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('DifferentPassword123!', 10);
      const mockUser = {
        userId: 1,
        email: loginDto.email.toLowerCase(),
        passwordHash: hashedPassword,
        userRoles: [],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should generate JWT token with correct payload', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        userId: 1,
        email: loginDto.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
        userRoles: [
          {
            userRoleId: 1,
            role: RoleType.Customer,
            isActive: true,
          },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('test-jwt-token');

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.userId,
        email: mockUser.email,
        role: RoleType.Customer,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        userId: 1,
        email: 'test@example.com',
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', password);

      expect(result).toBeDefined();
      expect(result?.userId).toBe(mockUser.userId);
      expect(result?.passwordHash).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      const mockUser = {
        userId: 1,
        email: 'test@example.com',
        passwordHash: hashedPassword,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'WrongPassword123!');

      expect(result).toBeNull();
    });
  });
});
