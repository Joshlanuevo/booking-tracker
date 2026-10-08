import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum';

export class UpdateBookingDto extends PartialType(
  OmitType(CreateBookingDto, ['idempotencyKey'] as const),
) {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
