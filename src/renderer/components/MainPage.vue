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
              <option>Create Upload Service</option>
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

    <m-dialog v-model="showUploadServicesDialog" :title="`Upload Services`">
      <div style="padding:10px;">
          
      </div>
    </m-dialog>
    
  </ph-window>
</template>

<script>
import Dialog from './Dialog/Dialog';
export default {
  components:{'m-dialog':Dialog},
  name: 'main-page',
  data(){
    return {
      showAddEditDialog: false,
      showUploadServicesDialog:false,
    };
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

