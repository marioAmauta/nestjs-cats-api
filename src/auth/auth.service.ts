import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      await this.userService.create({
        ...registerDto,
        password: await bcrypt.hash(registerDto.password, 10),
      });

      return {
        name: registerDto.name,
        email: registerDto.email,
      };
    } catch (error) {
      if (error?.errno === 1062) {
        throw new BadRequestException('Email already exists');
      }

      throw new BadRequestException();
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const foundUser = await this.userService.findOneByEmailWithPassword(loginDto.email);

      if (!foundUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(loginDto.password, foundUser.password);

      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        email: foundUser.email,
        role: foundUser.role,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
        email: foundUser.email,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async profile({ email, role }: { email: string; role: string }) {
    return await this.userService.findOneByEmail(email);
  }
}
