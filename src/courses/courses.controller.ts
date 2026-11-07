import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

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
}
