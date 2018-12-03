import nedb from 'nedb';
import {machineIdSync} from 'node-machine-id';
import Cryptr from 'cryptr';
import {remote} from 'electron';
import fs from 'fs';
import path from 'path';
import v4 from 'uuid/v4';
import mysqldump from 'mysqldump';
import AdmZip from 'adm-zip';
import schedule from 'node-schedule';
import EasyFtp from 'easy-ftp';


import { upload,meta } from 'ya-disk';
import { request } from 'https';
import { parse } from 'url';

import mLog from './mlogs';

export default {
  db: {
    service:null,
    data: null,
  },
  logs: {},
  crons: {},
  cryptr: null,
  watcher: {
    change: (path,id) => {

    },
  },
  init(){
    if(this.db.service == null) {
      this.dbInit();
      this.cryptrInit();
      this.tokenInit();
      this.dumpPathInit();
      this.logPathInit();
      this.runCron();
    }
  },
  getDbPath(){
    return remote.app.getPath('userData');
  },
  getLogPath(){
    return path.join(this.getDbPath(),'logs');
  },
  dbInit(){
    this.db.service = new nedb({ filename: path.join(this.getDbPath(),'mira.service'), autoload: true });
    this.db.data = new nedb({ filename: path.join(this.getDbPath(),'mira.data'), autoload: true });
  },
  cryptrInit(){
    this.cryptr = new Cryptr(machineIdSync({original: true}));
  },
  getTokenPath(){
    return path.join(this.getDbPath(),'miratokens');
  },
  tokenInit(){
    if(!fs.existsSync(this.getTokenPath())){
      fs.mkdirSync(this.getTokenPath());
    }
  },
  logPathInit(){
    if(!fs.existsSync(this.getLogPath())){
      fs.mkdirSync(this.getLogPath());
    }
  },
  getDumpPath(){
    return path.join(this.getDbPath(),'dumps');
  },
  dumpPathInit(){
    if(!fs.existsSync(this.getDumpPath())){
      fs.mkdirSync(this.getDumpPath());
    }
  },
  saveService(payload){
    return new Promise((resolve,reject) => {
      this.db.service.insert(payload,(err, newDoc)=>{
        if(err) reject(err);
        resolve(newDoc);
      });
    });
  },
  saveData(payload){
    return new Promise((resolve,reject) => {
      this.db.data.insert(payload,(err, newDoc)=>{
        if(err) reject(err);
        resolve(newDoc);
      });
    });
  },
  updateService(id,payload){
    return new Promise((resolve,reject) => {
      this.db.service.update({_id: id},{ $set: payload },{upsert:false},(err, numReplaced)=>{
        if(err) reject(err);
        resolve(numReplaced);
      });
    });
  },
  updateData(id,payload){
    return new Promise((resolve,reject) => {
      this.db.data.update({_id: id},{ $set: payload },{upsert:false},(err, numReplaced)=>{
        if(err) reject(err);
        resolve(numReplaced);
      });
    });
  },
  saveToken(payload,strifingyToken){
    const fileName = v4();
    const filePath = path.join(this.getTokenPath(),`${fileName}.token`);
    const fileContent = this.cryptr.encrypt(strifingyToken);
    this.createFile(filePath,fileContent);
    payload.token = fileName;
    return this.saveService(payload);
  },
  readToken(tokenFileName){
    const tokenFilePath  = path.join(this.getTokenPath(),`${tokenFileName}.token`);
    const content = fs.readFileSync(tokenFilePath);
    return this.cryptr.decrypt(content);
  },
  createFile(fileName,content){
    fs.writeFileSync(fileName,content);
  },
  allService(){
    return new Promise((resolve,reject) => {
      this.db.service.find({},(err, rows) => {
        if(err) reject(err);
        resolve(rows);
      });
    });
  },
  allData(){
    return new Promise((resolve,reject) => {
      this.db.data.find({},(err, rows) => {
        if(err) reject(err);
        resolve(rows);
      });
    });
  },
  findService(id){
    return new Promise((resolve,reject) => {
      this.db.service.findOne({_id:id},(err, row) => {
        if(err) reject(err);
        resolve(row);
      });
    });
  },
  getDefaultCronTimes(){
    return {
      'Custom':                     ['',   '',      '',      '',  ''],
      'Every Day 9AM':              ['0',  '9',     '*',     '*', '*'],
      'Every Day 9AM&9PM':          ['0',  '9,21',  '*',     '*', '*' ],
      'Every Week Monday':          ['0',  '9',     '*',     '*', '1'],
      'Every Week Monday&Friday':   ['0',  '9',     '*',     '*', '1,5'],
      'Every Month 15.Day':         ['0',  '9',     '15',    '*', '*'],
      'Every Month 15. & 30.Day':   ['0',  '9',     '15,30', '*', '*'],
    };
  },
  async dumpMysql(payload){
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const fileName=path.join(this.getDumpPath(),`${payload.dbname}-${year+'-'+month+'-'+day+'--'+hours+'-'+minutes+'-'+seconds}--mira-backup.sql`);
    const result = await mysqldump({
      dumpToFile: fileName,
      connection:{
        host: payload.dbhost,
        user: payload.dbuser,
        password: payload.dbpass,
        database: payload.dbname,
        port: payload.dbport,
      },
    });
    const zipFileName=`${fileName}.zip`;
    

    
    this.createZip(fileName,zipFileName).then(() => {
        this.removeFile(fileName);
        if(payload.service.type=='yandexdisk'){
          this.yandexDirControl(payload.service.token,zipFileName,payload.item);
        }else if(payload.service.type=='ftp'){
          this.ftpDirControl(zipFileName,payload.item);
        }
    });
  },
  removeFile(fileName){
    fs.unlinkSync(fileName);
  },
  createZip(filePath,zipFilePath){
    const zip = new AdmZip();
    zip.addLocalFile(filePath);
    return new Promise((resolve,reject) => {
      zip.toBuffer((buf) => {
		fs.writeFileSync(zipFilePath,buf);
        resolve(buf);
      },reject);
    });
  },
  ftpDirControl(zipFileName,item){
    const ftp = new EasyFtp();
      const config = {
        host: item.service.ftp.host,
        port: item.service.ftp.port,
        username: item.service.ftp.user,
        password: item.service.ftp.pass,
        type : item.service.ftp.type
      };


      ftp.connect(config);

      ftp.exist("/MiraBackup", (exist) => {
        if(!exist){
          ftp.mkdir("/MiraBackup", (err) => {
            if(err) {
              this.logs[item.id].error(`${item.name} with service ${item.service.name} not created maindir. ERR: ${err.toString()}`); 
              ftp.close();
            } else this.uploadFtp(ftp,zipFileName,item);
          });	
        } else {
          this.uploadFtp(ftp,zipFileName,item);
        }
      });

      ftp.on('error',(e) => {
        this.logs[item.id].error(`${item.name} with service ${item.service.name} not upload completed. ERR: ${e.toString()}`);
        ftp.close();
      });
  },
  uploadFtp(ftp,zipFileName,item){
    ftp.upload(zipFileName, `/MiraBackup/${zipFileName.replace(/^.*[\\\/]/, '')}`, (err) => {
      if(err) {
        this.logs[item.id].error(`${item.name} with service ${item.service.name} not upload completed. ERR: ${err.toString()}`);
        ftp.close();
        return;
      }
      this.removeFile(zipFileName);
      this.logs[item.id].info(`${item.name} with service ${item.service.name} Cron completed with mysql`);
      ftp.close();
    });
  },
  uploadYandex(tokenFile,filePath,item){
    const API_TOKEN = JSON.parse(this.readToken(tokenFile)).access_token;

    setTimeout(() => {

      upload.link(API_TOKEN, `disk:/MiraBackup/${filePath.replace(/^.*[\\\/]/, '')}`, true, ({ href, method }) => {
        const fileStream = fs.createReadStream(filePath);
        const uploadStream = request(Object.assign(parse(href), { method }));
      
        fileStream.pipe(uploadStream);
      
        fileStream.on('end', () => {
          uploadStream.end();
          this.removeFile(filePath);
          this.logs[item.id].info(`${item.name} with service ${item.service.name} Cron completed with mysql`);
        })
        .on('error', (e) => {
          this.logs[item.id].error(`${item.name} with service ${item.service.name} not upload completed. ERR: ${e.toString()}`);
        });
      },(e)=>{
        this.logs[item.id].error(`${item.name} with service ${item.service.name} not upload completed. ERR: ${e.toString()}`);
      });

    },0);
  },
  yandexDirControl(tokenFile,zipFileName,item){
    const API_TOKEN = JSON.parse(this.readToken(tokenFile)).access_token;
    meta.get(API_TOKEN, 'disk:/MiraBackup/', {}, (e) => {
      this.uploadYandex(tokenFile,zipFileName,item);
    },(err) => {
      upload.createDir(API_TOKEN,'disk:/MiraBackup/',false,() => {
        this.uploadYandex(tokenFile,zipFileName,item);
      },(err)=>{
        this.logs[item.id].error(`${item.name} with service ${service.name} not created directory. ERR: ${err.toString()}`);
      })
    });
  },
  runCron(){
    this.allData().then((rows) => {
      rows.forEach((item) => {
        if(item.active){
          if(item.dbtype=='mysql'){
            this.findService(item.service).then((service)=>{
              if(service.statusMessage=='Connected'){
                this.logs[item._id] = new mLog({
                  logDir: this.getLogPath(),
                  logFileName: `${item._id}.log`,
                  watcher: {
                    change: (path) => {
                      this.watcher.change(path,item._id);
                    },
                  }
                });
                const data = {
                  item:{
                    id: item._id,
                    name: item.name,
                    service:{
                      name: service.name,
                      ftp: {
                        user:service.ftpUser,
                        pass:service.ftpPass,
                        host:service.ftpHost,
                        port:service.ftpPort,
                        type:service.ftpType,
                      },
                    },
                  },
                  dbname:item.dbname,
                  dbhost:item.dbhost,
                  dbuser:item.dbuser,
                  dbpass:item.dbpass,
                  dbport:item.dbport,
                  service:{
                    type: service.type,
                    token: service.token,
                  },
                };
                const cron = `${item.cron.minute} ${item.cron.hour} ${item.cron.dayOfMonth} ${item.cron.month} ${item.cron.dayOfWeek}`;
                this.crons[item._id]=schedule.scheduleJob(cron,() => {
                  this.logs[item._id].info(`${item.name} with service ${service.name} Cron start running`);
                  this.dumpMysql(data);
                });
                this.logs[item._id].info(`${item.name} with service ${service.name} Cron added`);
              }
            });
          }
        }
      });
    });
  },
  logWatch(id){
    if(id in this.logs){
      this.logs[id].watch();
    }
  },
  logUnWatch(id){
    if(id in this.logs){
      this.logs[id].unwatch();
    }
  },
}