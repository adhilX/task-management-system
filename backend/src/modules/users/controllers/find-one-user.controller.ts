import { Controller, Get, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindOneUserService } from '../services/find-one-user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class FindOneUserController {
  constructor(private readonly findOneUserService: FindOneUserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    if (currentUser.role !== UserRole.ADMIN && currentUserIdStr !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.findOneUserService.execute(id);
  }
}
