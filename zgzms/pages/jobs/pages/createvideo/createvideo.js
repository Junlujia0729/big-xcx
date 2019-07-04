// pages/jobs/pages/createvideo/createvideo.js
const app = getApp();
const userApi = require('../../../../libraries/user.js');
var ctx;
var interval = null;
var left_time = 600;
var step_width = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    position: 'front', //前置或后置，值为front, back
    flash: 'off', //闪光灯，值为auto, on, off
    process: 0,
    time:'10:00',
    upload_picture_list: [],
    taping:false,
    jobid:0
  },
  flash_change(e){
    this.setData({
      flash: this.data.flash == "off" ? "on" : "off"
    });
  },
  position_change(e) {
    this.setData({
      position: this.data.position == "front" ? "back" : "front"
    });
  },
  stop(e) {
    console.log(e.detail)
  },
  restart(e){
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    const _this = this;
    left_time = 600;
    _this.setData({
      time: '10:00',
      process: 0,
      upload_picture_list: [],
      taping: true
    },function(){
      
      _this.start();

      //开始计时
      interval = setInterval(function () {
        // 分钟位  
        var min = Math.floor(left_time / 60);
        var minStr = min.toString();
        if (minStr.length == 1) minStr = '0' + minStr;

        // 秒位  
        var sec = left_time - min * 60;
        var secStr = sec.toString();
        if (secStr.length == 1) secStr = '0' + secStr;

        _this.setData({
          time: minStr + ':' + secStr,
          process: _this.data.process + step_width
        });
        left_time --;
        if (left_time <= 0) {
          _this.end();
        }
      }.bind(this), 1000);
    });
  },
  start(){
    const _this = this;
    ctx.startRecord({
      success: (res) => {
        console.log("start success");
        
      },
      fail: (res) => {
        console.log("start fail");
      },
      complete: (res) => {
        console.log("start complete");
        console.log(res);
      },
      timeoutCallback: (res) => {
        if (left_time > 1){
          _this.start();
        }
        
        let videoes = _this.data.upload_picture_list;
        videoes.push({ path: res.tempVideoPath, path_server: '', upload_percent: 0 });
        _this.setData({
          upload_picture_list: videoes
        })
      }
    })
  },
  end(){
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    const _this = this;

    _this.setData({
      taping:false
    });
    
    ctx.stopRecord({
      success: (res) => {
        
      },
      fail: (res) => {
        console.log("stop fail");
        console.log(res);
      },
      complete: (res) => {
        console.log("stop complete");
        console.log(res);
        if (res.errMsg == "operateCamera:ok"){
          let videoes = _this.data.upload_picture_list;
          videoes.push({ path: res.tempVideoPath, path_server: '', upload_percent: 0 });
          _this.setData({
            upload_picture_list: videoes
          })
        }
        
        setTimeout(function () {
          wx.navigateTo({
            url: '../savevideo/savevideo?left_time=' + left_time,
          })
        }, 500);
      }
    });
  },
  start_pause(e) {
    const _this = this;
    if (_this.data.taping){
      _this.end();
    }else{
      _this.restart();
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    let jobid = 0;
    if (options.scene && options.scene != "") {
      let scene = decodeURIComponent(options.scene);
      let scparams = scene.split("#");
      jobid = scparams[0];
    } else {
      //jobid = options.id;
      jobid = 1;
    }
    that.setData({
      jobid: jobid
    })
    userApi.xcx_login_new(1, 0, function () {
      
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    step_width = ((app.globalData.systemInfo.windowWidth - 50) / 600) * 2;

    ctx = wx.createCameraContext();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  }
})

function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}