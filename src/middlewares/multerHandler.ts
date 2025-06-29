import multer from 'multer';

const upload = multer();

const multerHandler = upload.single('profilePicture');

export default multerHandler;
