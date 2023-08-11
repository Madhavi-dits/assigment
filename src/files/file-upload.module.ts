import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExcelReaderService } from './file-reader.service';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileData } from './file-data';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        SequelizeModule.forFeature([FileData]),   
        PassportModule.register({
            defaultStrategy: 'jwt',
            property: 'user',
            session: false,
        }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '2h' },
        }),
    ],
    providers: [ExcelReaderService, FileUploadService],
    controllers: [FileUploadController],
    exports: [SequelizeModule, PassportModule,JwtModule]
})
export class FileUploadModule { }