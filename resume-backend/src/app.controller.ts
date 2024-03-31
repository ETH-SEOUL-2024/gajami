import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Address } from "viem";
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { AuthGuard } from './auth/auth.guard';
import { User } from './users/users.decorator';
import { UserRequest } from './auth/auth.controller';

class SendEthRequest {
  @ApiProperty({
    description: 'Receiver address',
    example: '0x15B202a9aef597FD6AF651D3E933B255047acBAd',
  })
  receiverAddress: Address
  @ApiProperty({
    description: 'Amount of Ether to send',
    example: 0.00001,
  })
  amount: number
}

class SendNearRequest {
  @ApiProperty({
    description: 'Receiver Id',
    example: 'testnear999.testnet',
  })
  receiverId: string
  @ApiProperty({
    description: 'Amount of Near to send',
    example: 0.00001,
  })
  amount: number
}

class AiChatRequest {
  @ApiProperty({
    description: 'Chat message',
    example: 'Hello',
  })
  keywords: string
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'meta transaction relay' })
  @ApiOkResponse()
  @Post('relay')
  async relay(@Body() body: any): Promise<any> {
    return await this.appService.realySignedTransaction(body);
  }

  // for debug
  @Get('eth-account/:nearAccountId')
  @ApiOperation({ summary: 'Near 토큰 전송' })
  @ApiOkResponse()
  async getNearAccount(@Param('nearAccountId') nearAccountId: string): Promise<Address> {
    return this.appService.getEthAccount(nearAccountId);
  }

  @UseGuards(AuthGuard)
  @Post('chat')
  @ApiOperation({ summary: 'AI Chat' })
  @ApiOkResponse()
  async aiChat(@Body() aiChatRequest: AiChatRequest, @User() user: UserRequest): Promise<any> {
    return this.appService.getGptChat(aiChatRequest.keywords, user);
  }
}