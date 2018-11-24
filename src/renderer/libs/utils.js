import nedb from 'nedb';
import {machineIdSync} from 'node-machine-id';
import Cryptr from 'cryptr';
import {remote} from 'electron';
import fs from 'fs';
import path from 'path';
import v4 from 'uuid/v4';

export default {
  db: {
    service:null,
    data: null,
  },
  cryptr: null,
  init(){
    if(this.db.service == null) {
      this.dbInit();
      this.cryptrInit();
      this.tokenInit();
    }
  },
  getDbPath(){
    return remote.app.getPath('userData');
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
  saveService(payload){
    return new Promise((resolve,reject) => {
      this.db.service.insert(payload,(err, newDoc)=>{
        if(err) reject(err);
        resolve(newDoc);
      });
    });
  },
  updateService(id,payload){
    return new Promise((resolve,reject) => {
      console.log(id,payload);
      this.db.service.update({_id: id},{ $set: payload },{upsert:false},(err, numReplaced)=>{
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
    payload._token = fileName;
    return this.saveService(payload);
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
}