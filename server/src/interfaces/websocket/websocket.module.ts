import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DataGateway } from './data.gateway';
import { ConnectionStateService } from './connection-state.service';

@Module({
  imports: [CommonModule],
  providers: [DataGateway, ConnectionStateService],
  exports: [DataGateway, ConnectionStateService],
})
export class WebsocketModule {}
