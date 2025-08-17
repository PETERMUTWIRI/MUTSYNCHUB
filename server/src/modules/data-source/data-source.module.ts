import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';
import { WebsocketModule } from '../../interfaces/websocket/websocket.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CacheModule.register(), WebsocketModule, PassportModule, CommonModule],
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
