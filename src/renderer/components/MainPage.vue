<template>
  <ph-window>
    <ph-toolbar type="header" title="Mira Backup">
    </ph-toolbar>
    <ph-window-content>
      <div class="pane-group">
          <div class="pane pane-sm sidebar">
            <ul class="list-group">
              <li class="list-group-header">
                  <input class="form-control search-input pull-left" v-model="searchTerm" type="text" placeholder="Search for someone">
                  <button class="btn btn-default btn-large add-button pull-left" title="New" 
                  @click="showAddEditDialog = true">
                    <span class="icon icon-plus"></span>
                  </button>
              </li>
              <li class="list-group-item"
              v-for="(item) in getAllReRenderData()"
              :key="item._id"
              :class="{active: item._id == selectedDatas.selectedItemId}"
              @click="selectRowItem(item._id)"
              @dblclick="editRow(item._id)"
              >
                <div class="media-body">
                  <strong>{{item.name}}</strong>
                  <p>{{item.dbtype}} <span class="icon icon-record" style="float:right;" :style="{color:item.active?`#34c84a`:`#fc605b`}"></span></p>
                </div>
              </li>
            </ul>
          </div>
          <div class="pane" style="padding:5px" v-html="logContent">
          </div>
        </div>
    </ph-window-content>
    <ph-toolbar type="footer"/>
    <m-dialog v-model="showAddEditDialog" @approve="saveData" @close="cancelData" :title="`New Backup`">
      <div style="padding:10px;">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="formData.data.name" class="form-control" placeholder="Name">
          </div>
          <div style="width:50%;padding:5px;float:left">

          <div class="form-group" style="width:49%; float:left">
            <label>DB Type</label>
              <select class="form-control"  v-model="formData.data.dbtype">
                <option value="mysql">MySQL / Maria DB</option>
              </select>
          </div>
          <div class="form-group" style="width:49%;margin-left:2%; float:left">
            <label>Host</label>
            <input type="text" v-model="formData.data.dbhost" class="form-control" placeholder="Host">
          </div>
          <div class="form-group" style="width:68%; float:left">
            <label>DB Name</label>
            <input type="text" v-model="formData.data.dbname" class="form-control" placeholder="DB Name">
          </div>
          <div class="form-group" style="width:30%;margin-left:2%; float:left">
            <label>Port</label>
            <input type="text" v-model="formData.data.dbport" class="form-control" placeholder="Port">
          </div>
          <div class="form-group" style="width:49%; float:left">
            <label>User Name</label>
            <input type="text" v-model="formData.data.dbuser" class="form-control" placeholder="User Name">
          </div>
          <div class="form-group" style="width:49%;margin-left:2%; float:left">
            <label>User Password</label>
            <input type="text" v-model="formData.data.dbpass" class="form-control" placeholder="User Password">
          </div>
            <div style="clear:both"></div>
          <button class="btn btn-positive" @click="connectDb">Test Connection</button>
          <br>Status: <span class="icon icon-record" :style="{color:formData.data.statusColor}"></span> {{formData.data.statusMessage}}
        
        </div>
        <div style="width:50%;padding:5px;float:left">
          <div class="form-group">
            <label>Backup Time <small>(CronJop)</small></label>
            <div style="clear:both"></div>
            <select v-model="selectedDatas.selectedCronTimes" class="form-control">
              <option v-for="(item,index) in this.$utils.getDefaultCronTimes()"
              :key="`cronTimes${item.join('')}`"
              :value="item.join('|')"
              >{{index}}</option>
          </select>
          <div style="clear:both;margin-top:5px;"></div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" v-model="formData.data.cron.minute" class="form-control" placeholder="Minute" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" v-model="formData.data.cron.hour" class="form-control" placeholder="Hour" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" v-model="formData.data.cron.dayOfMonth" class="form-control" placeholder="Day of Month" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" v-model="formData.data.cron.month" class="form-control" placeholder="Month" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" v-model="formData.data.cron.dayOfWeek" class="form-control" placeholder="Day of Week" style="text-align:center">
            </div>
            <div style="clear:both"></div>
          </div>

           <div class="form-group">
            <label>Upload Service</label>
            <button class="btn btn-sm btn-positive pull-right" @click="showUploadServicesDialog=true">New</button>

            <select class="form-control" v-model="formData.data.service">
              <option value="" v-show="!allServices.length">Create New Service</option>
              <option v-for="(service,index) in allServices"
              :key="`service-${index}`"
              :value="service._id"
              >{{service.name}}</option>
            </select>
           </div>
          
          <div class="checkbox">
            <label>
              <input type="checkbox" v-model="formData.data.active"> Active
            </label>
          </div>
          
        </div>

     
    
        <div style="clear:both"></div>
      </div>
    </m-dialog>

    <m-dialog v-model="showUploadServicesDialog" @approve="saveService" :title="`Upload Services`">
      <div style="padding:10px;">
          <div class="form-group">
            <label>Upload Service</label>
              <select v-model="selectedDatas.newService" class="form-control">
                <option value="">New</option>
                <option v-for="(service,index) in allServices"
                :key="`service-${index}`"
                :value="service._id"
                >{{service.name}}</option>
              </select>
          </div>
        <div style="padding:5px;float:left" :style="{width: ftpViewOptions.width}">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="formData.service.name" class="form-control" placeholder="Name">
          </div>
          <div class="form-group">
            <label>Service</label>
              <select v-model="formData.service.type" class="form-control">
                <option value="yandexdisk">Yandex.Disk</option>
                <option value="ftp">FTP</option>
              </select>
          </div>
          <button class="btn btn-positive" @click="connect">Connect</button>
          <br>Status: <span class="icon icon-record" :style="{color:formData.service.statusColor}"></span> {{formData.service.statusMessage}}
        </div>

        <div style="width:50%;padding:5px;float:left" v-show="ftpViewOptions.isShow">
         <div class="form-group">
            <label><strong>FTP</strong><br>Host</label>
            <input type="text" class="form-control" v-model="formData.service.ftpHost" placeholder="Host">
          </div>
          <div class="form-group" style="width:49%; float:left">
            <label>User Name</label>
            <input type="text" class="form-control" v-model="formData.service.ftpUser" placeholder="User Name">
          </div>
          <div class="form-group" style="width:49%; float:left;margin-left:2%">
            <label>User Password</label>
            <input type="text" class="form-control" v-model="formData.service.ftpPass" placeholder="User Password">
          </div>
          <div class="form-group" style="width:49%; float:left;">
            <label>Type</label>
              <select v-model="formData.service.ftpType" class="form-control">
                <option value="ftp">FTP</option>
                <option value="sftp">sFTP</option>
              </select>
          </div>
          <div class="form-group" style="width:49%; float:left;margin-left:2%">
            <label>Port</label>
            <input type="text" class="form-control" v-model="formData.service.ftpPort" placeholder="Port">
          </div>
        </div>
        <div style="clear:both"></div>

      </div>
    </m-dialog>
    
  </ph-window>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Dialog from './Dialog/Dialog';
