import { Controller, Delete, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteUserService } from '../services/delete-user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class DeleteUserController {
  constructor(private readonly deleteUserService: DeleteUserService) {}

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const currentUserIdStr = currentUser._id ? currentUser._id.toString() : (currentUser as any).id?.toString();
    if (currentUserIdStr === id) {
      throw new ForbiddenException('You cannot delete your own admin account');
    }
    return this.deleteUserService.execute(id);
  }
}
