import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  async findAll(@Query() query: TasksQueryDto, @CurrentUser() currentUser: any) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    return this.tasksService.findAll(query, {
      id: currentUserIdStr,
      role: currentUser.role,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const task = await this.tasksService.findById(id);

    // Tenancy Check: if employee, must be the assignee
    if (currentUser.role !== UserRole.ADMIN) {
      const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
      
      const assigneeId = (task.assignee && (task.assignee as any)._id)
        ? (task.assignee as any)._id.toString()
        : task.assignee?.toString();

      const isAssignee = assigneeId === currentUserIdStr;

      if (!isAssignee) {
        throw new ForbiddenException('You do not have permission to view this task');
      }
    }

    return task;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() currentUser: any,
  ) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    return this.tasksService.update(id, updateTaskDto, {
      id: currentUserIdStr,
      role: currentUser.role,
    });
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
