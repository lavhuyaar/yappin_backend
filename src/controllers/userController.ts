import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { createNewUser, getUserByUsername } from '../db/queries/userQueries';
import {
  validateLoginUser,
  validateRegisterUser,
} from '../validations/userValidations';

const SECRET_KEY: string = process.env.JWT_SECRET_KEY as string;

export const registerUser = [
  ...validateRegisterUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, firstName, lastName, password, profilePicture } =
      req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(409).json({
        errors: errors.array(),
      });
      return;
    }

    //Checks if username already exists
    const isUsernameExists = await getUserByUsername(username);

    if (isUsernameExists) {
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

export const loginUser = [
  ...validateLoginUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(409).json({
        errors: errors.array(),
      });

      return;
    }

    const { username, password } = req.body;

    const user = await getUserByUsername(username);

    if (!user) {
      res.status(404).json({
        message: "This username doesn't exists!",
      });
      return;
    }

    const match = await bcrypt.compare(password, user.password.trim());

    if (!match) {
      res.status(409).json({
        message: 'Incorrect password!',
      });

      return;
    }

    //JWT Token
    const token: string = jwt.sign({ user }, SECRET_KEY, {
      expiresIn: '7 days', //Valid for 7 days
    });
    res.status(200).json({
      user,
      token,
    });
    return;
  },
];
