import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when validation succeeds', async () => {
      const payload = { sub: 'user-1', email: 'test@example.com' };
      const user = { id: 'user-1', email: 'test@example.com' };

      mockAuthService.validateUser.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(result).toEqual(user);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException when validation fails', async () => {
      const payload = { sub: 'user-1', email: 'test@example.com' };

      mockAuthService.validateUser.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
