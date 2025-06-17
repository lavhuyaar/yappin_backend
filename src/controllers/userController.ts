import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { createNewUser, isUsernameExists } from '../db/queries/userQueries';
import { validateRegisterUser } from '../validations/userValidations';

export const registerUser = [
  ...validateRegisterUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, firstName, lastName, password, profilePicture } =
      req.body;

    if (!username || !firstName || !lastName || !password) {
      res.status(400).json({
        message: 'Missing credentials!',
      });
      return;
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(401).json({
        errors: errors.array(),
      });
      return;
    }

    //Checks if username already exists
    const isUsernameUnavailable: boolean = await isUsernameExists(username);

    if (isUsernameUnavailable) {
      res.status(409).json({
        message: 'Username already exists!',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10); //Hashed password

    const user = await createNewUser({
      username,
      firstName,
      lastName,
      password: hashedPassword,
      profilePicture,
    });

    if (!user) {
      res.status(404).json({
        message: 'Unable to register User!',
      });
      return;
    }

    res.status(201).json({
      message: 'User registered successfully!',
    });
    return;
  },
];
