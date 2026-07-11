import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { UnauthorizedException } from '../../../domain/errors/http.exception';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { BcryptService } from '../../../infrastructure/security/bcrypt.service';
import { JwtService } from '../../../infrastructure/security/jwt.service';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService
  ) {}

  async execute(dto: any) {
    const user = await this.userRepository.findByEmail(dto.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.bcryptService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is deactivated');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
