import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const totalUsers = await this.usersService.countAll();
    
    // The first user registered in the system becomes the Admin.
    // Subsequent sign-ups are blocked to prevent unauthorized creation of accounts.
    if (totalUsers > 0) {
      throw new ForbiddenException('Registration is closed. Please ask an Admin to create your account.');
    }

    const newUser = await this.usersService.create({
      ...registerDto,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    return newUser;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // Get user and explicitly select password since Mongoose schema defaults it to select: false
    const user = await this.usersService.findByEmail(email, true);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is deactivated');
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
