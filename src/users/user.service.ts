import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user-dto';
import { User } from './entities/user.entity';
import { DbService } from 'src/db/db.service';
import { LoginUserDto } from './dto/login-user-dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly dbService: DbService) {}

  async login(loginUserDto: LoginUserDto) {
    const users: User[] = await this.dbService.read();

    const user = users.find(
      (user) =>
        user.email === loginUserDto.email &&
        user.password === loginUserDto.password,
    );

    if (!user) {
      throw new BadRequestException('Login failed: Invalid credentials');
    }

    if (user.password !== loginUserDto.password) {
      throw new BadRequestException('Login failed: Invalid credentials');
    }

    return user;
  }

  async register(registerUserDto: RegisterUserDto) {
    const users: User[] = await this.dbService.read();

    const userExists = users.find(
      (user) => user.email === registerUserDto.email,
    );

    if (userExists) {
      throw new BadRequestException(
        `User ${registerUserDto.email} already exists`,
      );
    }

    const user = new User();
    user.email = registerUserDto.email;
    user.password = registerUserDto.password;

    users.push(user);
    await this.dbService.write(users);
    return user;
  }
}
