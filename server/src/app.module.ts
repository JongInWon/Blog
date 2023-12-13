import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [UsersModule, PostsModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
