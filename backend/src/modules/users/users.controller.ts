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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from './schemas/user.schema';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() query: UsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    if (currentUser.role !== UserRole.ADMIN && currentUserIdStr !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.usersService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    if (currentUser.role !== UserRole.ADMIN) {
      if (currentUserIdStr !== id) {
        throw new ForbiddenException('You can only update your own profile');
      }
      if (updateUserDto.role || updateUserDto.status) {
        throw new ForbiddenException('Employees are not authorized to update roles or account status');
      }
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    if (currentUserIdStr === id) {
      throw new ForbiddenException('You cannot delete your own admin account');
    }
    return this.usersService.delete(id);
  }
}
