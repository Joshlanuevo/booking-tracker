import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { getModelToken } from '@nestjs/mongoose';
import { Booking } from './schemas/booking.schema';

// Mongoose queries are chained (findById(id).exec()), so mocks must return { exec }
const execReturning = (value: unknown) => ({ exec: jest.fn().mockResolvedValue(value) });

const mockBookingModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const dto: CreateBookingDto = {
  customerName: 'Josh',
  destination: 'Tokyo',
  travelDate: '2026-12-01',
  amount: 500,
  idempotencyKey: 'abc-1',
}

const booking = { _id: '6ac20299216bf14e3071f731', ...dto, travelDate: new Date(dto.travelDate), status: 'pending' };

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    jest.resetAllMocks(); // fresh mocks per test, so no state leaks between tests

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getModelToken(Booking.name), useValue: mockBookingModel },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('findOne', () => {
    it('throws NotFoundException when the booking does not exist', async () => {
      mockBookingModel.findById.mockReturnValue(execReturning(null));

      await expect(service.findOne(booking._id)).rejects.toThrow(NotFoundException);
      expect(mockBookingModel.findById).toHaveBeenCalledWith(booking._id)
    });
    it('returns the booking when it exists', async () => {
      mockBookingModel.findById.mockReturnValue(execReturning(booking));

      const result = await service.findOne(booking._id);

      expect(result).toEqual(booking);
      expect(mockBookingModel.findById).toHaveBeenCalledWith(booking._id);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the booking does not exist', async () => {
      mockBookingModel.findByIdAndDelete.mockReturnValue(execReturning(null));

      await expect(service.remove(booking._id)).rejects.toThrow(NotFoundException);
      expect(mockBookingModel.findByIdAndDelete).toHaveBeenCalledWith(booking._id)
    });
  });

  describe('create', () => {
    // Test 1
    it('saves a new booking', async () => {
      // Arrange
      mockBookingModel.create.mockResolvedValue(booking);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(booking);
      expect(mockBookingModel.create).toHaveBeenCalledWith(dto);
    });

    it('returns the existing booking when the same request is retried', async () => {
      mockBookingModel.create.mockRejectedValue({ code: 11000 });
      mockBookingModel.findOne.mockReturnValue(execReturning(booking));

      const result = await service.create(dto);

      expect(result).toEqual(booking);
      expect(mockBookingModel.findOne).toHaveBeenCalledWith({ idempotencyKey: dto.idempotencyKey });
    });

    // Test 3
    it('throws ConflictException when the same key is used with a different payload', async () => {
      // Arrange: same ng Test 2
      mockBookingModel.create.mockRejectedValue({ code: 11000 });
      mockBookingModel.findOne.mockReturnValue(execReturning(booking));

      // Act + Assert: iba yung amount, kaya dapat 409
      await expect(service.create({ ...dto, amount: 999 })).rejects.toThrow(ConflictException);
    });

    // Test 4
    it('rethrows errors that are not duplicate-key errors', async () => {
      // Arrange: ibang error, hindi 11000
      mockBookingModel.create.mockRejectedValue(new Error('db down'));

      // Act + Assert
      await expect(service.create(dto)).rejects.toThrow('db down');
      expect(mockBookingModel.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    // Test 5
    it('returns all bookings sorted by newest first', async () => {
      // Arrange: find() → sort() → exec()
      const sort = jest.fn().mockReturnValue(execReturning([booking]));
      mockBookingModel.find.mockReturnValue({ sort });

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([booking]);
      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
