import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsDateString()
  travelDate!: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}
