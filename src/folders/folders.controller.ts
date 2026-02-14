import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Folders')
@ApiBearerAuth('JWT-auth')
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  create(@CurrentUser() user: User, @Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.create(user.id, createFolderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all folders' })
  @ApiResponse({ status: 200, description: 'Folders retrieved successfully' })
  findAll(@CurrentUser() user: User) {
    return this.foldersService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single folder by ID' })
  @ApiResponse({ status: 200, description: 'Folder retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.foldersService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a folder' })
  @ApiResponse({ status: 200, description: 'Folder updated successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.update(user.id, id, updateFolderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a folder' })
  @ApiResponse({ status: 204, description: 'Folder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.foldersService.remove(user.id, id);
  }
}
