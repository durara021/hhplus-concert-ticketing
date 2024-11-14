import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const baseDBConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'qwe124!@$',
  database: 'ticketing',
  entities: [__dirname + '/**/entities/**/*.entity{.ts,.js}'],
  synchronize: true,
  extra: {
    connectionLimit: 20,
  },
  logging: true,
};