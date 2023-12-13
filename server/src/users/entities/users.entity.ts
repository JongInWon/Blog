import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/entities/base.entity';
import { PostsModel } from '../../posts/entities/posts.entity';

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity()
export class UsersModel extends BaseModel {
  @Column()
  email: string;

  @Column({ length: 20, unique: true })
  nickname: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
