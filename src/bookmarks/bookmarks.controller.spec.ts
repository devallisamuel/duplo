import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { QueryBookmarkDto } from './dto/query-bookmark.dto';
import { User } from '../users/entities/user.entity';

describe('BookmarksController', () => {
  let controller: BookmarksController;
  let service: BookmarksService;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
    bookmarks: [],
    folders: [],
  };

  const mockBookmark = {
    id: 'bookmark-1',
    title: 'Test Bookmark',
    url: 'https://example.com',
    description: 'Test description',
    tags: ['test'],
    userId: 'user-1',
    folderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookmarksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        {
          provide: BookmarksService,
          useValue: mockBookmarksService,
        },
      ],
    }).compile();

    controller = module.get<BookmarksController>(BookmarksController);
    service = module.get<BookmarksService>(BookmarksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bookmark', async () => {
      const createDto: CreateBookmarkDto = {
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'Test description',
        tags: ['test'],
      };

      mockBookmarksService.create.mockResolvedValue(mockBookmark);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(mockBookmark);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all bookmarks with pagination', async () => {
      const queryDto: QueryBookmarkDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        data: [mockBookmark],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockBookmarksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockUser, queryDto);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, queryDto);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single bookmark', async () => {
      mockBookmarksService.findOne.mockResolvedValue(mockBookmark);

      const result = await controller.findOne(mockUser, 'bookmark-1');

      expect(result).toEqual(mockBookmark);
      expect(service.findOne).toHaveBeenCalledWith(mockUser.id, 'bookmark-1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a bookmark', async () => {
      const updateDto: UpdateBookmarkDto = {
        title: 'Updated Bookmark',
      };

      const updatedBookmark = { ...mockBookmark, ...updateDto };
      mockBookmarksService.update.mockResolvedValue(updatedBookmark);

      const result = await controller.update(mockUser, 'bookmark-1', updateDto);

      expect(result).toEqual(updatedBookmark);
      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        'bookmark-1',
        updateDto,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delete a bookmark', async () => {
      mockBookmarksService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockUser, 'bookmark-1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(mockUser.id, 'bookmark-1');
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
