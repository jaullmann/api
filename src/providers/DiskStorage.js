const fs = require("fs");
const path = require("path");
const uploadConfig = require("../configs/upload");

class diskStorage {
  async saveFile(file) {
    if (!fs.existsSync(uploadConfig.TMP_FOLDER)) {
      fs.mkdirSync(uploadConfig.TMP_FOLDER);
    }

    if (!fs.existsSync(uploadConfig.UPLOADS_FOLDER)) {
      fs.mkdirSync(uploadConfig.UPLOADS_FOLDER);
    }

    await fs.promises.rename(
      path.resolve(uploadConfig.TMP_FOLDER, file),
      path.resolve(uploadConfig.UPLOADS_FOLDER, file)
    );

    return file;
  }

  async deleteFile(file) {
    const filePath = path.resolve(uploadConfig.UPLOADS_FOLDER, file);
    
    try {
      await fs.promises.stat(filePath);
    } catch(e) {
      console.log(e)
      return;
    }
    
    await fs.promises.unlink(filePath);
  }  
}

module.exports = diskStorage;