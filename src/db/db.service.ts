import { Inject, Injectable } from '@nestjs/common';
import { writeFile, access, readFile } from 'fs/promises';
import { DbModuleOptions } from './db.module';

@Injectable()
export class DbService {
  @Inject('OPTIONS')
  options: DbModuleOptions;

  async write(obj: Record<string, any>) {
    // save database options
    await writeFile(this.options.path, JSON.stringify(obj || []), {
      encoding: 'utf-8',
    });
  }

  async read() {
    const filePath = this.options.path;
    try {
      await access(filePath);

      const data = await readFile(filePath, {
        encoding: 'utf-8',
      });
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      return [];
    }
  }
}
