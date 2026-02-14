import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { QueryBookmarkDto } from './dto/query-bookmark.dto';

@Injectable()
export class BookmarksService {
  private readonly logger = new Logger(BookmarksService.name);

  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}

  async create(
    userId: string,
    createBookmarkDto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    try {
      const existingBookmark = await this.findByUserIdAndUrl(
        userId,
        createBookmarkDto.url,
      );

      if (existingBookmark) {
        this.logger.warn(
          `Duplicate bookmark URL for user ${userId}: ${createBookmarkDto.url}`,
        );
        throw new ConflictException('Bookmark with this URL already exists');
      }

      const bookmark = this.bookmarkRepository.create({
        ...createBookmarkDto,
        userId,
      });

      const savedBookmark = await this.bookmarkRepository.save(bookmark);
      this.logger.log(`Bookmark created: ${savedBookmark.id}`);
      return savedBookmark;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating bookmark: ${error.message}`);
      throw new InternalServerErrorException('Failed to create bookmark');
    }
  }

  private async findByUserIdAndUrl(
    userId: string,
    url: string,
  ): Promise<Bookmark | null> {
    try {
      return await this.bookmarkRepository.findOne({
        where: { userId, url },
      });
    } catch (error) {
      this.logger.error(`Error finding bookmark by URL: ${error.message}`);
      return null;
    }
  }

  async findAll(userId: string, queryDto: QueryBookmarkDto) {
    try {
      const { page = 1, limit = 10, folderId, tags, search } = queryDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.bookmarkRepository
        .createQueryBuilder('bookmark')
        .where('bookmark.userId = :userId', { userId });

      if (folderId) {
        queryBuilder.andWhere('bookmark.folderId = :folderId', { folderId });
      }

      if (tags) {
        const tagArray = tags.split(',').map((tag) => tag.trim());
        queryBuilder.andWhere('bookmark.tags && :tags', { tags: tagArray });
      }

      if (search) {
        queryBuilder.andWhere(
          '(bookmark.title ILIKE :search OR bookmark.description ILIKE :search OR bookmark.url ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      try {
        const [data, total] = await queryBuilder
          .skip(skip)
          .take(limit)
          .orderBy('bookmark.createdAt', 'DESC')
          .getManyAndCount();

        this.logger.log(`Found ${total} bookmarks for user ${userId}`);

        return {
          data,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        this.logger.error(`Error querying bookmarks: ${error.message}`);
        throw new InternalServerErrorException('Failed to fetch bookmarks');
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Error in findAll bookmarks: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch bookmarks');
    }
  }

  async findOne(userId: string, id: string): Promise<Bookmark> {
    try {
      const bookmark = await this.bookmarkRepository.findOne({
        where: { id, userId },
      });

      if (!bookmark) {
        throw new NotFoundException('Bookmark not found');
      }

      return bookmark;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding bookmark: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch bookmark');
    }
  }

  async update(
    userId: string,
    id: string,
    updateBookmarkDto: UpdateBookmarkDto,
  ): Promise<Bookmark> {
    try {
      const bookmark = await this.findOne(userId, id);

      try {
        Object.assign(bookmark, updateBookmarkDto);
        const updatedBookmark = await this.bookmarkRepository.save(bookmark);
        this.logger.log(`Bookmark updated: ${id}`);
        return updatedBookmark;
      } catch (error) {
        this.logger.error(`Error updating bookmark: ${error.message}`);
        throw new InternalServerErrorException('Failed to update bookmark');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error in update bookmark: ${error.message}`);
      throw new InternalServerErrorException('Failed to update bookmark');
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    try {
      const bookmark = await this.findOne(userId, id);

      try {
        await this.bookmarkRepository.remove(bookmark);
        this.logger.log(`Bookmark deleted: ${id}`);
      } catch (error) {
        this.logger.error(`Error deleting bookmark: ${error.message}`);
        throw new InternalServerErrorException('Failed to delete bookmark');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error in remove bookmark: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete bookmark');
    }
  }
}
