// pages/addcomment/addcomment.js
const app = getApp()
const userApi = require('../../libraries/user.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dynid:0,
    dynIndex: -1,
    to_user:'',
    comment_type:1,   //1 师说评论
    comment_img_url : [],
    comment_img_count : 0,
    comment_words_count : 0,
    const_com_text : '',
    uptoken: '',
    upurl: app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=',
    upload_picture_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    that.setData({
      dynid: options.id,
      dynIndex: options.index,
      to_user: prevPage.data.replay_to_user
    });

    userApi.requestAppApi_POST(app.globalData.mainDomain + "Homework/upload_token", {}, function (res) {
      console.log(res);
      that.setData({
        uptoken: res.data.data.uptoken,
        upurl: app.globalData.mainDomain + 'Homework/upload_qiniu?fieldname=file&token=' + res.data.data.uptoken
      });
    });
  },

  textAreaInput: function (e) {
    this.setData({
      const_com_text: e.detail.value,
      comment_words_count: e.detail.value.length
    });
  },
  submitComment: function (e) {
    var that = this;
    var suburl = app.globalData.mainDomain + "Dynamic/comment_add";

    //先上报formid
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
    });
    
    if (that.data.comment_type == 1){
      //添加师说评论
      suburl = app.globalData.mainDomain + "Knowledge/user/comment_add";
    }
    //e.detail.formId
    if (e.detail.value.com_text != "") {
      wx.showLoading({
        title: '正在发送',
        mask: true,
      });
      var com_text = e.detail.value.com_text;
      if (that.data.comment_img_url.length > 0) {
        //上传图片并且发送
        var upload_picture_list_ = [];
        for (var ii = 0; ii < that.data.comment_img_url.length;ii++){
          upload_picture_list_.push({
            upload_percent: 0,
            path_server: '',
            path: that.data.comment_img_url[ii]
          });
        }
        
        that.setData({
          upload_picture_list: upload_picture_list_,
        })
        
        var proc = 0;
        var total = upload_picture_list_.length;
        userApi.upload_file_server(that, that.data.upurl, upload_picture_list_, proc, total, function () {
          subComment_pic(suburl, that.data.dynid, that.data.dynIndex, com_text, that.data.upload_picture_list);
        });
      } else {
        //直接发送
        subComment(suburl, that.data.dynid, that.data.dynIndex, com_text, '');
      }
    } else {
      console.log("showCmtImg");
      //底部按钮，只隐藏
      that.setData({
        showCmtImg: false
      });
    }
  },
  selectImg: function (e) {
    var that = this;
    var comment_img_url = that.data.comment_img_url;
    var comment_img_count = that.data.comment_img_count;
    if (comment_img_count < 3){
      wx.chooseImage({
        count: 3 - comment_img_count, // 默认9，这里显示一次选择相册的图片数量
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFiles = res.tempFiles
          //循环把图片加入上传列表
          for (var i in tempFiles) {
            comment_img_url.push(tempFiles[i].path);
            comment_img_count++;
          }
          that.setData({
            comment_img_url: comment_img_url,
            comment_img_count: comment_img_count
          });
        }
      });
    }else{
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '最多选择三张图片',
      })
    }
  },
  deleteImg: function (e) {
    var index = e.currentTarget.dataset.index;
    var that = this;
    var comment_img_url = [];
    var comment_img_count = 0;
    for (var i = 0; i < that.data.comment_img_url.length;i++){
      if (i != index){
        comment_img_url.push(that.data.comment_img_url[i]);
        comment_img_count ++;
      }
    }
    this.setData({
      comment_img_url: comment_img_url,
      comment_img_count: comment_img_count
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

  cancelComment:function(e){
    wx.navigateBack({
      
    });
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

function subComment_pic(suburl, dynid, dynIndex, com_text, upload_pic_list){
  var strImgUrl = "";
  for (var i = 0; i < upload_pic_list.length;i++){
    if (upload_pic_list[i].path_server != undefined && upload_pic_list[i].path_server != ""){
      strImgUrl += (upload_pic_list[i].path_server + ",");
    }
  }
  strImgUrl = strImgUrl.substring(0, strImgUrl.length - 1);
  subComment(suburl, dynid, dynIndex, com_text, strImgUrl);
}

function subComment(suburl, dynid, dynIndex, com_text, strImgUrl){
  var pages = getCurrentPages();
  var currPage = pages[pages.length - 1];   //当前页面
  var prevPage = pages[pages.length - 2];  //上一个页面

  console.log(strImgUrl);
  userApi.requestAppApi_POST(suburl,
  {
    class_id: dynid,
    content: com_text,
    images: strImgUrl,
    touid: prevPage.data.const_reply_uid,
    cid: prevPage.data.const_comment_id,
    reply_id: prevPage.data.const_reply_id
  }, function (res) {
   
    if (res.data.code != 200){
      wx.showModal({
        title: '错误',
        showCancel: false,
        content: res.data.msg,
      })
      return;
    }
    //清空form
    if (dynIndex == -1){
      //回复主评论
      var commentlist = prevPage.data.items.reply_list;
      if (commentlist == undefined || commentlist.length == 0){
        commentlist = [];
      }
      var commenta = res.data.data.comment;
      commenta.id = commenta["comment_id"];
      commenta.items = [];
      commentlist.unshift(commenta);
      prevPage.setData({
        'items.reply_list': commentlist
      });
    }else{
      //回复下面的回复
      var commenta = res.data.data.comment;
      commenta["id"] = commenta["comment_id"];
      var reply_list = prevPage.data.items.reply_list[dynIndex].items;
      if (reply_list == undefined || reply_list.length == 0) {
        reply_list = [];
      }
      reply_list.unshift(commenta);
      var reply_list_str = 'items.reply_list[' + dynIndex + '].items';
      prevPage.setData({
        [reply_list_str]: reply_list
      });
    }
    wx.hideLoading();
    //todo 提交到列表页
    wx.navigateBack({
    });
  })
}