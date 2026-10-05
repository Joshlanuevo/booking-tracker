import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { Model } from 'mongoose';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingDocument> {
    try {
      return await this.bookingModel.create(createBookingDto);
    } catch(err: any) {
      if (err?.code !== 11000) throw err;

      const existing = await this.bookingModel
        .findOne({ idempotencyKey: createBookingDto.idempotencyKey })
        .exec();

      if (!existing) throw err;

      const samePayload =
        existing.customerName === createBookingDto.customerName.trim() &&
        existing.destination === createBookingDto.destination &&
        existing.travelDate.getTime() === new Date(createBookingDto.travelDate).getTime() &&
        existing.amount === createBookingDto.amount;

      if (samePayload) return existing;

      throw new ConflictException('Idempotency key already used with a different payload')
    }
  }

  async findAll(): Promise<BookingDocument[]> {
    return this.bookingModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true, runValidators: true })
      .exec();
    
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  async remove(id: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findByIdAndDelete(id).exec();

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }
}