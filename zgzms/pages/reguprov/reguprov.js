// pages/reguprov/reguprov.js
const app = getApp()
const userApi = require('../../libraries/user.js')

var gSelectCity = 0;

function initSubMenuDisplay() {
  return ['hidden', 'hidden', 'hidden'];
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectCity: 0,
    selectProv: 0,
    areas:[],
    sharetitle:'教师资格证和教师招聘考试报名简章',
    imgUrls:[],
    swiperHeight: '250rpx',
    regulist:[],
    page:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.reguCity){
      gSelectCity = app.globalData.reguCity;
      that.setData({
        selectCity: app.globalData.reguCity
      });
    }

    if (options.scene && options.scene != "") {
      let scene = decodeURIComponent(options.scene);
      that.setData({
        selectProv: scene,
      });
    }else{
      if (options.id) {
        that.setData({
          selectProv: options.id
        });
      }
    }
    userApi.xcx_login_new(1, 0, function () {
      //取所有的省市
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/regu_area", { provinceid: that.data.selectProv, cityid: gSelectCity}, function (res) {
        if (gSelectCity == 0){
          gSelectCity = res.data.data[0].items[0].id;
          that.setData({
            selectCity: res.data.data[0].items[0].id,
            selectProv: res.data.data[0].id,
            areas: res.data.data
          });
        }else{
          that.setData({
            selectProv: res.data.data[0].id,
            areas: res.data.data
          });
        }

        that.requestRegulist();
      });

      userApi.requestAppApi_POST(app.globalData.mainDomain + "Xcx/banner", { btype: 4 }, function (res) {
        if (res.data.data.banner && res.data.data.banner.length) {
          //banner
          that.setData({
            imgUrls: res.data.data.banner
          });
        }
      });
    })
  },
  selectCity: function(e){
    let that = this;
    gSelectCity = e.currentTarget.dataset.id;
    that.setData({
      selectCity: e.currentTarget.dataset.id
    });
    that.requestRegulist();
  },
  //点击banner
  clickBanner: function (e) {
    var that = this;
    userApi.gotoActivityPage(that.data.imgUrls[e.currentTarget.dataset.index].path, that.data.imgUrls[e.currentTarget.dataset.index].title, that.data.imgUrls[e.currentTarget.dataset.index].open_type, function () {
    });
  },
  swiperImageLoad: function (e) {
    var that = this;
    if (e.currentTarget.dataset.index == 0) {
      var originWidth = e.detail.width,
        originHeight = e.detail.height,
        ratio = originWidth / originHeight;
      that.setData({
        swiperHeight: (app.globalData.systemInfo.windowWidth / ratio) + 'px'
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
    this.requestRegulist();
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
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '教师资格证和教师招聘考试报名简章',
      path: '/pages/reguprov/reguprov',
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
  gotoDetail : function(e){
    wx.navigateTo({
      url: '../regudetail/regudetail?id=' + e.currentTarget.dataset.id + "&cityid=" + e.currentTarget.dataset.cityid,
    })
  },
  setTixing : function(e){
    var that = this;
    var theareaid = e.currentTarget.dataset.areaid;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/yuyue", { openid: app.globalData.openId, formid: e.detail.formId,areaid:e.currentTarget.dataset.areaid }, function (res) {
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '设置成功，请注意微信通知',
      })

      var regulist = that.data.regulist;
      for (let x = 0; x < regulist.length; x++) {
        if (regulist[x].id == theareaid) {
          regulist[x].yuyue = 1;
        }
      }
      that.setData({
        regulist: regulist
      });
    });
  },
  manageTabs() {
    var that = this;
    wx.navigateTo({
      url: '../reguprov/manage?id=' + that.data.selectCity + '&pid=' + that.data.selectProv
    })
  },
  //获取预约数据
  requestYuyueStatus(areaids){
    var that = this;
    var regulist = that.data.regulist;
    userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/yuyue_status", { ids: areaids }, function (res2) {
      if (res2.data.data.length) {
        for (var j = 0; j < res2.data.data.length; j++) {
          for (var x = 0; x < regulist.length; x++) {
            if (regulist[x].id == res2.data.data[j]) {
              regulist[x].yuyue = 1;
            }
          }
        }
        that.setData({
          regulist: regulist
        });
      }
    });
  },
  //请求简章数据
  requestRegulist(){
    var that = this;
    if (that.data.selectCity > 0){
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Regulations/regu_list", { cityid: that.data.selectCity}, function (res) {
        let areadata = res.data.data;
        that.setData({
          regulist: areadata.areas
        });
        let areaids = '';
        if (areadata.areas) {
          for (let i = 0; i < areadata.areas.length; i++) {
            if (i > 0) {
              areaids += ',';
            }
            areaids += areadata.areas[i].id;
          }
        }
        that.requestYuyueStatus(areaids);
      });
    }
  }
})