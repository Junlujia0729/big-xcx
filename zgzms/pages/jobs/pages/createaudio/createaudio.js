const app = getApp();
const userApi = require('../../../../libraries/user.js');
var pages = getCurrentPages();

// 录音
const recorderManager = wx.getRecorderManager();
var interval;

const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50
}

Page({
  data: {
    gohome: 0,
    screenHeight:'',
    src:'',
    ap_progress: 0,
    duration:'600',
    state:'stop',
    img:'http://imgs.52jiaoshi.com/1520567563.png',
    countDownMinute: '00',
    countDownSecond: '00'
  },
  onLoad(params) {
    var that = this;
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    if (params.jobid) {
      var jobid = params.jobid;
      that.setData({
        jobid: jobid
      })
    }
    var screenHeight = app.globalData.systemInfo.screenHeight;
    
    initial(that.data.duration,that);
    that.setData({
      screenHeight: screenHeight
    })  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    clearInterval(interval);
    initial(that.data.duration, that);
  },

  onHide:function(){
    const that = this;
    clearInterval(interval);
    initial(that.data.duration, that);
  },
   /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
     
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  
  start:function(e){
    const that = this;
    
    if (that.data.state == 'stop'){
      that.setData({
        state:'start',
        img: 'http://imgs.52jiaoshi.com/1520496881.png'
      })
      recorderManager.start(options);
      //时间统计
      var totalSecond = parseInt(that.data.duration - 1,10);
      interval = setInterval(function () {
        // 秒数  
        var second = totalSecond;

        // 分钟位  
        var min = Math.floor((second) / 60);
        var minStr = min.toString();
        if (minStr.length == 1) minStr = '0' + minStr;

        // 秒位  
        var sec = second - min * 60;
        var secStr = sec.toString();
        if (secStr.length == 1) secStr = '0' + secStr;

        var progress = ((that.data.duration - totalSecond) / that.data.duration) * 100;
        that.setData({
          countDownMinute: minStr,
          countDownSecond: secStr,
          ap_progress: progress
        });
        totalSecond--;
        if (totalSecond < 0) {
          clearInterval(interval);
          //设置结束
          that.setData({
            countDownMinute: '00',
            countDownSecond: '00'
          });
        }
      }.bind(this), 1000); 
    }else{
      that.setData({
        state: 'stop',
        img: 'http://imgs.52jiaoshi.com/1520567563.png'
      })
      that.stop();
    }
  },

  again: function (e) {
    const that = this;
    that.setData({
      state: 'stop',
      img: 'http://imgs.52jiaoshi.com/1520567563.png'
    })
    clearInterval(interval);
    initial(that.data.duration,that);
    setTimeout(function () {
      that.start(options)
    }, 500);
  },
  stop: function (e) {
    const that = this;
    recorderManager.stop();
    clearInterval(interval);
    wx.showLoading({
      title: '录制完成'
    })
    recorderManager.onStop(function(res){
      console.log(res);  
      wx.hideLoading();
      that.setData({
        src: res.tempFilePath,
        new_duration: res.duration
      })
      wx.navigateTo({
        url: '../saveaudio/saveaudio',
      })
    });
    
  },
  //语音播放
  audioPlay: function (e) {
    var that = this;
    innerAudioContext.stop();
    innerAudioContext.play();
  },
  
  //进度条拖动事件
  handleTouchEnd: function (e) {
    console.log(e);
    var that = this;
    var x = e.detail.value;
    var time = e.currentTarget.dataset.time;

    var progress = parseInt(time * x / 100);
    that.setData({
      ap_progress: x
    });
    // that.audioCtx.seek(progress);
  },
}) 

function initial(duration,that){
  // 秒数  
  var second = duration;

  // 分钟位  
  var min = Math.floor((second) / 60);
  var minStr = min.toString();
  if (minStr.length == 1) minStr = '0' + minStr;

  // 秒位  
  var sec = second - min * 60;
  var secStr = sec.toString();
  if (secStr.length == 1) secStr = '0' + secStr;
  that.setData({
    countDownMinute: minStr,
    countDownSecond: secStr
  })
}
