import path from 'path';
import fs from 'fs';
import readLastLines from 'read-last-lines';
import chokidar from 'chokidar';

function mLogs(opt){
  const def = {
    logDir: '.',
    logFileName: '',
    fileWatch: true,
    watcher: {
      _: null,
      change: (path) => {},
    }
  };
  this.opts = Object.assign({},def,opt);

  this.fileName = path.join(this.opts.logDir,this.opts.logFileName);
  if(!fs.existsSync(this.fileName)) {
    fs.closeSync(fs.openSync(this.fileName, 'w'));
  }
};

mLogs.prototype.watch = function (){
  this.opts.watcher._ = chokidar.watch(this.fileName, {
    persistent: true
  });
  this.opts.watcher._.on('change',(path) => {
    this.opts.watcher.change(path);
  });
};

mLogs.prototype.unwatch = function (){
  this.opts.watcher._.unwatch(this.fileName);
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

mLogs.prototype.getLastLines=async function(linesCount=100){
  return readLastLines.read(this.fileName,linesCount);
};

export default mLogs;