import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCourseDto } from './dto/list-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

interface AuthUser {
  id: string;
  roles?: string[];
}

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@Controller('/api/v1/admin/courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}

  private getAdminId(req: AuthenticatedRequest): string {
    if (!req.user?.id || !req.user.roles?.includes('ADMIN')) {
      throw new ForbiddenException(
        'Only an authenticated institute admin can manages the course',
      );
    }

    return req.user.id;
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCourseDto) {
    const createCourse = this.courseService.create(this.getAdminId(req), dto);
    console.log('the create course =>', createCourse);

    return createCourse;
  }

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query() query: ListCourseDto) {
    const data = this.courseService.listMine(this.getAdminId(req), query);
    console.log('the course lists =>', data);

    return data;
  }

  @Get('/:courseId')
  getOne(
    @Req() req: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    const result = this.courseService.getMine(this.getAdminId(req), courseId);
    console.log('the create course =>', result);

    return result;
  }

  //update the course
  @Patch('/:courseId')
  updateOne(
    @Req() req: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    const result = this.courseService.update(
      this.getAdminId(req),
      courseId,
      dto,
    );
    console.log('the updated course =>', result);

    return result;
  }

  //remove the course
  @Delete('/:courseId')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    const data = this.courseService.remove(this.getAdminId(req), courseId);

    return data;
  }
}
