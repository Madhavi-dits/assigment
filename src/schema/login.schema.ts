import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email().optional(),
  password: yup.string().required(),
  phoneNumber : yup.string().optional(),
});