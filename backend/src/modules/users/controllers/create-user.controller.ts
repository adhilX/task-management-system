import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserService } from '../services/create-user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.createUserService.execute(createUserDto);
  }
}
