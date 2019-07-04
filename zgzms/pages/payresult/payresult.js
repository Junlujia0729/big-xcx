// pages/mine/mine.js

 
const app = getApp();
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classid: 0,
    items:[],
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0, 
    groupid : 0,
    dialog:false,
    platform_ios:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({
      classid: options.id,
      platform_ios: app.globalData.systemInfo.platform ? (app.globalData.systemInfo.platform.toLowerCase() == "ios" || app.globalData.systemInfo.platform.toLowerCase() == "devtools") : 0
    })
    if (options.groupid){
      that.setData({ groupid: options.groupid});
    }
    if (options.orderid) {
      that.setData({ orderid: options.orderid });
    }
    if(that.data.groupid==0){
      //正常购课
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_GET(app.globalData.mainDomain + "Live/pay_success_xcx",
          { classid: that.data.classid }, function (res) {
            console.log(res.data.data);
            var datas = res.data.data;
            that.setData({
              items: datas,
            });
          });
      })
      
    }else{
      //拼课
      userApi.xcx_login_new(1, 0, function () {
        userApi.requestAppApi_POST(app.globalData.mainDomain + "Course/paygroup_success",
          { classid: options.id, groupid: that.data.groupid, orderid: that.data.orderid }, function (res) {
            console.log(res.data.data);
            var datas = res.data.data;
            //循环已加入用户
            var arr = [];
            var arr1 = [];
            for (var j = 0; j < datas.items.length; j++) {
              arr.push(j + 1)
            }
            for (var h = 0; h < (datas.group_number - datas.items.length); h++) {
              arr1.push(h + 1)
            }
            that.setData({
              datas: datas,
              arr: arr,
              arr1: arr1,
              countdown: datas.countdown
            });
            //倒计时
            var totalSecond = datas.countdown;
            var interval = setInterval(function () {
              // 秒数  
              var second = totalSecond;

              // 天数位  
              var day = Math.floor(second / 3600 / 24);
              var dayStr = day.toString();
              if (dayStr.length == 1) dayStr = '0' + dayStr;

              // 小时位  
              var hr = Math.floor((second - day * 3600 * 24) / 3600);
              var hrStr = hr.toString();
              if (hrStr.length == 1) hrStr = '0' + hrStr;

              // 分钟位  
              var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
              var minStr = min.toString();
              if (minStr.length == 1) minStr = '0' + minStr;

              // 秒位  
              var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
              var secStr = sec.toString();
              if (secStr.length == 1) secStr = '0' + secStr;

              that.setData({
                countDownHour: hrStr,
                countDownMinute: minStr,
                countDownSecond: secStr,
              });
              totalSecond--;
              if (totalSecond < 0) {
                clearInterval(interval);
                //设置结束
                that.setData({
                  countDownDay: '00',
                  countDownHour: '00',
                  countDownMinute: '00',
                  countDownSecond: '00',
                });
              }
            }.bind(this), 1000);
          });

        userApi.requestAppApi_GET(app.globalData.mainDomain + "Course/rec_class", { groupid: that.data.groupid }, function (res) {
          console.log(res.data.data);
          that.setData({
            items: res.data.data
          });
        })
      })
      
    } 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "支付成功" });
    
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

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      console.log(res.target);
    }
    return {
      title: '【限时拼课】快来' + that.data.datas.group_price + '元拼' + that.data.datas.classname,
      path: '/pages/sharegroup/sharegroup?id=' + that.data.classid + '&groupid=' + that.data.groupid,
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

  //看课
  look: function () {
    var that = this;
    wx.redirectTo({
      url: '../mineclass/mineclass?id=' + that.data.classid,
    })
  },

  //重新拼课
  spell: function () {
    var that = this;
    wx.navigateTo({
      url: '../classx/classx?id=' + that.data.classid,
    })
  },

  //回到首页
  retuen: function () {
    wx.switchTab({
      url: '../home/home',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  gotoClass: function (e) {
    var pages = getCurrentPages().length;
    if (e.currentTarget.dataset.viewtype == 2) {
      wx.navigateBack({
        delta: pages - 1,
        success: function (res) {
          setTimeout(function () {
            wx.navigateTo({
              url: '../childlist/childlist?id=' + e.currentTarget.dataset.id,
            })
          }, 800);
        }
      })
    } else {
      wx.navigateBack({
        delta: pages - 1,
        success: function (res) {
          // console.log('回调成功跳转详情'); 
          setTimeout(function () {
            wx.navigateTo({
              url: '../classx/classx?id=' + e.currentTarget.dataset.id,
              fail: function (res) {
                console.log(res);
              }
            })
          }, 800);
        }
      })
    }
  },
  // 一键复制
  copy: function (e) {
    var that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            });
            setTimeout(function(){
              that.setData({
                dialog: false
              })
            },1000)
          }
        })
      }
    })
  },

  close:function(e){
    const that =this;
    that.setData({
      dialog:false
    })
  },

  download:function(e){
    const that = this;
    that.setData({
      dialog: true
    })
  },

  returnclass:function(e){
    wx.navigateBack({ 
    })
  }
})