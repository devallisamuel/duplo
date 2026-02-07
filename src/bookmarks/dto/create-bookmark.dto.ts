import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ example: 'NestJS Documentation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://docs.nestjs.com' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Official NestJS documentation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['nestjs', 'documentation', 'backend'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  folderId?: string;
}

