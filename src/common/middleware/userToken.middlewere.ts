import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';

@Injectable()
export class UserTokenMiddleware implements NestMiddleware {
  constructor(
    @Inject('TOKEN_CLIENT') private readonly redisClient: Redis
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    // 클라이언트 토큰 추출
    const clientToken = authHeader.split(' ')[1];
    const clientSecretKey = 'userToken-server-secret-key';

    try {
      // JWT 토큰 검증 및 uuid 추출
      const decoded = jwt.verify(clientToken, clientSecretKey) as { uuid: string };
      const { uuid } = decoded;

      // Redis에서 userId 조회
      const redisKey = `userToken:${uuid}`;
      const serverToken = await this.redisClient.get(redisKey);
      
      if (!serverToken) {
        return res.status(401).json({ message: '유저토큰이 만료되었거나 조회되지 않습니다.' });
      }

      // Redis에 저장된 서버 토큰에서 userId 추출
      const serverSecretKey = 'serverToken-client-secret-key';
      const serverDecoded = jwt.verify(serverToken, serverSecretKey) as { userId: string };

      // 요청 객체에 userId 추가하여 이후 핸들러에서 사용 가능하게 설정
      req.body.userId = serverDecoded.userId;

      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid token' });
    }
  }

}
