/* eslint-disable require-jsdoc */
const fs = require('fs');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {recursive: true});
    }
  }

  writeFile(file, meta) {
    const fileName = +new Date() + meta.filename;
    const path = `${this._folder}/${fileName}`;
    console.log(file);
    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (err) => reject(err));
      file.pipe(fileStream);
      file.on('end', () => resolve(fileName));
    });
  }
}

module.exports = StorageService;
