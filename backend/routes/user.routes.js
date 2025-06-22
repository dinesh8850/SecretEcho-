import { Router } from 'express';
import * as userController from '../controllers/user.controllers.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

 router.post('/register',
    body('email').isEmail().withMessage('email must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    userController.createUserController);

 router.post('/login',
    body('email').isEmail().withMessage('email must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    userController.loginUserController);   


 router.get('/profile', authMiddleware.authUser, userController.profileController )   


 router.post('/logout', authMiddleware.authUser, userController.logoutController); 


export default router;