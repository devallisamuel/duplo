import { IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBookmarkDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: 'nestjs,documentation' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ example: 'nestjs' })
  @IsOptional()
  @IsString()
  search?: string;
}
