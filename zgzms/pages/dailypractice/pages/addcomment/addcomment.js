// pages/addcomment/addcomment.js
const app = getApp()
const userApi = require('../../../../libraries/user.js')

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
    if (options.id){
      that.setData({ dynid: options.id});
    }
    if (options.index) {
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];   //当前页面
      var prevPage = pages[pages.length - 2];  //上一个页面
      that.setData({
        dynIndex: options.index,
        to_user: prevPage.data.replay_to_user
      });
    }
    if (options.tp){
      that.setData({ comment_type: options.tp});
    }
    
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
    var suburl = app.globalData.mainDomain + "Daily/comment_add";

    //先上报formid
    userApi.requestAppApi_POST(app.globalData.mainQueryDomain + "ApiNlpgbg/xcx_formidByUid", { formid: e.detail.formId, openid: app.globalData.openId, unionid: app.globalData.unionId, token: app.globalData.wx_ltk }, function (res) {
    });
    
    
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
  var columnPage = null;
  if (pages.length >= 3){
    var columnPage = pages[pages.length - 3];  //上一个页面
  }

  console.log(strImgUrl);
  userApi.requestAppApi_POST(suburl,
  {
    job_id: dynid,
    dialyid:0,
    content: com_text,
    images: strImgUrl,
    pid: dynIndex > -1 ? prevPage.data.const_reply_id : 0,
    to_uid: dynIndex > -1 ? prevPage.data.const_reply_uid : 0,
    cid: dynIndex > -1 ? prevPage.data.const_comment_id : 0,
    reply_id: dynIndex > -1 ? prevPage.data.const_reply_id : 0
  }, function (res) {
    
    if (res.data.code != 200){
      wx.showModal({
        title: '错误',
        showCancel: false,
        content: res.data.msg,
      })
      return;
    }
    console.log('查看图片问题');
    console.log(res);
    //清空form
    if (dynIndex == -1){
      //评论一节课
      var commentlist = prevPage.data.common_comment_list;
      if (commentlist == undefined || commentlist.length == 0){
        commentlist = [];
      }
      var commenta = res.data.data.comment;
      commenta.id = commenta["comment_id"];
      commenta.reply_list = [];
      commenta.reply_num = 0;
      commenta.like_num = 0;
      commenta.isliked = 0;     
      commentlist.unshift(commenta);
      var comment_num = prevPage.data.classinfo.comment_num;
      prevPage.setData({
        common_comment_list: commentlist,
        'classinfo.comment_num': ++comment_num,
        clock_state: true,
        clock_type: 1,
        clock_dialy_num: res.data.data.dialy_num,
        clock_num: res.data.data.num,
        clock_title: res.data.data.title,
        clock_dialy_picture: res.data.data.dialy_picture
      });

      if (columnPage != null  && columnPage.data.column_new_class){
        //这里处理下栏目详情页的数据
        //统计信息
        columnPage.setData({
          'column_my_dialy.count': res.data.data.dialy_num,
          'column_my_dialy.bdcount': res.data.data.bd_dialy_num
        });
        
        //评论列表
        var dialy_num = columnPage.data.items.dialy_num + 1;
        var column_lastcomment = columnPage.data.common_comment_list;
        column_lastcomment.unshift(commenta);
        columnPage.setData({
          common_comment_list: column_lastcomment,
          'items.dialy_num': dialy_num
        });
        //已打卡、评论增加新的
        if (columnPage.data.column_new_class && columnPage.data.column_new_class.class && columnPage.data.column_new_class.class.id == dynid){
          columnPage.setData({
            'column_new_class.class.dialy_time': commenta["id"]
          });
        }
      }
    }else{
      //回复评论
      var commentlist = prevPage.data.common_comment_list;
      var commenta = res.data.data.comment;
      commenta["id"] = commenta["jobid"];
      var reply_list = commentlist[prevPage.data.const_reply_pindex].reply_list;
      reply_list.unshift(commenta);
      var reply_num = commentlist[prevPage.data.const_reply_pindex].reply_num;
      var reply_list_str = 'common_comment_list[' + prevPage.data.const_reply_pindex + '].reply_list';
      var reply_num_str = 'common_comment_list[' + prevPage.data.const_reply_pindex + '].reply_num';
      prevPage.setData({
        const_reply_text: "",
        reply_words_count: 0,
        replay_to_user: "",
        [reply_list_str]: reply_list,
        [reply_num_str]: ++reply_num
      });
    }
    console.log('发表成功');
    //todo 提交到列表页
    wx.hideLoading();
    wx.navigateBack({
      
    });
  })
}