import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { decode } from 'base64-arraybuffer';

import supabase from '../supabase/supabase';
import {
  createNewUser,
  getOtherUsers,
  getUserByUsername,
  updateUser,
} from '../db/queries/userQueries';
import {
  validateLoginUser,
  validateProfile,
  validateRegisterUser,
} from '../validators/userValidators';
import { CustomRequest } from '../types/CustomRequest';

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

export const getUsersToTalk = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      message: 'Unauthorized action',
    });
    return;
  }

  const users = await getOtherUsers(userId);

  res.status(200).json({
    users,
    message: 'Users fetched successfully!',
  });

  return;
};

export const editUserProfile = [
  ...validateProfile,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { userId } = req;

    if (!userId) {
      res.status(403).json({
        message: 'Unauthorized action',
      });
      return;
    }

    let profilePictureURL: string | null = null;

    const { firstName, lastName, username, profilePicture } = req.body;
    const pfpFile = req.file; //Image

    // If User uploads a profile picture
    if (pfpFile) {
      const fileBase64 = decode(pfpFile.buffer.toString('base64'));

      // Adds or replaces profile image in supabase
      const { data, error } = await supabase.storage
        .from('yappin')
        .upload(`Profile ${userId}`, fileBase64, {
          contentType: pfpFile.mimetype,
          upsert: true,
        });

      if (error) {
        console.error(error.message);
        throw error;
      }

      // Gets public URL of uploaded image to store it in DB
      const { data: image } = supabase.storage
        .from('yappin')
        .getPublicUrl(data.path);

      profilePictureURL = `${image.publicUrl}?t=${Date.now()}`; // Public URL
    } else if (profilePicture) {
      profilePictureURL = profilePicture;
    } else {
      // If User does not upload image (intentionally removes it)
      const { data } = await supabase.storage
        .from('yappin')
        .list(`Profile ${userId}`);

      // If User had a profile picture before
      if (data) {
        // Sending no profile picture removes the previously uploaded pfp from supabase
        await supabase.storage.from('yappin').remove([`Profile ${userId}`]);
      }
      //Ensures that URL is removed from DB as well
      profilePictureURL = null;
    }

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

    const updatedProfile = await updateUser(
      userId,
      username,
      firstName,
      lastName,
      profilePictureURL,
    );

    if (!updatedProfile) {
      res.status(401).json({
        message: 'Failed to update Profile!',
      });
      return;
    }

    res.status(200).json({
      user: updatedProfile,
      message: 'Profile updated successfully!',
    });
    return;
  },
];
