import { Injectable } from '@nestjs/common';
import { ExcelReaderService } from './file-reader.service';
import { FileData } from './file-data';
import { InjectModel } from '@nestjs/sequelize';
import { STATUS_CODE } from 'src/utils/statusCode/status-code';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';

@Injectable()
export class FileUploadService {
  constructor(private readonly excelReaderService: ExcelReaderService, @InjectModel(FileData)
  private fileData: typeof FileData) { }

  async uploadFileData(file: any) {
    try {
      const excelData = await this.excelReaderService.readExcel(file);
      let data;
      for (const index of excelData.keys()) {
        if (index) {
          let firstName = excelData[index][1]
          let lastName = excelData[index][2]
          let gender = excelData[index][3]
          let country = excelData[index][4]
          let age = excelData[index][5]
          let date = excelData[index][6]
          if (this.fileData != null) {
            data = await this.fileData.create({ firstName: firstName, lastName: lastName, gender: gender, country: country, age: age, date: date });
          }
          return { statusCode: STATUS_CODE.BAD_REQUEST, message: RESPONSE_MESSAGES.MESSAGE.EXCEL_IMPORTED }
        }
      }
      return excelData;
    } catch (error) {
      return {
        statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
      }
    }

  }
}