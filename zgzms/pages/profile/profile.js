const app = getApp();
const userApi = require('../../libraries/user.js');
var ctx;

Page({
  data: {
    title: '我的',
    userInfo: {
      wechat: 'WEDN-NET',
      nickName: 'iceStone',
      avatarUrl: '../../images/wechat.jpeg'
    },
    upload_picture_list:[],
  },
  onLoad () {
    userApi.xcx_login_new(1, 0, function () {});
  },
  onReady(){
    
  },
  takePhoto:function(e){
    userApi.xcx_check_mobile_empty()
    console.log("goto");
  }
})
