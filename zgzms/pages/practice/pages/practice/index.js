// pages/practice/practice/index.js
const app = getApp();
const userApi = require('../../../../libraries/user.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapter_flag:1,
    edu_id:0,
    edu_flag:1,
    edu_title:'教育学',
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 3000,
    duration: 500,
    current: 0,
    actionSheetHidden: false,
    corIndex:0,
    items : [],
    itemsSelected : [],
    answers:[],
    correct_answer:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    console.log(options);
    that.setData({
        edu_id: options.edu_id,
        edu_flag: options.edu_flag,
        edu_title: options.edu_title
    });
    userApi.xcx_login_new(1,1,function(){
      userApi.requestAppApi_POST(app.globalData.mainDomain + "Practice/new_practice",
        { edu_id: that.data.edu_id, edu_flag: that.data.edu_flag},
        function (res) {
        var _its = [];
        var _correct_answer = [];
        for(var l=0;l<res.data.length;l++){
          _its.push([0,0,0,0]);
          _correct_answer.push(res.data[l].answer);
        }
        that.setData({
          items: res.data,
          itemsSelected : _its,
          correct_answer: _correct_answer
        });
        console.log(that.data.items);
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
    var edu_id = e.currentTarget.dataset.edu_id;
    var edu_flag = e.currentTarget.dataset.edu_flag;
    wx.navigateTo({
      url: '../practice/index?edu_id='+edu_id+'&edu_flag='+edu_flag
    })
  },

  actionshow:function(){
    var that = this;
    that.setData({
      actionSheetHidden: true
    });  
  },
  
  actionhide: function () {
    var that=this;
    that.setData({
      actionSheetHidden: false
    });
  },

  swipclick: function (e) {
    var that = this;
    var answer = e.currentTarget.dataset.answer;
    var _answers=that.data.answers;
    _answers.push(answer);
    var _pos = e.currentTarget.dataset.anindex;
    var _itemsSelected = that.data.itemsSelected;
    if (_itemsSelected[that.data.current][_pos] > 0){
      _itemsSelected[that.data.current][_pos] = 0;
    }else{
      for (var i = 0; i < _itemsSelected[that.data.current].length;i++){
        _itemsSelected[that.data.current][i] = 0;
      }
      _itemsSelected[that.data.current][_pos] = 1;
    }
    that.setData({
      itemsSelected: _itemsSelected,
      answers: _answers,
      current: e.currentTarget.dataset.current+1
    });
  },
  /**
   * 处理滚动事件处理
   */
  listenSwiper: function (e) {
    var that = this;
    that.setData({
      current: e.detail.current,
    });
  },
  /**
   * 提交结果
   */
  submitresult:function(e){
    var that = this;
    var message = {};
    message.chapter_flag = that.data.chapter_flag;
    message.edu_flag = that.data.edu_flag;
    message.paperid = that.data.edu_id;
    message.score  = 0;
    message.result = [];
    for (var i = 0; i < that.data.items.length; i++){
      var result_json = {};
      result_json.score = 0;
      result_json.orders = i;
      result_json.questionid = that.data.items[i].id;
      result_json.answer = that.data.answers[i];
      if (that.data.correct_answer[i] == that.data.answers[i]) {
        result_json.result = 1;
        result_json.score ++;
      } else{
        result_json.result = 2;
      }
      
      if (that.data.items[i].items.length == 0){
        result_json.questionitemid = 0;  
      }
      message.result.push(result_json);
    }
    for (var j = 0; j < message.result.length; j++) {
      message.score = parseInt(message.score + message.result[j].score);
    }
    console.log(message);
  },
  
})