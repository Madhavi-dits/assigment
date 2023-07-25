
import { Column, DataType, Table,Model } from 'sequelize-typescript';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address: string;

  @Column({
    type: DataType.ENUM('male', 'female', 'others'),
    allowNull: false,
  })
  gender: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  dob: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resetToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resetTokenExpires: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refreshToken: string;
}