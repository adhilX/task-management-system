import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindAllUsersService } from '../services/find-all-users.service';
import { UsersQueryDto } from '../dto/users-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class FindAllUsersController {
  constructor(private readonly findAllUsersService: FindAllUsersService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() query: UsersQueryDto) {
    return this.findAllUsersService.execute(query);
  }
}
