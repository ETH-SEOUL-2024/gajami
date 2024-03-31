import { Injectable } from '@nestjs/common';
import { configuration } from './common/config/configuration';
import { NearEthAdapter } from './common/adapters/nearAdapter';
import { Address } from "viem";
import { getAdminNearAccount } from './common/chains/near';
import { MpcContract } from './common/contracts/mpcContract';
import { getNearAccount } from './common/chains/near';
import { SCHEMA, SignedDelegate, actionCreators } from '@near-js/transactions';
import { deserialize } from 'borsh';
import { UsersService } from './users/users.service';
import { openAiClient } from './common/ai/openAi';
import { UserRequest } from './auth/auth.controller';

@Injectable()
export class AppService {
  constructor(private userService: UsersService) {
  }
  getHello(): string {
    return 'Hello World!! ' + configuration()['NODE_ENV'];
  }

  // socialDB에 스킬 정보 저장하는 relayer 
  async realySignedTransaction(encodedSignedTx: Uint8Array): Promise<any> {
    const adminNearAccount = await getAdminNearAccount();
    const deserializedTx: SignedDelegate = deserialize(SCHEMA.SignedDelegate, Buffer.from(encodedSignedTx)) as SignedDelegate;
    console.log('deserializedTx:', deserializedTx);
    console.log('actions:', deserializedTx.delegateAction.actions);
    const action = deserializedTx.delegateAction.actions[0];

    try {
      if (action.functionCall?.methodName === 'set') {
        console.log('set');
        console.log('args:', action.functionCall.args);
        const socialData = Buffer.from(action.functionCall.args).toString();
        await this.userService.addSkill(JSON.parse(socialData), deserializedTx.delegateAction.senderId);
      }
      const result = await adminNearAccount.signAndSendTransaction({
        actions: [actionCreators.signedDelegate(deserializedTx)],
        receiverId: deserializedTx.delegateAction.senderId
      });

      console.log('result:', result);
      return result;
    } catch (e) {
      console.log(e);
      return "Transaction Failed";
    }
  }

  async getEthAccount(nearAccountId: string): Promise<Address> {
    const derivationPath = "ethereum,1";
    const nearAccount = await getNearAccount(nearAccountId);
    const nearMpcContract: MpcContract = MpcContract.from(nearAccount);

    const sender: Address = await nearMpcContract.deriveEthAddress(derivationPath);

    const nearEthAdapter = await NearEthAdapter.from(nearAccount);
    const result = await nearEthAdapter.signAndSendTransaction({ receiver: sender, amount: 0.0001 });
    console.log('result:', result);
    return sender;
  };

  async getGptChat(keywords: string, user: UserRequest): Promise<any> {
    const completion = await openAiClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            `You are a sophisticated AI capable of generating personalized fictional development skill assessments based on user input. When provided with development skill keywords, analyze and respond with a fictional grade for each skill. The grades should be in the format of a list of skills with grades A through D. For example, if given the skills "Java, Python, Solidity," your response should be formatted as "skillData: {Java:A},{Python:B},{Solidity:C}". Your assessment should creatively reflect a variety of development skills based on the provided keywords, ensuring a believable and diverse skill profile for each query. and give some reason with prefix 'Explanation:' about caluculation.
            so format Is skillData:..., Explanation:... skillData is array and {key:value} = {skill:grade} and Explanation is string.`,
        },
        {
          role: 'user',
          content: `${keywords} is the user input. Based on these skills, please provide me with some fictional data regarding my development skill levels.`,
        }
      ],
      model: 'gpt-3.5-turbo',
    });

    // console.log('completion:', completion.choices[0]);
    // console.log('user:', user);
    const dataResponse = await this.parseSkillData(completion.choices[0].message.content)

    // todo: 추후 AI 응답과 온체인 데이터 스킬 비교 후 저장하는 프로세스로 이동 필요 
    const skillData = Object.entries(dataResponse.skillData.reduce((acc, cur) => ({ ...acc, ...cur }), {}))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key.toLowerCase()]: value
      }), {});
    const skill = await this.userService.addSkill(skillData, user.accountId);
    const skillNames = dataResponse.skillData.map(skillObject => Object.keys(skillObject)[0]);

    // console.log('skillNames:', skillNames);
    return {
      status: 'success',
      data: {
        skillData: skillNames,
        explanation: dataResponse.explanation,
        skillId: skill.id
      }
    }
  }

  async parseSkillData(content) {
    const parts = content.split('Explanation:');
    let skillDataPart = parts[0].replace('skillData:', '').trim();

    if (skillDataPart[skillDataPart.length - 1] === ',') {
      skillDataPart = skillDataPart.slice(0, -1);
    }

    const explanation = parts[1].trim();

    let formattedSkillDataJsonString = '[' + skillDataPart.replace(/([\w\/.-]+):(\w+)/g, '"$1":"$2"') + ']';
    formattedSkillDataJsonString = formattedSkillDataJsonString.replace(/}{/g, '},{');

    let skillData;
    try {
      skillData = JSON.parse(formattedSkillDataJsonString);
    } catch (error) {
      console.error('Parsing error:', error);
      skillData = [{ Java: 'A' }, { Rust: 'B' }, { Solidity: 'C' }];
    }

    console.log('skillData:', skillData);
    console.log('explanation:', explanation);

    return {
      skillData,
      explanation
    };
  }
}
