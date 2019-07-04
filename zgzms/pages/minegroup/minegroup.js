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
    is_load : false
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
    userApi.xcx_login_new(1, 0, function () {
      that.setData({ page: 1, is_load:true});
      userApi.requestAppApi_GET(app.globalData.mainDomain + "Course/my_group", {},function (res) {
          console.log(res.data)
          var datas = res.data.data;
          that.setData({
            items: datas,
            loadc : 1
          });
        });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "我的拼课" });
    
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
    const that = this
    
    userApi.requestAppApi_GET(app.globalData.mainDomain + "Course/my_group", {}, function (res) {
      console.log(res.data)
      var datas = res.data.data;
      if (app.globalData.mobile == '' && that.data.cancle == false) {
        that.setData({
          mobile: true
        });
      }
      that.setData({
        items: datas,
        loadc: 1
      });
    });
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
          cancle: true
        })
        wx.showModal({
          title: '提示',
          content: '绑定成功',
          showCancel: false,
          success: function (tres) {
            that.setData({ page: 1 });
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
          }
        })
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
  },

  //看课
  look:function (e) {
    var that = this;
    var classid = e.currentTarget.dataset.classid
    wx.navigateTo({
      url: '../mineclass/mineclass?id=' + classid,
    })
  },

  //重新拼课
  spell: function (e) {
    var that = this;
    var classid = e.currentTarget.dataset.classid
    wx.navigateTo({
      url: '../classx/classx?id=' + classid,
    })
  },
  shareTo : function (e){
    var that = this;
    var groupid = e.currentTarget.dataset.groupid
    wx.navigateTo({
      url: '../groupclass/groupclass?groupid=' + groupid,
    })
  }
})