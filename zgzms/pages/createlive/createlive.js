const app = getApp();
const userApi = require('../../libraries/user.js');
var pages = getCurrentPages();
// var createLivePusherContext = wx.createLivePusherContext();
// 创建一个页面对象用于控制页面的逻辑
const recorderManager = wx.getRecorderManager();

const innerAudioContext = wx.createInnerAudioContext();
recorderManager.onStart(() => {
  console.log('recorder start')
})
recorderManager.onResume(() => {
  console.log('recorder resume')
})
recorderManager.onPause(() => {
  console.log('recorder pause')
})
recorderManager.onStop((res) => {
  console.log('recorder stop', res)
  const { tempFilePath } = res
})
recorderManager.onFrameRecorded((res) => {
  const { frameBuffer } = res
  console.log('frameBuffer.byteLength', frameBuffer.byteLength)
})

const options = {
  duration: 60000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50
}


Page({
  data: {
    gohome: 0,
    src:'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E06DCBDC9AB7C49FD713D632D313AC4858BACB8DDD29067D3C601481D36E62053BF8DFEAF74C0A5CCFADD6471160CAF3E6A&fromtag=46',
    device:'back',
    flash:'on'
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
  
  

 

  statechange(e) {
    console.log('live-pusher code:', e.detail.code)
  },

  start:function(e){
    recorderManager.start(options);
    recorderManager.onStart(function (res) {
      console.log('开始');
    });
  },

  pause: function (e) {
    recorderManager.pause();
  },

  resume: function (e) {
    recorderManager.resume();
  },
  onReady: function (e) {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio')
  },
  // 语音录制
  audioPlay: function () {
    this.audioCtx.play();
  },
  audioPause: function () {
    this.audioCtx.pause();
  },
  stop: function (e) {
    const that = this;
    recorderManager.stop();
    recorderManager.onStop(function(res){
      console.log(res);  
      that.setData({
        src: res.tempFilePath
      })
      console.log(that.data.src);
      innerAudioContext.src = that.data.src;
    });
    
  },
  //语音播放
  audioPlay: function (e) {
    var that = this;
    innerAudioContext.stop();
    innerAudioContext.play();
  },
  switchCamera:function(e){
    createLivePusherContext.switchCamera();  
  },
  flash:function(e){
    const that = this;
    if(that.data.flash == 'on'){
      console.log('关闭')
      that.setData({
        flash: 'off'
      })
    }else{
      console.log('打开')
      that.setData({
        flash: 'on'
      })
    }
  },
  device: function (e) {
    const that = this;
    if (that.data.device == 'back') {
      that.setData({
        device: 'front'
      })
    } else {
      that.setData({
        device: 'back'
      })
    }
  },
  startRecord() {
    const ctx = wx.createCameraContext()
    ctx.startRecord({
      quality: 'high',
      success: (res) => {
        console.log(res);
      },
      timeoutCallback:(res1) => {
        console.log(res1);
        console.log('录像结束');
      }

    })

  },
  stopRecord() {
    const ctx = wx.createCameraContext()
    ctx.stopRecord({
      quality: 'high',
      success: (res) => {
        console.log(res);
        this.setData({
          src: res.tempThumbPath
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },

  bindButtonTap: function () {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        that.setData({
          src: res.tempFilePath
        })
      }
    })
  }
}) 
