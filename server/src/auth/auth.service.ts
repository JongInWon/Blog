import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './constant/auth.const';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * TODO
   *  1) registerWithEmail
   *  - email, nickname, password 를 입력받고 사용자를 생성한다.
   *  - 생성이 완료되면 accessToken, refreshToken 을 반환한다.
   *    - 회원가입 후 다시 로그인해주세요 <- 이런 쓸데없는 과정을 방지하기 위해서
   *
   * TODO
   *  2) loginWithEmail
   *    - email, password 를 입력하면 사용자 검증을 진행한다.
   *    - 검증이 완료되면 accessToken, refreshToken 을 반환한다.
   *
   * TODO
   *  3) loginUser
   *    - (1)과 (2)에서 필요한 accessToken, refreshToken 을 반환하는 로직
   *
   * TODO
   *  4) signToken
   *    - (3)에서 필요한 accessToken, refreshToken 을 sign 하는 로직
   *
   * TODO
   *  5) authenticateWithEmailAndPassword
   *    - (2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *      1. 사용자가 존재하는지 확인
   *      2. 비밀번호가 일치하는지 확인
   *      3. 모두 통과되면 찾은 사용자 정보 반환
   *      4. (2)에서 반환된 데이터를 기반으로 토큰 생성
   */

  /**
   * authorization: Basic token
   * authorization: Bearer token
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  // 토큰 검정
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    /**
     * sub: id
     * email: email
     * type: 'access' | 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토른 재발급은 Refresh 토큰만 가능합니다!',
      );
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    /**
     * Payload 에 들어갈 정보
     * - email
     * - sub -> id
     * - type : 'access' | 'refresh'
     */
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    /**
     * compare 파라미터
     * 1. 입력된 비밀번호
     * 2. 기존 해시
     */
    const canPass = await bcrypt.compare(user.password, existingUser.password);

    if (!canPass) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: RegisterUserDto) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
