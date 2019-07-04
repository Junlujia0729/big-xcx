// pages/jobs/pages/savevideo/savevideo.js
const app = getApp();
const userApi = require('../../../../libraries/user.js');
var ctx;
var interval = null;
var left_time = 0;
var step_width = 1;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    process: 0,
    src:'',
    upload_picture_list: [],
    jobid: 0,
    index:0,
    length:0,
    uptoken:''
  },
  waiting(){
    wx.showToast({
      title: '正在加载',
    })
  },
  update(res){
    //250ms一次
    this.setData({
      process: this.data.process + step_width / 4
    });
  },
  start(i){
    if (i == 0) {
      this.setData({
        process: 0,
        src: this.data.upload_picture_list[i].path,
        index: i
      });
    }else{
      this.setData({
        src: this.data.upload_picture_list[i].path,
        index: i
      });
    }
  },
  end() {
    const _this = this;
    if (_this.data.index < _this.data.length - 1){
      //播放下一个
      _this.start(_this.data.index + 1);
    }else{
      //从头播放
      _this.start(0);
    }
  },
  back(e){
    wx.navigateBack();
  },
  avconcatVideoes() {
    console.log("avconcatVideoes");
    var that = this;
    var _videoes = that.data.upload_picture_list;
    var proc = 0;
    var total = _videoes.length;
    console.log(_videoes);
    wx.showLoading({
      title: '正在上传',
    })
    userApi.upload_file_server(that, app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token='+that.data.uptoken, _videoes, proc, total, function () {
      let urls = "";
      for (let j = 0; j < that.data.upload_picture_list.length; j++) {
        urls += (that.data.upload_picture_list[j].path_server + ",");
      }
      console.log(that.data.upload_picture_list);
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/xcx_avconcat_videoes", { jobid: that.data.jobid, urls: urls.substr(0, urls.length - 1) }, function (res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          console.log(res.data.data);
          wx.navigateBack({
            delta: 2
          })
        }else{
          wx.showModal({
            title: '上传失败',
            content: res.data.msg,
          })
        }
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    left_time = 600 - options.left_time;

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    this.setData({
      upload_picture_list: prevPage.data.upload_picture_list,
      length: prevPage.data.upload_picture_list.length,
      jobid: prevPage.data.jobid
    });

    console.log(this.data);

    let that = this;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/upload_token", { }, function (res) {
      console.log(res);
      that.setData({
        uptoken: res.data.data.uptoken
      });
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    step_width = ((app.globalData.systemInfo.windowWidth - 50) / left_time) * 2;
    ctx = wx.createVideoContext('video');
    this.start(0);
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