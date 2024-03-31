import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './users.decorator';
import { UserRequest } from 'src/auth/auth.controller';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ summary: '모든 유저 정보 조회하기' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'id로 유저 조회하기' })
  @ApiOkResponse({ type: UserEntity })
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(+id);
  }

  @UseGuards(AuthGuard)
  @Get('accounts/:accountId')
  @ApiOperation({ summary: 'near accountId로 유저 조회하기' })
  @ApiOkResponse({ type: UserEntity })
  findUserInfoByNearAccountId(@Param('accountId') accountId: string) {
    return this.usersService.findUserInfoByNearAccountId(accountId);
  }

  // @UseGuards(AuthGuard)
  @Get('accounts/:accountId/balance')
  @ApiOperation({ summary: 'near accountId로 유저 onchain balacne 조회하기' })
  @ApiOkResponse({ type: UserEntity })
  getUserBalanceByNearAccountId(@Param('accountId') accountId: string) {
    return this.usersService.getUserBalanceByNearAccountId(accountId);
  }

  @ApiOperation({ summary: 'near 계정 backDB 등록된 skill 내역 조회' })
  @ApiOkResponse()
  @Get(':id/skill')
  async getSkillById(@Param('id') userId: number): Promise<any> {
    return await this.usersService.getSkillWithUserId(+userId);
  }


  // for debug
  @ApiOperation({ summary: 'near 계정 socialDB에 등록된 skill 내역 조회' })
  @ApiOkResponse()
  @Get('/social/:accountId/skill')
  async getSkillByNearAccountId(@Param('nearAccountId') nearAccountId: string): Promise<any> {
    return await this.usersService.getSkillWithNearAccountId(nearAccountId);
  }


  // for debug
  @ApiOperation({ summary: 'skill 정보에 대한 클레임 조회' })
  @ApiOkResponse()
  @Get('skills/:skillId/reward')
  async getSkillRewardBySkillId(@Param('skillId') skillId: number): Promise<any> {
    return await this.usersService.getSkillReward(+skillId);
  }

  @UseGuards(AuthGuard)
  @Get('/skills/:skillId/claim')
  async sendSkillClaim(@Param('skillId') skillId: number, @User() user: UserRequest): Promise<any> {
    return await this.usersService.sendSkillClaim(+skillId, user);
  }
}
