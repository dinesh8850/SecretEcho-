import userModel from '../models/user.model.js';
import * as userService from '../services/user.services.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redi.services.js';

export const  createUserController = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userService.createUser( req.body );
     const token = await user.generateJWT();
 
    delete user._doc.password

         res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).send(error.message);
    }


}

export const loginUserController = async (req, res) => {
   const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
         
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');

 
        if(!user) {
            return res.status(401).json({ 
                message: 'Invalid credentials'
             })
        }

        const isMatch = await user.isVaildPasssword(password);

      

        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid credentials'
             })
        }
        const token = user.generateJWT();
        delete user._doc.password
        res.status(200).json({ user, token });


    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const profileController = async (req, res) => {
    console.log("req.user", req.user);

    res.status(200).json({
        user: req.user
    });
}

export const logoutController = async (req, res) => {
  try {
    const token =
      (req.cookies && req.cookies.token) ||
      (req.headers.authorization?.split(' ')[1]);
    delete user._doc.password
    if (!token) {
      return res.status(400).json({ message: 'Token missing' });
    }

    // Blacklist token for 24 hours
    await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

    // Clear the token cookie
    res.clearCookie('token');

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).send('Server error');
  }
};
