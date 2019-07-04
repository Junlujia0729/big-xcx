// components/common-view/common-view.js
const app = getApp()
const userApi = require('../../libraries/user.js')
import { navigate } from "../../libraries/router.js"

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  ready:function(){
    if (app.globalData.mobile == "") {
      navigate({
        path: "pages/login/login"
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
