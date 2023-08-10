import { Column, DataType, Table, Model, Default } from 'sequelize-typescript';

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
    unique: true,
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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  otp: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  otpExpiration: Date;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN, 
    allowNull: true,
  })
  isVerified: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  passwordUpdateAt: Date;

  @Column({
    type:DataType.ENUM('user', 'admin', 'superadmin'),
    allowNull: true
  })
  role: string;

  @Column({
    type:DataType.STRING,
    allowNull: true
  })
  createdBy: string;

}