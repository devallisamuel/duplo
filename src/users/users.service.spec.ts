import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock findByEmail to return null (user doesn't exist)
      mockRepository.findOne.mockResolvedValue(null);

      const savedUser = { id: '1', ...registerDto, password: hashedPassword };
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(registerDto);

      expect(result).toEqual(savedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const existingUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      // Mock findByEmail to return existing user
      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(registerDto)).rejects.toThrow(
        ConflictException,
      );

      // Verify findByEmail was called
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });

      // Verify save was never called since user already exists
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(user);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        'password',
        'hashedPassword',
      );

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(
        'wrongPassword',
        'hashedPassword',
      );

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Comparison error'),
      );

      const result = await service.validatePassword(
        'password',
        'hashedPassword',
      );

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
