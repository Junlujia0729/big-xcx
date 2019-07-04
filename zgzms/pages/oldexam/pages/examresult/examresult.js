const app = getApp();
const userApi = require('../../../../libraries/user.js');

// 创建一个页面对象用于控制页面的逻辑
Page({
  data: {
    img:'http://imgs.52jiaoshi.com/150526922059b895e4b1f2b.png',
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0, 
    examid:0,
    title:''
  },
  onLoad(params) {
    if (1 == 0 && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      });
    }
    const that = this;
    var id = params.id;
    var title = params.title;
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_GET(app.globalData.mainDomain + "/Home/incorrent/examresult", { id: id}, function (res) {
        console.log(res.data.data);
        const per = parseInt((res.data.data.examresult.personalscore / res.data.data.examresult.totalscore) * 100);

        var timenow = new Date(res.data.data.record.subtime);
        timenow = timenow.getTime();
        var starttime = new Date(res.data.data.record.starttime);
        starttime = starttime.getTime();
        console.log("now=" + timenow+",start="+starttime);
        var _time = parseInt((timenow - starttime) / 1000,10);
        if(_time < 60){
          if (_time >= 0 && _time <= 9) {
            _time = "00:0" + _time;
          }else{
            _time = "00:" + _time;
          }
          that.setData({
            time: _time
          });
        }else{
          var m = parseInt(_time / 60,10);
          if (m >= 0 && m < 9){
            m = "0" + m;
          }
          var s = _time % 60
          if (s >= 0 && s < 9) {
            s = "0" + s;
          }
          that.setData({
            time: m + ':' + s
          });
        }
        that.setData({
          examresult: res.data.data.examresult,
          questions: res.data.data.questions,
          per: per,
          examid: id,
          title: title
        });
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
      title: that.data.title,
      path: '/pages/exam/examdetail/examdetail?id=' + that.data.examid,
      success: function (res1) {
        var scene = 10007;
        if (res1.shareTickets != undefined) {
          scene = 10044;
        }
        userApi.requestAppApi_POST(app.globalData.mainDomain + "/ApiNlpgbg/xcx_share_stat", {
          scene: scene, openid: app.globalData.openId
        }, function (shres) {

        });
        // 转发成功,通过res1.shareTickets[0]获取转发ticket
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
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

  //查看解析
  check:function(e){
    const key = e.currentTarget.dataset.key;
    let that = this;
    wx.navigateTo({
      url: '../examanalysis/examanalysis?id='+that.data.examid+'&key=' + key,
    })
  },
  // 查看某一道题
  checkitem:function(e){
    const index = e.currentTarget.dataset.index;
    let that = this;
    wx.navigateTo({
      url: '../examanalysis/examanalysis?id=' + that.data.examid+'&key=2&index=' + index,
    })
  }
}) 
