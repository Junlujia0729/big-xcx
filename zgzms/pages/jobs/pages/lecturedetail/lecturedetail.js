// pages/mine/mine.js

 
const app = getApp();
const userApi = require('../../../../libraries/user.js')
var WxParse = require('../../../../wxParse/wxParse.js');

const innerAudioContext = wx.createInnerAudioContext();
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items:[],
    play:'http://imgs.52jiaoshi.com/1520215809.png',
    state: 'pause',
    countDownMinute: '00',
    countDownSecond: '00',
    _duration:'0',
    process_time:'00:00'
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    if (options.id) {
      var jobid = options.id;
      that.setData({
        jobid: jobid
      })
    }
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/job_detail", { jobid: jobid},function (res) {
        console.log(res.data)
        var datas = res.data.data;
        datas.publish_time = datas.publish_time.substr(0, 10);
        if (datas.record != '' && datas.record){
          const images = datas.record.result.split(",");
          if (datas.record.update_time){
            datas.record.update_time = datas.record.update_time.substr(0, 10);
            that.setData({
              update_time: datas.record.update_time
            });
          }
          that.setData({
            images: images
          });
        }
        var article = datas.content;
        WxParse.wxParse('article', 'html', article, that, 5);

        innerAudioContext.src = 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46';

        that.setData({
          items: datas
        });
        // 音频播放进度更新
        innerAudioContext.onTimeUpdate(function (res) {
          console.log('111111');
          var currentTime = innerAudioContext.currentTime;
          var duration = innerAudioContext.duration;
          var progress = parseInt((currentTime / duration) * 100);
          that.setData({
            ap_progress: progress,
            process_time: formatTime(duration - currentTime),
            duration: duration
          })
        })
      });
    });

    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "试讲" });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    userApi.xcx_login_new(1, 0, function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/job_detail", { jobid: that.data.jobid }, function (res) {
        var datas = res.data.data;
        datas.publish_time = datas.publish_time.substr(0, 10);
        if (datas.record != '' && datas.record) {
          const images = datas.record.result.split(",");
          if (datas.record.update_time) {
            datas.record.update_time = datas.record.update_time.substr(0, 10);
            that.setData({
              update_time: datas.record.update_time
            });
          }
          that.setData({
            images: images
          });
        }
        var article = datas.content;
        WxParse.wxParse('article', 'html', article, that, 5);
        that.setData({
          items: datas
        });
      });
    });
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
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const that = this
    
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  interview: function () {
    wx.redirectTo({
      url: '../interviewclass/interviewclass',
    })
  },
  interview_jz: function () {
    wx.redirectTo({
      url: '../interviewclass/interviewclass?jz=1',
    })
  },
  complete:function(e){
    const that = this;
    if (that.data.items.type == 1){
      wx.navigateTo({
        url: '../saveimage/saveimage?jobid=' + that.data.jobid,
      })
    } else if (that.data.items.type == 2){
      wx.navigateTo({
        url: '../createvideo/createvideo?jobid=' + that.data.jobid,
      })
    } else if (that.data.items.type == 3){
      wx.navigateTo({
        url: '../createaudio/createaudio?jobid=' + that.data.jobid,
      })
    }
    
  },
  // 预览图片
  previewImage: function (e) {
    const that = this;
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.images // 需要预览的图片http链接列表  
    })
  },

  //语音播放
  audioPlay: function (e) {
    var that = this;
    if (that.data.state == 'pause') {
      that.setData({
        play: 'http://imgs.52jiaoshi.com/1520217356.png',
        state: 'play'
      })
      
      innerAudioContext.play();
      interval = setTimeout(function () {
        var progress = innerAudioContext.duration; 
      }.bind(this), 1000);
    } else {
      that.setData({
        play: 'http://imgs.52jiaoshi.com/1520215809.png',
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
})

function formatTime(seconds) {
  var min = ~~(seconds / 60)
  var sec = parseInt(seconds - min * 60)
  return ('00' + min).substr(-2) + ':' + ('00' + sec).substr(-2)
}