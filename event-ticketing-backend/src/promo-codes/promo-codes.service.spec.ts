import { Test, TestingModule } from '@nestjs/testing';
import { PromoCodesService } from './promo-codes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PromoCode } from '../entities/promo-code.entity';
import { PromoCodeUsage } from '../entities/promo-code-usage.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PromoCodesService', () => {
  let service: PromoCodesService;
  let promoCodeRepository: Repository<PromoCode>;
  let promoCodeUsageRepository: Repository<PromoCodeUsage>;

  const mockPromoCodeRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPromoCodeUsageRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoCodesService,
        {
          provide: getRepositoryToken(PromoCode),
          useValue: mockPromoCodeRepository,
        },
        {
          provide: getRepositoryToken(PromoCodeUsage),
          useValue: mockPromoCodeUsageRepository,
        },
      ],
    }).compile();

    service = module.get<PromoCodesService>(PromoCodesService);
    promoCodeRepository = module.get<Repository<PromoCode>>(
      getRepositoryToken(PromoCode),
    );
    promoCodeUsageRepository = module.get<Repository<PromoCodeUsage>>(
      getRepositoryToken(PromoCodeUsage),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePromoCode', () => {
    const mockPromoCode: PromoCode = {
      promoCodeId: 1,
      code: 'SUMMER2024',
      discountType: 'Percentage',
      discountValue: 20,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      maxUses: 100,
      usedCount: 50,
      minPurchaseAmount: 50,
      maxDiscountAmount: 100,
      isActive: true,
      scope: 'All',
      eventId: null,
      event: null,
      usages: [],
      createdAt: new Date(),
    };

    it('should successfully validate a valid promo code', async () => {
      const userId = 1;
      const eventId = 10;
      const orderAmount = 100;

      mockPromoCodeRepository.findOne.mockResolvedValue(mockPromoCode);
      mockPromoCodeUsageRepository.count.mockResolvedValue(0);

      const result = await service.validatePromoCode(
        'SUMMER2024',
        userId,
        eventId,
        orderAmount,
      );

      expect(result).toEqual({
        isValid: true,
        discountAmount: 20,
        promoCode: mockPromoCode,
      });
      expect(mockPromoCodeRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'SUMMER2024' },
        relations: ['event'],
      });
    });

    it('should throw NotFoundException if promo code does not exist', async () => {
      mockPromoCodeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validatePromoCode('INVALID', 1, 10, 100),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if promo code is inactive', async () => {
      const inactivePromoCode = { ...mockPromoCode, isActive: false };
      mockPromoCodeRepository.findOne.mockResolvedValue(inactivePromoCode);

      await expect(
        service.validatePromoCode('SUMMER2024', 1, 10, 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if promo code has not started yet', async () => {
      const futurePromoCode = {
        ...mockPromoCode,
        startDate: new Date('2025-01-01'),
      };
      mockPromoCodeRepository.findOne.mockResolvedValue(futurePromoCode);

      await expect(
        service.validatePromoCode('SUMMER2024', 1, 10, 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if promo code has expired', async () => {
      const expiredPromoCode = {
        ...mockPromoCode,
        endDate: new Date('2023-12-31'),
      };
      mockPromoCodeRepository.findOne.mockResolvedValue(expiredPromoCode);

      await expect(
        service.validatePromoCode('SUMMER2024', 1, 10, 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if promo code has reached max uses', async () => {
      const maxedOutPromoCode = {
        ...mockPromoCode,
        usedCount: 100,
        maxUses: 100,
      };
      mockPromoCodeRepository.findOne.mockResolvedValue(maxedOutPromoCode);

      await expect(
        service.validatePromoCode('SUMMER2024', 1, 10, 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order amount below minimum', async () => {
      mockPromoCodeRepository.findOne.mockResolvedValue(mockPromoCode);

      await expect(
        service.validatePromoCode('SUMMER2024', 1, 10, 30),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user has already used the promo code', async () => {
      mockPromoCodeRepository.findOne.mockResolvedValue(mockPromoCode);
      mockPromoCodeUsageRepository.count.mockResolvedValue(1);

      await expect(
        service.validatePromoCode('SUMMER2024', 1, 10, 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if event-specific promo code used for wrong event', async () => {
      const eventSpecificPromoCode = {
        ...mockPromoCode,
        scope: 'Event',
        eventId: 5,
      };
      mockPromoCodeRepository.findOne.mockResolvedValue(eventSpecificPromoCode);
      mockPromoCodeUsageRepository.count.mockResolvedValue(0);

      await expect(
        service.validatePromoCode('SUMMER2024', 1, 10, 100),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const promoCode: PromoCode = {
        promoCodeId: 1,
        code: 'PERCENT20',
        discountType: 'Percentage',
        discountValue: 20,
        maxDiscountAmount: null,
        startDate: new Date(),
        endDate: new Date(),
        maxUses: 100,
        usedCount: 0,
        minPurchaseAmount: 0,
        isActive: true,
        scope: 'All',
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      const discount = service.calculateDiscount(promoCode, 100);
      expect(discount).toBe(20); // 20% of 100
    });

    it('should calculate percentage discount with max cap', () => {
      const promoCode: PromoCode = {
        promoCodeId: 1,
        code: 'PERCENT50',
        discountType: 'Percentage',
        discountValue: 50,
        maxDiscountAmount: 30,
        startDate: new Date(),
        endDate: new Date(),
        maxUses: 100,
        usedCount: 0,
        minPurchaseAmount: 0,
        isActive: true,
        scope: 'All',
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      const discount = service.calculateDiscount(promoCode, 100);
      expect(discount).toBe(30); // 50% of 100 = 50, but capped at 30
    });

    it('should calculate fixed amount discount correctly', () => {
      const promoCode: PromoCode = {
        promoCodeId: 1,
        code: 'FIXED25',
        discountType: 'FixedAmount',
        discountValue: 25,
        maxDiscountAmount: null,
        startDate: new Date(),
        endDate: new Date(),
        maxUses: 100,
        usedCount: 0,
        minPurchaseAmount: 0,
        isActive: true,
        scope: 'All',
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      const discount = service.calculateDiscount(promoCode, 100);
      expect(discount).toBe(25);
    });

    it('should not exceed order amount for fixed discount', () => {
      const promoCode: PromoCode = {
        promoCodeId: 1,
        code: 'FIXED100',
        discountType: 'FixedAmount',
        discountValue: 100,
        maxDiscountAmount: null,
        startDate: new Date(),
        endDate: new Date(),
        maxUses: 100,
        usedCount: 0,
        minPurchaseAmount: 0,
        isActive: true,
        scope: 'All',
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      const discount = service.calculateDiscount(promoCode, 50);
      expect(discount).toBe(50); // Should not exceed order amount
    });
  });

  describe('recordPromoCodeUsage', () => {
    it('should successfully record promo code usage', async () => {
      const mockPromoCode: PromoCode = {
        promoCodeId: 1,
        code: 'SUMMER2024',
        discountType: 'Percentage',
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(),
        maxUses: 100,
        usedCount: 50,
        minPurchaseAmount: 0,
        maxDiscountAmount: null,
        isActive: true,
        scope: 'All',
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      const mockUsage = {
        usageId: 1,
        promoCodeId: 1,
        userId: 1,
        orderId: 100,
        discountApplied: 20,
        usedAt: new Date(),
      };

      mockPromoCodeRepository.findOne.mockResolvedValue(mockPromoCode);
      mockPromoCodeUsageRepository.create.mockReturnValue(mockUsage);
      mockPromoCodeUsageRepository.save.mockResolvedValue(mockUsage);
      mockPromoCodeRepository.save.mockResolvedValue({
        ...mockPromoCode,
        usedCount: 51,
      });

      await service.recordPromoCodeUsage(1, 1, 100, 20);

      expect(mockPromoCodeUsageRepository.create).toHaveBeenCalledWith({
        promoCodeId: 1,
        userId: 1,
        orderId: 100,
        discountApplied: 20,
      });
      expect(mockPromoCodeUsageRepository.save).toHaveBeenCalledWith(mockUsage);
      expect(mockPromoCodeRepository.save).toHaveBeenCalledWith({
        ...mockPromoCode,
        usedCount: 51,
      });
    });
  });

  describe('getPromoCodeAnalytics', () => {
    it('should return analytics for a promo code', async () => {
      const mockPromoCode: PromoCode = {
        promoCodeId: 1,
        code: 'SUMMER2024',
        discountType: 'Percentage',
        discountValue: 20,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        maxUses: 100,
        usedCount: 50,
        minPurchaseAmount: 0,
        maxDiscountAmount: null,
        isActive: true,
        scope: 'All',
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      const mockUsages = [
        { discountApplied: 20 },
        { discountApplied: 15 },
        { discountApplied: 25 },
      ];

      mockPromoCodeRepository.findOne.mockResolvedValue(mockPromoCode);
      mockPromoCodeUsageRepository.find.mockResolvedValue(mockUsages);

      const result = await service.getPromoCodeAnalytics(1);

      expect(result).toEqual({
        promoCode: mockPromoCode,
        totalUsages: 50,
        totalDiscountGiven: 60,
        averageDiscountPerUse: 20,
        usageRate: 50, // 50/100 * 100
      });
      expect(mockPromoCodeRepository.findOne).toHaveBeenCalledWith({
        where: { promoCodeId: 1 },
      });
      expect(mockPromoCodeUsageRepository.find).toHaveBeenCalledWith({
        where: { promoCodeId: 1 },
      });
    });

    it('should throw NotFoundException if promo code does not exist', async () => {
      mockPromoCodeRepository.findOne.mockResolvedValue(null);

      await expect(service.getPromoCodeAnalytics(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPromoCode', () => {
    it('should successfully create a new promo code', async () => {
      const createDto = {
        code: 'NEWYEAR2024',
        discountType: 'Percentage' as const,
        discountValue: 30,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        maxUses: 200,
        minPurchaseAmount: 100,
        maxDiscountAmount: 50,
        scope: 'All' as const,
      };

      const mockCreatedPromoCode = {
        promoCodeId: 1,
        ...createDto,
        usedCount: 0,
        isActive: true,
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      mockPromoCodeRepository.create.mockReturnValue(mockCreatedPromoCode);
      mockPromoCodeRepository.save.mockResolvedValue(mockCreatedPromoCode);

      const result = await service.createPromoCode(createDto);

      expect(result).toEqual(mockCreatedPromoCode);
      expect(mockPromoCodeRepository.create).toHaveBeenCalledWith({
        ...createDto,
        usedCount: 0,
        isActive: true,
      });
      expect(mockPromoCodeRepository.save).toHaveBeenCalledWith(
        mockCreatedPromoCode,
      );
    });
  });

  describe('deactivatePromoCode', () => {
    it('should successfully deactivate a promo code', async () => {
      const mockPromoCode: PromoCode = {
        promoCodeId: 1,
        code: 'SUMMER2024',
        discountType: 'Percentage',
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(),
        maxUses: 100,
        usedCount: 50,
        minPurchaseAmount: 0,
        maxDiscountAmount: null,
        isActive: true,
        scope: 'All',
        eventId: null,
        event: null,
        usages: [],
        createdAt: new Date(),
      };

      mockPromoCodeRepository.findOne.mockResolvedValue(mockPromoCode);
      mockPromoCodeRepository.save.mockResolvedValue({
        ...mockPromoCode,
        isActive: false,
      });

      const result = await service.deactivatePromoCode(1);

      expect(result.isActive).toBe(false);
      expect(mockPromoCodeRepository.save).toHaveBeenCalledWith({
        ...mockPromoCode,
        isActive: false,
      });
    });

    it('should throw NotFoundException if promo code does not exist', async () => {
      mockPromoCodeRepository.findOne.mockResolvedValue(null);

      await expect(service.deactivatePromoCode(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
