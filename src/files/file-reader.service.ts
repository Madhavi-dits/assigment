import { Injectable } from '@nestjs/common';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { STATUS_CODE } from 'src/utils/statusCode/status-code';
import { RESPONSE_MESSAGES } from 'src/utils/message/message';

@Injectable()
export class ExcelReaderService {
  async readExcel(file): Promise<any[]> {
    try {
      const jsonArray: any[] = [];
      if (file.mimetype === 'application/vnd.ms-excel') {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Assuming you want to read the first sheet
        const worksheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      } else if (file.mimetype === 'text/csv') {
        fs.createReadStream(file.buffer)
          .pipe(csvParser())
          .on('data', (data) => {
            jsonArray.push(data);
          })
          .on('end', () => {
            fs.unlinkSync(file.buffer);
          });
        return jsonArray;
      }
    } catch (error) {
      return error.message
    }
  }

  async exportToExcel(jsonData) {
    try {
      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      fs.writeFileSync('exported_data.xlsx', excelBuffer);
      return {statusCode: STATUS_CODE.OK, message:RESPONSE_MESSAGES.MESSAGE.EXPORTED_DATA_TO_EXCEL}
    } catch (error) {
      return {
        statusCode: STATUS_CODE.BAD_REQUEST, data: error, message: RESPONSE_MESSAGES.MESSAGE.BAD_REQUEST
      }
    }

  }
}



