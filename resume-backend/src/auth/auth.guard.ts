import { AuthService } from './auth.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PublicKey, KeyType, Signature } from '@near-js/crypto';
import { baseDecode } from '@near-js/utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    try {
      if (!token) {
        console.log('auth guard failed! no token');
        throw new UnauthorizedException();
      }
      const did = request.headers['x-decentrailized-id']
      if (!did) {
        console.log('auth guard failed! no did');
        throw new UnauthorizedException();
      }

      request['user'] = {
        did: did,
        accountId: did.split(':')[2],
      }
      console.log('request.user:', request['user'])

      const signature = baseDecode(token);
      if (request.path == '/auth/signup') {
        const publicKey = baseDecode(request.headers['x-public-key']);
        const email = request.body['email']
        if (!this.authService.verifySign(signature, publicKey, email)) {
          throw new UnauthorizedException();
        }
        request['user']['publicKey'] = new PublicKey({ keyType: KeyType.ED25519, data: publicKey });
      } else if (request.path == '/auth/login') {
        const publicKey = baseDecode(request.headers['x-public-key']);
        const email = request.body['email']
        if (!this.authService.verifySign(signature, publicKey, email)) {
          throw new UnauthorizedException();
        }
        request['user']['publicKey'] = new PublicKey({ keyType: KeyType.ED25519, data: publicKey });
      } else {
        // const verify = await this.authService.verifySignWithDid(signature, did);
        // console.log('verify:', verify);
        // if (!verify) {
        //   throw new UnauthorizedException();
        // }
        const publicKey = baseDecode(request.headers['x-public-key']);
        request['user']['publicKey'] = new PublicKey({ keyType: KeyType.ED25519, data: publicKey });
        if (!this.authService.verifySign(signature, publicKey, did)) {
          throw new UnauthorizedException();
        }
      }
      return true;
    } catch (e) {
      console.log('auth guard failed!\n', e);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}