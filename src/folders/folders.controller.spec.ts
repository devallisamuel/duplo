import { Test, TestingModule } from '@nestjs/testing';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { User } from '../users/entities/user.entity';

describe('FoldersController', () => {
  let controller: FoldersController;
  let service: FoldersService;

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

  const mockFolder = {
    id: 'folder-1',
    name: 'Test Folder',
    description: 'Test description',
    color: '#FF5733',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    bookmarks: [],
  };

  const mockFoldersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoldersController],
      providers: [
        {
          provide: FoldersService,
          useValue: mockFoldersService,
        },
      ],
    }).compile();

    controller = module.get<FoldersController>(FoldersController);
    service = module.get<FoldersService>(FoldersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a folder', async () => {
      const createDto: CreateFolderDto = {
        name: 'Test Folder',
        description: 'Test description',
        color: '#FF5733',
      };

      mockFoldersService.create.mockResolvedValue(mockFolder);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual(mockFolder);
      expect(service.create).toHaveBeenCalledWith(mockUser.id, createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all folders', async () => {
      const expectedResult = [mockFolder];

      mockFoldersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single folder', async () => {
      mockFoldersService.findOne.mockResolvedValue(mockFolder);

      const result = await controller.findOne(mockUser, 'folder-1');

      expect(result).toEqual(mockFolder);
      expect(service.findOne).toHaveBeenCalledWith(mockUser.id, 'folder-1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a folder', async () => {
      const updateDto: UpdateFolderDto = {
        name: 'Updated Folder',
      };

      const updatedFolder = { ...mockFolder, ...updateDto };
      mockFoldersService.update.mockResolvedValue(updatedFolder);

      const result = await controller.update(mockUser, 'folder-1', updateDto);

      expect(result).toEqual(updatedFolder);
      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        'folder-1',
        updateDto,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delete a folder', async () => {
      mockFoldersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockUser, 'folder-1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(mockUser.id, 'folder-1');
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
