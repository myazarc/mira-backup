import path from 'path';
import fs from 'fs';

function mLogs(opt){
  const def = {
    logDir: '.',
    logFileName: '',
    useDate: true,
  };

  this.opts = Object.assign({},def,opt);

  this.fileName = path.join(this.opts.logDir,this.opts.logFileName);
  if(!fs.existsSync(this.fileName)) {
    fs.closeSync(fs.openSync(this.fileName, 'w'));
  }
};

mLogs.prototype.info = function (message) {
  let line = `[${new Date().toLocaleString('tr-TR')}] INFO ${message}\r\n`;
  fs.appendFileSync(this.fileName,line);
  return line;
};

mLogs.prototype.error = function(message) {
  let line = `[${new Date().toLocaleString('tr-TR')}] ERROR ${message}\r\n`;
  fs.appendFileSync(this.fileName,line);
  return line;
};

mLogs.prototype.custom = function(message,type='') {
  let line = `[${new Date().toLocaleString('tr-TR')}] ${type} ${message}\r\n`;
  fs.appendFileSync(this.fileName,line);
  return line;
};

export default mLogs;