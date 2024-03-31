import { PublicKey } from '@near-js/crypto';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { User } from 'src/users/users.decorator';

export class SignRequest {
  @ApiProperty({
    description: 'User Email',
    example: 'test@gmail.com',
  })
  email: string
}

export class UserRequest {
  accountId: string
  did: string
  publicKey: PublicKey
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'near 계정 signup' })
  @Post('signup')
  async signup(@Body() signRequest: SignRequest, @User() userRequest: UserRequest): Promise<any> {
    return await this.authService.signup(signRequest, userRequest);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'near 계정 login' })
  @Post('login')
  async login(@Body() signRequest: SignRequest, @User() user: UserRequest): Promise<any> {
    return await this.authService.login(signRequest, user.accountId, user.publicKey);
  }
}
