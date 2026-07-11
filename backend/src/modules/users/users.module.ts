import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

// Controllers
import { CreateUserController } from './controllers/create-user.controller';
import { FindAllUsersController } from './controllers/find-all-users.controller';
import { FindOneUserController } from './controllers/find-one-user.controller';
import { UpdateUserController } from './controllers/update-user.controller';
import { DeleteUserController } from './controllers/delete-user.controller';

// Services
import { CreateUserService } from './services/create-user.service';
import { FindAllUsersService } from './services/find-all-users.service';
import { FindOneUserService } from './services/find-one-user.service';
import { UpdateUserService } from './services/update-user.service';
import { DeleteUserService } from './services/delete-user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [
    CreateUserController,
    FindAllUsersController,
    FindOneUserController,
    UpdateUserController,
    DeleteUserController,
  ],
  providers: [
    UsersService,
    UsersRepository,
    CreateUserService,
    FindAllUsersService,
    FindOneUserService,
    UpdateUserService,
    DeleteUserService,
  ],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
