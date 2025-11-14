import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Date of birth',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    example: 'Passionate event organizer with 10+ years of experience',
    description: 'User bio',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: 'https://johndoe.com',
    description: 'Personal or company website',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    example: 'America/New_York',
    description: 'User timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile image URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;
}

export class UpdateUserOrganizationDto {
  @ApiProperty({
    example: 'ABC Events Inc.',
    description: 'Company name',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    example: 'BL-123456',
    description: 'Business license number',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessLicense?: string;

  @ApiProperty({
    example: '123 Business Ave',
    description: 'Business address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'New York',
    description: 'City',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    example: 'NY',
    description: 'State',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    example: '10001',
    description: 'Zip code',
    required: false,
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({
    example: 'USA',
    description: 'Country',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateUserPreferencesDto {
  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  newBookingNotifications?: boolean;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  cancellationNotifications?: boolean;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  lowInventoryNotifications?: boolean;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  dailyReports?: boolean;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  weeklyReports?: boolean;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  monthlyReports?: boolean;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiProperty({ example: 30, default: 30 })
  @IsOptional()
  sessionTimeout?: number;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  loginNotifications?: boolean;

  @ApiProperty({ example: 'America/New_York', default: 'America/New_York' })
  @IsOptional()
  @IsString()
  defaultTimeZone?: string;

  @ApiProperty({ example: 120, default: 120 })
  @IsOptional()
  defaultEventDuration?: number;

  @ApiProperty({ example: 30, default: 30 })
  @IsOptional()
  defaultTicketSaleStart?: number;

  @ApiProperty({ example: 'flexible', default: 'flexible' })
  @IsOptional()
  @IsString()
  defaultRefundPolicy?: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  autoPublish?: boolean;

  @ApiProperty({ example: 'light', enum: ['light', 'dark'], default: 'light' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ example: 'en', default: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'MM/dd/yyyy', default: 'MM/dd/yyyy' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiProperty({ example: '12h', enum: ['12h', '24h'], default: '12h' })
  @IsOptional()
  @IsString()
  timeFormat?: string;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'blue', default: 'blue' })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiProperty({ example: 'medium', enum: ['small', 'medium', 'large'], default: 'medium' })
  @IsOptional()
  @IsString()
  fontSize?: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  compactMode?: boolean;
}
