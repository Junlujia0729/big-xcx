// pages/mine/mine.js

 
const app = getApp();
const userApi = require('../../libraries/user.js')
var countdown = 60;
var settime = function (that) {
  if (countdown == 0) {
    that.setData({
      is_show: true
    })
    countdown = 60;
    return;
  } else {
    that.setData({
      is_show: false,
      last_time: countdown
    })

    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }
    , 1000)
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    loadc:0,
    items:[],
    mobile:false,
    show: true,
    is_show: true,
    cancle:false,
    is_load : false,
    hidden: true
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
    const that = this
    userApi.xcx_login_new(1,0,function(){
      that.setData({ page: 1 , is_load:true});
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/mine_new", { page: 1 },function (res) {
          var datas = res.data.data.classlist;
          for(var i=0;i<datas.length;i++){
            datas[i].lasttime = that.formatTime(datas[i].lasttime);
          }
          // console.log('默认加载获取');
          // console.log(app.globalData.mobile);
          if (app.globalData.mobile == '' && that.data.cancle == false) {
            that.setData({
              mobile: true
            });
          }
          that.setData({
            items: datas,
            loadc : 1
          });
        });
    });
  },
  formatTime:function(time) {
    let unixtime = time
    let unixTimestamp = new Date(unixtime * 1000)
    let Y = unixTimestamp.getFullYear()
    let M = ((unixTimestamp.getMonth() + 1) >= 10 ? (unixTimestamp.getMonth() + 1) : '0' + (unixTimestamp.getMonth() + 1))
    let D = (unixTimestamp.getDate() >= 10 ? unixTimestamp.getDate() : '0' + unixTimestamp.getDate())
    let toDay = Y + '-' + M + '-' + D + ' ' + unixTimestamp.getHours() + ":" + unixTimestamp.getMinutes() + ":" + unixTimestamp.getSeconds();
    return toDay;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "我的课程" });
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    if (app.globalData.mobile == '' && that.data.cancle == false && that.data.is_load == true) {
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/mine_new", { page: 1 }, function (res) {
        var datas = res.data.data.classlist;
        for (var i = 0; i < datas.length; i++) {
          datas[i].lasttime = that.formatTime(datas[i].lasttime);
        }
        that.setData({
          items: datas,
          loadc: 1,
          mobile: true
        });
      });
    } else {
      that.setData({
        mobile: false
      });
    }
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
    userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/mine_new", { page: 1 }, function (res) {
      var datas = res.data.data.classlist;
      for (var i = 0; i < datas.length; i++) {
        datas[i].lasttime = that.formatTime(datas[i].lasttime);
      }
      that.setData({
        items: datas,
        loadc: 1,
      });
    });
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const that = this;
    var tpg = that.data.page + 1;
    userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/mine_new", { page: tpg }, function (res) {
      that.setData({ page: tpg });
      var datas = res.data.data.classlist;
      var itms = that.data.items;
      if (datas.length){
        for (var i = 0; i < datas.length; i++) {
          datas[i].lasttime = that.formatTime(datas[i].lasttime);
          itms.push(datas[i]);
        }
        that.setData({
          items: itms,
        });
      }
    })
  },

  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '教师资格证成绩查询',
      path: '/pages/queryscore/queryscore',
      // imageUrl: 'http://www.52jiaoshi.com/download/52_green.jpg',
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
        //console.log(res1.shareTickets[0]);
      },
      fail: function (res1) {
        // 转发失败
        //console.log(res1);
      }
    }
  },

  interview: function () {
    wx.redirectTo({
      url: '../interviewclass/interviewclass',
    })
  },
  interview_jz : function (){
    wx.redirectTo({
      url: '../interviewclass/interviewclass?jz=1',
    })
  },

  bindphone: function (e) {
    this.setData({
      linkphone: e.detail.value
    })
  },

  // 获取验证码
  get_mobile_code: function () {
    var that = this;
    that.setData({
      hidden: !that.data.hidden
    });
    setTimeout(function () {
      if (that.data.linkphone == "") {
        wx.showModal({
          title: '提示',
          content: '亲，手机号码还没有填哦！',
          showCancel: false,
          success: function (res) {

          }
        })
        return false;
      };
      var reg = /^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/;

      var M = that.data.linkphone;
      if (M.length != 11 || !reg.test(M)) {
        wx.showModal({
          title: '提示',
          content: '请输入正确的手机号',
          showCancel: false,
          success: function (res) {

          }
        })
        return false;
      }
      userApi.requestAppApi_POST(app.globalData.mainDomain + "User/wxcsms", {
        mobile: that.data.linkphone,
      }, function (res) {
        console.log(res)
        that.setData({
          hidden: !that.data.hidden
        });
        if (res.data.code == 0) {
          that.setData({
            is_show: false   //false
          })
          settime(that);
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            success: function (res) {

            }
          })
        }
      })
    }, 200);
  },

  checkmobile: function (e) {
    var that = this;
    var mobile = e.detail.value.mobile;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "/App/wxbind", {
      mobile: e.detail.value.mobile,
      captcha: e.detail.value.verifycode
    }, function (res) {
      if (res.data.code == 200) {
        app.globalData.mobile = mobile;
        app.globalData.userToken = res.data.data.token;
        console.log('绑定后获取手机号');
        console.log(app.globalData.mobile);
        that.setData({
          mobile: false,  //false
          cancle: true,
          page: 1
        })
        wx.showToast({
          title: '绑定成功',
        });
        userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/mine_new", { page: 1 },
          function (resn) {
            var datas = resn.data.data.classlist;
            for (var i = 0; i < datas.length; i++) {
              datas[i].lasttime = that.formatTime(datas[i].lasttime);
            }
            that.setData({
              items: datas,
              loadc: 1
            });
          });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false,
          success: function (res) {

          }
        })
      }
    });
  },

  cancle:function(){
    var that=this;
    that.setData({
      mobile: false ,  //false
      cancle: true
    })  
  }
})