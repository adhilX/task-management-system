import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { UnauthorizedException, ForbiddenException } from '../../../domain/errors/domain.exception';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IPasswordHasher } from '../../services/password-hasher.interface';
import { ITokenService } from '../../services/token-service.interface';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: any) {
    const user = await this.userRepository.findByEmail(dto.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is deactivated');
    }

    if (dto.portal === 'admin' && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to access the Admin Portal');
    }

    if (dto.portal === 'employee' && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('You are not authorized to access the Employee Portal');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, roleType: user.role };
    const accessToken = this.tokenService.sign(payload);
    const refreshToken = this.tokenService.signRefresh(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      accessToken,
      refreshToken,
    };
  }
}
