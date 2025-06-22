import userModel from '../models/user.model.js';


export const createUser = async ({
    email, password
}) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
 
    const hasPassword = await userModel.hasPassword(password);


    const user = await userModel.create({
        email,
        password: await userModel.hasPassword(password)
    });
    return user;


}