import mysql from 'mysql';
import EasyFtp from 'easy-ftp';

export default {
  components:{'m-dialog':Dialog},
  name: 'main-page',
  data(){
    return {
      showAddEditDialog: false,
      showUploadServicesDialog:false,

      formData: {
        service: {
          name: null,
          type: 'yandexdisk',
          statusColor:'#fc605b',
          statusMessage:'Not Connected',
          ftpType: 'ftp',
          ftpHost: '',
          ftpUser: '',
          ftpPass: '',
          ftpPort: '21',
        },
        data:{
          name: '',
          dbtype: 'mysql',
          dbname: '',
          dbhost: '',
          dbuser: '',
          dbpass: '',
          dbport: '',
          statusColor:'#fc605b',
          statusMessage:'Not Connected',
          cron:{
            minute:'',
            hour:'',
            dayOfMonth:'',
            month:'',
            dayOfWeek:'',
          },
          active: true,
          service: '',
        },
      },

      tokenData: null,

      selectedDatas: {
        newService: '',
        selectedCronTimes: '||||',
        dataId: '',
        selectedItemId : null,
      },

      ftpViewOptions: {
        width: '100%',
        isShow:false,
      },
      logContent:null,

      isSearch : false,
      searchTerm: null,
      searchedData: [],
    };
  },
  computed:{
    ...mapState({
      allServices: state => state.Services.services,
      allDatas: state => state.Datas.datas,
    }),
  },
  mounted(){
    this.$electron.ipcRenderer.on('yandex-oauth-reply',(event,arg) => {
      if(arg.status){
        this.formData.service.statusColor = '#34c84a';
        this.formData.service.statusMessage = 'Connected';
        this.tokenData = arg.token;
      } else {
        this.formData.service.statusColor = '#fc605b';
        this.formData.service.statusMessage = 'Not Connected';
      }
    });

    this.$electron.ipcRenderer.on('hide-window',(event,arg) => {
      this.$utils.logUnWatch(this.selectedDatas.selectedItemId);
    });

    this.$electron.ipcRenderer.on('show-window',(event,arg) => {
      this.$utils.logWatch(this.selectedDatas.selectedItemId);
    });


    this.getAllServices();
    this.getAllDatas();
    this.$utils.watcher.change = (path,id) => {
      this.watchLogFile(id);
    };
  },
  methods:{
    ...mapActions(['getAllServices','addOneServices','updateServices','getAllDatas','addOneDatas','updateDatas']),
    getAllReRenderData(){
      if(this.isSearch) {
        return this.searchedData;
      }
      return this.allDatas;
    },
    connect(){
      switch(this.formData.service.type) {
        case 'yandexdisk':
          this.$electron.ipcRenderer.send('yandex-oauth');
        break;

        case 'ftp':
          this.testConnectFtp();
        break;
      };
    },
    connectDb(){
      if(this.formData.data.dbtype == 'mysql'){
        this.testConnectMysql();
      }
    },
    saveService(dialog){
      if(this.formData.service.name == '') {
        this.$electron.remote.dialog.showMessageBox({title: 'Form Data Error',message: 'Name not null!',buttons:['Ok']});
      }else if(this.formData.service.statusMessage != 'Connected'){
        this.$electron.remote.dialog.showMessageBox({title: 'Form Data Error',message: 'Status must be "Connected". Please, click Connect button.',buttons:['Ok']});
      } else {
        if(this.selectedDatas.newService=="") {
          this.$utils.saveToken(this.formData.service,JSON.stringify(this.tokenData)).then((row) => {
            this.addOneServices(row);
          }).catch((err) => {
            console.log(err);
          });
        }else {
          this.updateService();
        }
        dialog.close();
      }
    },
    saveData(dialog){
      if(this.formData.data.name == '') {
        this.$electron.remote.dialog.showMessageBox({title: 'Form Data Error',message: 'Name not null!',buttons:['Ok']});
      } else if (this.formData.data.dbtype == ''){
        this.$electron.remote.dialog.showMessageBox({title: 'Form Data Error',message: 'Database Type not null!',buttons:['Ok']});
      } else if (this.formData.data.statusMessage != 'Connected!'){
        this.$electron.remote.dialog.showMessageBox({title: 'Form Data Error',message: 'DB Status must be "Connected!". Please, click test connection button.',buttons:['Ok']});
      } else if (this.formData.data.cron.minute == ''
                || this.formData.data.cron.hour == ''
                || this.formData.data.cron.dayOfMonth == ''
                || this.formData.data.cron.month == ''
                || this.formData.data.cron.dayOfWeek == ''
                ){
        this.$electron.remote.dialog.showMessageBox({title: 'Form Data Error',message: 'Backup Times not null!',buttons:['Ok']});
      }else if (this.formData.data.service == '') {
        this.$electron.remote.dialog.showMessageBox({title: 'Form Data Error',message: 'Upload Service not null!',buttons:['Ok']});
      }else {
        if(this.selectedDatas.dataId=="") {
          this.$utils.saveData(this.formData.data).then((row) => {
            this.addOneDatas(row);
            this.resetDataForm();
          }).catch((err) => {
            console.log(err);
          });
        }else {
          this.updateData();
        }
        dialog.close();
      }
    },
    updateService(){
      this.$utils.updateService(this.selectedDatas.newService,this.formData.service).then((numReplaced) => {
        this.updateServices({
          id: this.selectedDatas.newService,
          data: this.formData.service,
        });
        this.selectedDatas.newService="";
      }).catch((err) => {
        console.log(err);
      });
    },
    updateData(){
      this.$utils.updateData(this.selectedDatas.dataId,this.formData.data).then((numReplaced) => {
        this.updateDatas({
          id: this.selectedDatas.dataId,
          data: this.formData.data,
        });
        this.resetDataForm();
      }).catch((err) => {
        console.log(err);
      });
    },
    testConnectMysql(){
      const DBConnectionData={
        host: this.formData.data.dbhost,
        user: this.formData.data.dbuser,
        password: this.formData.data.dbpass,
        database: this.formData.data.dbname,
        port: this.formData.data.dbport ? this.formData.data.dbport : 3306,
      };
      const connection=mysql.createConnection(DBConnectionData);
      connection.connect((err) => {
        if(err) {
          this.formData.data.statusColor =  '#fc605b';;
          this.formData.data.statusMessage = 'Not Connected';
          this.$electron.remote.dialog.showMessageBox({title: 'Connection Error',message:err.toString(),buttons:['Ok']});
        } else {
          this.formData.data.statusColor =  '#34c84a';
          this.formData.data.statusMessage = 'Connected!';
        }
      });
      
    },
    resetDataForm(){
      this.formData.data={
          name: '',
          dbtype: 'mysql',
          dbname: '',
          dbhost: '',
          dbuser: '',
          dbpass: '',
          dbport: '',
          statusColor:'#fc605b',
          statusMessage:'Not Connected',
          cron:{
            minute:'',
            hour:'',
            dayOfMonth:'',
            month:'',
            dayOfWeek:'',
          },
          active: true,
          service: '',
        };
        this.resetServiceForm();
        this.selectedDatas.selectedCronTimes='||||';
        this.selectedDatas.dataId= '';
    },
    resetServiceForm(){
      this.formData.service={
        name: null,
        type: 'yandexdisk',
        statusColor:'#fc605b',
        statusMessage:'Not Connected',
        ftpType: 'ftp',
        ftpHost: '',
        ftpUser: '',
        ftpPass: '',
        ftpPort: '21',
      };
    },
    selectRowItem(itemId){
      this.selectedDatas.selectedItemId=itemId;
    },
    editRow(itemId){
      this.selectedDatas.dataId=itemId;
      const row = this.allDatas.find((item) => item._id==itemId);
      if(row){
        this.formData.data = Object.assign({},row);
        this.showAddEditDialog = true;
      }
    },
    cancelData(){
      this.resetDataForm();
    },
    watchLogFile(val){
      if(val in this.$utils.logs){
        this.$utils.logs[val].getLastLines().then((res) => {
          const lineArr=res.split('\n');
          lineArr.pop();
          this.logContent=lineArr.reverse().join('<br>').replace(/\] ERROR/,'] <strong style="color:red">ERROR</strong>');
        });
      }
    },
    testConnectFtp() {
      const ftp = new EasyFtp();
      const config = {
        host: this.formData.service.ftpHost,
        port: this.formData.service.ftpPort,
        username: this.formData.service.ftpUser,
        password: this.formData.service.ftpPass,
        type : this.formData.service.ftpType
      };

      process.once('uncaughtException', (err) => {
        this.formData.service.statusColor =  '#fc605b';
        this.formData.service.statusMessage = 'Not Connected';
        this.$electron.remote.dialog.showMessageBox({title: 'Connection Error',message:err.toString(),buttons:['Ok']});
      });

      ftp.connect(config);

      ftp.pwd((err,path) => {
        if(err) {
          this.formData.service.statusColor =  '#fc605b';
          this.formData.service.statusMessage = 'Not Connected';
        } else {
          this.formData.service.statusColor =  '#34c84a';
          this.formData.service.statusMessage = 'Connected';
          ftp.close();
        }
      });

      ftp.on('error',(err) => {
        this.formData.data.statusColor =  '#fc605b';;
        this.formData.data.statusMessage = 'Not Connected';
        this.$electron.remote.dialog.showMessageBox({title: 'Connection Error',message:err.toString(),buttons:['Ok']});
      });
    },
  },
  watch:{
    'selectedDatas.newService'(val) {
      let selectedRow="";
      if(val!=""){
        selectedRow = this.allServices.find(item => item._id == val);
        this.formData.service.name=selectedRow.name;
        this.formData.service.type=selectedRow.type;
        this.formData.service.statusColor=selectedRow.statusColor;
        this.formData.service.statusMessage=selectedRow.statusMessage;
        this.formData.service.ftpType=selectedRow.ftpType;
        this.formData.service.ftpHost=selectedRow.ftpHost;
        this.formData.service.ftpUser=selectedRow.ftpUser;
        this.formData.service.ftpPass=selectedRow.ftpPass;
        this.formData.service.ftpPort=selectedRow.ftpPort;

      }else {
        this.resetServiceForm();
      }
    },
    'formData.service.type'(val){
      if(val=='ftp') {
        this.ftpViewOptions.width='50%';
        this.ftpViewOptions.isShow=true;
      }else{
        this.ftpViewOptions.width='100%';
        this.ftpViewOptions.isShow=false;
      }
    },
    'selectedDatas.selectedCronTimes'(val){
      const times=val.split('|');
      this.formData.data.cron.minute=times[0];
      this.formData.data.cron.hour=times[1];
      this.formData.data.cron.dayOfMonth=times[2];
      this.formData.data.cron.month=times[3];
      this.formData.data.cron.dayOfWeek=times[4];
    },
    allDatas(){
      if(this.selectedDatas.selectedItemId==null && this.allDatas.length){
        this.selectedDatas.selectedItemId = this.allDatas[0]._id;
      }
    },
    'selectedDatas.selectedItemId'(val,oldVal){
      if(val!=null) {
        this.$utils.logWatch(val);
        this.watchLogFile(val);
      }
      if(oldVal) {
        this.$utils.logUnWatch(oldVal);
      }
    },
    searchTerm(val){
      if(val!=''){
        this.searchedData = this.allDatas.filter((item) => {
          if(item.name.includes(val))
            return true;
          return false;
        });
        this.isSearch = true;
      }else {
        this.isSearch = false;
        this.searchedData = [];
      }
    }
  },
  
}
</script>

<style lang="scss">
.add-button{
  width: 40px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  height: 32px;
}

.search-input{
  width: calc(100% - 40px);
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}
</style>

