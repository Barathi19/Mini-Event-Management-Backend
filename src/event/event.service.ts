import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './models/event.model';
import { Model } from 'mongoose';
import { Attendee } from './models/attendance.model';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto, RegisterEventDto } from './dto/event.dto';

interface IAttendeeCounts {
  _id: string;
  count: number;
}

export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Attendee.name) private readonly attendeeModel: Model<Attendee>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<EventDocument> {
    const { name, startTime, location } = createEventDto;

    await this.isEventAlreadyExist(name, new Date(startTime), location);

    const newEvent = new this.eventModel({
      ...createEventDto,
      startTime: new Date(createEventDto.startTime),
      endTime: new Date(createEventDto.endTime),
    });

    return await newEvent.save();
  }

  async getAll(timezone: string = 'Asia/Kolkata') {
    const now = new Date();

    const events = await this.eventModel
      .find({ endTime: { $gte: now } })
      .lean();

    // Get attendee counts for each event
    const eventIds = events.map((e) => e._id);
    const attendeeCounts: IAttendeeCounts[] =
      await this.attendeeModel.aggregate([
        { $match: { eventId: { $in: eventIds } } },
        { $group: { _id: '$eventId', count: { $sum: 1 } } },
      ]);

    const countMap: Record<string, number> = attendeeCounts.reduce(
      (acc, cur) => {
        acc[cur._id.toString()] = cur.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return events.map((event) => {
      const booked = countMap[event._id.toString()] || 0;
      const slotsLeft = event.maxCapacity - booked;

      return {
        ...event,
        startTime: this.formatWithTimezone(event.startTime, timezone),
        endTime: this.formatWithTimezone(event.endTime, timezone),
        booked,
        slotsLeft,
      };
    });
  }

  async getEvent(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    return event;
  }

  async registerEvent(eventId: string, registerEventDto: RegisterEventDto) {
    const event = await this.getEvent(eventId);

    const { email, name } = registerEventDto;

    await this.isEmailAlreadyRegistered(email, eventId);

    const count = await this.attendeeModel.countDocuments({ eventId });
    if (count >= event.maxCapacity)
      throw new BadRequestException('Event is fully booked');

    return await this.attendeeModel.create({
      eventId,
      name,
      email,
    });
  }

  async listAttendees(eventId: string, page = 1, limit = 10) {
    await this.getEvent(eventId);

    const skip = (page - 1) * limit;
    const [attendees, total] = await Promise.all([
      this.attendeeModel
        .find({ eventId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.attendeeModel.countDocuments({ eventId }),
    ]);

    return {
      data: attendees,
      meta: {
        page,
        perPage: limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async isEmailAlreadyRegistered(email: string, eventId: string) {
    const isRegistered = await this.attendeeModel.findOne({ email, eventId });
    if (isRegistered) {
      throw new ConflictException(
        'This email is already registered for the event',
      );
    }
  }

  async isEventAlreadyExist(name: string, startTime: Date, location: string) {
    const startOfDay = new Date(startTime);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startTime);
    endOfDay.setHours(23, 59, 59, 999);

    const isExist = await this.eventModel.findOne({
      name,
      location,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    if (isExist) {
      throw new ConflictException('Event already exists for that day.');
    }
  }

  private formatWithTimezone(date: Date, timezone: string): string {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return date.toISOString();
    }
  }
}
