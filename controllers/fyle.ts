import {
  Controller,
  Get,
  Res,
  Headers,
  Req,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { FyleService } from 'services/fyle';

@Controller('fyle')
export class FyleController {
  constructor() { }

  @Inject() private readonly service: FyleService

  @Get()
  async get(
    @Headers('range') range: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const fyle = await this.service.getOne({ id: req.query.id })
    if (!fyle) {
      throw new HttpException('file_not_found', HttpStatus.NOT_FOUND);
    }

    const file = fs.readFileSync(join(process.cwd(), '_FILES_', `${fyle.id}.${fyle.type.split('/').pop()}`))


    const head = {
      // 'Content-Length': size,
      'Content-Type': fyle.type,
    };
    res.writeHead(200, head as any);

    const path = join(process.cwd(), '_FILES_', `${fyle.id}.${fyle.type.split('/').pop()}`)

    const stream = fs.createReadStream(path);
    stream.pipe(res);

  }
}