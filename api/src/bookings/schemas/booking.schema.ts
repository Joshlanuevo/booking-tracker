import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BookingStatus } from "../enums/booking-status.enum";

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true }) // adds createdAt / updatedAt automatically
export class Booking {
    @Prop({ required: true, trim: true })
    customerName: string;

    @Prop({ required: true, unique: true })
    idempotencyKey: string;

    @Prop({ required: true })
    destination: string;

    @Prop({ required: true})
    travelDate: Date;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);