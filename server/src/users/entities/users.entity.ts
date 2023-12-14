import { Column, Entity, OneToMany } from 'typeorm';
import { PostsModel } from '../../posts/entities/posts.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { Exclude } from 'class-transformer';

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({ message: stringValidationMessage })
  @Length(1, 20, { message: lengthValidationMessage })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(3, 8, { message: lengthValidationMessage })
  /**
   * Request
   * front -> back
   * plain object (JSON) -> class instance (dto)
   *
   * Response
   * back -> front
   * class instance (dto) -> plain object (JSON)
   *
   * toClassOnly: class instance 로 변환될 때만
   * toPlainOnly: plain object 로 변환될 때만
   *
   * 로그인을 할 때 비밀번호를 입력해 백엔드로 전달할 때는 데이터 포멧에 비밀번호가 포함되어야 하기 때문에
   * Response 일 때만 비밀번호를 제거해준다.
   */
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
