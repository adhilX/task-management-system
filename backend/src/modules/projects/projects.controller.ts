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
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsQueryDto } from './dto/projects-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(@Query() query: ProjectsQueryDto, @CurrentUser() currentUser: any) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    return this.projectsService.findAll(query, {
      id: currentUserIdStr,
      role: currentUser.role,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const project = await this.projectsService.findById(id);
    
    // Security check: if not admin, employee must be in the project team or the project manager
    if (currentUser.role !== UserRole.ADMIN) {
      const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
      
      const managerId = (project.manager && (project.manager as any)._id)
        ? (project.manager as any)._id.toString()
        : project.manager?.toString();

      const isManager = managerId === currentUserIdStr;

      const isTeamMember = project.team.some((member: any) => {
        const memberId = (member && member._id) ? member._id.toString() : member?.toString();
        return memberId === currentUserIdStr;
      });

      if (!isManager && !isTeamMember) {
        throw new ForbiddenException('You do not have access to view this project');
      }
    }
    return project;
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
