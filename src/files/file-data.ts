import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table
export class FileData extends Model<FileData> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gender: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  age: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  country: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  date: string;
}