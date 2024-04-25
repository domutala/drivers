import { DataSource, DataSourceOptions } from "typeorm";
import entitys from "./entitys";

export let dataSource: DataSource;

export const ConfigDatabase = () => {
  const config = {
    type: "postgres",
    username: process.env.API_DATABASE_USERNAME || "root",
    password: process.env.API_DATABASE_PASSWORD || "secret",
    database: process.env.API_DATABASE_NAME || "digibank",
    port: process.env.API_DATABASE_PORT || 5432,
    host: process.env.API_DATABASE_HOST || "localhost",
    synchronize: true,
    logging: false,
    entities: entitys,
  };

  return config as DataSourceOptions;
};

export const CreateDatabase = async () => {
  try {
    const config = ConfigDatabase();

    dataSource = new DataSource(config);
  } catch (error) {
    throw error;
  }

  await dataSource.initialize();

  return dataSource;
};
