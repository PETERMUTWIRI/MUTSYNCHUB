import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { DataSourceService } from './data-source.service';
import { DataSourceController } from './data-source.controller';
import { WebsocketModule } from '../../interfaces/websocket/websocket.module';

@Module({
  imports: [CacheModule.register(), WebsocketModule],
  controllers: [DataSourceController],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
