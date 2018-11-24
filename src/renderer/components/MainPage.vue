<template>
  <ph-window>
    <ph-toolbar type="header" title="Mira Backup">
    </ph-toolbar>
    <ph-window-content>
      <div class="pane-group">
          <div class="pane pane-sm sidebar">
            <ul class="list-group">
              <li class="list-group-header">
                  <input class="form-control search-input pull-left" type="text" placeholder="Search for someone">
                  <button class="btn btn-default btn-large add-button pull-left" title="New" 
                  @click="showAddEditDialog = true">
                    <span class="icon icon-plus"></span>
                  </button>
              </li>
              <li class="list-group-item active">
                <div class="media-body">
                  <strong>Test Connection</strong>
                  <p>3 Times</p>
                </div>
              </li>
              <li class="list-group-item">
                <div class="media-body">
                  <strong>List item title</strong>
                  <p>Lorem ipsum dolor sit amet.</p>
                </div>
              </li>
              <li class="list-group-item">
                <div class="media-body">
                  <strong>List item title</strong>
                  <p>Lorem ipsum dolor sit amet.</p>
                </div>
              </li>
              <li class="list-group-item">
                <div class="media-body">
                  <strong>List item title</strong>
                  <p>Lorem ipsum dolor sit amet.</p>
                </div>
              </li>
              <li class="list-group-item">
                <div class="media-body">
                  <strong>List item title</strong>
                  <p>Lorem ipsum dolor sit amet.</p>
                </div>
              </li>
              <li class="list-group-item">
                <div class="media-body">
                  <strong>List item title</strong>
                  <p>Lorem ipsum dolor sit amet.</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="pane">
          </div>
        </div>
    </ph-window-content>
    <ph-toolbar type="footer"/>
    <m-dialog v-model="showAddEditDialog" :title="`New Backup`">
      <div style="padding:10px;">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class="form-control" placeholder="Name">
          </div>
          <div style="width:50%;padding:5px;float:left">

          <div class="form-group">
            <label>DB Type</label>
              <select class="form-control">
                <option value="mysql">MySQL / Maria DB</option>
              </select>
          </div>
          <div class="form-group">
            <label>Host</label>
            <input type="text" class="form-control" placeholder="Name">
          </div>
          <div class="form-group">
            <label>User Name</label>
            <input type="text" class="form-control" placeholder="Name">
          </div>
          <div class="form-group">
            <label>User Password</label>
            <input type="text" class="form-control" placeholder="Name">
          </div>
          <div class="form-group">
            <label>Port</label>
            <input type="text" class="form-control" placeholder="Name">
          </div>
        </div>
        <div style="width:50%;padding:5px;float:left">
          <div class="form-group">
            <label>Backup Time <small>(CronJop)</small></label>
            <div style="clear:both"></div>
            <select class="form-control">
              <option>Custom</option>
              <option>Every Day 9AM</option>
              <option>Every Day 9AM&9PM</option>
              <option>Every Week Monday</option>
              <option>Every Week Monday&Friday</option>
              <option>Every Month 15.Day</option>
              <option>Every Month 15. & 30.Day</option>
              <option>Option eight</option>
          </select>
          <div style="clear:both;margin-top:5px;"></div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" class="form-control" placeholder="Minute" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" class="form-control" placeholder="Hour" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" class="form-control" placeholder="Day of Month" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" class="form-control" placeholder="Month" style="text-align:center">
            </div>
            <div style="width:18%;float:left; margin:1%;margin-top:0px;">
              <input type="text" class="form-control" placeholder="Day of Week" style="text-align:center">
            </div>
            <div style="clear:both"></div>
          </div>

           <div class="form-group">
            <label>Upload Service</label>
            <button class="btn btn-sm btn-positive pull-right" @click="showUploadServicesDialog=true">New</button>

            <select class="form-control">
              <option value="" v-show="!allServices.length">Create New Service</option>
              <option v-for="(service,index) in allServices"
              :key="`service-${index}`"
              :value="service._id"
              >{{service.name}}</option>
            </select>
           </div>
          
          <div class="checkbox">
            <label>
              <input type="checkbox"> Active
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
        <div style="width:50%;padding:5px;float:left">
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
        <div style="clear:both"></div>

      </div>
    </m-dialog>
    
  </ph-window>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Dialog from './Dialog/Dialog';
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
        },
      },

      tokenData: null,

      selectedDatas: {
        newService: "",
      },
    };
  },
  computed:{
    ...mapState({
      allServices: state => state.Services.services,
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
    this.getAllServices();
  },
  methods:{
    ...mapActions(['getAllServices']),
    connect(){
      if(this.formData.service.type == 'yandexdisk')
        this.$electron.ipcRenderer.send('yandex-oauth', 'getToken');
    },
    saveService(){
      this.$utils.saveToken(this.formData.service,JSON.stringify(this.tokenData)).then((id) => {
        console.log(id);
      }).catch((err) => {
        console.log(err);
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
      }else {
        this.formData.service.name=null;
        this.formData.service.type='yandexdisk';
        this.formData.service.statusColor='#fc605b';
        this.formData.service.statusMessage='Not Connected';
      }
    },
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

