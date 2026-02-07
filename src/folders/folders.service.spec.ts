import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { Folder } from './entities/folder.entity';

describe('FoldersService', () => {
  let service: FoldersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoldersService,
        {
          provide: getRepositoryToken(Folder),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FoldersService>(FoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a folder successfully', async () => {
      const createDto = {
        name: 'Test Folder',
        description: 'Test description',
        color: '#FF0000',
      };

      const folder = { id: '1', ...createDto, userId: 'user1' };
      mockRepository.create.mockReturnValue(folder);
      mockRepository.save.mockResolvedValue(folder);

      const result = await service.create('user1', createDto);

      expect(result).toEqual(folder);
    });
  });

  describe('findAll', () => {
    it('should return all folders for a user', async () => {
      const folders = [
        { id: '1', name: 'Folder 1', userId: 'user1' },
        { id: '2', name: 'Folder 2', userId: 'user1' },
      ];
      mockRepository.find.mockResolvedValue(folders);

      const result = await service.findAll('user1');

      expect(result).toEqual(folders);
    });
  });

  describe('findOne', () => {
    it('should find a folder by id', async () => {
      const folder = { id: '1', name: 'Test', userId: 'user1' };
      mockRepository.findOne.mockResolvedValue(folder);

      const result = await service.findOne('user1', '1');

      expect(result).toEqual(folder);
    });

    it('should throw NotFoundException if folder not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('user1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a folder successfully', async () => {
      const folder = { id: '1', name: 'Test', userId: 'user1' };
      mockRepository.findOne.mockResolvedValue(folder);
      mockRepository.remove.mockResolvedValue(folder);

      await service.remove('user1', '1');

      expect(mockRepository.remove).toHaveBeenCalledWith(folder);
    });

    it('should throw NotFoundException if folder not found for removal', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a folder successfully', async () => {
      const updateDto = { name: 'Updated Folder' };
      const folder = { id: '1', name: 'Test', userId: 'user1' };
      const updatedFolder = { ...folder, ...updateDto };

      mockRepository.findOne.mockResolvedValue(folder);
      mockRepository.save.mockResolvedValue(updatedFolder);

      const result = await service.update('user1', '1', updateDto);

      expect(result).toEqual(updatedFolder);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if folder not found for update', async () => {
      const updateDto = { name: 'Updated Folder' };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('user1', '1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
