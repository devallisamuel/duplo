import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './entities/bookmark.entity';

describe('BookmarksService', () => {
  let service: BookmarksService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        {
          provide: getRepositoryToken(Bookmark),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a bookmark successfully', async () => {
      const createDto = {
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'Test description',
        tags: ['test'],
      };

      // Mock findOne to return null (bookmark doesn't exist)
      mockRepository.findOne.mockResolvedValue(null);

      const bookmark = { id: '1', ...createDto, userId: 'user1' };
      mockRepository.create.mockReturnValue(bookmark);
      mockRepository.save.mockResolvedValue(bookmark);

      const result = await service.create('user1', createDto);

      expect(result).toEqual(bookmark);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user1', url: createDto.url },
      });
    });

    it('should throw ConflictException if bookmark URL already exists for user', async () => {
      const createDto = {
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'Test description',
        tags: ['test'],
      };

      const existingBookmark = {
        id: '1',
        title: 'Existing Bookmark',
        url: 'https://example.com',
        userId: 'user1',
      };

      // Mock findOne to return existing bookmark
      mockRepository.findOne.mockResolvedValue(existingBookmark);

      await expect(service.create('user1', createDto)).rejects.toThrow(
        ConflictException,
      );

      // Verify findOne was called with correct parameters
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user1', url: createDto.url },
      });

      // Verify save was never called since bookmark already exists
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a bookmark by id', async () => {
      const bookmark = { id: '1', title: 'Test', userId: 'user1' };
      mockRepository.findOne.mockResolvedValue(bookmark);

      const result = await service.findOne('user1', '1');

      expect(result).toEqual(bookmark);
    });

    it('should throw NotFoundException if bookmark not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('user1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a bookmark successfully', async () => {
      const bookmark = { id: '1', title: 'Test', userId: 'user1' };
      mockRepository.findOne.mockResolvedValue(bookmark);
      mockRepository.remove.mockResolvedValue(bookmark);

      await service.remove('user1', '1');

      expect(mockRepository.remove).toHaveBeenCalledWith(bookmark);
    });

    it('should throw NotFoundException if bookmark not found for removal', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a bookmark successfully', async () => {
      const updateDto = { title: 'Updated Title' };
      const bookmark = { id: '1', title: 'Test', userId: 'user1' };
      const updatedBookmark = { ...bookmark, ...updateDto };

      mockRepository.findOne.mockResolvedValue(bookmark);
      mockRepository.save.mockResolvedValue(updatedBookmark);

      const result = await service.update('user1', '1', updateDto);

      expect(result).toEqual(updatedBookmark);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if bookmark not found for update', async () => {
      const updateDto = { title: 'Updated Title' };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('user1', '1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated bookmarks', async () => {
      const queryDto = { page: 1, limit: 10 };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll('user1', queryDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter by folderId', async () => {
      const queryDto = { page: 1, limit: 10, folderId: 'folder1' };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll('user1', queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'bookmark.folderId = :folderId',
        { folderId: 'folder1' },
      );
    });

    it('should filter by tags', async () => {
      const queryDto = { page: 1, limit: 10, tags: 'tag1,tag2' };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll('user1', queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'bookmark.tags && :tags',
        { tags: ['tag1', 'tag2'] },
      );
    });

    it('should filter by search term', async () => {
      const queryDto = { page: 1, limit: 10, search: 'test' };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll('user1', queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { search: '%test%' },
      );
    });
  });
});
