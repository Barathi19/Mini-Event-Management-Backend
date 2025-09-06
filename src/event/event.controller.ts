import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EventService } from './event.service';
import {
  CreateEventDto,
  GetEventAttendeesQueryDto,
  GetEventsQueryDto,
  RegisterEventDto,
} from './dto/event.dto';
import { IsObjectId } from 'src/common/pipe/isObjectId';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventService.create(createEventDto);
  }

  @Get()
  async getAll(@Query() query: GetEventsQueryDto) {
    return await this.eventService.getAll(query.timezone);
  }

  @Get(':id/attendees')
  async listAttendees(
    @Param('id', IsObjectId) id: string,
    @Query() query: GetEventAttendeesQueryDto,
  ) {
    const { page, limit } = query;
    return await this.eventService.listAttendees(id, page, limit);
  }

  @Post(':id/register')
  async registerEvent(
    @Param('id', IsObjectId) id: string,
    @Body() registerEventDto: RegisterEventDto,
  ) {
    return await this.eventService.registerEvent(id, registerEventDto);
  }
}
