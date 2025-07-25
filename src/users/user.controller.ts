import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/create-user-dto';
import { LoginUserDto } from './dto/login-user-dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './oss';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { MyLogger } from 'src/logger/my.logger';
@Controller('user')
export class UserController {
  private readonly logger = new MyLogger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Get('merge-file')
  mergeFile(@Query('file') fileName: string, @Res() res: Response) {
    const nameDir = 'uploads/' + fileName;

    const files = fs.readdirSync(nameDir);

    let startPos = 0,
      countFile = 0;
    files.map((file) => {
      const filePath = nameDir + '/' + file;
      console.log('filePath | ', filePath);

      const streamFile = fs.createReadStream(filePath);

      streamFile
        .pipe(
          fs.createWriteStream('uploads/merge/' + fileName, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          countFile++;
          console.log('count file | ', countFile);
          if (files.length === countFile) {
            fs.rm(
              nameDir,
              {
                recursive: true,
              },
              () => {},
            );
          }
        });

      startPos += fs.statSync(filePath).size;
    });

    return res.json({
      link: `http://localhost:8080/uploads/merge/${fileName}`,
      fileName,
    });
  }

  @Post('upload/large-file')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadLargeFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { name: string },
  ) {
    console.log('upload file body | ', body);
    console.log('upload file | ', files);

    const fileName = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name;
    const nameDir = 'uploads/chunks-' + fileName;

    if (!fs.existsSync(nameDir)) {
      fs.mkdirSync(nameDir);
    }

    fs.cpSync(files[0].path, nameDir + '/' + body.name);

    fs.rmSync(files[0].path);
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/avatar',
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
      fileFilter: (req, file, cb) => {
        const extName = path.extname(file.originalname).toLowerCase();

        if (['.jpg', '.jpeg', '.png', '.gif'].includes(extName)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed!'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('File uploaded:', file.path);
    return file.path;
  }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }
}
