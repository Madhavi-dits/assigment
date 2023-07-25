import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName : yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    phoneNumber : yup.string().required(),
    address : yup.string().required(),
    dob: yup.string().required(),
    gender: yup.string().required(), 
  });