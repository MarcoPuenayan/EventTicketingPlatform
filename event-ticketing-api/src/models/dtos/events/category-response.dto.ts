import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1, description: 'Category ID' })
  categoryId: number;

  @ApiProperty({ example: 'Music', description: 'Category name' })
  name: string;

  @ApiProperty({
    example: 'All music related events',
    description: 'Category description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: '/icons/music.svg',
    description: 'Category icon URL',
    nullable: true,
  })
  iconUrl: string | null;

  @ApiProperty({ example: true, description: 'Is category active' })
  isActive: boolean;

  @ApiProperty({
    example: 25,
    description: 'Number of published events in this category',
  })
  eventCount: number;
}
