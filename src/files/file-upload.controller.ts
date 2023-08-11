import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { ExcelReaderService } from './file-reader.service';
import { STATUS_CODE } from 'src/utils/statusCode/status-code';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly excelReaderService: ExcelReaderService) { }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFileData(@UploadedFile() file:Express.Multer.File) {
    try {
      const filePath = file;
      const data = await this.excelReaderService.readExcel(filePath);
      return data;
    } catch (error) {
      return {
        statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
      }
    }
  }

  @Post('export')
  async exportToExcel(@Body() jsonData: any[]) {
    try {
      const excel = await this.excelReaderService.exportToExcel(jsonData);
    } catch (error) {
      return {
        statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
      }
    }
    
  }
}