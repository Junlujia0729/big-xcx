const app = getApp();
const userApi = require('../../../../libraries/user.js');
var pages = getCurrentPages();
// var createLivePusherContext = wx.createLivePusherContext();
// 创建一个页面对象用于控制页面的逻辑
const innerAudioContext = wx.createInnerAudioContext();

var interval;
Page({
  data: {
    gohome: 0,
    screenHeight:'',
    src:'',
    ap_progress: 0,
    duration:'',
    play:'http://imgs.52jiaoshi.com/1520501547.png',
    pause:'',
    state:'pause',
    uptoken: ''
  },
  onLoad(params) {
    const that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }


    let audio = [];
    audio.push({ path: prevPage.data.src, path_server: '', upload_percent: 0 });

    that.setData({
      screenHeight: prevPage.data.screenHeight,
      src: prevPage.data.src,
      duration: prevPage.data.new_duration,
      upload_picture_list: audio,
      length: 1,
      jobid: prevPage.data.jobid,
      process_time: formatTime(prevPage.data.new_duration /1000)
    })

    innerAudioContext.src = prevPage.data.src;
    // 音频播放进度更新
    innerAudioContext.onTimeUpdate(function (res) {
      var currentTime = innerAudioContext.currentTime;
      var duration = innerAudioContext.duration;
      var progress = parseInt((currentTime / duration) * 100);
      that.setData({
        ap_progress: progress,
        process_time: formatTime(currentTime),
        duration: duration
      })
    })

    innerAudioContext.onEnded(function (res) {
      innerAudioContext.seek(0);
      that.setData({
        ap_progress: 0,
        process_time: formatTime(prevPage.data.new_duration / 1000),
        play: 'http://imgs.52jiaoshi.com/1520501547.png',
        state: 'pause'
      })
    })

    userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/upload_token", {}, function (res) {
      console.log(res);
      that.setData({
        uptoken: res.data.data.uptoken
      });
    });
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
  
  //语音播放
  audioPlay: function (e) {
    var that = this;
    if(that.data.state == 'pause'){
      
      that.setData({
        play: 'http://imgs.52jiaoshi.com/1520574790.png',
        state:'play'
      })
      innerAudioContext.play();

      interval = setInterval(function () {
        var progress = innerAudioContext.duration; 
      }.bind(this), 1000);
    }else{
      that.setData({
        play: 'http://imgs.52jiaoshi.com/1520501547.png',
        state: 'pause'
      })
      innerAudioContext.pause();
    }
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
    innerAudioContext.seek(progress);
  },

  download:function(e){
    const that = this;
    wx.downloadFile({
      url: that.data.src,
      success: function (res) {
        wx.showLoading({
          title: '正在下载，请稍等',
        })
      },
      fail: function (res) { 
        wx.showModal({
          title: '提示',
          content: '下载失败，是否重新下载',
          success: function(res) {
            if (res.confirm) {
              that.download();
            } else if (res.cancel) {
            }
          },
        })
      }
    })
  },
  submitaudio() {
    console.log("avconcatVideoes");
    var that = this;
    var _audio = that.data.upload_picture_list;
    var proc = 0;
    var total = _audio.length;
    console.log(_audio);
    wx.showLoading({
      title: '正在上传',
    })
    userApi.upload_file_server(that, app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=' + that.data.uptoken, _audio, proc, total, function () {
      let urls = "";
      for (let j = 0; j < that.data.upload_picture_list.length; j++) {
        urls += (that.data.upload_picture_list[j].path_server + ",");
      }
      console.log(that.data.upload_picture_list);
      submitjob(that.data.jobid, urls.substr(0, urls.length - 1))
    });
  }
})

function submitjob(jobid, result) {
  userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/submit_job", { jobid: jobid, result: result }, function (res) {
    console.log(res.data);
    if (res.data.code == 200) {
      wx.hideLoading();
      wx.navigateBack({
        delta: 2
      })
    } else if (res.data.code == 201) {
      console.log(res.code);
      wx.showToast({
        title: res.data.data.msg,
      })
    }
  });
}
function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}
