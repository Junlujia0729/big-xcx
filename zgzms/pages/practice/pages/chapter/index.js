// pages/practice/chapter/index.js
const app = getApp();
const userApi = require('../../../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:0,
    edu_flag:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.setData({
        id: options.id,
        edu_flag: options.edu_flag,
        title: options.edu_title
    });
    userApi.xcx_login_new(1,1,function(){
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Practice/practice_chapter", options,function (res) {
          var improtant=[];
          var improtant_no=[];
          //循环知识点重要程度
          for (var i = 0; i < res.data.data.fs.length;i++){
            var arr=[];
            var arr1=[];
            for (var j = 0; j < res.data.data.fs[i].improtant;j++){
              arr.push(j + 1)
            }
            for (var h = 0; h < (5 - res.data.data.fs[i].improtant); h++) {
              arr1.push(h + 1)
            }
            improtant.push(arr);
            improtant_no.push(arr1);
          }

          //循环完成度
          var _proportion = [];
          for (var i = 0; i < res.data.data.fs.length; i++) {
            _proportion.push(res.data.data.fs[i].completecount / res.data.data.fs[i].totalcount)
          }
          that.setData({
              items: res.data.data,
              arr: improtant,
              arr1: improtant_no,
              proportion: _proportion
          });
          console.log(res);
        });
    });
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   
  },

  /**
   * 练习
   */
  practice:function(e){
    console.log(e)
    var edu_id = e.currentTarget.dataset.edu_id;
    var edu_flag = e.currentTarget.dataset.edu_flag;
    var edu_title = e.currentTarget.dataset.edu_title;
    wx.navigateTo({
      url: '../practice/index?edu_id=' + edu_id + '&edu_flag=' + edu_flag + '&edu_title=' + edu_title
    })
  },

})