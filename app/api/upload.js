import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing form data' });
        return;
      }

      const file = files.file;
      const newPath = path.join(form.uploadDir, `${fields.roomId}-${file.name}`);
      fs.renameSync(file.path, newPath);

      const relativeUrl = `/uploads/${fields.roomId}-${file.name}`;
      res.status(200).json({ url: relativeUrl });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}