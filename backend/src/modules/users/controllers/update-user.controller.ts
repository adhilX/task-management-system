import { Controller, Put, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserService } from '../services/update-user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UpdateUserController {
  constructor(private readonly updateUserService: UpdateUserService) {}

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
    return this.updateUserService.execute(id, updateUserDto);
  }
}
