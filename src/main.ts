import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(3000, '0.0.0.0');
  if (process.env.REHEARSAL_MODE !== 'true') {
    const registry = app.get(SchedulerRegistry);
    Logger.log(
      `Scheduled jobs registered: ${registry.getCronJobs().size}; TZ=${
        process.env.TZ
      }`,
      'Startup',
    );
  }
}
bootstrap();
