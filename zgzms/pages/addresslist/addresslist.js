// pages/order/order.js


const app = getApp();
const userApi = require('../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderid: 0,
    addresslist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    if (options.orderid){
      that.setData({
        orderid: options.orderid
      });
    }
    userApi.xcx_login_new(1,0,function () {
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Live/listAddress", {
      }, function (res) {
        that.setData({ addresslist: res.data.data });
        if (that.data.addresslist.length == 0) {
          wx.chooseAddress({
            success: function (res) {
              console.log(res);
              userApi.requestAppApi_POST(app.globalData.mainDomain + "Live/addAddress",
                {
                  linkname: res.userName,
                  linkphone: res.telNumber,
                  postprovince: res.provinceName,
                  postcity: res.cityName,
                  postdist: res.countyName,
                  postaddress: res.detailInfo
                },
                function (res1) {
                  var alist = that.data.addresslist;
                  alist.push({
                    id: res1.data.data.id,
                    linkname: res.userName,
                    linkphone: res.telNumber,
                    postprovince: res.provinceName,
                    postcity: res.cityName,
                    postdist: res.countyName,
                    postaddress: res.detailInfo
                  });
                  that.setData({ addresslist: alist });

                  var pages = getCurrentPages();
                  var currPage = pages[pages.length - 1];   //当前页面
                  var prevPage = pages[pages.length - 2];  //上一个页面
                  prevPage.setData({
                    address: alist[alist.length - 1]
                  });
                  wx.navigateBack({
                  });
                })
            }
          })
        }
      });
    });
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({ title: "选择收货地址" });
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

 
  bindViewTap:function(e){
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    var address = that.data.addresslist[e.currentTarget.dataset.index];
    prevPage.setData({ address: address});
    if (that.data.orderid > 0){
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Order/updateorder", {
        orderid: that.data.orderid, addressid: address.id
      }, function (res) {
        wx.navigateBack({});
      });
    }else{
      wx.navigateBack({});
    }
    
  },

  add:function(){
    
  }
})