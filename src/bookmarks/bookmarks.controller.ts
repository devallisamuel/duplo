import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { QueryBookmarkDto } from './dto/query-bookmark.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Bookmarks')
@ApiBearerAuth('JWT-auth')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bookmark' })
  @ApiResponse({ status: 201, description: 'Bookmark created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Bookmark with this URL already exists',
  })
  create(
    @CurrentUser() user: User,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    return this.bookmarksService.create(user.id, createBookmarkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully' })
  findAll(@CurrentUser() user: User, @Query() queryDto: QueryBookmarkDto) {
    return this.bookmarksService.findAll(user.id, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single bookmark by ID' })
  @ApiResponse({ status: 200, description: 'Bookmark retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookmarksService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark updated successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ) {
    return this.bookmarksService.update(user.id, id, updateBookmarkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bookmark' })
  @ApiResponse({ status: 204, description: 'Bookmark deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookmarksService.remove(user.id, id);
  }
}
