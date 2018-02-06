//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    logged: false
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  addQuestionTap: function () {
    wx.navigateTo({
      url: '../biz/configure',
    })
  },
  answerQuestionTap: function () {
    wx.navigateTo({
      url: '../biz/answer',
    })
  },
  doRegister: function () {
    var gd = app.globalData
    if (gd.openid && gd.userInfo && !gd.registerStat){
      // 正在请求
      gd.registerStat = 1;
      wx.request({
        url: 'https://debug.daily2fun.com/qqq/api/register',
        method: 'POST',
        data: { 'id': gd.openid, 'name': gd.userInfo.nickName, 'avatar': gd.userInfo.avatarUrl },
        header: { 'content-type': 'application/json' },
        success: function (res) {
          console.log('注册用户成功')
          if (res.data.code == 200) gd.registerStat = 2 // 请求成功
          else gd.registerStat = 0 // 请求失败
        }
      })
    }
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.doRegister()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.doRegister()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.doRegister()
        }
      })
    }

    if (app.globalData.openid) {
      this.setData({
        logged: true
      })
      this.doRegister()
    } else {
      app.openidReadyCallback = res => {
        this.setData({
          logged: true
        })
        this.doRegister()
      }
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
