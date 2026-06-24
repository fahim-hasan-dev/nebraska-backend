import fs from 'fs'
import path from 'path'
import { deleteFromR2 } from '../helpers/r2.helper'

const unlinkFile = (file: string) => {
  if (!file) return;

  if (file.startsWith('http://') || file.startsWith('https://')) {
    deleteFromR2(file);
  } else {
    const filePath = path.join('uploads', file)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}

export default unlinkFile
