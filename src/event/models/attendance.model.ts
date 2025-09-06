import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AttendeeDocument = HydratedDocument<Attendee>;

@Schema()
export class Attendee {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true })
  eventId: string;
}

export const AttendeeSchema = SchemaFactory.createForClass(Attendee);
AttendeeSchema.index({ eventId: 1, email: 1 }, { unique: true });
