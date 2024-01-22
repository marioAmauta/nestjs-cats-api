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
    const foundUser = await this.userService.findOneByEmail(registerDto.email);

    if (foundUser) {
      throw new BadRequestException('Email is already taken');
    }

    return await this.userService.create({
      ...registerDto,
      password: await bcrypt.hash(registerDto.password, 10),
    });
  }

  async login(loginDto: LoginDto) {
    const foundUser = await this.userService.findOneByEmail(loginDto.email);

    if (!foundUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(loginDto.password, foundUser.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: foundUser.name,
      email: foundUser.email,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      email: foundUser.email,
    };
  }
}
