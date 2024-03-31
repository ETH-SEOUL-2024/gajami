export class SkillClaimResponse {
  ethBalance: string;

  ethTxHash: string;

  nearBalance: string;

  nearTxHash: string;
}
export class SkillResponseInfo {
  skill: string;

  grade: string;
}
export class ChatResponse {
  explanation: string;

  // skillData: SkillResponseInfo[];
  skillData: string[];

  skillId: number;
}

// --------------------------------------------------

export class UserBalance {
  ethBalance: string;

  nearBalance: string;
}

export class SkillDataInfo {
  java: string;

  solidity: string;
}
export class SkillInfo {
  id: number;

  userId: number;

  data: SkillDataInfo;

  reward: JSON;
}
export class UserInfo {
  user: {
    id: number;
    email: string;
    ethAddress: string;
    nearAccountId: string;
    ethBalance: string;
    nearBalance: string;
  };

  skills: SkillInfo[];
}
