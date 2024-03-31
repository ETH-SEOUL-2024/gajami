import { PublicKey, KeyType } from '@near-js/crypto';
import { Injectable } from '@nestjs/common';
import { sha256 } from 'js-sha256';
import { UsersService } from 'src/users/users.service';
import { SignRequest, UserRequest } from './auth.controller';
import { DidDocument, User } from '@prisma/client';
import { baseDecode } from '@near-js/utils';
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  async signup(signRequest: SignRequest, userRequest: UserRequest): Promise<any> {
    const email = signRequest.email;
    const userExist = await this.usersService.existUserByEmail(email);
    if (userExist) {
      return {
        status: "signup failed",
        mesaage: "user already exist"
      };
    } else {
      const createdUser: User = await this.usersService.create(email, userRequest);

      return createdUser;
    }
  }

  async login(signRequest: SignRequest, accountId: string, publicKey: PublicKey): Promise<any> {
    const email = signRequest.email;
    const userExist = await this.usersService.existUserByEmail(email);
    if (!userExist) {
      const user = await this.usersService.upsert(email, accountId);
      console.log('user created:', user);
    }

    const didDocument = await this.usersService.createDidDocument(`did:near:${accountId}`, email, publicKey);
    console.log('didDocument upsert:', didDocument);


    return {
      status: "login success",
    };
  }

  public async verifySign(signature: Uint8Array, publicKeyData: Uint8Array, email?: string, did?: string, pubKeyType?: KeyType): Promise<boolean> {
    const pubKey: PublicKey = new PublicKey({ keyType: pubKeyType || KeyType.ED25519, data: publicKeyData });

    if (!email && did) {
      const userDid: DidDocument = await this.usersService.findDidDocumentByDid(did);
      email = userDid.email;
    }
    return pubKey.verify(new Uint8Array(sha256.array(email)), signature);
  }

  public async verifySignWithDid(signature: Uint8Array, did: string): Promise<boolean> {
    const userDid: DidDocument = await this.usersService.findDidDocumentByDid(did);
    console.log('userDid:', userDid);

    const authType = userDid.publicKey[0]['auth_type'];
    if (authType !== 'ed25519') {
      throw new Error('invalid public key type');
    }
    // TODO: FIXME
    return this.verifySign(signature, baseDecode(userDid.publicKey[0]['data']), userDid.email);
    // return true;
  }
}
