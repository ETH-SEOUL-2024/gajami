import { AppService } from './../app.service';
import { UserRequest } from './../auth/auth.controller';
import { getAdminNearAccount, getNearAccount } from './../common/chains/near';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DidDocument, Skill, User } from '@prisma/client';
import { BN } from 'bn.js';
import { KeyType, PublicKey } from '@near-js/crypto';
import {
  actionCreators
} from '@near-js/transactions';
import { FinalExecutionOutcome, FinalExecutionStatus } from 'near-api-js/lib/providers';
import { baseEncode } from '@near-js/utils';
import { Address, formatEther } from 'viem';
import { MpcContract } from 'src/common/contracts/mpcContract';
import { NearEthAdapter } from 'src/common/adapters/nearAdapter';
import { SkillData } from 'src/common/libs/types';
import { parseNearAmount } from '@near-js/utils';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }
  async create(email: string, userRequest: UserRequest): Promise<User> {
    const createdUser = await this.prisma.user.create({ data: { email, nearAccountId: userRequest.accountId } as CreateUserDto });
    const didDocument = await this.createDidDocument(userRequest.did, email, userRequest.publicKey);
    console.log('didDocument registered!:', didDocument);
    return createdUser;
  }

  upsert(email: string, accountId: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { email },
      update: { nearAccountId: accountId },
      create: { email, nearAccountId: accountId }
    });
  }

  async createDidDocument(did: string, email: string, publicKey: PublicKey): Promise<DidDocument> {
    const publicKeyData = [{
      auth_type: publicKey.keyType == KeyType.ED25519 ? 'ed25519' : '',
      data: baseEncode(publicKey.data),
    }];

    return this.prisma.didDocument.upsert({
      where: {
        id: did,
      },
      update: {
        email,
        publicKey: publicKeyData,
      },
      create: {
        id: did,
        email,
        publicKey: publicKeyData,
        context: ["https://www.w3.org/ns/did/v1"],
      }
    });
  }

  async getUserBalanceByNearAccountId(nearAccountId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { nearAccountId } });
    if (!user) {
      return {
        status: "failed",
        message: "user not exist"
      }
    }

    let responsData = {}
    const nearAccount = await getNearAccount(nearAccountId);
    try {
      const nearBalance = await nearAccount.getAccountBalance();
      console.log('nearBalance:', nearBalance);
      let availableNearToken = 0;
      // if (+nearBalance.available < 0) {
      //   availableNearToken = 0;
      // } else {
      //   availableNearToken = +nearBalance.available / 10 ** 24;
      // }
      availableNearToken = +nearBalance.total / 10 ** 24;

      responsData['nearBalance'] = availableNearToken.toString();
      console.log('nearBalance:', availableNearToken);
    } catch (e) {
      console.log('nearBalance error:', e);
    }

    try {
      const nearEthAdapter = await NearEthAdapter.from(nearAccount);
      const ethBalance = formatEther(await nearEthAdapter.getEthBalance());
      responsData['ethBalance'] = ethBalance;
      console.log('ethBalance:', ethBalance);
    } catch (e) {
      console.log('ethBalance error:', e);
    }

    await this.prisma.userBalance.upsert({
      where: {
        userId: user.id
      },
      update: {
        ethBalance: responsData['ethBalance'],
        nearBalance: responsData['nearBalance']
      },
      create: {
        user: {
          connect: { id: user.id }
        },
        ethBalance: responsData['ethBalance'],
        nearBalance: responsData['nearBalance']
      }
    })

    return {
      status: "success",
      data: responsData
    }
  }

  findOneByNearAccountId(nearAccountId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { nearAccountId } });
  }

  findDidDocumentByDid(did: string): Promise<DidDocument> {
    return this.prisma.didDocument.findUnique({ where: { id: did } });
  }

  async findUserInfoByNearAccountId(nearAccountId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { nearAccountId } });
    if (!user) {
      return {
        status: "failed",
        message: "user not exist"
      }
    }

    await this.getUserBalanceByNearAccountId(nearAccountId);

    const userBalance = await this.prisma.userBalance.findFirst({
      where: { userId: user.id }
    })

    const userSkills = await this.prisma.skill.findMany({
      where: {
        userId: +user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const userEthAddress = await this.getEthAddress(user.nearAccountId);
    return {
      user: {
        id: user.id,
        email: user.email,
        nearAccountId: user.nearAccountId,
        ethAddress: userEthAddress,
        ethBalance: userBalance?.ethBalance || '0',
        nearBalance: userBalance?.nearBalance || '0'
      },
      skills: userSkills
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOneById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async existUserByEmail(email: string): Promise<boolean> {
    return (await this.prisma.user.count({ where: { email } })) > 0;
  }

  async findByNearAccountId(nearAccountId: string) {
    return this.prisma.user.findUnique({ where: { nearAccountId } });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getSkillWithNearAccountId(nearAccountId: string): Promise<any> {
    const adminNearAccount = await getAdminNearAccount();
    const actions = [
      actionCreators.functionCall(
        'get',
        {
          keys: [`${nearAccountId}/profile/skill/**`],
        },
        new BN('200000000000000'),
        new BN('0'),
      ),
    ];

    try {
      const result: FinalExecutionOutcome = await adminNearAccount.signAndSendTransaction({
        receiverId: 'v1.social08.testnet',
        actions,
      });
      const status = result.status as FinalExecutionStatus;
      if ('SuccessValue' in status && status.SuccessValue) {
        const decodedString = Buffer.from(status.SuccessValue, 'base64').toString('utf-8');
        const result = JSON.parse(decodedString);

        return result;
      } else {
        throw new Error('Failed to get skill');
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getSkillWithUserId(userId: number): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return "user not exist";
    }

    return await this.prisma.skill.findFirst({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async sendSkillClaim(skillId: number, userRequest: UserRequest): Promise<any> {
    let user = await this.findOneByNearAccountId(userRequest['accountId']);
    if (!user) {
      return {
        status: "failed",
        message: "user not exist"
      }
    }

    const skill = await this.prisma.skill.findFirst({ where: { id: skillId } });
    if (!skill) {
      return {
        status: "failed",
        message: "skill not exist"
      }
    }

    if (skill.rewarded) {
      return {
        status: "failed",
        message: "skill already rewarded"
      }
    }

    const ethBalance = skill.reward['ethBalance'] || '0';
    const nearBalance = skill.reward['nearBalance'] || '0';

    console.log('sending skill claim... ', user.nearAccountId, ', ethBalance:', ethBalance, ', nearBalance:', nearBalance);

    const userEthAddress = await this.getEthAddress(user.nearAccountId);
    let ethTxHash = await this.sendEther(userEthAddress, ethBalance);

    if (ethTxHash === "Invalid amount") {
      ethTxHash = '';
    }
    const nearOutcome = await this.sendNear(user.nearAccountId, nearBalance);
    let nearTxHash = '';
    if ((nearOutcome !== "Invalid amount" && nearOutcome !== "Transaction Failed;") || ethTxHash) {
      await this.prisma.skill.update({
        where: { id: skillId },
        data: {
          rewarded: true
        }
      });
    }

    console.log('ethTxHash:', ethTxHash, ', nearOutcome:', nearOutcome);
    if (nearOutcome !== "Invalid amount" && nearOutcome !== "Transaction Failed;") {
      nearTxHash = nearOutcome.transaction_outcome.id;
    }
    return {
      status: "success",
      message: "Claim success",
      data: {
        ethBalance: ethBalance,
        ethTxHash: ethTxHash,
        nearBalance: nearBalance,
        nearTxHash: nearTxHash
      }
    }
  }

  // TODO: db에 저장된 skill 정보에 대한 클레임 조회
  async getSkillReward(skillId: number): Promise<any> {
    const skill = await this.prisma.skill.findFirst({ where: { id: skillId } });
    if (!skill) {
      return "skill not exist";
    }

    const skillData = skill.data;
    const { nearBalance, ethBalance } = await this.calculateSkillReward(skillData as SkillData);
    return { skill, 'calculatedNearBalance': nearBalance, 'calculatedEthBalance': ethBalance };
  }

  async addSkill(skillData: SkillData, nearAccountId: string): Promise<Skill> {
    const nearUser = await this.findOneByNearAccountId(nearAccountId);
    if (!nearUser) {
      throw new Error('User not found');
    }

    console.log('skillData:', skillData);

    const { nearBalance, ethBalance } = await this.calculateSkillReward(skillData);
    const userSkill = await this.prisma.skill.create({
      data: {
        data: skillData,
        reward: {
          ethBalance: ethBalance.toString(),
          nearBalance: nearBalance.toString(),
        },
        user: {
          connect: { id: nearUser.id },
        },
      },
    });

    return userSkill;
  }

  async calculateSkillReward(skillData: SkillData): Promise<any> {
    const rewards = {
      eth: {
        go: 0.002,
        solidity: 0.001,
      },
      near: {
        rust: 0.002,
        typescript: 0.001,
        javascript: 0.001,
      },
    };

    let nearBalance = 0;
    let ethBalance = 0;

    const applyRewards = (skillName) => {
      const ethReward = rewards.eth[skillName];
      const nearReward = rewards.near[skillName];

      if (ethReward) {
        ethBalance += ethReward;
      } else if (nearReward) {
        nearBalance += nearReward;
      }
    };

    Object.entries(skillData).forEach(([skillName, grade]) => {
      applyRewards(skillName.toLowerCase());
    });

    console.log(`NEAR Balance: ${nearBalance}, ETH Balance: ${ethBalance}`);
    return { nearBalance, ethBalance };
  }

  async addSkillBySocialDB(socialData: JSON, nearAccountId: string): Promise<any> {
    console.log('socialData:', socialData);
    const data = socialData['data']
    const accountData = data[nearAccountId];

    if (!accountData) {
      return "account not exist";
    }

    const nearUser = await this.findOneByNearAccountId(nearAccountId);
    if (!nearUser) {
      return "user not exist";
    }

    const skillData = accountData['profile']['skill'];
    console.log('skillData:', skillData);
    return await this.prisma.skill.create({
      data: {
        data: skillData,
        user: {
          connect: { id: nearUser.id },
        },
      },
    });
  }

  async getEthAddress(nearAccountId: string): Promise<Address> {
    const derivationPath = "ethereum,1";
    const nearAccount = await getNearAccount(nearAccountId);
    const nearMpcContract: MpcContract = MpcContract.from(nearAccount);

    const sender: Address = await nearMpcContract.deriveEthAddress(derivationPath);
    return sender;
  };

  async sendEther(receiver: Address, amount: any): Promise<string> {
    if (amount <= 0) {
      return "Invalid amount";
    }
    const adminNearAccount = await getAdminNearAccount();
    const nearEthAdapter = await NearEthAdapter.from(adminNearAccount);
    return await nearEthAdapter.signAndSendTransaction({ receiver, amount });
  }

  async sendNear(receiverId: string, amount: number): Promise<any> {
    if (amount <= 0) {
      return "Invalid amount";
    }

    const adminNearAccount = await getAdminNearAccount();
    if (!receiverId.includes('.testnet') && !receiverId.includes('.near')) {
      return "Invalid receiverId. receiverId must be '.testnet' or '.near'";
    }

    try {
      const outcome: FinalExecutionOutcome = await adminNearAccount.sendMoney(receiverId, parseNearAmount(amount + ""));
      if (typeof outcome.status === 'object' && 'Failure' in outcome.status) {
        throw new Error(JSON.stringify(outcome));
      } else {
        console.log('Transaction Successful', outcome);
      }

      return outcome;
    } catch (e) {
      console.log(e);
      return "Transaction Failed;"
    }
  }
}
