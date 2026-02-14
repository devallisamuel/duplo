import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(registerDto);

      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`User registered successfully: ${user.email}`);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Registration error: ${errorMessage}`);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);

      if (!user) {
        this.logger.warn(`Login attempt with invalid email: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      try {
        const isPasswordValid = await this.usersService.validatePassword(
          loginDto.password,
          user.password,
        );

        if (!isPasswordValid) {
          this.logger.warn(`Invalid password for user: ${loginDto.email}`);
          throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        this.logger.log(`User logged in successfully: ${user.email}`);

        return {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Password validation error: ${errorMessage}`);
        throw new InternalServerErrorException('Login failed');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Login error: ${errorMessage}`);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async validateUser(userId: string) {
    try {
      return await this.usersService.findById(userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`User validation error: ${errorMessage}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
