import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  const user = req.user;

  if (!user) {
    // AccessTokenGuard를 통과했을 때 작동하기 때문에 클라이언트 에러가 아닌 서버 에러을 띄운다.
    throw new InternalServerErrorException(
      'Request에 user 프로퍼티가 존재하지 않습니다!',
    );
  }

  return user;
});
