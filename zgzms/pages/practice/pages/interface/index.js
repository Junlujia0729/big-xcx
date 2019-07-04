// pages/practice/interface/index.js
const app = getApp();
const userApi = require('../../../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    try_exam_type:1,
    try_province:24  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    userApi.xcx_login_new(1,1,function(){
      // that.setData({ page: 1 });
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Practice/practice_interface", options,function (res) {
        var datas = res.data.data;
        var _proportion=[];
        
        for (var i = 0; i < datas.length; i++){
          _proportion.push(datas[i].comlpate / datas[i].totality)
        }
        that.setData({
          items: res.data.data,
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
   * 快速练习
   */
  practice:function(e){
    var edu_id = e.currentTarget.dataset.edu_id;
    var edu_flag = e.currentTarget.dataset.edu_flag;
    var edu_title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../practice/index?edu_id=' + edu_id + '&edu_flag=' + edu_flag + '&edu_title=' + edu_title
    })
  },
  /**
   * 章节列表
   */
  chapter:function(e){
    console.log(e);
    var id = e.currentTarget.dataset.id;
    var edu_flag = e.currentTarget.dataset.edu_flag;
    var edu_title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../chapter/index?id=' + id + '&edu_flag=' + edu_flag + '&edu_title=' + edu_title
    })
  }
})