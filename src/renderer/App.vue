<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'mira-backup',
    
  }
</script>

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
  html,body,#app {
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
  }

  ::-webkit-scrollbar {
    height: 12px;
    width: 5px;
    background: #fff;
}

::-webkit-scrollbar-thumb {
    background: rgb(40, 110, 202);
}

::-webkit-scrollbar-corner {
    background: rgb(40, 110, 202);
}
</style>
