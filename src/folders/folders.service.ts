import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);

  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async create(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<Folder> {
    try {
      const folder = this.folderRepository.create({
        ...createFolderDto,
        userId,
      });

      try {
        const savedFolder = await this.folderRepository.save(folder);
        this.logger.log(`Folder created: ${savedFolder.id}`);
        return savedFolder;
      } catch (error) {
        this.logger.error(`Error saving folder: ${error.message}`);
        throw new InternalServerErrorException('Failed to create folder');
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Error in create folder: ${error.message}`);
      throw new InternalServerErrorException('Failed to create folder');
    }
  }

  async findAll(userId: string): Promise<Folder[]> {
    try {
      const folders = await this.folderRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      this.logger.log(`Found ${folders.length} folders for user ${userId}`);
      return folders;
    } catch (error) {
      this.logger.error(`Error finding folders: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch folders');
    }
  }

  async findOne(userId: string, id: string): Promise<Folder> {
    try {
      const folder = await this.folderRepository.findOne({
        where: { id, userId },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }

      return folder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding folder: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch folder');
    }
  }

  async update(
    userId: string,
    id: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<Folder> {
    try {
      const folder = await this.findOne(userId, id);

      try {
        Object.assign(folder, updateFolderDto);
        const updatedFolder = await this.folderRepository.save(folder);
        this.logger.log(`Folder updated: ${id}`);
        return updatedFolder;
      } catch (error) {
        this.logger.error(`Error updating folder: ${error.message}`);
        throw new InternalServerErrorException('Failed to update folder');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error in update folder: ${error.message}`);
      throw new InternalServerErrorException('Failed to update folder');
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    try {
      const folder = await this.findOne(userId, id);

      try {
        await this.folderRepository.remove(folder);
        this.logger.log(`Folder deleted: ${id}`);
      } catch (error) {
        this.logger.error(`Error deleting folder: ${error.message}`);
        throw new InternalServerErrorException('Failed to delete folder');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error in remove folder: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete folder');
    }
  }
}
